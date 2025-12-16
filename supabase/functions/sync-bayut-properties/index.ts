import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// New UAE Real Estate API configuration
const API_HOST = 'uae-real-estate2.p.rapidapi.com';
const API_BASE = `https://${API_HOST}`;

interface SyncRequest {
  action: 'test' | 'search_locations' | 'sync_properties' | 'sync_transactions' | 'search_developers';
  // Location search
  query?: string;
  // Property search filters
  locations_ids?: number[];
  purpose?: 'for-sale' | 'for-rent';
  category?: string;
  rooms?: number[];
  baths?: number[];
  price_min?: number;
  price_max?: number;
  area_min?: number;
  area_max?: number;
  furnished?: boolean;
  completion_status?: 'ready' | 'off_plan';
  sale_type?: 'new' | 'resale';
  has_video?: boolean;
  has_panorama?: boolean;
  has_floorplan?: boolean;
  index?: 'latest' | 'verified' | 'price-asc' | 'price-desc' | 'area-asc' | 'area-desc';
  page?: number;
  limit?: number;
  // Transaction filters
  start_date?: string;
  end_date?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const rapidApiKeyRaw = Deno.env.get('RAPIDAPI_KEY');
  const rapidApiKey = rapidApiKeyRaw?.trim();
  if (!rapidApiKey) {
    return new Response(
      JSON.stringify({
        error: 'RAPIDAPI_KEY not configured',
        message: 'Please add your RapidAPI key in the secrets configuration',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const body: SyncRequest = await req.json();
    const { action } = body;

    console.log(`[Bayut API] Action: ${action}`);

    // ===========================================
    // TEST CONNECTION
    // ===========================================
    if (action === 'test') {
      const testResponse = await fetch(
        `${API_BASE}/locations_search?query=dubai`,
        {
          headers: {
            'X-RapidAPI-Key': rapidApiKey,
            'X-RapidAPI-Host': API_HOST,
          },
        }
      );

      if (!testResponse.ok) {
        const errorText = await testResponse.text();
        console.error('[Bayut API] Test failed:', errorText);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `API Error: ${testResponse.status}`,
            details: errorText
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const testData = await testResponse.json();
      console.log('[Bayut API] Test successful, locations found:', testData.results?.length || 0);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'API connection successful (uae-real-estate2)',
          locationsFound: testData.results?.length || 0,
          apiVersion: 'uae-real-estate2'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ===========================================
    // SEARCH LOCATIONS
    // ===========================================
    if (action === 'search_locations') {
      const { query } = body;
      if (!query) {
        return new Response(
          JSON.stringify({ error: 'Query is required for location search' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const response = await fetch(
        `${API_BASE}/locations_search?query=${encodeURIComponent(query)}`,
        {
          headers: {
            'X-RapidAPI-Key': rapidApiKey,
            'X-RapidAPI-Host': API_HOST,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Location search failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const locations = (data.results || []).map((loc: any) => ({
        id: loc.id,
        name: loc.name,
        level: loc.level,
        path: loc.path,
      }));

      console.log(`[Bayut API] Found ${locations.length} locations for "${query}"`);

      return new Response(
        JSON.stringify({ success: true, locations }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ===========================================
    // SYNC PROPERTIES (POST with filters)
    // ===========================================
    if (action === 'sync_properties') {
      const {
        locations_ids = [],
        purpose = 'for-sale',
        category,
        rooms,
        baths,
        price_min,
        price_max,
        area_min,
        area_max,
        furnished,
        completion_status,
        sale_type,
        has_video,
        has_panorama,
        has_floorplan,
        index = 'latest',
        page = 0,
        limit = 20,
      } = body;

      if (locations_ids.length === 0) {
        return new Response(
          JSON.stringify({ error: 'At least one location_id is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Build request body for POST
      const searchBody: any = {
        purpose,
        locations_ids,
        index,
      };

      if (category) searchBody.category = category;
      if (rooms && rooms.length > 0) searchBody.rooms = rooms;
      if (baths && baths.length > 0) searchBody.baths = baths;
      if (price_min) searchBody.price_min = price_min;
      if (price_max) searchBody.price_max = price_max;
      if (area_min) searchBody.area_min = area_min;
      if (area_max) searchBody.area_max = area_max;
      if (furnished !== undefined) searchBody.furnished = furnished;
      if (completion_status) searchBody.completion_status = completion_status;
      if (sale_type) searchBody.sale_type = sale_type;
      if (has_video) searchBody.has_video = true;
      if (has_panorama) searchBody.has_panorama = true;
      if (has_floorplan) searchBody.has_floorplan = true;

      // Create sync log
      const { data: syncLog, error: logError } = await supabase
        .from('bayut_sync_logs')
        .insert({
          sync_type: 'properties',
          area_name: `Location IDs: ${locations_ids.join(', ')}`,
          status: 'running',
        })
        .select()
        .single();

      const syncLogId = syncLog?.id;
      let apiCallsUsed = 0;
      let propertiesFound = 0;
      let propertiesSynced = 0;
      let photosSynced = 0;
      const errors: string[] = [];

      try {
        // Fetch properties using POST
        const searchUrl = `${API_BASE}/properties_search?page=${page}&hitsPerPage=${limit}`;
        console.log(`[Bayut API] POST ${searchUrl}`, JSON.stringify(searchBody));

        const searchResponse = await fetch(searchUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-RapidAPI-Key': rapidApiKey,
            'X-RapidAPI-Host': API_HOST,
          },
          body: JSON.stringify(searchBody),
        });
        apiCallsUsed++;

        if (!searchResponse.ok) {
          const errorBody = await searchResponse.text();
          console.error(`[Bayut API] Search failed:`, errorBody);
          throw new Error(`Property search failed: ${searchResponse.status} - ${errorBody}`);
        }

        const searchData = await searchResponse.json();
        const properties = searchData.results || [];
        propertiesFound = properties.length;
        const totalAvailable = searchData.nbHits || propertiesFound;

        console.log(`[Bayut API] Found ${propertiesFound} properties (${totalAvailable} total available)`);

        // Process each property
        for (const prop of properties) {
          try {
            const externalId = String(prop.id);
            
            // Check if recently synced
            const { data: existing } = await supabase
              .from('properties')
              .select('id, last_synced_at')
              .eq('external_id', externalId)
              .eq('external_source', 'bayut')
              .single();

            if (existing?.last_synced_at) {
              const lastSync = new Date(existing.last_synced_at);
              const hoursSinceSync = (Date.now() - lastSync.getTime()) / (1000 * 60 * 60);
              if (hoursSinceSync < 24) {
                console.log(`[Bayut API] Skipping ${externalId} - recently synced`);
                continue;
              }
            }

            // Transform property
            const transformedProperty = transformProperty(prop);
            
            // Re-host photos
            const photoUrls = extractPhotoUrls(prop);
            const rehostedImages: string[] = [];
            
            for (const photoUrl of photoUrls.slice(0, 5)) {
              try {
                const rehostedUrl = await rehostPhoto(supabase, photoUrl, externalId);
                if (rehostedUrl) {
                  rehostedImages.push(rehostedUrl);
                  photosSynced++;
                }
              } catch (photoError) {
                console.error(`[Bayut API] Photo rehost failed:`, photoError);
              }
            }
            
            transformedProperty.images = rehostedImages;

            // Upsert property
            const { error: upsertError } = await supabase
              .from('properties')
              .upsert(
                {
                  ...transformedProperty,
                  id: existing?.id,
                },
                { onConflict: 'external_source,external_id' }
              );

            if (upsertError) {
              console.error(`[Bayut API] Upsert failed:`, upsertError);
              errors.push(`Property ${externalId}: ${upsertError.message}`);
            } else {
              propertiesSynced++;
              console.log(`[Bayut API] Synced: ${externalId}`);
            }
          } catch (propError) {
            const errorMsg = propError instanceof Error ? propError.message : String(propError);
            errors.push(errorMsg);
          }
        }

        // Update sync log
        if (syncLogId) {
          await supabase
            .from('bayut_sync_logs')
            .update({
              completed_at: new Date().toISOString(),
              properties_found: propertiesFound,
              properties_synced: propertiesSynced,
              photos_synced: photosSynced,
              api_calls_used: apiCallsUsed,
              errors: errors.length > 0 ? errors : [],
              status: errors.length > 0 ? 'completed_with_errors' : 'completed',
            })
            .eq('id', syncLogId);
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: `Synced ${propertiesSynced} of ${propertiesFound} properties`,
            propertiesFound,
            propertiesSynced,
            photosSynced,
            apiCallsUsed,
            totalAvailable,
            errors: errors.length > 0 ? errors : undefined,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      } catch (syncError) {
        if (syncLogId) {
          await supabase
            .from('bayut_sync_logs')
            .update({
              completed_at: new Date().toISOString(),
              properties_found: propertiesFound,
              properties_synced: propertiesSynced,
              photos_synced: photosSynced,
              api_calls_used: apiCallsUsed,
              errors: [...errors, syncError instanceof Error ? syncError.message : String(syncError)],
              status: 'failed',
            })
            .eq('id', syncLogId);
        }
        throw syncError;
      }
    }

    // ===========================================
    // SYNC TRANSACTIONS (market data)
    // ===========================================
    if (action === 'sync_transactions') {
      const {
        locations_ids = [],
        purpose = 'for-sale',
        category,
        rooms,
        start_date,
        end_date,
        page = 0,
        limit = 50,
      } = body;

      const txBody: any = {
        purpose,
      };

      if (locations_ids.length > 0) txBody.locations_ids = locations_ids;
      if (category) txBody.category = category;
      if (rooms && rooms.length > 0) txBody.rooms = rooms;
      if (start_date) txBody.start_date = start_date;
      if (end_date) txBody.end_date = end_date;

      const txUrl = `${API_BASE}/transactions?page=${page}&hitsPerPage=${limit}`;
      console.log(`[Bayut API] POST ${txUrl}`, JSON.stringify(txBody));

      const txResponse = await fetch(txUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': API_HOST,
        },
        body: JSON.stringify(txBody),
      });

      if (!txResponse.ok) {
        const errorBody = await txResponse.text();
        throw new Error(`Transaction fetch failed: ${txResponse.status} - ${errorBody}`);
      }

      const txData = await txResponse.json();
      const transactions = txData.results || [];

      console.log(`[Bayut API] Found ${transactions.length} transactions`);

      return new Response(
        JSON.stringify({
          success: true,
          transactions: transactions.map((tx: any) => ({
            id: tx.id,
            date: tx.date,
            price: tx.price,
            area: tx.area,
            rooms: tx.rooms,
            location: tx.location,
            property_type: tx.property_type,
            floor: tx.floor,
          })),
          total: txData.nbHits || transactions.length,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ===========================================
    // SEARCH DEVELOPERS
    // ===========================================
    if (action === 'search_developers') {
      const { query, page = 0, limit = 20 } = body;

      let devUrl = `${API_BASE}/developers?page=${page}&hitsPerPage=${limit}`;
      if (query) {
        devUrl += `&query=${encodeURIComponent(query)}`;
      }

      console.log(`[Bayut API] GET ${devUrl}`);

      const devResponse = await fetch(devUrl, {
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': API_HOST,
        },
      });

      if (!devResponse.ok) {
        const errorBody = await devResponse.text();
        throw new Error(`Developer search failed: ${devResponse.status} - ${errorBody}`);
      }

      const devData = await devResponse.json();
      const developers = devData.results || [];

      console.log(`[Bayut API] Found ${developers.length} developers`);

      return new Response(
        JSON.stringify({
          success: true,
          developers: developers.map((dev: any) => ({
            id: dev.id,
            name: dev.name,
            logo: dev.logo,
            projects_count: dev.projects_count,
            properties_count: dev.properties_count,
          })),
          total: devData.nbHits || developers.length,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: `Unknown action: ${action}` }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Bayut API] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Request failed', 
        details: error instanceof Error ? error.message : String(error)
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Transform API property to our schema
function transformProperty(prop: any): any {
  const externalId = String(prop.id);
  const title = prop.title || prop.name || 'Property';
  
  // Extract location
  let locationArea = 'Dubai';
  if (prop.location) {
    if (typeof prop.location === 'string') {
      locationArea = prop.location;
    } else if (prop.location.name) {
      locationArea = prop.location.name;
    } else if (Array.isArray(prop.location) && prop.location.length > 0) {
      locationArea = prop.location[0]?.name || 'Dubai';
    }
  }

  // Extract property type
  let propertyType = 'apartment';
  if (prop.category) {
    const cat = typeof prop.category === 'string' ? prop.category.toLowerCase() : prop.category?.name?.toLowerCase() || '';
    const typeMap: Record<string, string> = {
      'apartment': 'apartment',
      'apartments': 'apartment',
      'villa': 'villa',
      'villas': 'villa',
      'townhouse': 'townhouse',
      'townhouses': 'townhouse',
      'penthouse': 'penthouse',
      'duplex': 'duplex',
      'studio': 'studio',
    };
    propertyType = typeMap[cat] || 'apartment';
  }

  // Parse rooms/bedrooms
  let bedrooms = 0;
  if (prop.rooms !== undefined) {
    if (typeof prop.rooms === 'number') {
      bedrooms = prop.rooms;
    } else if (typeof prop.rooms === 'string') {
      if (prop.rooms.toLowerCase() === 'studio') {
        bedrooms = 0;
      } else {
        const num = parseInt(prop.rooms, 10);
        bedrooms = isNaN(num) ? 0 : num;
      }
    }
  }

  // Generate slug
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
  const slug = `${baseSlug}-${externalId}`;

  return {
    external_id: externalId,
    external_source: 'bayut',
    external_url: prop.url || `https://www.bayut.com/property/details-${externalId}.html`,
    title,
    description: prop.description || null,
    price_aed: prop.price || 0,
    size_sqft: Math.round(prop.area || 0),
    bedrooms,
    bathrooms: prop.baths || 0,
    property_type: propertyType,
    listing_type: prop.purpose === 'for-rent' ? 'rent' : 'sale',
    location_area: locationArea,
    latitude: prop.geo?.lat || prop.latitude || null,
    longitude: prop.geo?.lng || prop.longitude || null,
    is_off_plan: prop.completion_status === 'off_plan',
    furnishing: prop.furnished ? 'furnished' : (prop.furnishing || null),
    rera_permit_number: prop.rera_permit || prop.permit_number || null,
    amenities: prop.amenities || [],
    images: [],
    last_synced_at: new Date().toISOString(),
    is_published: false,
    slug,
    // New fields from enhanced API
    year_built: prop.year_built || null,
    service_charge_per_sqft: prop.service_charge || null,
    view_type: prop.view || null,
    floor_number: prop.floor || null,
    parking_spaces: prop.parking || null,
  };
}

// Extract photo URLs
function extractPhotoUrls(prop: any): string[] {
  const urls: string[] = [];
  
  if (prop.cover_photo) {
    urls.push(prop.cover_photo);
  }
  
  if (prop.photos && Array.isArray(prop.photos)) {
    for (const photo of prop.photos) {
      const url = typeof photo === 'string' ? photo : photo.url;
      if (url && !urls.includes(url)) {
        urls.push(url);
      }
    }
  }
  
  return urls.slice(0, 10);
}

// Re-host photo to Supabase storage
async function rehostPhoto(supabase: any, sourceUrl: string, propertyId: string): Promise<string | null> {
  try {
    const response = await fetch(sourceUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    const urlHash = sourceUrl.split('/').pop()?.split('?')[0] || Date.now().toString();
    const extension = sourceUrl.includes('.png') ? 'png' : 'jpg';
    const filename = `bayut/${propertyId}/${urlHash}.${extension}`;

    const { error } = await supabase.storage
      .from('property-media')
      .upload(filename, uint8Array, {
        contentType: blob.type || 'image/jpeg',
        upsert: true,
      });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from('property-media')
      .getPublicUrl(filename);

    return publicUrlData?.publicUrl || null;
  } catch (error) {
    console.error('[Bayut API] Photo rehost error:', error);
    return null;
  }
}
