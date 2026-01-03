import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { neighborhoodId, neighborhoodName } = await req.json();

    if (!neighborhoodName) {
      throw new Error('Neighborhood name is required');
    }

    const GEOAPIFY_API_KEY = Deno.env.get('GEOAPIFY_API_KEY');
    if (!GEOAPIFY_API_KEY) {
      throw new Error('Geoapify API key not configured');
    }

    console.log(`Geocoding neighborhood: ${neighborhoodName}`);

    // Call Geoapify Geocoding API
    const searchQuery = `${neighborhoodName}, Dubai, UAE`;
    const geocodeUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(searchQuery)}&format=json&apiKey=${GEOAPIFY_API_KEY}`;

    const response = await fetch(geocodeUrl);
    if (!response.ok) {
      throw new Error(`Geoapify API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      console.log(`No geocoding results found for: ${neighborhoodName}`);
      return new Response(
        JSON.stringify({ success: false, message: 'No geocoding results found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = data.results[0];
    const latitude = result.lat;
    const longitude = result.lon;
    const boundingBox = result.bbox ? {
      sw_lat: result.bbox[1],
      sw_lng: result.bbox[0],
      ne_lat: result.bbox[3],
      ne_lng: result.bbox[2],
    } : null;

    console.log(`Geocoded ${neighborhoodName}: ${latitude}, ${longitude}`);

    // Update neighborhood in database if ID provided
    if (neighborhoodId) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { error: updateError } = await supabase
        .from('neighborhoods')
        .update({ latitude, longitude })
        .eq('id', neighborhoodId);

      if (updateError) {
        console.error('Error updating neighborhood:', updateError);
        throw updateError;
      }

      console.log(`Updated neighborhood ${neighborhoodId} with coordinates`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        latitude,
        longitude,
        boundingBox,
        formattedAddress: result.formatted,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Geocoding error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
