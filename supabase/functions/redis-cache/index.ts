import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CacheRequest {
  operation: 'get' | 'set' | 'delete' | 'rateLimit';
  key: string;
  value?: unknown;
  ttl?: number;
  maxRequests?: number;
  windowSeconds?: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const UPSTASH_REDIS_REST_URL = Deno.env.get('UPSTASH_REDIS_REST_URL');
  const UPSTASH_REDIS_REST_TOKEN = Deno.env.get('UPSTASH_REDIS_REST_TOKEN');

  if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
    console.error('[redis-cache] Missing Upstash credentials');
    return new Response(
      JSON.stringify({ error: 'Redis not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { operation, key, value, ttl, maxRequests, windowSeconds }: CacheRequest = await req.json();

    if (!operation || !key) {
      return new Response(
        JSON.stringify({ error: 'Missing operation or key' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[redis-cache] ${operation} key=${key}`);

    // Helper to make Redis REST API calls
    async function redisCommand(command: string[]): Promise<unknown> {
      const response = await fetch(`${UPSTASH_REDIS_REST_URL}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Redis error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      return result.result;
    }

    switch (operation) {
      case 'get': {
        const result = await redisCommand(['GET', key]);
        let parsedValue = null;
        
        if (result) {
          try {
            parsedValue = JSON.parse(result as string);
          } catch {
            parsedValue = result;
          }
        }

        return new Response(
          JSON.stringify({ value: parsedValue }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'set': {
        const serializedValue = JSON.stringify(value);
        const commands = ttl 
          ? ['SET', key, serializedValue, 'EX', ttl.toString()]
          : ['SET', key, serializedValue];
        
        await redisCommand(commands);

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'delete': {
        await redisCommand(['DEL', key]);

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'rateLimit': {
        if (!maxRequests || !windowSeconds) {
          return new Response(
            JSON.stringify({ error: 'Missing maxRequests or windowSeconds' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const now = Date.now();
        const windowStart = now - windowSeconds * 1000;

        // Use Redis sorted set for sliding window rate limiting
        // Remove old entries
        await redisCommand(['ZREMRANGEBYSCORE', key, '0', windowStart.toString()]);

        // Count current requests in window
        const count = await redisCommand(['ZCARD', key]) as number;

        if (count >= maxRequests) {
          // Get oldest entry to calculate reset time
          const oldest = await redisCommand(['ZRANGE', key, '0', '0', 'WITHSCORES']) as string[];
          const resetAt = oldest.length >= 2 
            ? parseInt(oldest[1]) + windowSeconds * 1000 
            : now + windowSeconds * 1000;

          return new Response(
            JSON.stringify({ 
              allowed: false, 
              remaining: 0, 
              resetAt,
              retryAfter: Math.ceil((resetAt - now) / 1000)
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Add current request
        await redisCommand(['ZADD', key, now.toString(), `${now}-${Math.random()}`]);
        
        // Set expiry on the key
        await redisCommand(['EXPIRE', key, (windowSeconds + 1).toString()]);

        return new Response(
          JSON.stringify({ 
            allowed: true, 
            remaining: maxRequests - count - 1,
            resetAt: now + windowSeconds * 1000
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Unknown operation' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal error';
    console.error('[redis-cache] Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
