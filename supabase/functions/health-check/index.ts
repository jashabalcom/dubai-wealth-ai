import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  checks: {
    database: { status: string; latencyMs: number };
    storage: { status: string };
    auth: { status: string };
  };
  uptime: number;
}

const startTime = Date.now();

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('[health-check] Health check requested');

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const checks: HealthStatus['checks'] = {
    database: { status: 'unknown', latencyMs: 0 },
    storage: { status: 'unknown' },
    auth: { status: 'unknown' },
  };

  let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

  // Check database connectivity and latency
  try {
    const dbStart = Date.now();
    const { error } = await supabase.from('areas').select('id').limit(1);
    const dbLatency = Date.now() - dbStart;
    
    if (error) {
      console.error('[health-check] Database check failed:', error.message);
      checks.database = { status: 'error', latencyMs: dbLatency };
      overallStatus = 'unhealthy';
    } else {
      checks.database = { 
        status: dbLatency < 500 ? 'healthy' : 'slow', 
        latencyMs: dbLatency 
      };
      if (dbLatency >= 500) {
        overallStatus = 'degraded';
      }
    }
    console.log(`[health-check] Database latency: ${dbLatency}ms`);
  } catch (err) {
    console.error('[health-check] Database check exception:', err);
    checks.database = { status: 'error', latencyMs: -1 };
    overallStatus = 'unhealthy';
  }

  // Check storage availability
  try {
    const { data, error } = await supabase.storage.listBuckets();
    if (error) {
      console.error('[health-check] Storage check failed:', error.message);
      checks.storage = { status: 'error' };
      if (overallStatus === 'healthy') overallStatus = 'degraded';
    } else {
      checks.storage = { status: 'healthy' };
    }
  } catch (err) {
    console.error('[health-check] Storage check exception:', err);
    checks.storage = { status: 'error' };
    if (overallStatus === 'healthy') overallStatus = 'degraded';
  }

  // Check auth service
  try {
    const { data, error } = await supabase.auth.getSession();
    // No session is expected for service role, but no error means auth is working
    checks.auth = { status: 'healthy' };
  } catch (err) {
    console.error('[health-check] Auth check exception:', err);
    checks.auth = { status: 'error' };
    if (overallStatus === 'healthy') overallStatus = 'degraded';
  }

  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);

  const healthStatus: HealthStatus = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    checks,
    uptime: uptimeSeconds,
  };

  console.log(`[health-check] Status: ${overallStatus}, DB latency: ${checks.database.latencyMs}ms`);

  const httpStatus = overallStatus === 'unhealthy' ? 503 : 200;

  return new Response(JSON.stringify(healthStatus, null, 2), {
    status: httpStatus,
    headers: { 
      ...corsHeaders, 
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
});
