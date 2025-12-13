import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

const FREE_AI_LIMIT = 5;

interface UseAIUsageReturn {
  usageCount: number;
  remainingUses: number;
  hasReachedLimit: boolean;
  isUnlimited: boolean;
  isLoading: boolean;
  trackUsage: () => Promise<boolean>;
  canUse: boolean;
}

export function useAIUsage(): UseAIUsageReturn {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [usageCount, setUsageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const isUnlimited = profile?.membership_tier === 'investor' || profile?.membership_tier === 'elite';

  useEffect(() => {
    async function fetchUsage() {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      if (isUnlimited) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('ai_usage')
        .select('id')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching AI usage:', error);
      } else {
        setUsageCount(data?.length || 0);
      }
      setIsLoading(false);
    }

    fetchUsage();
  }, [user?.id, isUnlimited]);

  const trackUsage = useCallback(async (): Promise<boolean> => {
    if (!user?.id) return false;
    if (isUnlimited) return true;

    if (usageCount >= FREE_AI_LIMIT) {
      return false;
    }

    const { error } = await supabase
      .from('ai_usage')
      .insert({
        user_id: user.id,
        query_type: 'chat'
      });

    if (error) {
      console.error('Error tracking AI usage:', error);
      return false;
    }

    setUsageCount(prev => prev + 1);
    return true;
  }, [user?.id, isUnlimited, usageCount]);

  const remainingUses = isUnlimited ? Infinity : Math.max(0, FREE_AI_LIMIT - usageCount);
  const hasReachedLimit = !isUnlimited && usageCount >= FREE_AI_LIMIT;
  const canUse = isUnlimited || usageCount < FREE_AI_LIMIT;

  return {
    usageCount,
    remainingUses,
    hasReachedLimit,
    isUnlimited,
    isLoading,
    trackUsage,
    canUse
  };
}
