import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RateLimitConfig {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Max requests per window
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  default: { windowMs: 60000, maxRequests: 60 },      // 60 req/min
  ai: { windowMs: 60000, maxRequests: 10 },           // 10 AI calls/min
  auth: { windowMs: 300000, maxRequests: 5 },         // 5 auth attempts/5min
  search: { windowMs: 60000, maxRequests: 30 },       // 30 searches/min
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { identifier, endpoint = 'default' } = await req.json();
    
    if (!identifier) {
      return new Response(
        JSON.stringify({ error: 'identifier is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const config = RATE_LIMITS[endpoint] || RATE_LIMITS.default;
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const windowStart = new Date(Date.now() - config.windowMs).toISOString();
    const key = `${endpoint}:${identifier}`;

    // Get current request count
    const { data: existingLimit, error: fetchError } = await supabase
      .from('rate_limits')
      .select('request_count, expires_at')
      .eq('key', key)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (fetchError) {
      console.error('[rate-limiter] Fetch error:', fetchError);
      // Fail open - allow request if rate limiter has issues
      return new Response(
        JSON.stringify({ allowed: true, remaining: config.maxRequests }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let currentCount = 0;
    let expiresAt = new Date(Date.now() + config.windowMs).toISOString();

    if (existingLimit) {
      currentCount = existingLimit.request_count;
      expiresAt = existingLimit.expires_at;
    }

    // Check if limit exceeded
    if (currentCount >= config.maxRequests) {
      const retryAfter = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000);
      
      console.log(`[rate-limiter] Rate limit exceeded for ${key}`);
      
      return new Response(
        JSON.stringify({
          allowed: false,
          remaining: 0,
          retryAfter,
          message: 'Rate limit exceeded. Please try again later.',
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': String(retryAfter),
          } 
        }
      );
    }

    // Increment counter
    const { error: upsertError } = await supabase
      .from('rate_limits')
      .upsert({
        key,
        identifier,
        endpoint,
        request_count: currentCount + 1,
        expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'key' });

    if (upsertError) {
      console.error('[rate-limiter] Upsert error:', upsertError);
    }

    const remaining = config.maxRequests - currentCount - 1;

    return new Response(
      JSON.stringify({
        allowed: true,
        remaining,
        limit: config.maxRequests,
        resetAt: expiresAt,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[rate-limiter] Error:', error);
    // Fail open
    return new Response(
      JSON.stringify({ allowed: true, error: 'Rate limiter error' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
