import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Split areas into 5 smaller chunks to prevent CPU timeout
const DUBAI_AREA_CHUNKS = [
  // Chunk 1: Premium areas
  [
    { id: 36, name: 'Dubai Marina' },
    { id: 10, name: 'Downtown Dubai' },
    { id: 14, name: 'Palm Jumeirah' },
    { id: 87, name: 'Jumeirah Beach Residence (JBR)' },
    { id: 54, name: 'Business Bay' },
  ],
  // Chunk 2: Popular residential
  [
    { id: 59, name: 'Jumeirah Village Circle (JVC)' },
    { id: 53, name: 'Dubai Hills Estate' },
    { id: 168, name: 'Arabian Ranches' },
    { id: 302, name: 'Mohammed Bin Rashid City' },
    { id: 117, name: 'DIFC' },
  ],
  // Chunk 3: High-density areas
  [
    { id: 12, name: 'Jumeirah Lake Towers (JLT)' },
    { id: 67, name: 'Dubai Sports City' },
    { id: 295, name: 'Dubai Silicon Oasis' },
    { id: 279, name: 'DAMAC Hills' },
    { id: 835, name: 'Sobha Hartland' },
  ],
  // Chunk 4: Lifestyle areas
  [
    { id: 164, name: 'Emirates Hills' },
    { id: 386, name: 'Town Square' },
    { id: 105, name: 'Al Barsha' },
    { id: 268, name: 'Motor City' },
    { id: 23, name: 'Jumeirah' },
  ],
  // Chunk 5: Emerging areas
  [
    { id: 43, name: 'Meydan City' },
    { id: 368, name: 'International City' },
    { id: 79, name: 'Dubai Investment Park' },
    { id: 242, name: 'Dubai Creek Harbour' },
    { id: 1754, name: 'Bluewaters Island' },
  ],
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
  let totalChunksProcessed = 0;
  let errorMessage: string | null = null;
  const chunkResults: { chunk: number; synced: number; error?: string }[] = [];

  try {
    const body = await req.json().catch(() => ({}));
    const triggeredBy = body.triggered_by || 'manual';
    const chunkIndex = body.chunk_index; // Optional: run specific chunk only
    
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

    // Check if schedule is enabled (unless manual trigger)
    if (!schedule.is_enabled && triggeredBy !== 'manual') {
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

    // Parse configuration with sensible defaults for scheduled sync
    const config = schedule.config || {};
    const pagesPerArea = Math.min(config.pages_per_area || 2, 3); // Cap at 3 pages for scheduled
    const liteMode = config.lite_mode !== false; // Default to lite mode for speed
    const includeRentals = config.include_rentals !== false; // Default to include rentals
    const skipRecentlySynced = config.skip_recently_synced !== false; // Skip recent by default

    console.log(`[Scheduled Sync] Config: ${pagesPerArea} pages/area, lite=${liteMode}, rentals=${includeRentals}, skipRecent=${skipRecentlySynced}`);

    // Update last_run_at immediately
    await supabase
      .from('sync_schedules')
      .update({ 
        last_run_at: new Date().toISOString(),
        last_run_status: 'running'
      })
      .eq('schedule_name', 'bayut_daily_sync');

    // Determine which chunks to process
    const chunksToProcess = chunkIndex !== undefined 
      ? [DUBAI_AREA_CHUNKS[chunkIndex]] 
      : DUBAI_AREA_CHUNKS;

    // Process each chunk sequentially (prevents CPU overload)
    for (let i = 0; i < chunksToProcess.length; i++) {
      const chunk = chunksToProcess[i];
      const actualChunkIndex = chunkIndex !== undefined ? chunkIndex : i;
      
      console.log(`[Scheduled Sync] Processing chunk ${actualChunkIndex + 1}/${DUBAI_AREA_CHUNKS.length}: ${chunk.map(a => a.name).join(', ')}`);

      try {
        // Call sync function with chunked_sync action for better timeout handling
        const { data: syncResult, error: syncError } = await supabase.functions.invoke('sync-bayut-properties', {
          body: {
            action: 'chunked_sync',
            areas: chunk,
            max_pages: pagesPerArea,
            lite_mode: liteMode,
            include_rentals: includeRentals,
            areas_per_chunk: chunk.length, // Process all areas in this chunk
          },
        });

        if (syncError) {
          console.error(`[Scheduled Sync] Chunk ${actualChunkIndex + 1} error:`, syncError);
          chunkResults.push({ 
            chunk: actualChunkIndex + 1, 
            synced: 0, 
            error: syncError.message 
          });
          continue;
        }

        const chunkSynced = syncResult?.progress?.properties_synced || 
                           syncResult?.chunk_stats?.properties_synced || 0;
        totalPropertiesSynced += chunkSynced;
        totalChunksProcessed++;

        chunkResults.push({ 
          chunk: actualChunkIndex + 1, 
          synced: chunkSynced 
        });

        console.log(`[Scheduled Sync] Chunk ${actualChunkIndex + 1} complete: ${chunkSynced} properties`);

        // Small delay between chunks to prevent rate limiting
        if (i < chunksToProcess.length - 1) {
          await new Promise(r => setTimeout(r, 2000));
        }

      } catch (chunkError) {
        const errorMsg = chunkError instanceof Error ? chunkError.message : String(chunkError);
        console.error(`[Scheduled Sync] Chunk ${actualChunkIndex + 1} failed:`, errorMsg);
        chunkResults.push({ 
          chunk: actualChunkIndex + 1, 
          synced: 0, 
          error: errorMsg 
        });
      }
    }

    const durationSeconds = Math.round((Date.now() - startTime) / 1000);
    const hasErrors = chunkResults.some(r => r.error);
    const status = hasErrors 
      ? (totalPropertiesSynced > 0 ? 'completed_with_errors' : 'failed')
      : 'completed';

    console.log(`[Scheduled Sync] Completed: ${totalPropertiesSynced} properties in ${durationSeconds}s (${totalChunksProcessed}/${chunksToProcess.length} chunks)`);

    // Update schedule with results
    await supabase
      .from('sync_schedules')
      .update({ 
        last_run_status: status,
        last_run_properties_synced: totalPropertiesSynced,
        last_run_duration_seconds: durationSeconds,
        next_run_at: getNextRunTime(schedule.cron_expression),
      })
      .eq('schedule_name', 'bayut_daily_sync');

    // Create appropriate alert
    if (totalPropertiesSynced > 0) {
      await supabase.from('sync_alerts').insert({
        alert_type: hasErrors ? 'sync_partial' : 'sync_success',
        severity: hasErrors ? 'warning' : 'info',
        title: hasErrors ? 'Scheduled Sync Completed with Errors' : 'Scheduled Sync Completed',
        message: `Daily Bayut sync: ${totalPropertiesSynced} properties synced in ${durationSeconds}s. Chunks: ${totalChunksProcessed}/${chunksToProcess.length}`,
        is_acknowledged: false,
      });
    } else if (hasErrors) {
      await supabase.from('sync_alerts').insert({
        alert_type: 'sync_failure',
        severity: 'error',
        title: 'Scheduled Sync Failed',
        message: `All sync chunks failed. Check API key and connection.`,
        is_acknowledged: false,
      });
    }

    return new Response(
      JSON.stringify({ 
        success: totalPropertiesSynced > 0 || !hasErrors, 
        message: `Scheduled sync ${status}`,
        totalPropertiesSynced,
        durationSeconds,
        triggeredBy,
        chunksProcessed: totalChunksProcessed,
        totalChunks: chunksToProcess.length,
        chunkResults,
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
        chunkResults,
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
