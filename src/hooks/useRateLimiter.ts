import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter?: number;
  resetAt?: number;
  message?: string;
}

// Rate limit configurations per endpoint
const RATE_LIMITS = {
  default: { maxRequests: 100, windowSeconds: 60 },
  ai: { maxRequests: 20, windowSeconds: 60 },
  auth: { maxRequests: 10, windowSeconds: 60 },
  search: { maxRequests: 60, windowSeconds: 60 },
} as const;

export function useRateLimiter() {
  const { user } = useAuth();
  const [isLimited, setIsLimited] = useState(false);
  const [retryAfter, setRetryAfter] = useState(0);

  const checkRateLimit = useCallback(async (
    endpoint: keyof typeof RATE_LIMITS = 'default'
  ): Promise<RateLimitResult> => {
    // Use user ID or generate anonymous identifier
    const identifier = user?.id || `anon-${getAnonymousId()}`;
    const config = RATE_LIMITS[endpoint];

    try {
      // First try Redis-based rate limiting (distributed, more accurate)
      const { data, error } = await supabase.functions.invoke('redis-cache', {
        body: { 
          operation: 'rateLimit',
          key: `ratelimit:${endpoint}:${identifier}`,
          maxRequests: config.maxRequests,
          windowSeconds: config.windowSeconds,
        },
      });

      if (error) {
        console.warn('[useRateLimiter] Redis error, falling back:', error);
        // Fallback to legacy rate limiter if Redis fails
        return fallbackRateLimit(identifier, endpoint);
      }

      if (!data.allowed) {
        setIsLimited(true);
        const retrySeconds = data.retryAfter || Math.ceil((data.resetAt - Date.now()) / 1000);
        setRetryAfter(retrySeconds);
        
        // Auto-reset after retry period
        setTimeout(() => {
          setIsLimited(false);
          setRetryAfter(0);
        }, retrySeconds * 1000);
      }

      return {
        allowed: data.allowed,
        remaining: data.remaining,
        retryAfter: data.retryAfter,
        resetAt: data.resetAt,
      };
    } catch (err) {
      console.warn('[useRateLimiter] Exception:', err);
      // Fail open - allow request if rate limiter is down
      return { allowed: true, remaining: 999 };
    }
  }, [user?.id]);

  return {
    checkRateLimit,
    isLimited,
    retryAfter,
  };
}

// Fallback to database-based rate limiting if Redis is unavailable
async function fallbackRateLimit(
  identifier: string, 
  endpoint: string
): Promise<RateLimitResult> {
  try {
    const { data, error } = await supabase.functions.invoke('rate-limiter', {
      body: { identifier, endpoint },
    });

    if (error) {
      console.error('[useRateLimiter] Fallback error:', error);
      return { allowed: true, remaining: 999 };
    }

    return data as RateLimitResult;
  } catch {
    return { allowed: true, remaining: 999 };
  }
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
