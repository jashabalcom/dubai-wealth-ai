import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AGENT_TIERS, AgentTier } from '@/lib/agent-tiers-config';

interface AgentSubscriptionStatus {
  subscribed: boolean;
  tier: AgentTier;
  subscription_end: string | null;
}

export function useAgentSubscription() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const checkAgentSubscription = useCallback(async (agentId: string): Promise<AgentSubscriptionStatus | null> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('agent-check-subscription', {
        body: { agentId }
      });
      
      if (error) {
        console.error('Error checking agent subscription:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to check subscription status",
          variant: "destructive",
        });
        return null;
      }
      
      return data as AgentSubscriptionStatus;
    } catch (error) {
      console.error('Error checking agent subscription:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const startAgentCheckout = useCallback(async (agentId: string, tier: 'preferred' | 'premium') => {
    setLoading(true);
    
    try {
      const tierConfig = AGENT_TIERS[tier];
      
      if (!tierConfig.price_id) {
        throw new Error('Invalid tier selected');
      }

      const { data, error } = await supabase.functions.invoke('agent-checkout', {
        body: { 
          agentId,
          priceId: tierConfig.price_id,
          tier
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.url) {
        window.location.href = data.url;
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

  const openAgentPortal = useCallback(async (agentId: string) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('agent-customer-portal', {
        body: { agentId }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No portal URL received');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to open billing portal';
      toast({
        title: "Portal Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateAgentTierManually = useCallback(async (
    agentId: string, 
    tier: AgentTier,
    options?: { 
      overrideLimits?: boolean;
      customMaxListings?: number;
    }
  ) => {
    setLoading(true);
    
    try {
      const tierConfig = AGENT_TIERS[tier];
      
      const updateData: any = {
        subscription_tier: tier,
        subscription_status: tier === 'basic' ? 'inactive' : 'manual',
        show_direct_contact: tierConfig.show_direct_contact,
        priority_ranking: tierConfig.priority_ranking,
        featured_listings_remaining: tierConfig.featured_listings,
      };

      // Apply listing limits (allow admin override)
      if (options?.overrideLimits && options.customMaxListings !== undefined) {
        updateData.max_listings = options.customMaxListings;
      } else {
        updateData.max_listings = tierConfig.max_listings;
      }

      const { error } = await supabase
        .from('agents')
        .update(updateData)
        .eq('id', agentId);

      if (error) throw error;

      toast({
        title: "Tier Updated",
        description: `Agent tier set to ${tierConfig.name}`,
      });

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update tier';
      toast({
        title: "Update Error",
        description: message,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    checkAgentSubscription,
    startAgentCheckout,
    openAgentPortal,
    updateAgentTierManually,
  };
}
