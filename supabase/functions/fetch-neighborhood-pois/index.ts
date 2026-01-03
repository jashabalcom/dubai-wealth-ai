import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Map Geoapify categories to our POI types
const CATEGORY_MAPPING: Record<string, { apiCategories: string[], ourType: string }> = {
  restaurant: { 
    apiCategories: ['catering.restaurant', 'catering.cafe', 'catering.fast_food'],
    ourType: 'restaurant' 
  },
  school: { 
    apiCategories: ['education.school', 'education.kindergarten', 'education.college', 'education.university'],
    ourType: 'school' 
  },
  healthcare: { 
    apiCategories: ['healthcare.hospital', 'healthcare.clinic', 'healthcare.pharmacy'],
    ourType: 'healthcare' 
  },
  gym: { 
    apiCategories: ['leisure.fitness', 'leisure.sports'],
    ourType: 'gym' 
  },
  supermarket: { 
    apiCategories: ['commercial.supermarket', 'commercial.convenience'],
    ourType: 'supermarket' 
  },
  entertainment: { 
    apiCategories: ['entertainment.cinema', 'entertainment.culture', 'leisure.park'],
    ourType: 'entertainment' 
  },
};

interface POIResult {
  external_id: string;
  neighborhood_id: string;
  poi_type: string;
  name: string;
  description: string | null;
  latitude: number;
  longitude: number;
  address: string | null;
  rating: number | null;
  review_count: number | null;
  website: string | null;
  image_url: string | null;
  source: string;
  last_synced_at: string;
  opening_hours: object | null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { neighborhoodId, latitude, longitude, radius = 2000, categories } = await req.json();

    if (!neighborhoodId || !latitude || !longitude) {
      throw new Error('neighborhoodId, latitude, and longitude are required');
    }

    const GEOAPIFY_API_KEY = Deno.env.get('GEOAPIFY_API_KEY');
    if (!GEOAPIFY_API_KEY) {
      throw new Error('Geoapify API key not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Fetching POIs for neighborhood ${neighborhoodId} at ${latitude}, ${longitude}`);

    const categoriesToFetch = categories || Object.keys(CATEGORY_MAPPING);
    const allPOIs: POIResult[] = [];
    let totalFetched = 0;

    for (const categoryKey of categoriesToFetch) {
      const categoryConfig = CATEGORY_MAPPING[categoryKey];
      if (!categoryConfig) continue;

      // Build the categories query parameter
      const apiCategories = categoryConfig.apiCategories.join(',');
      
      const placesUrl = `https://api.geoapify.com/v2/places?categories=${apiCategories}&filter=circle:${longitude},${latitude},${radius}&limit=20&apiKey=${GEOAPIFY_API_KEY}`;

      console.log(`Fetching ${categoryKey} POIs...`);

      const response = await fetch(placesUrl);
      if (!response.ok) {
        console.error(`Geoapify API error for ${categoryKey}: ${response.status}`);
        continue;
      }

      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        for (const feature of data.features) {
          const props = feature.properties;
          
          // Skip if no valid place ID or name
          if (!props.place_id || !props.name) continue;

          const poi: POIResult = {
            external_id: `geoapify_${props.place_id}`,
            neighborhood_id: neighborhoodId,
            poi_type: categoryConfig.ourType,
            name: props.name,
            description: props.categories?.join(', ') || null,
            latitude: feature.geometry.coordinates[1],
            longitude: feature.geometry.coordinates[0],
            address: props.formatted || props.address_line1 || null,
            rating: props.rating || null,
            review_count: null,
            website: props.website || null,
            image_url: null,
            source: 'geoapify',
            last_synced_at: new Date().toISOString(),
            opening_hours: props.opening_hours ? { raw: props.opening_hours } : null,
          };

          allPOIs.push(poi);
        }

        totalFetched += data.features.length;
        console.log(`Found ${data.features.length} ${categoryKey} POIs`);
      }

      // Rate limiting between category requests
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Upsert POIs into database
    if (allPOIs.length > 0) {
      console.log(`Upserting ${allPOIs.length} POIs into database...`);
      
      const { error: upsertError } = await supabase
        .from('neighborhood_pois')
        .upsert(allPOIs, { 
          onConflict: 'external_id',
          ignoreDuplicates: false 
        });

      if (upsertError) {
        console.error('Error upserting POIs:', upsertError);
        throw upsertError;
      }

      console.log(`Successfully upserted ${allPOIs.length} POIs`);
    }

    // Get POI counts by type
    const { data: poiCounts } = await supabase
      .from('neighborhood_pois')
      .select('poi_type')
      .eq('neighborhood_id', neighborhoodId);

    const countsByType: Record<string, number> = {};
    if (poiCounts) {
      for (const poi of poiCounts) {
        countsByType[poi.poi_type] = (countsByType[poi.poi_type] || 0) + 1;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        totalFetched,
        totalUpserted: allPOIs.length,
        countsByType,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Fetch POIs error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
