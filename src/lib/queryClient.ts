import { QueryClient } from '@tanstack/react-query';

/**
 * Optimized React Query client configuration
 * 
 * Performance optimizations:
 * - Extended staleTime reduces unnecessary refetches
 * - Extended gcTime keeps data in cache longer
 * - Disabled refetchOnWindowFocus for stable UX
 * - Retry with exponential backoff
 * - Query deduplication via shared query client
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh for 5 minutes
      staleTime: 5 * 60 * 1000,
      
      // Keep unused data in cache for 30 minutes
      gcTime: 30 * 60 * 1000,
      
      // Don't refetch on window focus (prevents jarring updates)
      refetchOnWindowFocus: false,
      
      // Only refetch on reconnect if data is stale
      refetchOnReconnect: 'always',
      
      // Don't refetch when component mounts if data is fresh
      refetchOnMount: false,
      
      // Retry failed requests with exponential backoff
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Network mode: always try to fetch, use cache as fallback
      networkMode: 'offlineFirst',
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
      
      // Network mode for mutations
      networkMode: 'online',
    },
  },
});

/**
 * Query key factory for consistent cache keys
 */
export const queryKeys = {
  // Properties
  properties: {
    all: ['properties'] as const,
    list: (filters: Record<string, unknown>) => ['properties', 'list', filters] as const,
    detail: (id: string) => ['properties', 'detail', id] as const,
    counts: () => ['properties', 'counts'] as const,
  },
  
  // Area benchmarks
  benchmarks: {
    all: ['area-benchmarks'] as const,
    byArea: (area: string) => ['area-benchmarks', area] as const,
  },
  
  // Agents
  agents: {
    all: ['agents'] as const,
    active: () => ['agents', 'active'] as const,
    detail: (id: string) => ['agents', 'detail', id] as const,
  },
  
  // Market data
  market: {
    stats: (area?: string) => ['market-stats', area] as const,
    digests: () => ['market-digests'] as const,
  },
  
  // Cached data
  cached: {
    propertyCounts: () => ['cached-property-counts'] as const,
    statusCounts: (listingType?: string) => ['cached-status-counts', listingType] as const,
    listingCounts: () => ['cached-listing-counts'] as const,
    areaBenchmarks: () => ['cached-area-benchmarks'] as const,
    activeAgents: () => ['cached-active-agents'] as const,
    marketStats: (area?: string) => ['cached-market-stats', area] as const,
    propertiesWithCounts: (params: Record<string, unknown>) => ['cached-properties-with-counts', params] as const,
  },
} as const;

/**
 * Prefetch common data for better perceived performance
 */
export async function prefetchCommonData(): Promise<void> {
  // This can be called on app initialization to warm the cache
  // Implementation would prefetch frequently accessed data
  console.log('[QueryClient] Prefetch available for common data');
}

/**
 * Clear all cached data (useful for logout or data refresh)
 */
export function clearQueryCache(): void {
  queryClient.clear();
  console.log('[QueryClient] Cache cleared');
}

/**
 * Invalidate specific query patterns
 */
export function invalidateQueries(pattern: readonly unknown[]): Promise<void> {
  return queryClient.invalidateQueries({ queryKey: pattern });
}
