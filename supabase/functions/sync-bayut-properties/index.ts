import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Bayut API configuration
const BAYUT_API_HOST = 'bayut-com1.p.rapidapi.com';
const BAYUT_API_BASE = `https://${BAYUT_API_HOST}`;

// Dubai areas mapping
const DUBAI_AREAS: Record<string, string> = {
  'dubai-marina': '5002',
  'downtown-dubai': '6901',
  'palm-jumeirah': '5548',
  'business-bay': '6588',
  'jumeirah-village-circle': '6357',
  'jumeirah-lake-towers': '5549',
  'dubai-hills-estate': '9262',
  'arabian-ranches': '5003',
  'difc': '6599',
  'jumeirah-beach-residence': '5550',
  'dubai-sports-city': '5004',
  'dubai-silicon-oasis': '6374',
  'al-barsha': '5318',
  'meydan-city': '8124',
  'creek-harbour': '10817',
};

interface SyncRequest {
  action: 'test' | 'sync_area' | 'get_areas';
  area?: string;
  purpose?: 'for-sale' | 'for-rent';
  propertyType?: string;
  limit?: number;
}

serve(async (req) => {
  // Handle CORS preflight
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

  if (rapidApiKeyRaw !== rapidApiKey) {
    console.log('[Bayut Sync] RAPIDAPI_KEY contained whitespace; trimming applied', {
      rawLen: rapidApiKeyRaw?.length ?? 0,
      trimmedLen: rapidApiKey.length,
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const body: SyncRequest = await req.json();
    const { action, area, purpose = 'for-sale', propertyType, limit = 10 } = body;

    console.log(`[Bayut Sync] Action: ${action}, Area: ${area}, Purpose: ${purpose}`);

    if (action === 'get_areas') {
      return new Response(
        JSON.stringify({ 
          areas: Object.entries(DUBAI_AREAS).map(([slug, id]) => ({ 
            slug, 
            id,
            name: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
          }))
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'test') {
      // Test API connection with a simple autocomplete request
      const testResponse = await fetch(
        `${BAYUT_API_BASE}/auto-complete?query=dubai&hitsPerPage=1`,
        {
          headers: {
            'X-RapidAPI-Key': rapidApiKey,
            'X-RapidAPI-Host': BAYUT_API_HOST,
          },
        }
      );

      if (!testResponse.ok) {
        const errorText = await testResponse.text();
        console.error('[Bayut Sync] Test failed:', errorText);
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
      console.log('[Bayut Sync] Test successful:', testData);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'API connection successful',
          apiCallsUsed: 1
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'sync_area') {
      if (!area) {
        return new Response(
          JSON.stringify({ error: 'Area is required for sync_area action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const locationId = DUBAI_AREAS[area];
      if (!locationId) {
        return new Response(
          JSON.stringify({ error: `Unknown area: ${area}`, availableAreas: Object.keys(DUBAI_AREAS) }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create sync log entry
      const { data: syncLog, error: logError } = await supabase
        .from('bayut_sync_logs')
        .insert({
          sync_type: 'area',
          area_name: area,
          status: 'running',
        })
        .select()
        .single();

      if (logError) {
        console.error('[Bayut Sync] Failed to create sync log:', logError);
      }

      const syncLogId = syncLog?.id;
      let apiCallsUsed = 0;
      let propertiesFound = 0;
      let propertiesSynced = 0;
      let photosSynced = 0;
      const errors: string[] = [];

      try {
        // Fetch property listings
        const listUrl = `${BAYUT_API_BASE}/properties/list?locationExternalIDs=${locationId}&purpose=${purpose}&hitsPerPage=${limit}&page=0&lang=en&sort=date-desc&rentFrequency=yearly`;
        
        console.log(`[Bayut Sync] Fetching list: ${listUrl}`);
        
        const listResponse = await fetch(listUrl, {
          headers: {
            'X-RapidAPI-Key': rapidApiKey,
            'X-RapidAPI-Host': BAYUT_API_HOST,
          },
        });
        apiCallsUsed++;

        if (!listResponse.ok) {
          throw new Error(`List API failed: ${listResponse.status}`);
        }

        const listData = await listResponse.json();
        const properties = listData.hits || [];
        propertiesFound = properties.length;

        console.log(`[Bayut Sync] Found ${propertiesFound} properties`);

        // Process each property
        for (const prop of properties) {
          try {
            const externalId = prop.externalID || String(prop.id);
            
            // Check if property already exists
            const { data: existing } = await supabase
              .from('properties')
              .select('id, last_synced_at')
              .eq('external_id', externalId)
              .eq('external_source', 'bayut')
              .single();

            // Skip if recently synced (within last 24 hours)
            if (existing?.last_synced_at) {
              const lastSync = new Date(existing.last_synced_at);
              const hoursSinceSync = (Date.now() - lastSync.getTime()) / (1000 * 60 * 60);
              if (hoursSinceSync < 24) {
                console.log(`[Bayut Sync] Skipping ${externalId} - recently synced`);
                continue;
              }
            }

            // Transform property data
            const transformedProperty = transformBayutProperty(prop);
            
            // Re-host photos to our storage
            const photoUrls = extractPhotoUrls(prop);
            const rehostedImages: string[] = [];
            
            for (const photoUrl of photoUrls.slice(0, 5)) { // Limit to 5 photos per property
              try {
                const rehostedUrl = await rehostPhoto(supabase, photoUrl, externalId);
                if (rehostedUrl) {
                  rehostedImages.push(rehostedUrl);
                  photosSynced++;
                }
              } catch (photoError) {
                console.error(`[Bayut Sync] Photo rehost failed:`, photoError);
              }
            }
            
            transformedProperty.images = rehostedImages;

            // Upsert property
            const { error: upsertError } = await supabase
              .from('properties')
              .upsert(
                {
                  ...transformedProperty,
                  id: existing?.id, // Keep existing ID if updating
                },
                {
                  onConflict: 'external_source,external_id',
                }
              );

            if (upsertError) {
              console.error(`[Bayut Sync] Upsert failed for ${externalId}:`, upsertError);
              errors.push(`Property ${externalId}: ${upsertError.message}`);
            } else {
              propertiesSynced++;
              console.log(`[Bayut Sync] Synced property: ${externalId}`);
            }
          } catch (propError) {
            const errorMsg = propError instanceof Error ? propError.message : String(propError);
            errors.push(errorMsg);
            console.error(`[Bayut Sync] Property processing error:`, propError);
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
            message: `Synced ${propertiesSynced} of ${propertiesFound} properties from ${area}`,
            propertiesFound,
            propertiesSynced,
            photosSynced,
            apiCallsUsed,
            errors: errors.length > 0 ? errors : undefined,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      } catch (syncError) {
        // Update sync log with failure
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

    return new Response(
      JSON.stringify({ error: `Unknown action: ${action}` }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Bayut Sync] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Sync failed', 
        details: error instanceof Error ? error.message : String(error)
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Transform Bayut property to our schema
function transformBayutProperty(prop: any): any {
  const externalId = prop.externalID || String(prop.id);
  const title = prop.title || 'Property';
  
  // Extract location area
  let locationArea = 'Dubai';
  if (prop.location && prop.location.length > 0) {
    const community = prop.location.find((loc: any) => loc.level === 1 || loc.level === 2);
    locationArea = community?.name || prop.location[0]?.name || 'Dubai';
  }

  // Extract property type
  let propertyType = 'apartment';
  if (prop.category && prop.category.length > 0) {
    const categorySlug = prop.category[0]?.slug?.toLowerCase() || '';
    const typeMap: Record<string, string> = {
      'apartment': 'apartment',
      'villa': 'villa',
      'townhouse': 'townhouse',
      'penthouse': 'penthouse',
      'duplex': 'duplex',
      'studio': 'studio',
    };
    propertyType = typeMap[categorySlug] || 'apartment';
  }

  // Parse bedrooms
  let bedrooms = 0;
  if (prop.rooms) {
    if (prop.rooms.toLowerCase() === 'studio') {
      bedrooms = 0;
    } else {
      const num = parseInt(prop.rooms, 10);
      bedrooms = isNaN(num) ? 0 : num;
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
    external_url: `https://www.bayut.com/property/details-${externalId}.html`,
    title,
    description: prop.description || null,
    price_aed: prop.price || 0,
    size_sqft: Math.round(prop.area || 0),
    bedrooms,
    bathrooms: prop.baths || 0,
    property_type: propertyType,
    listing_type: prop.purpose === 'for-rent' ? 'rent' : 'sale',
    location_area: locationArea,
    latitude: prop.geography?.lat || null,
    longitude: prop.geography?.lng || null,
    is_off_plan: prop.completionStatus === 'off_plan',
    furnishing: prop.furnishingStatus || null,
    rera_permit_number: prop.permitNumber || null,
    amenities: prop.amenities || [],
    images: [],
    last_synced_at: new Date().toISOString(),
    is_published: false,
    slug,
  };
}

// Extract photo URLs from Bayut property
function extractPhotoUrls(prop: any): string[] {
  const urls: string[] = [];
  
  if (prop.coverPhoto?.url) {
    urls.push(prop.coverPhoto.url);
  }
  
  if (prop.photos) {
    for (const photo of prop.photos) {
      if (photo.url && !urls.includes(photo.url)) {
        urls.push(photo.url);
      }
    }
  }
  
  return urls.slice(0, 10);
}

// Re-host photo to Supabase storage
async function rehostPhoto(supabase: any, sourceUrl: string, propertyId: string): Promise<string | null> {
  try {
    // Fetch the image
    const response = await fetch(sourceUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Generate filename
    const urlHash = sourceUrl.split('/').pop()?.split('?')[0] || Date.now().toString();
    const extension = sourceUrl.includes('.jpg') ? 'jpg' : sourceUrl.includes('.png') ? 'png' : 'jpg';
    const filename = `bayut/${propertyId}/${urlHash}.${extension}`;

    // Upload to storage
    const { data, error } = await supabase.storage
      .from('property-media')
      .upload(filename, uint8Array, {
        contentType: blob.type || 'image/jpeg',
        upsert: true,
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('property-media')
      .getPublicUrl(filename);

    return publicUrlData?.publicUrl || null;
  } catch (error) {
    console.error('[Bayut Sync] Photo rehost error:', error);
    return null;
  }
}
