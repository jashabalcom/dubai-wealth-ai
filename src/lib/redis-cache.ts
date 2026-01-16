/**
 * Redis Cache Layer using Upstash REST API
 * Provides distributed caching for API responses, rate limiting, and session data
 */

import { supabase } from '@/integrations/supabase/client';

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
  short: 60,           // 1 minute - for rapidly changing data
  medium: 300,         // 5 minutes - for semi-dynamic data
  long: 900,           // 15 minutes - for slow-changing data
  veryLong: 3600,      // 1 hour - for static-ish data
  day: 86400,          // 24 hours - for rarely changing data
  week: 604800,        // 7 days - for static data
} as const;

// Cache key prefixes for organization
export const CACHE_KEYS = {
  // Market data
  areaBenchmarks: (area: string) => `benchmarks:${area.toLowerCase()}`,
  marketStats: (area: string) => `market-stats:${area.toLowerCase()}`,
  propertyDetails: (id: string) => `property:${id}`,
  developerProjects: (id: string) => `developer:${id}:projects`,
  
  // AI responses
  aiResponse: (hash: string) => `ai:response:${hash}`,
  aiStrategy: (params: string) => `ai:strategy:${params}`,
  
  // User data
  userProfile: (userId: string) => `user:profile:${userId}`,
  userPreferences: (userId: string) => `user:prefs:${userId}`,
  
  // Rate limiting
  rateLimit: (identifier: string, endpoint: string) => `ratelimit:${endpoint}:${identifier}`,
  
  // News & content
  newsArticles: (page: number) => `news:page:${page}`,
  digestCache: (date: string) => `digest:${date}`,
  
  // Search
  searchResults: (query: string) => `search:${hashString(query)}`,
} as const;

/**
 * Simple string hash for cache keys
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Redis cache operations via edge function
 */
class RedisCache {
  private localCache = new Map<string, { data: unknown; expiresAt: number }>();
  private maxLocalSize = 500; // Increased from 50 for better hit rates at scale
  private cacheStats = { hits: 0, misses: 0, sets: 0 };

  /**
   * Get a value from cache (checks local first, then Redis)
   */
  async get<T>(key: string): Promise<T | null> {
    // Check local cache first
    const local = this.localCache.get(key);
    if (local && Date.now() < local.expiresAt) {
      this.cacheStats.hits++;
      return local.data as T;
    }
    if (local) {
      this.localCache.delete(key);
    }
    this.cacheStats.misses++;

    try {
      const { data, error } = await supabase.functions.invoke('redis-cache', {
        body: { operation: 'get', key },
      });

      if (error) {
        console.warn('[RedisCache] Get error:', error);
        return null;
      }

      if (data?.value !== null && data?.value !== undefined) {
        // Store in local cache too
        this.setLocal(key, data.value, 60); // 1 min local TTL
        return data.value as T;
      }

      return null;
    } catch (err) {
      console.warn('[RedisCache] Get exception:', err);
      return null;
    }
  }

  /**
   * Set a value in cache
   */
  async set<T>(key: string, value: T, ttlSeconds: number): Promise<boolean> {
    // Always set locally first for immediate availability
    this.setLocal(key, value, ttlSeconds);
    this.cacheStats.sets++;

    try {
      const { error } = await supabase.functions.invoke('redis-cache', {
        body: { operation: 'set', key, value, ttl: ttlSeconds },
      });

      if (error) {
        console.warn('[RedisCache] Set error:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.warn('[RedisCache] Set exception:', err);
      return false;
    }
  }

  /**
   * Delete a value from cache
   */
  async delete(key: string): Promise<boolean> {
    this.localCache.delete(key);

    try {
      const { error } = await supabase.functions.invoke('redis-cache', {
        body: { operation: 'delete', key },
      });

      if (error) {
        console.warn('[RedisCache] Delete error:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.warn('[RedisCache] Delete exception:', err);
      return false;
    }
  }

  /**
   * Get or fetch pattern - returns cached value or fetches and caches
   */
  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds: number
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fetcher();
    await this.set(key, data, ttlSeconds);
    return data;
  }

  /**
   * Rate limit check using Redis
   */
  async checkRateLimit(
    identifier: string,
    endpoint: string,
    maxRequests: number,
    windowSeconds: number
  ): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    try {
      const { data, error } = await supabase.functions.invoke('redis-cache', {
        body: {
          operation: 'rateLimit',
          key: CACHE_KEYS.rateLimit(identifier, endpoint),
          maxRequests,
          windowSeconds,
        },
      });

      if (error) {
        console.warn('[RedisCache] Rate limit error:', error);
        // Fail open
        return { allowed: true, remaining: maxRequests, resetAt: Date.now() + windowSeconds * 1000 };
      }

      return data;
    } catch (err) {
      console.warn('[RedisCache] Rate limit exception:', err);
      return { allowed: true, remaining: maxRequests, resetAt: Date.now() + windowSeconds * 1000 };
    }
  }

  /**
   * Invalidate all keys matching a pattern (use carefully)
   */
  async invalidatePattern(pattern: string): Promise<void> {
    // Clear matching local cache
    for (const key of this.localCache.keys()) {
      if (key.startsWith(pattern.replace('*', ''))) {
        this.localCache.delete(key);
      }
    }

    // Note: Pattern deletion requires SCAN which is expensive
    // For production, consider tracking keys by prefix instead
  }

  /**
   * Set value in local cache only
   */
  private setLocal<T>(key: string, value: T, ttlSeconds: number): void {
    // Evict oldest if at capacity
    if (this.localCache.size >= this.maxLocalSize) {
      const oldestKey = this.localCache.keys().next().value;
      if (oldestKey) this.localCache.delete(oldestKey);
    }

    this.localCache.set(key, {
      data: value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  /**
   * Clear local cache
   */
  clearLocal(): void {
    this.localCache.clear();
  }

  /**
   * Cleanup expired local entries
   */
  cleanupLocal(): void {
    const now = Date.now();
    for (const [key, entry] of this.localCache.entries()) {
      if (now > entry.expiresAt) {
        this.localCache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics for monitoring
   */
  getStats(): { hits: number; misses: number; sets: number; hitRate: number; localSize: number } {
    const total = this.cacheStats.hits + this.cacheStats.misses;
    return {
      ...this.cacheStats,
      hitRate: total > 0 ? this.cacheStats.hits / total : 0,
      localSize: this.localCache.size,
    };
  }

  /**
   * Reset stats (useful for testing)
   */
  resetStats(): void {
    this.cacheStats = { hits: 0, misses: 0, sets: 0 };
  }
}

// Singleton instance
export const redisCache = new RedisCache();

// Periodic local cache cleanup (every 5 minutes)
if (typeof window !== 'undefined') {
  setInterval(() => redisCache.cleanupLocal(), 5 * 60 * 1000);
}

/**
 * Hash function for AI response caching
 * Creates a deterministic hash from input parameters
 */
export function createAIResponseHash(params: Record<string, unknown>): string {
  const normalized = JSON.stringify(params, Object.keys(params).sort());
  return hashString(normalized);
}
