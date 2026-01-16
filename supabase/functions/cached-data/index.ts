import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Request tracing
function generateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
}

class RequestTimer {
  private startTime: number;
  private checkpoints: Map<string, number> = new Map();
  public readonly requestId: string;

  constructor() {
    this.startTime = Date.now();
    this.requestId = generateRequestId();
  }

  checkpoint(name: string): void {
    this.checkpoints.set(name, Date.now() - this.startTime);
  }

  getDuration(): number {
    return Date.now() - this.startTime;
  }

  log(dataType: string, status: 'success' | 'error' | 'cache_hit' = 'success'): void {
    const duration = this.getDuration();
    const checkpointsObj = Object.fromEntries(this.checkpoints);
    
    console.log(JSON.stringify({
      requestId: this.requestId,
      dataType,
      status,
      duration,
      checkpoints: checkpointsObj,
      timestamp: new Date().toISOString(),
    }));

    // Alert on slow requests (>1 second for cached-data)
    if (duration > 1000) {
      console.warn(`[SLOW] ${this.requestId} ${dataType} took ${duration}ms`, checkpointsObj);
    }
  }
}

// CDN cache headers for different data types
const getCacheHeaders = (ttlSeconds: number, dataType: string, requestId: string): Record<string, string> => ({
  ...corsHeaders,
  'Content-Type': 'application/json',
  // CDN caching: cache publicly for specified duration
  'Cache-Control': `public, max-age=${ttlSeconds}, s-maxage=${ttlSeconds * 2}, stale-while-revalidate=${ttlSeconds}`,
  // Vary by authorization to ensure different users get correct data
  'Vary': 'Authorization',
  // Custom headers for debugging cache behavior
  'X-Cache-TTL': ttlSeconds.toString(),
  'X-Data-Type': dataType,
  'X-Request-ID': requestId,
});

// Cache TTLs in seconds
const CACHE_TTL = {
  propertyCounts: 300,      // 5 minutes
  areaBenchmarks: 900,      // 15 minutes
  statusCounts: 120,        // 2 minutes
  listingCounts: 300,       // 5 minutes
  activeAgents: 600,        // 10 minutes
  marketStats: 900,         // 15 minutes
};

// Redis REST API helper
async function redisCommand(command: string[]): Promise<any> {
  const redisUrl = Deno.env.get('UPSTASH_REDIS_REST_URL');
  const redisToken = Deno.env.get('UPSTASH_REDIS_REST_TOKEN');
  
  if (!redisUrl || !redisToken) {
    return null;
  }

  try {
    const response = await fetch(`${redisUrl}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${redisToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(command),
    });

    if (!response.ok) {
      console.error('Redis error:', response.status);
      return null;
    }

    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error('Redis command error:', error);
    return null;
  }
}

async function getCached<T>(key: string): Promise<T | null> {
  const result = await redisCommand(['GET', key]);
  if (result) {
    try {
      return JSON.parse(result) as T;
    } catch {
      return null;
    }
  }
  return null;
}

async function setCache(key: string, value: any, ttl: number): Promise<void> {
  await redisCommand(['SET', key, JSON.stringify(value), 'EX', ttl.toString()]);
}

serve(async (req) => {
  const timer = new RequestTimer();
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    timer.checkpoint('supabase_init');

    const { dataType, params } = await req.json();
    const cacheKey = `cache:${dataType}:${JSON.stringify(params || {})}`;
    timer.checkpoint('parse_request');

    // Try cache first
    const cached = await getCached(cacheKey);
    timer.checkpoint('cache_check');
    
    if (cached) {
      timer.log(dataType, 'cache_hit');
      const ttl = CACHE_TTL[dataType as keyof typeof CACHE_TTL] || 300;
      return new Response(JSON.stringify({ data: cached, fromCache: true }), {
        headers: getCacheHeaders(ttl, dataType, timer.requestId),
      });
    }
    let data: any;
    let ttl: number;

    switch (dataType) {
      case 'propertyCounts': {
        ttl = CACHE_TTL.propertyCounts;
        const { data: result, error } = await supabase.rpc('get_property_counts');
        if (error) throw error;
        data = result?.[0] || { area_counts: {}, developer_counts: {} };
        break;
      }

      case 'areaBenchmarks': {
        ttl = CACHE_TTL.areaBenchmarks;
        const { data: result, error } = await supabase
          .from('area_benchmarks')
          .select('*')
          .order('area_name');
        if (error) throw error;
        data = result || [];
        break;
      }

      case 'statusCounts': {
        ttl = CACHE_TTL.statusCounts;
        const listingType = params?.listingType === 'rent' ? 'rent' : 'sale';
        
        // Optimized: single query with counts
        const [allResult, readyResult, offPlanResult] = await Promise.all([
          supabase
            .from('properties')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'available')
            .eq('listing_type', listingType),
          supabase
            .from('properties')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'available')
            .eq('listing_type', listingType)
            .eq('completion_status', 'ready'),
          supabase
            .from('properties')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'available')
            .eq('listing_type', listingType)
            .neq('completion_status', 'ready'),
        ]);

        data = {
          all: allResult.count || 0,
          ready: readyResult.count || 0,
          off_plan: offPlanResult.count || 0,
        };
        break;
      }

      case 'listingCounts': {
        ttl = CACHE_TTL.listingCounts;
        const [buyResult, rentResult] = await Promise.all([
          supabase
            .from('properties')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'available')
            .eq('listing_type', 'sale'),
          supabase
            .from('properties')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'available')
            .eq('listing_type', 'rent'),
        ]);

        data = {
          buy: buyResult.count || 0,
          rent: rentResult.count || 0,
        };
        break;
      }

      case 'activeAgents': {
        ttl = CACHE_TTL.activeAgents;
        const { data: result, error } = await supabase.rpc('get_active_agents');
        if (error) throw error;
        data = result || [];
        break;
      }

      case 'marketStats': {
        ttl = CACHE_TTL.marketStats;
        const areaName = params?.area;
        
        const { data: result, error } = await supabase
          .from('area_market_data')
          .select('*')
          .eq('is_active', true)
          .order('updated_at', { ascending: false });
        
        if (error) throw error;
        
        if (areaName) {
          data = result?.find(r => r.area_name === areaName) || null;
        } else {
          data = result || [];
        }
        break;
      }

      case 'propertiesWithCounts': {
        ttl = CACHE_TTL.statusCounts;
        const { data: result, error } = await supabase.rpc('get_properties_with_counts', {
          p_listing_type: params?.listingType || null,
          p_status: params?.status || 'available',
          p_area: params?.area || null,
          p_property_type: params?.propertyType || null,
          p_min_price: params?.minPrice || null,
          p_max_price: params?.maxPrice || null,
          p_bedrooms: params?.bedrooms || null,
          p_developer: params?.developer || null,
          p_limit: params?.limit || 20,
          p_offset: params?.offset || 0,
          p_sort_by: params?.sortBy || 'newest',
        });
        
        if (error) throw error;
        data = result?.[0] || {
          properties: [],
          total_count: 0,
          area_counts: {},
          developer_counts: {},
          ready_count: 0,
          offplan_count: 0,
          buy_count: 0,
          rent_count: 0,
        };
        break;
      }

      default:
        timer.log(dataType, 'error');
        return new Response(
          JSON.stringify({ error: `Unknown data type: ${dataType}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Request-ID': timer.requestId } }
        );
    }

    timer.checkpoint('db_query');

    // Cache the result
    await setCache(cacheKey, data, ttl);
    timer.checkpoint('cache_set');
    
    timer.log(dataType, 'success');

    return new Response(
      JSON.stringify({ data, fromCache: false }),
      { headers: getCacheHeaders(ttl, dataType, timer.requestId) }
    );

  } catch (error) {
    timer.log('unknown', 'error');
    console.error('Error in cached-data function:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Request-ID': timer.requestId } }
    );
  }
});