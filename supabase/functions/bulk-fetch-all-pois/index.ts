import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { skipExisting = true, limit } = await req.json().catch(() => ({}));

    console.log('Starting bulk POI fetch for all neighborhoods...');

    // Get all published neighborhoods with coordinates
    let query = supabase
      .from('neighborhoods')
      .select('id, name, latitude, longitude')
      .eq('is_published', true)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    if (limit) {
      query = query.limit(limit);
    }

    const { data: neighborhoods, error: fetchError } = await query;

    if (fetchError) {
      throw new Error(`Failed to fetch neighborhoods: ${fetchError.message}`);
    }

    if (!neighborhoods || neighborhoods.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No neighborhoods with coordinates found', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${neighborhoods.length} neighborhoods to process`);

    // If skipExisting, get neighborhoods that already have POIs
    let existingNeighborhoodIds: Set<string> = new Set();
    if (skipExisting) {
      const { data: existingPOIs } = await supabase
        .from('neighborhood_pois')
        .select('neighborhood_id')
        .limit(10000);

      if (existingPOIs) {
        existingNeighborhoodIds = new Set(existingPOIs.map(p => p.neighborhood_id));
      }
      console.log(`Skipping ${existingNeighborhoodIds.size} neighborhoods that already have POIs`);
    }

    const results: { name: string; success: boolean; poiCount?: number; error?: string }[] = [];
    let totalPOIs = 0;
    let processed = 0;
    let skipped = 0;

    for (const neighborhood of neighborhoods) {
      // Skip if already has POIs and skipExisting is true
      if (skipExisting && existingNeighborhoodIds.has(neighborhood.id)) {
        skipped++;
        results.push({ name: neighborhood.name, success: true, poiCount: 0, error: 'Skipped - already has POIs' });
        continue;
      }

      try {
        console.log(`Processing ${neighborhood.name} (${processed + 1}/${neighborhoods.length - skipped})...`);

        // Call the existing fetch-neighborhood-pois function
        const response = await fetch(`${supabaseUrl}/functions/v1/fetch-neighborhood-pois`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            neighborhoodId: neighborhood.id,
            latitude: neighborhood.latitude,
            longitude: neighborhood.longitude,
            radius: 2000,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API error: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        
        if (result.success) {
          totalPOIs += result.totalUpserted || 0;
          results.push({ name: neighborhood.name, success: true, poiCount: result.totalUpserted || 0 });
          console.log(`✓ ${neighborhood.name}: ${result.totalUpserted || 0} POIs`);
        } else {
          results.push({ name: neighborhood.name, success: false, error: result.error });
          console.error(`✗ ${neighborhood.name}: ${result.error}`);
        }

        processed++;

        // Rate limiting - wait 500ms between neighborhoods to respect API limits
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.push({ name: neighborhood.name, success: false, error: errorMessage });
        console.error(`✗ ${neighborhood.name}: ${errorMessage}`);
        processed++;
        
        // Continue to next neighborhood even if one fails
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    const successCount = results.filter(r => r.success && !r.error?.includes('Skipped')).length;
    const failCount = results.filter(r => !r.success).length;

    console.log(`Bulk POI fetch complete: ${successCount} successful, ${failCount} failed, ${skipped} skipped, ${totalPOIs} total POIs`);

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          total: neighborhoods.length,
          processed,
          skipped,
          successful: successCount,
          failed: failCount,
          totalPOIsAdded: totalPOIs,
        },
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Bulk POI fetch error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
