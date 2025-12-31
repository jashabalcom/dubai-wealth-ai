import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { STRIPE_TIERS, SubscriptionTier, BillingPeriod } from '@/lib/stripe-config';

interface SubscriptionStatus {
  subscribed: boolean;
  tier: SubscriptionTier;
  subscription_end: string | null;
  is_trialing: boolean;
  trial_end: string | null;
}

export interface FunnelOptions {
  source: string;
  trialDays?: number;
}

export function useSubscription() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const checkSubscription = useCallback(async (): Promise<SubscriptionStatus | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Error checking subscription:', error);
        return null;
      }
      
      return data as SubscriptionStatus;
    } catch (error) {
      console.error('Error checking subscription:', error);
      return null;
    }
  }, []);

  const startCheckout = useCallback((
    tier: 'investor' | 'elite' | 'private', 
    billingPeriod: BillingPeriod = 'monthly',
    funnelOptions?: FunnelOptions
  ) => {
    // Private tier uses contact flow instead of direct checkout
    if (tier === 'private') {
      navigate('/contact?subject=Private+Membership');
      return;
    }
    
    // Build query params for embedded checkout
    const params = new URLSearchParams({ billing: billingPeriod });
    if (funnelOptions?.source) {
      params.set('source', funnelOptions.source);
    }
    if (funnelOptions?.trialDays) {
      params.set('trial', String(funnelOptions.trialDays));
    }
    
    // Navigate to embedded checkout page
    navigate(`/checkout/${tier}?${params.toString()}`);
  }, [navigate]);

  const openCustomerPortal = useCallback(async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) {
        throw new Error(error.message);
      }

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No portal URL received');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to open customer portal';
      toast({
        title: "Portal Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    checkSubscription,
    startCheckout,
    openCustomerPortal,
  };
}
