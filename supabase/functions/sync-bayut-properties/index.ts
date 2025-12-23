import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// UAE Real Estate API configuration
const API_HOST = 'uae-real-estate2.p.rapidapi.com';
const API_BASE = `https://${API_HOST}`;

// Hybrid storage configuration
const REHOST_LIMIT = 4; // Cover photo + first 3 gallery images
const BATCH_SIZE = 20;
const BATCH_COOLDOWN_MS = 5000; // 5 seconds between batches

interface SyncRequest {
  action: 'test' | 'search_locations' | 'sync_properties' | 'sync_transactions' | 'search_developers' | 'search_agents' | 'search_agencies' | 'get_property_details' | 'sync_new_projects' | 'bulk_sync';
  // Location search
  query?: string;
  // Property search filters
  locations_ids?: number[];
  purpose?: 'for-sale' | 'for-rent';
  category?: string;
  categories?: string[]; // NEW: multiple categories support
  rooms?: number[];
  baths?: number[];
  price_min?: number;
  price_max?: number;
  area_min?: number;
  area_max?: number;
  is_furnished?: boolean;
  is_completed?: boolean;
  sale_type?: 'new' | 'resale';
  has_video?: boolean;
  has_360_tour?: boolean;
  has_floorplan?: boolean;
  index?: 'popular' | 'verified' | 'latest' | 'lowest_price' | 'highest_price' | 'projects';
  page?: number;
  limit?: number;
  // Transaction filters
  start_date?: string;
  end_date?: string;
  // Property details
  property_id?: string;
  // Developer/agent/agency filtering (NEW API features)
  developer_ids?: number[];
  agent_ids?: number[];
  agency_ids?: number[];
  // Dry run mode - counts only, no upserts
  dry_run?: boolean;
  // BULK SYNC options (new for 10K strategy)
  areas?: { id: number; name: string }[]; // Multiple areas to sync
  max_pages?: number; // Max pages per area (default: 1, max: 20)
  lite_mode?: boolean; // Skip detail fetches - uses search data only
  include_rentals?: boolean; // Also sync rental properties
  skip_recently_synced?: boolean; // Skip 24-hour check (force re-sync)
}

// Organic throttling: random delay between 800-2000ms
async function organicDelay(): Promise<void> {
  const delay = Math.floor(Math.random() * 1200) + 800;
  await new Promise(resolve => setTimeout(resolve, delay));
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
    // GET PROPERTY DETAILS (Full property by ID)
    // ===========================================
    if (action === 'get_property_details') {
      const { property_id } = body;
      if (!property_id) {
        return new Response(
          JSON.stringify({ error: 'property_id is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const response = await fetch(
        `${API_BASE}/property/${property_id}`,
        {
          headers: {
            'X-RapidAPI-Key': rapidApiKey,
            'X-RapidAPI-Host': API_HOST,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Property details failed: ${response.status} - ${errorText}`);
      }

      const property = await response.json();
      console.log(`[Bayut API] Got details for property ${property_id}`);

      return new Response(
        JSON.stringify({ success: true, property }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ===========================================
    // SEARCH AGENTS
    // ===========================================
    if (action === 'search_agents') {
      const { query, locations_ids, page = 0, limit = 20 } = body;

      let agentUrl = `${API_BASE}/agents_by_name?page=${page}&hitsPerPage=${limit}`;
      if (query) {
        agentUrl += `&query=${encodeURIComponent(query)}`;
      }

      console.log(`[Bayut API] GET ${agentUrl}`);

      const response = await fetch(agentUrl, {
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': API_HOST,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Agent search failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const agents = data.results || [];

      // Upsert discovered agents to bayut_agents table
      for (const agent of agents) {
        try {
          await supabase.from('bayut_agents').upsert({
            bayut_id: String(agent.id),
            name: agent.name || 'Unknown',
            brn: agent.brn || null,
            phone: agent.phone || null,
            whatsapp: agent.whatsapp || null,
            email: agent.email || null,
            photo_url: agent.photo || null,
            agency_bayut_id: agent.agency?.id ? String(agent.agency.id) : null,
            agency_name: agent.agency?.name || null,
            is_trubroker: agent.isTruBroker || false,
            languages: agent.languages || [],
            last_synced_at: new Date().toISOString(),
          }, { onConflict: 'bayut_id' });
        } catch (e) {
          console.error('[Bayut API] Failed to upsert agent:', e);
        }
      }

      console.log(`[Bayut API] Found ${agents.length} agents`);

      return new Response(
        JSON.stringify({
          success: true,
          agents: agents.map((a: any) => ({
            id: a.id,
            name: a.name,
            brn: a.brn,
            phone: a.phone,
            whatsapp: a.whatsapp,
            photo: a.photo,
            agency_id: a.agency?.id,
            agency_name: a.agency?.name,
            is_trubroker: a.isTruBroker,
          })),
          total: data.nbHits || agents.length,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ===========================================
    // SEARCH AGENCIES
    // ===========================================
    if (action === 'search_agencies') {
      const { query, page = 0, limit = 20 } = body;

      let agencyUrl = `${API_BASE}/agencies_by_name?page=${page}&hitsPerPage=${limit}`;
      if (query) {
        agencyUrl += `&query=${encodeURIComponent(query)}`;
      }

      console.log(`[Bayut API] GET ${agencyUrl}`);

      const response = await fetch(agencyUrl, {
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': API_HOST,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Agency search failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const agencies = data.results || [];

      // Upsert discovered agencies to bayut_agencies table
      for (const agency of agencies) {
        try {
          await supabase.from('bayut_agencies').upsert({
            bayut_id: String(agency.id),
            name: agency.name || 'Unknown',
            logo_url: agency.logo || null,
            orn: agency.orn || null,
            phone: agency.phone || null,
            email: agency.email || null,
            website: agency.website || null,
            agent_count: agency.agents_count || 0,
            property_count: agency.properties_count || 0,
            product_tier: agency.product_tier || null,
            description: agency.description || null,
            last_synced_at: new Date().toISOString(),
          }, { onConflict: 'bayut_id' });
        } catch (e) {
          console.error('[Bayut API] Failed to upsert agency:', e);
        }
      }

      console.log(`[Bayut API] Found ${agencies.length} agencies`);

      return new Response(
        JSON.stringify({
          success: true,
          agencies: agencies.map((a: any) => ({
            id: a.id,
            name: a.name,
            logo: a.logo,
            orn: a.orn,
            phone: a.phone,
            agents_count: a.agents_count,
            properties_count: a.properties_count,
            product_tier: a.product_tier,
          })),
          total: data.nbHits || agencies.length,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ===========================================
    // SYNC PROPERTIES (with HYBRID image storage)
    // ===========================================
    if (action === 'sync_properties') {
      const {
        locations_ids = [],
        purpose = 'for-sale',
        category,
        categories,
        rooms,
        baths,
        price_min,
        price_max,
        area_min,
        area_max,
        is_furnished,
        is_completed,
        sale_type,
        has_video,
        has_360_tour,
        has_floorplan,
        index = 'latest',
        page = 0,
        limit = 20,
        dry_run = false,
        developer_ids,
        agent_ids,
        agency_ids,
      } = body;

      // DRY RUN MODE - just count properties without processing
      if (dry_run) {
        console.log(`[Bayut API] DRY RUN - counting properties only`);
        
        const searchBody: any = { purpose, locations_ids, index };
        if (category) searchBody.category = category;
        if (rooms && rooms.length > 0) searchBody.rooms = rooms;
        
        const searchUrl = `${API_BASE}/properties_search?page=0&hitsPerPage=1`;
        const searchResponse = await fetch(searchUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-RapidAPI-Key': rapidApiKey,
            'X-RapidAPI-Host': API_HOST,
          },
          body: JSON.stringify(searchBody),
        });

        if (!searchResponse.ok) {
          const errorText = await searchResponse.text();
          throw new Error(`Dry run failed: ${searchResponse.status} - ${errorText}`);
        }

        const searchData = await searchResponse.json();
        const totalAvailable = searchData.nbHits || 0;
        
        return new Response(
          JSON.stringify({
            success: true,
            dry_run: true,
            totalAvailable,
            wouldSync: Math.min(limit, totalAvailable),
            estimatedApiCalls: 1, // Only 1 call used for dry run
            message: `Would sync up to ${Math.min(limit, totalAvailable)} of ${totalAvailable} available properties`,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (locations_ids.length === 0) {
        return new Response(
          JSON.stringify({ error: 'At least one location_id is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Build request body with CORRECT API parameters (including NEW features)
      const searchBody: any = {
        purpose,
        locations_ids,
        index,
      };

      // Support for multiple categories (NEW API feature)
      if (categories && categories.length > 0) {
        searchBody.categories = categories;
      } else if (category) {
        searchBody.category = category;
      }
      
      // Support for developer/agent/agency filtering (NEW API feature)
      if (developer_ids && developer_ids.length > 0) searchBody.developer_ids = developer_ids;
      if (agent_ids && agent_ids.length > 0) searchBody.agent_ids = agent_ids;
      if (agency_ids && agency_ids.length > 0) searchBody.agency_ids = agency_ids;
      
      if (rooms && rooms.length > 0) searchBody.rooms = rooms;
      if (baths && baths.length > 0) searchBody.baths = baths;
      if (price_min) searchBody.price_min = price_min;
      if (price_max) searchBody.price_max = price_max;
      if (area_min) searchBody.area_min = area_min;
      if (area_max) searchBody.area_max = area_max;
      if (is_furnished !== undefined) searchBody.is_furnished = is_furnished;
      if (is_completed !== undefined) searchBody.is_completed = is_completed;
      if (sale_type) searchBody.sale_type = sale_type;
      if (has_video) searchBody.has_video = true;
      if (has_360_tour) searchBody.has_360_tour = true;
      if (has_floorplan) searchBody.has_floorplan = true;

      // Create sync log
      const { data: syncLog } = await supabase
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
      let photosRehosted = 0;
      let photosCdnReferenced = 0;
      let floorPlansRehosted = 0;
      let agentsDiscovered = 0;
      let agenciesDiscovered = 0;
      const errors: string[] = [];
      const discoveredAgentIds = new Set<string>();
      const discoveredAgencyIds = new Set<string>();

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

        // Process each property with ORGANIC THROTTLING
        let processedCount = 0;
        for (const prop of properties) {
          try {
            processedCount++;
            
            // Batch cooldown
            if (processedCount > 1 && processedCount % BATCH_SIZE === 0) {
              console.log(`[Bayut API] Batch cooldown at ${processedCount} properties...`);
              await new Promise(r => setTimeout(r, BATCH_COOLDOWN_MS));
            }

            const externalId = String(prop.id);
            
            // VALIDATION: Skip properties with missing essential data
            if (!prop.id) {
              console.log(`[Bayut API] Skipping property - no ID`);
              errors.push('Property skipped: no ID');
              continue;
            }
            
            if (!prop.price || prop.price <= 0) {
              console.log(`[Bayut API] Skipping ${externalId} - no valid price`);
              errors.push(`Property ${externalId}: no valid price`);
              continue;
            }
            
            // Skip LAND PLOTS (they don't have size_sqft)
            const propTitle = (prop.title || '').toLowerCase();
            const propCategory = (prop.category || '').toLowerCase();
            if (propTitle.includes('plot') || propTitle.includes('land') || 
                propCategory.includes('plot') || propCategory.includes('land')) {
              console.log(`[Bayut API] Skipping ${externalId} - land/plot listing`);
              continue;
            }
            
            // Skip non-Dubai properties (check if location array exists and filter)
            let locationName = '';
            if (Array.isArray(prop.location)) {
              locationName = prop.location.find((l: any) => l.level === 0)?.name?.toLowerCase() || '';
            } else if (prop.geography?.city) {
              locationName = prop.geography.city.toLowerCase();
            }
            // Only skip if we have location info and it's clearly not Dubai
            if (locationName && !locationName.includes('dubai') && !locationName.includes('uae') && locationName.length > 0) {
              console.log(`[Bayut API] Skipping ${externalId} - not in Dubai: ${locationName}`);
              continue;
            }
            
            // Check if recently synced (within 24 hours)
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

            // FETCH FULL PROPERTY DETAILS (search results don't include photos)
            let fullProp = prop;
            try {
              console.log(`[Bayut API] Fetching details for ${externalId}`);
              const detailResponse = await fetch(
                `${API_BASE}/property/${externalId}`,
                {
                  headers: {
                    'X-RapidAPI-Key': rapidApiKey,
                    'X-RapidAPI-Host': API_HOST,
                  },
                }
              );
              apiCallsUsed++;
              
              if (detailResponse.ok) {
                const detailData = await detailResponse.json();
                fullProp = detailData;
                console.log(`[Bayut API] Got details for ${externalId}, photos: ${fullProp.photos?.length || 0}`);
              } else {
                console.log(`[Bayut API] Detail fetch failed for ${externalId}, using search data`);
              }
              
              // Rate limit between detail fetches
              await new Promise(r => setTimeout(r, 300));
            } catch (detailError) {
              console.error(`[Bayut API] Detail fetch error for ${externalId}:`, detailError);
            }

            // HYBRID IMAGE STORAGE (use fullProp which has photos)
            const imageResult = await processPropertyImages(supabase, fullProp, externalId);
            photosRehosted += imageResult.rehostedCount;
            photosCdnReferenced += imageResult.cdnCount;
            floorPlansRehosted += imageResult.floorPlansCount;

            // Extract agent/agency intelligence
            const agentData = extractAgentData(prop);
            const agencyData = extractAgencyData(prop);

            // Track discovered agents/agencies
            if (agentData?.agent_id && !discoveredAgentIds.has(String(agentData.agent_id))) {
              discoveredAgentIds.add(String(agentData.agent_id));
              agentsDiscovered++;
              
              // Upsert to bayut_agents (using correct column names from schema)
              try {
                await supabase.from('bayut_agents').upsert({
                  bayut_id: String(agentData.agent_id),
                  external_id: String(agentData.agent_id),
                  name: agentData.agent_name || 'Unknown',
                  phone: agentData.agent_phone || null,
                  phone_numbers: agentData.agent_whatsapp ? [{ mobile: agentData.agent_whatsapp }] : [],
                  photo_url: agentData.agent_photo || null,
                  agency_external_id: agentData.agency_id ? String(agentData.agency_id) : null,
                  is_verified: agentData.is_trubroker || false,
                  last_synced_at: new Date().toISOString(),
                }, { onConflict: 'bayut_id' });
              } catch (e) { 
                console.error('[Bayut API] Agent upsert error:', e);
              }
            }

            if (agencyData?.agency_id && !discoveredAgencyIds.has(String(agencyData.agency_id))) {
              discoveredAgencyIds.add(String(agencyData.agency_id));
              agenciesDiscovered++;

              // Upsert to bayut_agencies (using correct column names from schema)
              try {
                await supabase.from('bayut_agencies').upsert({
                  bayut_id: String(agencyData.agency_id),
                  external_id: String(agencyData.agency_id),
                  name: agencyData.agency_name || 'Unknown',
                  logo_url: agencyData.agency_logo || null,
                  license_number: agencyData.agency_orn || null,
                  phone: agencyData.agency_phone || null,
                  last_synced_at: new Date().toISOString(),
                }, { onConflict: 'bayut_id' });
              } catch (e) { 
                console.error('[Bayut API] Agency upsert error:', e);
              }
            }

            // Transform property with all new fields (use fullProp which has complete data)
            const transformedProperty = transformProperty(fullProp);
            
            // CRITICAL: Ensure size_sqft is never null/undefined
            if (!transformedProperty.size_sqft || transformedProperty.size_sqft < 1) {
              transformedProperty.size_sqft = 1;
            }
            
            transformedProperty.images = imageResult.rehostedImages;
            transformedProperty.gallery_urls = imageResult.cdnGalleryUrls;
            transformedProperty.floor_plan_urls = imageResult.floorPlanUrls;
            transformedProperty.bayut_agent_data = agentData;
            transformedProperty.bayut_agency_data = agencyData;
            transformedProperty.bayut_building_info = extractBuildingInfo(prop);

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
              console.log(`[Bayut API] Synced: ${externalId} (${imageResult.rehostedCount} rehosted, ${imageResult.cdnCount} CDN)`);
            }

            // Organic delay between properties
            await organicDelay();

          } catch (propError) {
            const errorMsg = propError instanceof Error ? propError.message : String(propError);
            errors.push(errorMsg);
          }
        }

        // Calculate estimated storage saved (avg 500KB per CDN image)
        const estimatedStorageSavedMb = Math.round((photosCdnReferenced * 500) / 1024);

        // Update sync log with comprehensive metrics
        if (syncLogId) {
          await supabase
            .from('bayut_sync_logs')
            .update({
              completed_at: new Date().toISOString(),
              properties_found: propertiesFound,
              properties_synced: propertiesSynced,
              photos_synced: photosRehosted + floorPlansRehosted,
              api_calls_used: apiCallsUsed,
              errors: errors.length > 0 ? { 
                messages: errors,
                photos_rehosted: photosRehosted,
                photos_cdn_referenced: photosCdnReferenced,
                floor_plans_rehosted: floorPlansRehosted,
                agents_discovered: agentsDiscovered,
                agencies_discovered: agenciesDiscovered,
                estimated_storage_saved_mb: estimatedStorageSavedMb,
              } : null,
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
            storage: {
              photosRehosted,
              photosCdnReferenced,
              floorPlansRehosted,
              estimatedStorageSavedMb,
            },
            intelligence: {
              agentsDiscovered,
              agenciesDiscovered,
            },
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
              photos_synced: photosRehosted + floorPlansRehosted,
              api_calls_used: apiCallsUsed,
              errors: { messages: [...errors, syncError instanceof Error ? syncError.message : String(syncError)] },
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

    // ===========================================
    // SYNC NEW PROJECTS (NEW API ENDPOINT)
    // ===========================================
    if (action === 'sync_new_projects') {
      const { 
        locations_ids = [],
        page = 0, 
        limit = 20,
        dry_run = false,
      } = body;

      console.log(`[Bayut API] Syncing new projects - page ${page}, limit ${limit}`);

      // Build request body
      const searchBody: any = {};
      if (locations_ids.length > 0) searchBody.locations_ids = locations_ids;

      const projectsUrl = `${API_BASE}/new_projects_search?page=${page}&hitsPerPage=${limit}`;
      
      const projectsResponse = await fetch(projectsUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': API_HOST,
        },
        body: JSON.stringify(searchBody),
      });

      if (!projectsResponse.ok) {
        const errorBody = await projectsResponse.text();
        throw new Error(`New projects search failed: ${projectsResponse.status} - ${errorBody}`);
      }

      const projectsData = await projectsResponse.json();
      const projects = projectsData.results || [];
      const totalAvailable = projectsData.nbHits || projects.length;

      console.log(`[Bayut API] Found ${projects.length} new projects (${totalAvailable} total)`);

      // DRY RUN - just return counts
      if (dry_run) {
        return new Response(
          JSON.stringify({
            success: true,
            dry_run: true,
            totalAvailable,
            wouldSync: Math.min(limit, totalAvailable),
            message: `Would sync up to ${Math.min(limit, totalAvailable)} of ${totalAvailable} new projects`,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      let projectsSynced = 0;
      const errors: string[] = [];

      // Process each project and upsert to developer_projects
      for (const project of projects) {
        try {
          const externalId = String(project.id);
          
          // Find or create developer
          let developerId: string | null = null;
          if (project.developer?.id) {
            const developerExternalId = String(project.developer.id);
            
            // Check if developer exists
            const { data: existingDev } = await supabase
              .from('developers')
              .select('id')
              .eq('slug', developerExternalId)
              .single();

            if (existingDev) {
              developerId = existingDev.id;
            } else {
              // Create developer
              const devSlug = (project.developer.name || 'developer')
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .substring(0, 50);

              const { data: newDev, error: devError } = await supabase
                .from('developers')
                .insert({
                  name: project.developer.name || 'Unknown Developer',
                  slug: `${devSlug}-${developerExternalId}`,
                  logo_url: project.developer.logo || null,
                  is_active: true,
                })
                .select('id')
                .single();

              if (!devError && newDev) {
                developerId = newDev.id;
              }
            }
          }

          // Generate project slug
          const projectName = project.name || project.title || 'Project';
          const baseSlug = projectName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .substring(0, 50);
          const slug = `${baseSlug}-${externalId}`;

          // Extract location
          let locationArea = 'Dubai';
          if (project.location?.community?.name) {
            locationArea = project.location.community.name;
          } else if (project.location?.city?.name) {
            locationArea = project.location.city.name;
          }

          // Upsert to developer_projects
          const { error: upsertError } = await supabase
            .from('developer_projects')
            .upsert({
              developer_id: developerId,
              name: projectName,
              slug,
              description: project.description || null,
              location_area: locationArea,
              image_url: project.media?.cover_photo || project.image || null,
              status: project.completion_status === 'completed' ? 'completed' : 'under_construction',
              completion_year: project.completion_date ? new Date(project.completion_date).getFullYear() : null,
              total_units: project.total_units || null,
              project_type: project.property_type || 'residential',
              is_flagship: project.is_featured || false,
              highlights: project.amenities || [],
            }, { onConflict: 'slug' });

          if (upsertError) {
            console.error(`[Bayut API] Project upsert error:`, upsertError);
            errors.push(`Project ${externalId}: ${upsertError.message}`);
          } else {
            projectsSynced++;
            console.log(`[Bayut API] Synced project: ${projectName}`);
          }

        } catch (projectError) {
          const errorMsg = projectError instanceof Error ? projectError.message : String(projectError);
          errors.push(errorMsg);
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: `Synced ${projectsSynced} of ${projects.length} new projects`,
          projectsFound: projects.length,
          projectsSynced,
          totalAvailable,
          errors: errors.length > 0 ? errors : undefined,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ===========================================
    // BULK SYNC - Scale to 10K Properties
    // ===========================================
    if (action === 'bulk_sync') {
      const {
        areas = [],
        purpose = 'for-sale',
        categories,
        max_pages = 1,
        lite_mode = false,
        include_rentals = false,
        skip_recently_synced = false,
        limit = 50, // per page
      } = body;

      if (areas.length === 0) {
        return new Response(
          JSON.stringify({ error: 'At least one area is required for bulk sync' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const maxPagesPerArea = Math.min(max_pages, 20); // Cap at 20 pages = 1000 properties per area
      const propertiesPerPage = Math.min(limit, 50); // Cap at 50 per page

      console.log(`[Bayut API] BULK SYNC - ${areas.length} areas, ${maxPagesPerArea} pages each, lite_mode=${lite_mode}`);

      // Create sync log for bulk operation
      const { data: syncLog } = await supabase
        .from('bayut_sync_logs')
        .insert({
          sync_type: 'bulk_sync',
          area_name: `Bulk: ${areas.length} areas`,
          status: 'running',
        })
        .select()
        .single();

      const syncLogId = syncLog?.id;

      let totalApiCalls = 0;
      let totalPropertiesFound = 0;
      let totalPropertiesSynced = 0;
      let totalPhotosRehosted = 0;
      let totalPhotosCdn = 0;
      let totalAgentsDiscovered = 0;
      let totalAgenciesDiscovered = 0;
      const allErrors: string[] = [];
      const areaResults: { name: string; synced: number; pages: number }[] = [];
      const discoveredAgentIds = new Set<string>();
      const discoveredAgencyIds = new Set<string>();

      const purposes = include_rentals ? ['for-sale', 'for-rent'] : [purpose];

      for (const area of areas) {
        let areaSynced = 0;
        let areaPagesProcessed = 0;

        for (const currentPurpose of purposes) {
          // Paginate through results for this area
          for (let pageNum = 0; pageNum < maxPagesPerArea; pageNum++) {
            try {
              // Build search body
              const searchBody: any = {
                purpose: currentPurpose,
                locations_ids: [area.id],
                index: 'latest',
              };
              if (categories && categories.length > 0) {
                searchBody.categories = categories;
              }

              const searchUrl = `${API_BASE}/properties_search?page=${pageNum}&hitsPerPage=${propertiesPerPage}`;
              console.log(`[Bayut API] Bulk sync: ${area.name} page ${pageNum + 1}/${maxPagesPerArea} (${currentPurpose})`);

              const searchResponse = await fetch(searchUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'X-RapidAPI-Key': rapidApiKey,
                  'X-RapidAPI-Host': API_HOST,
                },
                body: JSON.stringify(searchBody),
              });
              totalApiCalls++;

              if (!searchResponse.ok) {
                const errorBody = await searchResponse.text();
                console.error(`[Bayut API] Search failed for ${area.name}:`, errorBody);
                allErrors.push(`${area.name} page ${pageNum}: ${searchResponse.status}`);
                break; // Stop pagination for this area on error
              }

              const searchData = await searchResponse.json();
              const properties = searchData.results || [];
              const totalAvailable = searchData.nbHits || 0;
              totalPropertiesFound += properties.length;

              if (properties.length === 0) {
                console.log(`[Bayut API] No more properties for ${area.name}, stopping pagination`);
                break; // No more results, stop pagination
              }

              areaPagesProcessed++;

              // Process properties (LITE MODE or FULL MODE)
              for (const prop of properties) {
                try {
                  const externalId = String(prop.id);

                  // Basic validation
                  if (!prop.id || !prop.price || prop.price <= 0) continue;

                  // Skip land/plots
                  const propTitle = (prop.title || '').toLowerCase();
                  const propCategory = (prop.category || '').toLowerCase();
                  if (propTitle.includes('plot') || propTitle.includes('land') || 
                      propCategory.includes('plot') || propCategory.includes('land')) {
                    continue;
                  }

                  // Check if recently synced (unless skip_recently_synced)
                  if (!skip_recently_synced) {
                    const { data: existing } = await supabase
                      .from('properties')
                      .select('id, last_synced_at')
                      .eq('external_id', externalId)
                      .eq('external_source', 'bayut')
                      .single();

                    if (existing?.last_synced_at) {
                      const lastSync = new Date(existing.last_synced_at);
                      const hoursSinceSync = (Date.now() - lastSync.getTime()) / (1000 * 60 * 60);
                      if (hoursSinceSync < 24) continue;
                    }
                  }

                  let fullProp = prop;
                  let imageResult = {
                    rehostedImages: [] as string[],
                    cdnGalleryUrls: [] as string[],
                    floorPlanUrls: [] as string[],
                    rehostedCount: 0,
                    cdnCount: 0,
                    floorPlansCount: 0,
                  };

                  // LITE MODE: Use search data directly, skip detail fetch
                  // FULL MODE: Fetch details and rehost images
                  if (!lite_mode) {
                    try {
                      const detailResponse = await fetch(
                        `${API_BASE}/property/${externalId}`,
                        {
                          headers: {
                            'X-RapidAPI-Key': rapidApiKey,
                            'X-RapidAPI-Host': API_HOST,
                          },
                        }
                      );
                      totalApiCalls++;

                      if (detailResponse.ok) {
                        fullProp = await detailResponse.json();
                      }
                      await new Promise(r => setTimeout(r, 200));
                    } catch (e) {
                      console.error(`[Bayut API] Detail fetch error:`, e);
                    }

                    // Process images
                    imageResult = await processPropertyImages(supabase, fullProp, externalId);
                    totalPhotosRehosted += imageResult.rehostedCount;
                    totalPhotosCdn += imageResult.cdnCount;
                  } else {
                    // LITE MODE: Rehost ONLY the cover photo to Supabase (owned image)
                    // This avoids Bayut CDN exposure while keeping sync fast
                    const coverPhotoUrl = prop.media?.cover_photo || prop.coverPhoto?.url;
                    if (coverPhotoUrl) {
                      try {
                        const rehostedCoverUrl = await rehostPhoto(supabase, coverPhotoUrl, externalId, 'gallery');
                        if (rehostedCoverUrl) {
                          imageResult.rehostedImages = [rehostedCoverUrl];
                          imageResult.rehostedCount = 1;
                          totalPhotosRehosted++;
                          console.log(`[Bayut API] Lite mode: rehosted cover for ${externalId}`);
                        } else {
                          // Fallback: if rehost fails, skip image entirely (don't expose CDN)
                          console.warn(`[Bayut API] Lite mode: cover rehost failed for ${externalId}, skipping image`);
                        }
                      } catch (coverError) {
                        console.error(`[Bayut API] Lite mode cover rehost error for ${externalId}:`, coverError);
                        // Don't add CDN URL - we want owned images only
                      }
                    }
                  }

                  // Extract agent/agency
                  const agentData = extractAgentData(prop);
                  const agencyData = extractAgencyData(prop);

                  if (agentData?.agent_id && !discoveredAgentIds.has(String(agentData.agent_id))) {
                    discoveredAgentIds.add(String(agentData.agent_id));
                    totalAgentsDiscovered++;
                  }
                  if (agencyData?.agency_id && !discoveredAgencyIds.has(String(agencyData.agency_id))) {
                    discoveredAgencyIds.add(String(agencyData.agency_id));
                    totalAgenciesDiscovered++;
                  }

                  // Transform property
                  const transformedProperty = transformProperty(fullProp);
                  if (!transformedProperty.size_sqft || transformedProperty.size_sqft < 1) {
                    transformedProperty.size_sqft = 1;
                  }

                  transformedProperty.images = imageResult.rehostedImages;
                  transformedProperty.gallery_urls = imageResult.cdnGalleryUrls;
                  transformedProperty.floor_plan_urls = imageResult.floorPlanUrls;
                  transformedProperty.bayut_agent_data = agentData;
                  transformedProperty.bayut_agency_data = agencyData;
                  transformedProperty.bayut_building_info = extractBuildingInfo(prop);

                  // Check for existing record
                  const { data: existingProp } = await supabase
                    .from('properties')
                    .select('id')
                    .eq('external_id', externalId)
                    .eq('external_source', 'bayut')
                    .single();

                  // Upsert
                  const { error: upsertError } = await supabase
                    .from('properties')
                    .upsert(
                      {
                        ...transformedProperty,
                        id: existingProp?.id,
                      },
                      { onConflict: 'external_source,external_id' }
                    );

                  if (!upsertError) {
                    totalPropertiesSynced++;
                    areaSynced++;
                  } else {
                    allErrors.push(`${externalId}: ${upsertError.message}`);
                  }

                } catch (propError) {
                  const msg = propError instanceof Error ? propError.message : String(propError);
                  allErrors.push(msg);
                }
              }

              // Small delay between pages
              await new Promise(r => setTimeout(r, 300));

            } catch (pageError) {
              const msg = pageError instanceof Error ? pageError.message : String(pageError);
              allErrors.push(`${area.name} page ${pageNum}: ${msg}`);
            }
          }
        }

        areaResults.push({ name: area.name, synced: areaSynced, pages: areaPagesProcessed });
        console.log(`[Bayut API] Completed ${area.name}: ${areaSynced} properties synced`);
      }

      // Update sync log
      if (syncLogId) {
        await supabase
          .from('bayut_sync_logs')
          .update({
            completed_at: new Date().toISOString(),
            properties_found: totalPropertiesFound,
            properties_synced: totalPropertiesSynced,
            photos_synced: totalPhotosRehosted,
            api_calls_used: totalApiCalls,
            errors: allErrors.length > 0 ? { 
              messages: allErrors.slice(0, 50), // Limit errors stored
              total_errors: allErrors.length,
              photos_cdn: totalPhotosCdn,
              agents_discovered: totalAgentsDiscovered,
              agencies_discovered: totalAgenciesDiscovered,
              area_results: areaResults,
            } : null,
            status: allErrors.length > 0 ? 'completed_with_errors' : 'completed',
          })
          .eq('id', syncLogId);
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: `Bulk sync complete: ${totalPropertiesSynced} properties from ${areas.length} areas`,
          totalPropertiesFound,
          totalPropertiesSynced,
          totalApiCalls,
          lite_mode,
          storage: {
            photosRehosted: totalPhotosRehosted,
            photosCdnReferenced: totalPhotosCdn,
          },
          intelligence: {
            agentsDiscovered: totalAgentsDiscovered,
            agenciesDiscovered: totalAgenciesDiscovered,
          },
          areaResults,
          errors: allErrors.length > 0 ? allErrors.slice(0, 20) : undefined,
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

// ===========================================
// HYBRID IMAGE STORAGE
// ===========================================
interface ImageProcessResult {
  rehostedImages: string[];     // Stored in Supabase (cover + first 3)
  cdnGalleryUrls: string[];     // Bayut CDN references (remaining)
  floorPlanUrls: string[];      // Stored in Supabase (all floor plans)
  rehostedCount: number;
  cdnCount: number;
  floorPlansCount: number;
}

async function processPropertyImages(
  supabase: any, 
  prop: any, 
  externalId: string
): Promise<ImageProcessResult> {
  const result: ImageProcessResult = {
    rehostedImages: [],
    cdnGalleryUrls: [],
    floorPlanUrls: [],
    rehostedCount: 0,
    cdnCount: 0,
    floorPlansCount: 0,
  };

  // Extract all photo URLs
  const photoUrls = extractPhotoUrls(prop);
  
  // Re-host cover photo + first 3 gallery images to Supabase
  const photosToRehost = photoUrls.slice(0, REHOST_LIMIT);
  for (const url of photosToRehost) {
    try {
      const rehostedUrl = await rehostPhoto(supabase, url, externalId, 'gallery');
      if (rehostedUrl) {
        result.rehostedImages.push(rehostedUrl);
        result.rehostedCount++;
      }
    } catch (e) {
      console.error(`[Bayut API] Failed to rehost photo:`, e);
      // Fall back to CDN reference if rehost fails
      result.cdnGalleryUrls.push(url);
      result.cdnCount++;
    }
  }
  
  // Store remaining gallery as CDN references (no storage cost)
  if (photoUrls.length > REHOST_LIMIT) {
    const remainingPhotos = photoUrls.slice(REHOST_LIMIT);
    result.cdnGalleryUrls.push(...remainingPhotos);
    result.cdnCount += remainingPhotos.length;
  }
  
  // Re-host ALL floor plans to Supabase (critical documents)
  const floorPlanUrls = extractFloorPlanUrls(prop);
  for (const fpUrl of floorPlanUrls) {
    try {
      const rehostedFp = await rehostPhoto(supabase, fpUrl, externalId, 'floorplan');
      if (rehostedFp) {
        result.floorPlanUrls.push(rehostedFp);
        result.floorPlansCount++;
      }
    } catch (e) {
      console.error(`[Bayut API] Failed to rehost floor plan:`, e);
    }
  }

  return result;
}

// Extract floor plan URLs - handles Bayut API structure (floor_plan.2d_images)
function extractFloorPlanUrls(prop: any): string[] {
  const urls: string[] = [];
  
  // Check floor_plan.2d_images (correct path per API)
  if (prop.floor_plan?.['2d_images'] && Array.isArray(prop.floor_plan['2d_images'])) {
    for (const fp of prop.floor_plan['2d_images']) {
      const url = typeof fp === 'string' ? fp : fp?.url;
      if (url && !urls.includes(url)) {
        urls.push(url);
      }
    }
  }
  
  // Fallback: legacy field names
  if (prop.floorplan_images && Array.isArray(prop.floorplan_images)) {
    for (const fp of prop.floorplan_images) {
      const url = typeof fp === 'string' ? fp : fp.url;
      if (url && !urls.includes(url)) {
        urls.push(url);
      }
    }
  }
  
  return urls;
}

// ===========================================
// AGENT/AGENCY INTELLIGENCE EXTRACTION
// ===========================================
function extractAgentData(prop: any): any | null {
  if (!prop.agency) return null;
  
  return {
    agent_id: prop.agency.id,
    agent_name: prop.agency.name,
    agent_phone: prop.agency.phone,
    agent_whatsapp: prop.agency.whatsapp,
    agent_brn: prop.agency.brn,
    agent_photo: prop.agency.photo,
    agency_id: prop.agency.agency?.id,
    agency_name: prop.agency.agency?.name,
    is_trubroker: prop.agency.isTruBroker || false,
  };
}

function extractAgencyData(prop: any): any | null {
  const agency = prop.agency?.agency;
  if (!agency) return null;
  
  return {
    agency_id: agency.id,
    agency_name: agency.name,
    agency_logo: agency.logo,
    agency_orn: agency.orn,
    agency_phone: agency.phone,
    product_tier: agency.product_tier,
  };
}

function extractBuildingInfo(prop: any): any | null {
  if (!prop.building) return null;
  
  return {
    name: prop.building.name,
    total_floors: prop.building.floors,
    year_completed: prop.building.yearCompleted,
    developer: prop.building.developer?.name,
    developer_id: prop.building.developer?.id,
  };
}

// ===========================================
// TRANSFORM PROPERTY (FIXED FOR NEW BAYUT API)
// ===========================================
function transformProperty(prop: any): any {
  const externalId = String(prop.id);
  const title = prop.title || prop.name || 'Property';
  
  // Extract location - PRIORITY ORDER based on Bayut API structure
  let locationArea = 'Dubai';
  
  // Try location.community.name first (most specific)
  if (prop.location?.community?.name) {
    locationArea = prop.location.community.name;
  } 
  // Then location.sub_community.name
  else if (prop.location?.sub_community?.name) {
    locationArea = prop.location.sub_community.name;
  }
  // Then location.city.name
  else if (prop.location?.city?.name) {
    locationArea = prop.location.city.name;
  }
  // Fallback: location array (legacy format)
  else if (Array.isArray(prop.location) && prop.location.length > 0) {
    // Find level 1 or 2 for area name (level 0 is usually country/city)
    const areaLevel = prop.location.find((l: any) => l.level === 1 || l.level === 2);
    locationArea = areaLevel?.name || prop.location[0]?.name || 'Dubai';
  }
  // Fallback: string location
  else if (typeof prop.location === 'string') {
    locationArea = prop.location;
  }

  // Extract property type - PRIORITY ORDER based on Bayut API structure
  let propertyType = 'apartment';
  
  // Try type.sub first (e.g., "Apartments", "Villas")
  if (prop.type?.sub) {
    const subType = prop.type.sub.toLowerCase();
    propertyType = mapPropertyType(subType);
  }
  // Then category.main or category.sub
  else if (prop.category?.main || prop.category?.sub) {
    const cat = (prop.category.sub || prop.category.main || '').toLowerCase();
    propertyType = mapPropertyType(cat);
  }
  // Fallback: category as string
  else if (typeof prop.category === 'string') {
    propertyType = mapPropertyType(prop.category.toLowerCase());
  }
  
  // ALSO check title for property type hints (e.g., "Villa For Sale...")
  const titleLower = title.toLowerCase();
  if (titleLower.includes('villa') && propertyType === 'apartment') {
    propertyType = 'villa';
  } else if (titleLower.includes('townhouse') && propertyType === 'apartment') {
    propertyType = 'townhouse';
  } else if (titleLower.includes('penthouse') && propertyType === 'apartment') {
    propertyType = 'penthouse';
  }

  // Parse bedrooms - PRIORITY ORDER based on Bayut API structure
  let bedrooms = 0;
  
  // Try details.bedrooms first (NEW API format)
  if (prop.details?.bedrooms !== undefined) {
    bedrooms = parseInt(prop.details.bedrooms, 10) || 0;
  }
  // Then direct bedrooms field
  else if (prop.bedrooms !== undefined) {
    bedrooms = parseInt(prop.bedrooms, 10) || 0;
  }
  // Then rooms field (legacy)
  else if (prop.rooms !== undefined) {
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
  
  // VALIDATION: Cross-check bedrooms from title if we got 0 but title mentions beds
  if (bedrooms === 0) {
    const bedroomMatch = title.match(/(\d+)\s*(?:bed|br|bedroom)/i);
    if (bedroomMatch) {
      const titleBeds = parseInt(bedroomMatch[1], 10);
      if (!isNaN(titleBeds) && titleBeds > 0) {
        console.log(`[Bayut API] Correcting bedrooms from 0 to ${titleBeds} based on title: "${title}"`);
        bedrooms = titleBeds;
      }
    }
    // Check for "master room" patterns like "6 master room"
    const masterMatch = title.match(/(\d+)\s*master\s*room/i);
    if (masterMatch) {
      const masterBeds = parseInt(masterMatch[1], 10);
      if (!isNaN(masterBeds) && masterBeds > 0) {
        console.log(`[Bayut API] Correcting bedrooms from 0 to ${masterBeds} based on master room in title`);
        bedrooms = masterBeds;
      }
    }
  }
  
  // Extract bathrooms
  let bathrooms = 0;
  if (prop.details?.bathrooms !== undefined) {
    bathrooms = parseInt(prop.details.bathrooms, 10) || 0;
  } else if (prop.baths !== undefined) {
    bathrooms = parseInt(prop.baths, 10) || 0;
  } else if (prop.bathrooms !== undefined) {
    bathrooms = parseInt(prop.bathrooms, 10) || 0;
  }
  
  // Extract size - PRIORITY ORDER with VALIDATION
  let sizeSqft = 1;
  
  // Try area.built_up first (NEW API format)
  if (prop.area?.built_up) {
    sizeSqft = parseFloat(prop.area.built_up) || 1;
  }
  // Then area.size
  else if (prop.area?.size) {
    sizeSqft = parseFloat(prop.area.size) || 1;
  }
  // Then direct area as number
  else if (typeof prop.area === 'number') {
    sizeSqft = prop.area || 1;
  }
  // Then sqft / builtupArea fields
  else if (prop.sqft) {
    sizeSqft = parseFloat(prop.sqft) || 1;
  } 
  else if (prop.builtupArea) {
    sizeSqft = parseFloat(prop.builtupArea) || 1;
  }
  
  // VALIDATION: Size must make sense for property type
  // Studios typically < 1500 sqft, apartments < 6000 sqft
  if (bedrooms === 0 && sizeSqft > 2000) {
    console.log(`[Bayut API] WARNING: Studio with ${sizeSqft} sqft - likely incorrect bedroom count for property ${externalId}`);
    // The bedroom correction from title should have fixed this, but log it
  }
  
  sizeSqft = Math.max(1, Math.round(sizeSqft));
  
  // Extract coordinates - PRIORITY ORDER
  let latitude: number | null = null;
  let longitude: number | null = null;
  
  // Try location.coordinates first (NEW API format)
  if (prop.location?.coordinates?.lat && prop.location?.coordinates?.lng) {
    latitude = parseFloat(prop.location.coordinates.lat) || null;
    longitude = parseFloat(prop.location.coordinates.lng) || null;
  }
  // Then geo object
  else if (prop.geo?.lat && prop.geo?.lng) {
    latitude = parseFloat(prop.geo.lat) || null;
    longitude = parseFloat(prop.geo.lng) || null;
  }
  // Then direct lat/lng
  else if (prop.latitude && prop.longitude) {
    latitude = parseFloat(prop.latitude) || null;
    longitude = parseFloat(prop.longitude) || null;
  }

  // Generate slug
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
  const slug = `${baseSlug}-${externalId}`;

  // Extract developer name
  let developerName: string | null = null;
  if (prop.developer?.name) {
    developerName = prop.developer.name;
  } else if (prop.building?.developer?.name) {
    developerName = prop.building.developer.name;
  }

  return {
    external_id: externalId,
    external_source: 'bayut',
    external_url: prop.url || `https://www.bayut.com/property/details-${externalId}.html`,
    title,
    description: prop.description || null,
    price_aed: Math.max(0, prop.price || 0),
    size_sqft: sizeSqft,
    bedrooms: bedrooms,
    bathrooms: bathrooms,
    property_type: propertyType,
    listing_type: prop.purpose === 'for-rent' ? 'rent' : 'sale',
    location_area: locationArea,
    latitude,
    longitude,
    is_off_plan: prop.is_completed === false || prop.completion_status === 'off_plan' || prop.completion_status === 'offplan',
    completion_percent: prop.completion_percent || null,
    furnishing: prop.is_furnished ? 'furnished' : (prop.furnishing || null),
    rera_permit_number: prop.rera_permit || prop.permit_number || prop.trakheesi || null,
    amenities: prop.amenities || [],
    images: [],
    gallery_urls: [],
    floor_plan_urls: [],
    last_synced_at: new Date().toISOString(),
    is_published: true,
    slug,
    developer_name: developerName,
    // Enhanced fields
    year_built: prop.year_built || prop.details?.year_built || null,
    service_charge_per_sqft: prop.service_charge || null,
    view_type: prop.view || null,
    floor_number: prop.floor || prop.details?.floor || null,
    parking_spaces: prop.parking || prop.details?.parking || null,
  };
}

// Helper function to map property types
function mapPropertyType(typeStr: string): string {
  const typeMap: Record<string, string> = {
    'apartment': 'apartment',
    'apartments': 'apartment',
    'flat': 'apartment',
    'flats': 'apartment',
    'villa': 'villa',
    'villas': 'villa',
    'townhouse': 'townhouse',
    'townhouses': 'townhouse',
    'town house': 'townhouse',
    'penthouse': 'penthouse',
    'penthouses': 'penthouse',
    'duplex': 'duplex',
    'studio': 'studio',
    'land': 'land',
    'plot': 'land',
    'plots': 'land',
    'residential plot': 'land',
    'office': 'office',
    'offices': 'office',
    'retail': 'retail',
    'shop': 'retail',
    'warehouse': 'warehouse',
    'residential': 'apartment',
  };
  
  // Check for direct match
  if (typeMap[typeStr]) {
    return typeMap[typeStr];
  }
  
  // Check for partial match
  for (const [key, value] of Object.entries(typeMap)) {
    if (typeStr.includes(key)) {
      return value;
    }
  }
  
  return 'apartment';
}

// Extract photo URLs - handles Bayut API structure (media.cover_photo, media.photos)
function extractPhotoUrls(prop: any): string[] {
  const urls: string[] = [];
  
  // Debug logging for photo fields
  console.log(`[Bayut API] Photo fields for ${prop.id}:`, {
    hasMedia: !!prop.media,
    coverPhoto: prop.media?.cover_photo?.substring(0, 50),
    photosCount: prop.media?.photos?.length || 0,
    photoCount: prop.media?.photo_count || 0,
  });
  
  // Cover photo from media.cover_photo
  if (prop.media?.cover_photo) {
    urls.push(prop.media.cover_photo);
  }
  
  // Gallery photos from media.photos (array of URLs)
  if (prop.media?.photos && Array.isArray(prop.media.photos)) {
    for (const photo of prop.media.photos) {
      const url = typeof photo === 'string' ? photo : photo?.url;
      if (url && !urls.includes(url)) {
        urls.push(url);
      }
    }
  }
  
  // Fallback: check legacy field names
  if (urls.length === 0) {
    if (prop.coverPhoto?.url) urls.push(prop.coverPhoto.url);
    if (prop.photos && Array.isArray(prop.photos)) {
      for (const photo of prop.photos) {
        const url = photo?.url || (typeof photo === 'string' ? photo : null);
        if (url && !urls.includes(url)) urls.push(url);
      }
    }
  }
  
  console.log(`[Bayut API] Extracted ${urls.length} photos for property ${prop.id}`);
  
  return urls.slice(0, 20); // Cap at 20 photos
}

// Re-host photo to Supabase storage
async function rehostPhoto(
  supabase: any, 
  sourceUrl: string, 
  propertyId: string,
  type: 'gallery' | 'floorplan' = 'gallery'
): Promise<string | null> {
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
    const folder = type === 'floorplan' ? 'floorplans' : 'gallery';
    const filename = `bayut/${propertyId}/${folder}/${urlHash}.${extension}`;

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
