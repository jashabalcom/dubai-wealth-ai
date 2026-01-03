import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export function useEmailVerification() {
  const { user } = useAuth();

  const isEmailVerified = user?.email_confirmed_at != null;

  const resendVerificationEmail = async () => {
    if (!user?.email) {
      return { error: new Error('No email address found') };
    }

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        toast({
          title: 'Failed to send email',
          description: error.message,
          variant: 'destructive',
        });
        return { error };
      }

      toast({
        title: 'Verification email sent',
        description: 'Check your inbox and click the link to verify your email.',
      });
      return { error: null };
    } catch (err) {
      const error = err as Error;
      toast({
        title: 'Failed to send email',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    }
  };

  return { isEmailVerified, resendVerificationEmail, userEmail: user?.email };
}
