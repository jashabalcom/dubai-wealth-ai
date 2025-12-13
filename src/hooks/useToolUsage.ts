import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

const FREE_TOOL_LIMIT = 3;

export type ToolName = 'roi' | 'mortgage' | 'rent-vs-buy' | 'airbnb' | 'str-vs-ltr' | 'total-cost';

interface UseToolUsageReturn {
  usageCount: number;
  remainingUses: number;
  hasReachedLimit: boolean;
  isUnlimited: boolean;
  isLoading: boolean;
  trackUsage: () => Promise<boolean>;
  canUse: boolean;
}

export function useToolUsage(toolName: ToolName): UseToolUsageReturn {
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
        .from('tool_usage')
        .select('id')
        .eq('user_id', user.id)
        .eq('tool_name', toolName);

      if (error) {
        console.error('Error fetching tool usage:', error);
      } else {
        setUsageCount(data?.length || 0);
      }
      setIsLoading(false);
    }

    fetchUsage();
  }, [user?.id, toolName, isUnlimited]);

  const trackUsage = useCallback(async (): Promise<boolean> => {
    if (!user?.id) return false;
    if (isUnlimited) return true;

    // Check if already at limit
    if (usageCount >= FREE_TOOL_LIMIT) {
      return false;
    }

    const { error } = await supabase
      .from('tool_usage')
      .insert({
        user_id: user.id,
        tool_name: toolName
      });

    if (error) {
      console.error('Error tracking tool usage:', error);
      return false;
    }

    setUsageCount(prev => prev + 1);
    return true;
  }, [user?.id, toolName, isUnlimited, usageCount]);

  const remainingUses = isUnlimited ? Infinity : Math.max(0, FREE_TOOL_LIMIT - usageCount);
  const hasReachedLimit = !isUnlimited && usageCount >= FREE_TOOL_LIMIT;
  const canUse = isUnlimited || usageCount < FREE_TOOL_LIMIT;

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
