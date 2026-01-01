import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Affiliate {
  id: string;
  user_id: string;
  agent_id: string | null;
  referral_code: string;
  affiliate_type: 'member' | 'agent_basic' | 'agent_preferred' | 'agent_premium';
  commission_rate: number | null;
  stripe_connect_id: string | null;
  stripe_connect_status: string;
  status: 'pending' | 'approved' | 'suspended' | 'rejected';
  total_clicks: number;
  total_signups: number;
  total_qualified: number;
  total_earnings: number;
  pending_earnings: number;
  application_notes: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Referral {
  id: string;
  affiliate_id: string;
  referred_user_id: string;
  referred_at: string;
  qualification_date: string;
  qualified_at: string | null;
  status: 'pending' | 'qualified' | 'churned' | 'fraudulent';
  first_subscription_product: string | null;
  first_subscription_amount: number | null;
}

export interface Commission {
  id: string;
  affiliate_id: string;
  referral_id: string;
  product_type: string;
  billing_period: string;
  gross_amount: number;
  commission_rate: number;
  commission_amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'paid' | 'voided';
  approved_at: string | null;
  paid_at: string | null;
  created_at: string;
}

export interface Payout {
  id: string;
  affiliate_id: string;
  amount: number;
  currency: string;
  commission_count: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  processed_at: string | null;
  created_at: string;
}

export interface AffiliateNotification {
  id: string;
  affiliate_id: string;
  notification_type: string;
  title: string;
  message: string;
  metadata: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export const useAffiliate = () => {
  const { user } = useAuth();
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [notifications, setNotifications] = useState<AffiliateNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAffiliate, setIsAffiliate] = useState(false);

  // Fetch affiliate profile
  const fetchAffiliate = useCallback(async () => {
    if (!user) {
      setAffiliate(null);
      setIsAffiliate(false);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('affiliates')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      setAffiliate(data as unknown as Affiliate | null);
      setIsAffiliate(!!data);
    } catch (err) {
      console.error('Error fetching affiliate:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch referrals
  const fetchReferrals = useCallback(async () => {
    if (!affiliate) return;

    try {
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('affiliate_id', affiliate.id)
        .order('referred_at', { ascending: false });

      if (error) throw error;
      setReferrals((data || []) as unknown as Referral[]);
    } catch (err) {
      console.error('Error fetching referrals:', err);
    }
  }, [affiliate]);

  // Fetch commissions
  const fetchCommissions = useCallback(async () => {
    if (!affiliate) return;

    try {
      const { data, error } = await supabase
        .from('commissions')
        .select('*')
        .eq('affiliate_id', affiliate.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCommissions((data || []) as unknown as Commission[]);
    } catch (err) {
      console.error('Error fetching commissions:', err);
    }
  }, [affiliate]);

  // Fetch payouts
  const fetchPayouts = useCallback(async () => {
    if (!affiliate) return;

    try {
      const { data, error } = await supabase
        .from('affiliate_payouts')
        .select('*')
        .eq('affiliate_id', affiliate.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayouts((data || []) as unknown as Payout[]);
    } catch (err) {
      console.error('Error fetching payouts:', err);
    }
  }, [affiliate]);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!affiliate) return;

    try {
      const { data, error } = await supabase
        .from('affiliate_notifications')
        .select('*')
        .eq('affiliate_id', affiliate.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications((data || []) as unknown as AffiliateNotification[]);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  }, [affiliate]);

  // Apply to become an affiliate
  const applyAsAffiliate = useCallback(async (notes?: string) => {
    if (!user) {
      toast.error('Please sign in to apply');
      return null;
    }

    try {
      // Generate referral code
      const { data: codeData, error: codeError } = await supabase
        .rpc('generate_referral_code', { prefix: null });

      if (codeError) throw codeError;

      const { data, error } = await supabase
        .from('affiliates')
        .insert({
          user_id: user.id,
          referral_code: codeData,
          affiliate_type: 'member',
          status: 'pending',
          application_notes: notes || null
        })
        .select()
        .single();

      if (error) throw error;

      setAffiliate(data as unknown as Affiliate);
      setIsAffiliate(true);
      toast.success('Application submitted! We\'ll review it shortly.');
      return data;
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Error applying as affiliate:', error);
      toast.error(error.message || 'Failed to submit application');
      return null;
    }
  }, [user]);

  // Connect Stripe account
  const connectStripeAccount = useCallback(async () => {
    if (!affiliate) return;

    try {
      const { data, error } = await supabase.functions.invoke('create-affiliate-connect-account', {
        body: { affiliate_id: affiliate.id }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Error connecting Stripe:', error);
      toast.error('Failed to start Stripe connection');
    }
  }, [affiliate]);

  // Mark notification as read
  const markNotificationRead = useCallback(async (notificationId: string) => {
    try {
      await supabase
        .from('affiliate_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (err) {
      console.error('Error marking notification read:', err);
    }
  }, []);

  // Copy referral link
  const copyReferralLink = useCallback(() => {
    if (!affiliate) return;

    const link = `${window.location.origin}?ref=${affiliate.referral_code}`;
    navigator.clipboard.writeText(link);
    toast.success('Referral link copied!');
  }, [affiliate]);

  // Initial fetch
  useEffect(() => {
    fetchAffiliate();
  }, [fetchAffiliate]);

  // Fetch related data when affiliate is loaded
  useEffect(() => {
    if (affiliate) {
      fetchReferrals();
      fetchCommissions();
      fetchPayouts();
      fetchNotifications();
    }
  }, [affiliate, fetchReferrals, fetchCommissions, fetchPayouts, fetchNotifications]);

  // Stats calculations
  const stats = {
    totalClicks: affiliate?.total_clicks || 0,
    totalSignups: affiliate?.total_signups || 0,
    totalQualified: affiliate?.total_qualified || 0,
    conversionRate: affiliate?.total_clicks 
      ? ((affiliate.total_signups / affiliate.total_clicks) * 100).toFixed(1)
      : '0.0',
    pendingEarnings: affiliate?.pending_earnings || 0,
    totalEarnings: affiliate?.total_earnings || 0,
    pendingCommissions: commissions.filter(c => c.status === 'pending').length,
    approvedCommissions: commissions.filter(c => c.status === 'approved').length,
    unreadNotifications: notifications.filter(n => !n.is_read).length
  };

  return {
    affiliate,
    referrals,
    commissions,
    payouts,
    notifications,
    stats,
    loading,
    isAffiliate,
    applyAsAffiliate,
    connectStripeAccount,
    copyReferralLink,
    markNotificationRead,
    refetch: fetchAffiliate
  };
};
