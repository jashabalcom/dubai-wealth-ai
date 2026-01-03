import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Map our categories to Google Place types
const GOOGLE_PLACE_TYPES: Record<string, string[]> = {
  restaurant: ['restaurant', 'cafe', 'bakery'],
  school: ['school', 'university', 'primary_school'],
  healthcare: ['hospital', 'doctor', 'pharmacy'],
  gym: ['gym'],
  supermarket: ['supermarket', 'grocery_store'],
  entertainment: ['movie_theater', 'amusement_park', 'night_club', 'park'],
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
  website_url: string | null;
  image_url: string | null;
  source: string;
  last_synced_at: string;
  opening_hours: object | null;
  google_place_id: string | null;
  price_level: string | null;
  cuisine_type: string | null;
}

async function fetchGooglePlacesPOIs(
  latitude: number, 
  longitude: number, 
  radius: number,
  categoryKey: string,
  placeTypes: string[],
  apiKey: string
): Promise<any[]> {
  const results: any[] = [];
  
  for (const placeType of placeTypes) {
    try {
      const response = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.priceLevel,places.photos,places.location,places.primaryType,places.types,places.userRatingCount,places.websiteUri'
        },
        body: JSON.stringify({
          includedTypes: [placeType],
          locationRestriction: {
            circle: {
              center: { latitude, longitude },
              radius
            }
          },
          languageCode: 'en',
          maxResultCount: 10
        })
      });

      if (!response.ok) {
        console.error(`Google Places API error for ${placeType}: ${response.status}`);
        continue;
      }

      const data = await response.json();
      if (data.places && data.places.length > 0) {
        results.push(...data.places);
        console.log(`Found ${data.places.length} ${placeType} places`);
      }

      // Rate limiting between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Error fetching ${placeType}:`, error);
    }
  }

  return results;
}

function mapPriceLevel(priceLevel: string | undefined): string | null {
  if (!priceLevel) return null;
  const mapping: Record<string, string> = {
    'PRICE_LEVEL_FREE': 'Free',
    'PRICE_LEVEL_INEXPENSIVE': '$',
    'PRICE_LEVEL_MODERATE': '$$',
    'PRICE_LEVEL_EXPENSIVE': '$$$',
    'PRICE_LEVEL_VERY_EXPENSIVE': '$$$$',
  };
  return mapping[priceLevel] || null;
}

function extractCuisineType(types: string[] | undefined): string | null {
  if (!types) return null;
  const cuisineTypes = types.filter(t => 
    t.includes('cuisine') || 
    ['italian_restaurant', 'indian_restaurant', 'chinese_restaurant', 'japanese_restaurant', 
     'thai_restaurant', 'mexican_restaurant', 'french_restaurant', 'mediterranean_restaurant',
     'middle_eastern_restaurant', 'american_restaurant', 'seafood_restaurant', 'steak_house',
     'sushi_restaurant', 'pizza_restaurant', 'burger_restaurant', 'cafe', 'bakery'].includes(t)
  );
  
  if (cuisineTypes.length > 0) {
    // Clean up the type name
    return cuisineTypes[0]
      .replace('_restaurant', '')
      .replace('_', ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  return null;
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

    const GOOGLE_PLACES_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY');
    if (!GOOGLE_PLACES_API_KEY) {
      throw new Error('Google Places API key not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Fetching POIs for neighborhood ${neighborhoodId} at ${latitude}, ${longitude}`);

    const categoriesToFetch = categories || Object.keys(GOOGLE_PLACE_TYPES);
    const allPOIs: POIResult[] = [];
    let totalFetched = 0;

    for (const categoryKey of categoriesToFetch) {
      const placeTypes = GOOGLE_PLACE_TYPES[categoryKey];
      if (!placeTypes) continue;

      console.log(`Fetching ${categoryKey} POIs from Google Places...`);

      const places = await fetchGooglePlacesPOIs(
        latitude, 
        longitude, 
        radius, 
        categoryKey, 
        placeTypes, 
        GOOGLE_PLACES_API_KEY
      );

      for (const place of places) {
        // Build photo URL if available
        let imageUrl: string | null = null;
        if (place.photos && place.photos.length > 0) {
          const photoName = place.photos[0].name;
          // Store the photo reference to be fetched via our proxy
          imageUrl = `${supabaseUrl}/functions/v1/google-place-photo?photoName=${encodeURIComponent(photoName)}&maxWidth=400`;
        }

        const poi: POIResult = {
          external_id: `google_${place.id}`,
          neighborhood_id: neighborhoodId,
          poi_type: categoryKey,
          name: place.displayName?.text || 'Unknown',
          description: place.primaryType?.replace(/_/g, ' ') || null,
          latitude: place.location?.latitude || latitude,
          longitude: place.location?.longitude || longitude,
          address: place.formattedAddress || null,
          rating: place.rating || null,
          review_count: place.userRatingCount || null,
          website_url: place.websiteUri || null,
          image_url: imageUrl,
          source: 'google_places',
          last_synced_at: new Date().toISOString(),
          opening_hours: null,
          google_place_id: place.id,
          price_level: mapPriceLevel(place.priceLevel),
          cuisine_type: extractCuisineType(place.types),
        };

        allPOIs.push(poi);
      }

      totalFetched += places.length;
      console.log(`Processed ${places.length} ${categoryKey} POIs`);

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
