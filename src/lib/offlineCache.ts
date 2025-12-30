const CACHE_PREFIX = 'mla_cache_';
const CACHE_VERSION = 'v1';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version: string;
}

export function setCacheItem<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      version: CACHE_VERSION,
    };
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(entry));
  } catch (error) {
    console.warn('Failed to cache data:', error);
    // Handle quota exceeded by clearing old cache entries
    clearOldCacheEntries();
  }
}

export function getCacheItem<T>(key: string, maxAge?: number): T | null {
  try {
    const stored = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!stored) return null;

    const entry: CacheEntry<T> = JSON.parse(stored);
    
    // Check version
    if (entry.version !== CACHE_VERSION) {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }

    // Check age if maxAge is specified (in milliseconds)
    if (maxAge && Date.now() - entry.timestamp > maxAge) {
      return null; // Return null but don't delete - still useful as stale data
    }

    return entry.data;
  } catch (error) {
    console.warn('Failed to read cache:', error);
    return null;
  }
}

export function getCacheTimestamp(key: string): Date | null {
  try {
    const stored = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!stored) return null;

    const entry = JSON.parse(stored);
    return new Date(entry.timestamp);
  } catch {
    return null;
  }
}

export function removeCacheItem(key: string): void {
  localStorage.removeItem(`${CACHE_PREFIX}${key}`);
}

export function clearOldCacheEntries(maxAgeMs: number = 1000 * 60 * 60 * 24 * 7): void {
  const now = Date.now();
  const keysToRemove: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(CACHE_PREFIX)) {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const entry = JSON.parse(stored);
          if (now - entry.timestamp > maxAgeMs || entry.version !== CACHE_VERSION) {
            keysToRemove.push(key);
          }
        }
      } catch {
        keysToRemove.push(key);
      }
    }
  }

  keysToRemove.forEach(key => localStorage.removeItem(key));
}

// Recently viewed properties cache
export function cacheRecentlyViewed(properties: any[]): void {
  setCacheItem('recently_viewed', properties.slice(0, 20)); // Keep last 20
}

export function getCachedRecentlyViewed(): any[] {
  return getCacheItem('recently_viewed') || [];
}

// Saved properties cache
export function cacheSavedPropertyIds(ids: string[]): void {
  setCacheItem('saved_property_ids', ids);
}

export function getCachedSavedPropertyIds(): string[] {
  return getCacheItem('saved_property_ids') || [];
}

// Portfolio data cache
export function cachePortfolioData(portfolio: any, properties: any[]): void {
  setCacheItem('portfolio', { portfolio, properties });
}

export function getCachedPortfolioData(): { portfolio: any; properties: any[] } | null {
  return getCacheItem('portfolio');
}
