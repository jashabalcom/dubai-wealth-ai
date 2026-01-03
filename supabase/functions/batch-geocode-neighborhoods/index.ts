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
    const geoapifyApiKey = Deno.env.get('GEOAPIFY_API_KEY');
    if (!geoapifyApiKey) {
      throw new Error('GEOAPIFY_API_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all neighborhoods with missing coordinates
    const { data: neighborhoods, error: fetchError } = await supabase
      .from('neighborhoods')
      .select('id, name, slug')
      .or('latitude.is.null,longitude.is.null')
      .order('name');

    if (fetchError) {
      throw new Error(`Failed to fetch neighborhoods: ${fetchError.message}`);
    }

    if (!neighborhoods || neighborhoods.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'All neighborhoods already have coordinates',
        processed: 0,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    console.log(`Found ${neighborhoods.length} neighborhoods to geocode`);

    const results: { name: string; success: boolean; coordinates?: { lat: number; lng: number }; error?: string }[] = [];

    for (const neighborhood of neighborhoods) {
      try {
        // Add delay to respect rate limits (5 requests/second for free tier)
        await new Promise(resolve => setTimeout(resolve, 250));

        const searchQuery = `${neighborhood.name}, Dubai, UAE`;
        const geocodeUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(searchQuery)}&format=json&apiKey=${geoapifyApiKey}`;

        console.log(`Geocoding: ${neighborhood.name}`);
        const response = await fetch(geocodeUrl);
        
        if (!response.ok) {
          throw new Error(`Geoapify API error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.results || data.results.length === 0) {
          results.push({ name: neighborhood.name, success: false, error: 'No results found' });
          continue;
        }

        const result = data.results[0];
        const latitude = result.lat;
        const longitude = result.lon;

        // Update the neighborhood with coordinates
        const { error: updateError } = await supabase
          .from('neighborhoods')
          .update({
            latitude,
            longitude,
            updated_at: new Date().toISOString(),
          })
          .eq('id', neighborhood.id);

        if (updateError) {
          results.push({ name: neighborhood.name, success: false, error: updateError.message });
        } else {
          results.push({ 
            name: neighborhood.name, 
            success: true, 
            coordinates: { lat: latitude, lng: longitude } 
          });
          console.log(`✓ ${neighborhood.name}: ${latitude}, ${longitude}`);
        }
      } catch (error) {
        console.error(`Error geocoding ${neighborhood.name}:`, error);
        results.push({ 
          name: neighborhood.name, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    return new Response(JSON.stringify({
      success: true,
      message: `Geocoded ${successCount} neighborhoods, ${failCount} failed`,
      processed: neighborhoods.length,
      successCount,
      failCount,
      results,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Batch geocode error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
