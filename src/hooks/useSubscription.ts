import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { STRIPE_TIERS, SubscriptionTier } from '@/lib/stripe-config';

interface SubscriptionStatus {
  subscribed: boolean;
  tier: SubscriptionTier;
  subscription_end: string | null;
}

export function useSubscription() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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

  const startCheckout = useCallback(async (tier: 'investor' | 'elite') => {
    setLoading(true);
    
    try {
      const tierConfig = STRIPE_TIERS[tier];
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          priceId: tierConfig.price_id,
          tier: tier
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.url) {
        window.open(data.url, '_blank');
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start checkout';
      toast({
        title: "Checkout Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const openCustomerPortal = useCallback(async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) {
        throw new Error(error.message);
      }

      if (data?.url) {
        window.open(data.url, '_blank');
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
