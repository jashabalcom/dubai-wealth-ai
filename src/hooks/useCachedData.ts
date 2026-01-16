import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { redisCache, CACHE_TTL, CACHE_KEYS } from '@/lib/redis-cache';

interface CacheResponse<T> {
  data: T;
  fromCache: boolean;
}

type DataType = 
  | 'propertyCounts' 
  | 'areaBenchmarks' 
  | 'statusCounts' 
  | 'listingCounts' 
  | 'activeAgents' 
  | 'marketStats'
  | 'propertiesWithCounts';

interface FetchOptions {
  dataType: DataType;
  params?: Record<string, unknown>;
  staleTime?: number;
  cacheTime?: number;
}

/**
 * Fetch data through the cached-data edge function with local caching layer
 */
async function fetchCachedData<T>(dataType: DataType, params?: Record<string, unknown>): Promise<T> {
  const cacheKey = `local:${dataType}:${JSON.stringify(params || {})}`;
  
  // Try local cache first (fastest)
  const localCached = redisCache.getLocal<T>(cacheKey);
  if (localCached !== null) {
    return localCached;
  }

  // Call edge function
  const { data, error } = await supabase.functions.invoke('cached-data', {
    body: { dataType, params },
  });

  if (error) {
    console.error(`Error fetching ${dataType}:`, error);
    throw error;
  }

  const result = (data as CacheResponse<T>).data;
  
  // Store in local cache based on data type
  const ttl = getTTLForDataType(dataType);
  redisCache.setLocal(cacheKey, result, ttl);

  return result;
}

function getTTLForDataType(dataType: DataType): number {
  switch (dataType) {
    case 'propertyCounts':
      return CACHE_TTL.medium;
    case 'areaBenchmarks':
      return CACHE_TTL.long;
    case 'statusCounts':
      return CACHE_TTL.short;
    case 'listingCounts':
      return CACHE_TTL.medium;
    case 'activeAgents':
      return CACHE_TTL.medium;
    case 'marketStats':
      return CACHE_TTL.long;
    case 'propertiesWithCounts':
      return CACHE_TTL.short;
    default:
      return CACHE_TTL.medium;
  }
}

/**
 * Hook to fetch cached property counts (area and developer)
 */
export function useCachedPropertyCounts() {
  return useQuery({
    queryKey: ['cached-property-counts'],
    queryFn: () => fetchCachedData<{
      area_counts: Record<string, number>;
      developer_counts: Record<string, number>;
    }>('propertyCounts'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to fetch cached area benchmarks
 */
export function useCachedAreaBenchmarks() {
  return useQuery({
    queryKey: ['cached-area-benchmarks'],
    queryFn: () => fetchCachedData<Array<{
      id: string;
      area_name: string;
      avg_price_sqft: number;
      avg_yield: number;
      data_as_of: string;
      data_source: string;
      is_verified: boolean | null;
      source_url: string | null;
    }>>('areaBenchmarks'),
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000,
  });
}

/**
 * Hook to fetch cached status counts (Ready vs Off-Plan)
 */
export function useCachedStatusCounts(listingType?: 'buy' | 'rent') {
  return useQuery({
    queryKey: ['cached-status-counts', listingType],
    queryFn: () => fetchCachedData<{
      all: number;
      ready: number;
      off_plan: number;
    }>('statusCounts', { listingType }),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch cached listing counts (Buy vs Rent)
 */
export function useCachedListingCounts() {
  return useQuery({
    queryKey: ['cached-listing-counts'],
    queryFn: () => fetchCachedData<{
      buy: number;
      rent: number;
    }>('listingCounts'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to fetch cached active agents
 */
export function useCachedActiveAgents() {
  return useQuery({
    queryKey: ['cached-active-agents'],
    queryFn: () => fetchCachedData<Array<{
      id: string;
      full_name: string;
      avatar_url: string | null;
      bio: string | null;
      years_experience: number | null;
      areas_covered: string[] | null;
      specializations: string[] | null;
      languages: string[] | null;
      is_verified: boolean | null;
      brokerage_id: string | null;
      total_listings: number | null;
      subscription_tier: string | null;
    }>>('activeAgents'),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000,
  });
}

/**
 * Hook to fetch cached market stats for an area
 */
export function useCachedMarketStats(area?: string) {
  return useQuery({
    queryKey: ['cached-market-stats', area],
    queryFn: () => fetchCachedData<{
      area_name: string;
      avg_price_sqft: number | null;
      avg_property_price: number | null;
      avg_yield: number | null;
      price_trend_percent: number | null;
      total_transactions_ytd: number | null;
    } | null>('marketStats', { area }),
    enabled: !!area,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000,
  });
}

/**
 * Hook to fetch properties with all counts in a single query
 */
export function useCachedPropertiesWithCounts(params: {
  listingType?: string;
  status?: string;
  area?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  developer?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
}) {
  return useQuery({
    queryKey: ['cached-properties-with-counts', params],
    queryFn: () => fetchCachedData<{
      properties: any[];
      total_count: number;
      area_counts: Record<string, number>;
      developer_counts: Record<string, number>;
      ready_count: number;
      offplan_count: number;
      buy_count: number;
      rent_count: number;
    }>('propertiesWithCounts', params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
  });
}