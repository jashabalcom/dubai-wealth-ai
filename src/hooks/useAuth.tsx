import { useState, useEffect, createContext, useContext, ReactNode, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { trackSignUp, trackLogin } from '@/lib/analytics';

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  country: string | null;
  membership_tier: 'free' | 'investor' | 'elite' | 'private';
  membership_status: 'active' | 'canceled' | 'trialing' | 'expired';
  membership_renews_at: string | null;
  onboarding_completed_at: string | null;
  onboarding_step: number | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Debounce refs to prevent rate limiting
  const lastSubscriptionCheck = useRef<number>(0);
  const subscriptionCheckInProgress = useRef<boolean>(false);
  const subscriptionCheckTimeout = useRef<NodeJS.Timeout | null>(null);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!error && data) {
      setProfile(data as Profile);
    }
  }, []);

  const checkSubscription = useCallback(async (force = false) => {
    // Prevent concurrent calls and rate limiting
    const now = Date.now();
    const minInterval = 30000; // 30 seconds minimum between checks
    
    if (!force && (now - lastSubscriptionCheck.current < minInterval)) {
      console.log('[AUTH] Subscription check skipped - too soon');
      return;
    }
    
    if (subscriptionCheckInProgress.current) {
      console.log('[AUTH] Subscription check already in progress');
      return;
    }

    subscriptionCheckInProgress.current = true;
    lastSubscriptionCheck.current = now;

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Error checking subscription:', error);
        return;
      }
      
      // Refresh profile to get updated tier from the server
      const currentUser = (await supabase.auth.getUser()).data.user;
      if (currentUser) {
        await fetchProfile(currentUser.id);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      subscriptionCheckInProgress.current = false;
    }
  }, [fetchProfile]);

  const refreshSubscription = useCallback(async () => {
    await checkSubscription(true);
  }, [checkSubscription]);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer profile fetch to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      if (subscriptionCheckTimeout.current) {
        clearTimeout(subscriptionCheckTimeout.current);
      }
    };
  }, [fetchProfile]);

  // No automatic periodic checks - rely on profile data from database
  // Manual refresh available via refreshSubscription()

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName || '',
        },
      },
    });

    // Handle successful signup
    if (!error && data.user) {
      // Track sign-up conversion
      trackSignUp('email');
      
      // Check for affiliate referral cookie and create referral record
      const referralCode = document.cookie
        .split('; ')
        .find(row => row.startsWith('affiliate_ref='))
        ?.split('=')[1];
      
      if (referralCode) {
        try {
          // Get the affiliate by referral code
          const { data: affiliate } = await supabase
            .rpc('get_affiliate_by_code', { code: referralCode });
          
          if (affiliate && affiliate.length > 0) {
            // Create referral record - qualification_date is 60 days from now
            const qualificationDate = new Date();
            qualificationDate.setDate(qualificationDate.getDate() + 60);
            
            await supabase.from('referrals').insert([{
              affiliate_id: affiliate[0].id,
              referred_user_id: data.user.id,
              status: 'pending' as const,
              qualification_date: qualificationDate.toISOString(),
            }]);
            console.log('Referral created for affiliate:', referralCode);
          }
        } catch (refError) {
          console.error('Failed to create referral:', refError);
          // Don't fail signup if referral creation fails
        }
      }
      
      try {
        // Enqueue the full drip campaign sequence
        await supabase.functions.invoke('enqueue-welcome-sequence', {
          body: { 
            user_id: data.user.id,
            email, 
            full_name: fullName,
            membership_tier: 'free'
          },
        });
        console.log('Welcome email sequence enqueued successfully');
      } catch (emailError) {
        console.error('Failed to enqueue welcome sequence:', emailError);
        // Don't fail signup if email fails
      }
    }

    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error) {
      // Track login event
      trackLogin('email');
    }

    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signUp, signIn, signOut, refreshSubscription }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
