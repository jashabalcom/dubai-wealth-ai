import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter?: number;
  message?: string;
}

export function useRateLimiter() {
  const { user } = useAuth();
  const [isLimited, setIsLimited] = useState(false);
  const [retryAfter, setRetryAfter] = useState(0);

  const checkRateLimit = useCallback(async (
    endpoint: 'default' | 'ai' | 'auth' | 'search' = 'default'
  ): Promise<RateLimitResult> => {
    // Use user ID or generate anonymous identifier
    const identifier = user?.id || `anon-${getAnonymousId()}`;

    try {
      const { data, error } = await supabase.functions.invoke('rate-limiter', {
        body: { identifier, endpoint },
      });

      if (error) {
        console.error('[useRateLimiter] Error:', error);
        // Fail open - allow request if rate limiter is down
        return { allowed: true, remaining: 999 };
      }

      if (!data.allowed) {
        setIsLimited(true);
        setRetryAfter(data.retryAfter || 60);
        
        // Auto-reset after retry period
        setTimeout(() => {
          setIsLimited(false);
          setRetryAfter(0);
        }, (data.retryAfter || 60) * 1000);
      }

      return data as RateLimitResult;
    } catch (err) {
      console.error('[useRateLimiter] Exception:', err);
      return { allowed: true, remaining: 999 };
    }
  }, [user?.id]);

  return {
    checkRateLimit,
    isLimited,
    retryAfter,
  };
}

// Generate persistent anonymous ID for rate limiting
function getAnonymousId(): string {
  const storageKey = 'rei_anon_id';
  let id = localStorage.getItem(storageKey);
  
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(storageKey, id);
  }
  
  return id;
}
