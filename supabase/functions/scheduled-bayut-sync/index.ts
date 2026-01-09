import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Top 25 Dubai investment areas
const TOP_DUBAI_AREAS = [
  { id: 36, name: 'Dubai Marina' },
  { id: 10, name: 'Downtown Dubai' },
  { id: 14, name: 'Palm Jumeirah' },
  { id: 87, name: 'Jumeirah Beach Residence (JBR)' },
  { id: 54, name: 'Business Bay' },
  { id: 59, name: 'Jumeirah Village Circle (JVC)' },
  { id: 53, name: 'Dubai Hills Estate' },
  { id: 168, name: 'Arabian Ranches' },
  { id: 302, name: 'Mohammed Bin Rashid City' },
  { id: 117, name: 'DIFC' },
  { id: 12, name: 'Jumeirah Lake Towers (JLT)' },
  { id: 67, name: 'Dubai Sports City' },
  { id: 295, name: 'Dubai Silicon Oasis' },
  { id: 279, name: 'DAMAC Hills' },
  { id: 835, name: 'Sobha Hartland' },
  { id: 164, name: 'Emirates Hills' },
  { id: 386, name: 'Town Square' },
  { id: 105, name: 'Al Barsha' },
  { id: 268, name: 'Motor City' },
  { id: 23, name: 'Jumeirah' },
  { id: 43, name: 'Meydan City' },
  { id: 368, name: 'International City' },
  { id: 79, name: 'Dubai Investment Park' },
  { id: 242, name: 'Dubai Creek Harbour' },
  { id: 1754, name: 'Bluewaters Island' },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const startTime = Date.now();
  let totalPropertiesSynced = 0;
  let errorMessage: string | null = null;

  try {
    const body = await req.json().catch(() => ({}));
    const triggeredBy = body.triggered_by || 'manual';
    
    console.log(`[Scheduled Sync] Starting sync triggered by: ${triggeredBy}`);

    // Fetch schedule configuration
    const { data: schedule, error: scheduleError } = await supabase
      .from('sync_schedules')
      .select('*')
      .eq('schedule_name', 'bayut_daily_sync')
      .single();

    if (scheduleError) {
      console.error('[Scheduled Sync] Failed to fetch schedule:', scheduleError);
      throw new Error('Failed to fetch schedule configuration');
    }

    // Check if schedule is enabled
    if (!schedule.is_enabled) {
      console.log('[Scheduled Sync] Schedule is disabled, skipping sync');
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Schedule is disabled',
          skipped: true 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse configuration
    const config = schedule.config || {};
    const pagesPerArea = config.pages_per_area || 5;
    const liteMode = config.lite_mode || false;
    const includeRentals = config.include_rentals !== false;
    const skipRecentlySynced = config.skip_recently_synced || false;

    console.log(`[Scheduled Sync] Config: ${pagesPerArea} pages/area, lite=${liteMode}, rentals=${includeRentals}`);

    // Update last_run_at immediately
    await supabase
      .from('sync_schedules')
      .update({ 
        last_run_at: new Date().toISOString(),
        last_run_status: 'running'
      })
      .eq('schedule_name', 'bayut_daily_sync');

    // Call the main sync function using bulk_sync action
    const { data: syncResult, error: syncError } = await supabase.functions.invoke('sync-bayut-properties', {
      body: {
        action: 'bulk_sync',
        areas: TOP_DUBAI_AREAS,
        max_pages: pagesPerArea,
        lite_mode: liteMode,
        include_rentals: includeRentals,
        skip_recently_synced: skipRecentlySynced,
      },
    });

    if (syncError) {
      throw new Error(`Sync failed: ${syncError.message}`);
    }

    totalPropertiesSynced = syncResult?.totalPropertiesSynced || 0;
    const durationSeconds = Math.round((Date.now() - startTime) / 1000);

    console.log(`[Scheduled Sync] Completed: ${totalPropertiesSynced} properties in ${durationSeconds}s`);

    // Update schedule with results
    await supabase
      .from('sync_schedules')
      .update({ 
        last_run_status: 'completed',
        last_run_properties_synced: totalPropertiesSynced,
        last_run_duration_seconds: durationSeconds,
        next_run_at: getNextRunTime(schedule.cron_expression),
      })
      .eq('schedule_name', 'bayut_daily_sync');

    // Create success alert if significant sync
    if (totalPropertiesSynced > 0) {
      await supabase.from('sync_alerts').insert({
        alert_type: 'sync_success',
        severity: 'info',
        title: 'Scheduled Sync Completed',
        message: `Daily Bayut sync completed: ${totalPropertiesSynced} properties synced in ${durationSeconds}s`,
        is_acknowledged: false,
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Scheduled sync completed`,
        totalPropertiesSynced,
        durationSeconds,
        triggeredBy,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Scheduled Sync] Error:', errorMessage);

    const durationSeconds = Math.round((Date.now() - startTime) / 1000);

    // Update schedule with error status
    await supabase
      .from('sync_schedules')
      .update({ 
        last_run_status: 'failed',
        last_run_properties_synced: totalPropertiesSynced,
        last_run_duration_seconds: durationSeconds,
      })
      .eq('schedule_name', 'bayut_daily_sync');

    // Create failure alert
    await supabase.from('sync_alerts').insert({
      alert_type: 'sync_failure',
      severity: 'error',
      title: 'Scheduled Sync Failed',
      message: `Daily Bayut sync failed: ${errorMessage}`,
      is_acknowledged: false,
    });

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        totalPropertiesSynced,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Calculate next run time based on cron expression (simplified for daily at specific hour)
function getNextRunTime(cronExpression: string): string {
  const now = new Date();
  const parts = cronExpression.split(' ');
  
  if (parts.length >= 2) {
    const minute = parseInt(parts[0]) || 0;
    const hour = parseInt(parts[1]) || 23;
    
    const nextRun = new Date(now);
    nextRun.setUTCHours(hour, minute, 0, 0);
    
    // If we've already passed this time today, move to tomorrow
    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1);
    }
    
    return nextRun.toISOString();
  }
  
  // Default: tomorrow at same time
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString();
}
