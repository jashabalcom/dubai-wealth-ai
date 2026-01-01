/**
 * Simple in-memory cache with TTL support
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private maxSize = 100;

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlSeconds: number): void {
    // Evict oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }
    
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clear expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  // Get with automatic fetch if not cached
  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) return cached;
    
    const data = await fetcher();
    this.set(key, data, ttlSeconds);
    return data;
  }
}

// Singleton instance
export const cache = new MemoryCache();

// Cache key generators
export const cacheKeys = {
  areaBenchmarks: (area: string) => `benchmarks:${area}`,
  propertyDetails: (id: string) => `property:${id}`,
  developerProjects: (developerId: string) => `developer:${developerId}:projects`,
  marketStats: (area: string) => `market-stats:${area}`,
  userProfile: (userId: string) => `profile:${userId}`,
  newsArticles: (page: number) => `news:page:${page}`,
};

// TTL constants (in seconds)
export const cacheTTL = {
  short: 60,           // 1 minute
  medium: 300,         // 5 minutes
  long: 900,           // 15 minutes
  veryLong: 3600,      // 1 hour
  day: 86400,          // 24 hours
};

// Periodic cleanup (run every 5 minutes)
if (typeof window !== 'undefined') {
  setInterval(() => cache.cleanup(), 5 * 60 * 1000);
}
