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
const REHOST_LIMIT = 10; // Cover photo + first 9 gallery images (high quality sync)
const BATCH_SIZE = 20;
const BATCH_COOLDOWN_MS = 3000; // 3 seconds between batches (faster for quality sync)

// STRICT DUBAI-ONLY WHITELIST - prevents syncing properties from other emirates
const DUBAI_AREA_WHITELIST = new Set([
  // Core Dubai Areas
  'dubai', 'downtown dubai', 'dubai marina', 'palm jumeirah', 'business bay',
  'jumeirah beach residence', 'jbr', 'dubai hills estate', 'dubai creek harbour',
  'jumeirah village circle', 'jvc', 'arabian ranches', 'emirates hills', 'difc',
  'meydan city', 'damac hills', 'emaar beachfront', 'bluewaters island',
  'jumeirah lake towers', 'jlt', 'the greens', 'the views', 'discovery gardens',
  'dubai sports city', 'motor city', 'dubai silicon oasis', 'dubai south',
  'al barsha', 'al barsha heights', 'tecom', 'internet city', 'media city',
  'dubai investment park', 'dip', 'dubai production city', 'impz',
  'jumeirah', 'umm suqeim', 'al safa', 'al wasl', 'city walk', 'la mer',
  'dubai land', 'dubailand', 'living legends', 'falcon city', 'mirdif',
  'al warqa', 'al nahda dubai', 'al qusais', 'deira', 'bur dubai', 'karama',
  'al quoz', 'al satwa', 'oud metha', 'healthcare city', 'culture village',
  'dubai festival city', 'creek beach', 'sobha hartland', 'mohammed bin rashid city',
  'mbr city', 'district one', 'tilal al ghaf', 'mudon', 'remraam', 'akoya',
  'arjan', 'al furjan', 'jumeirah golf estates', 'victory heights',
  'the springs', 'the meadows', 'the lakes', 'emirates living', 'al sufouh',
  'palm deira', 'palm jebel ali', 'world islands', 'dubai islands',
  'dubai harbour', 'madinat jumeirah', 'port rashid', 'mina rashid',
  'dubai design district', 'd3', 'al jadaf', 'al khawaneej', 'al mamzar',
  'nad al sheba', 'al mizhar', 'dubailand oasis', 'wadi al safa',
  'liwan', 'queue point', 'international city', 'dragon mart',
]);

// NON-DUBAI KEYWORDS - properties with these in title/location are REJECTED
const NON_DUBAI_KEYWORDS = [
  'ajman', 'sharjah', 'abu dhabi', 'ras al khaimah', 'fujairah', 'umm al quwain',
  'al helio', 'al-helio', 'helio', 'al haliou', 'al-haliou', 'haliou',
  'al raqaib', 'al rashidiya ajman', 'al nuaimia', 'al rawda ajman',
  'al jurf', 'al mowaihat', 'al tallah', 'al zahya', 'masfoot',
];

// Check if a location is in Dubai - STRICT: REJECT by default unless confirmed Dubai
function isDubaiLocation(prop: any): boolean {
  let foundDubai = false;
  let foundOtherEmirate = false;
  
  // STEP 1: Check title first - if it mentions non-Dubai, reject IMMEDIATELY
  const title = (prop.title || prop.name || '').toLowerCase();
  for (const keyword of NON_DUBAI_KEYWORDS) {
    if (title.includes(keyword)) {
      console.log(`[Bayut API] REJECTED: Title contains non-Dubai keyword "${keyword}"`);
      return false;
    }
  }
  
  // STEP 2: Check location array
  if (Array.isArray(prop.location)) {
    for (const loc of prop.location) {
      const locName = (loc.name || '').toLowerCase();
      
      // Check for non-Dubai emirates
      for (const keyword of NON_DUBAI_KEYWORDS) {
        if (locName.includes(keyword)) {
          foundOtherEmirate = true;
          break;
        }
      }
      
      // Check for Dubai
      if (locName === 'dubai' || locName.includes('dubai')) {
        foundDubai = true;
      }
      if (DUBAI_AREA_WHITELIST.has(locName)) {
        foundDubai = true;
      }
    }
  }
  
  // STEP 3: Check structured location object
  if (prop.location?.city?.name) {
    const cityName = prop.location.city.name.toLowerCase();
    if (cityName === 'dubai' || cityName.includes('dubai')) {
      foundDubai = true;
    }
    for (const keyword of NON_DUBAI_KEYWORDS) {
      if (cityName.includes(keyword)) {
        foundOtherEmirate = true;
      }
    }
  }
  
  // STEP 4: Check geography object
  if (prop.geography?.city) {
    const city = prop.geography.city.toLowerCase();
    if (city.includes('dubai')) foundDubai = true;
    for (const keyword of NON_DUBAI_KEYWORDS) {
      if (city.includes(keyword)) {
        foundOtherEmirate = true;
      }
    }
  }
  
  // DECISION LOGIC: 
  // If we found non-Dubai emirate -> REJECT
  if (foundOtherEmirate) {
    console.log(`[Bayut API] REJECTED: Location contains non-Dubai emirate`);
    return false;
  }
  
  // If we confirmed Dubai -> ACCEPT
  if (foundDubai) {
    return true;
  }
  
  // DEFAULT: REJECT if we cannot confirm it's Dubai (strict mode)
  console.log(`[Bayut API] REJECTED: Could not confirm Dubai location - rejecting by default`);
  return false;
}

interface SyncRequest {
  action: 'test' | 'search_locations' | 'sync_properties' | 'sync_transactions' | 'search_developers' | 'search_agents' | 'search_agencies' | 'get_property_details' | 'sync_new_projects' | 'bulk_sync' | 'cleanup_non_dubai';
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

      // DUPLICATE PREVENTION: Track processed external IDs in this sync session
      const processedExternalIds = new Set<string>();
      let duplicatesBlocked = 0;

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

            // VALIDATION: Skip properties with missing essential data
            if (!prop.id) {
              console.log(`[Bayut API] Skipping property - no ID`);
              errors.push('Property skipped: no ID');
              continue;
            }

            const externalId = String(prop.id);
            
            // DUPLICATE PREVENTION #1: Memory guard - skip if already processed in this batch
            if (processedExternalIds.has(externalId)) {
              console.log(`[Bayut API] DUPLICATE BLOCKED (memory): ${externalId} already processed in this sync`);
              duplicatesBlocked++;
              continue;
            }
            processedExternalIds.add(externalId);
            
            if (!prop.price || prop.price <= 0) {
              console.log(`[Bayut API] Skipping ${externalId} - no valid price`);
              errors.push(`Property ${externalId}: no valid price`);
              continue;
            }
            
            // Skip land/plots
            const propTitle = (prop.title || '').toLowerCase();
            const propCategory = (prop.category || '').toLowerCase();
            if (propTitle.includes('plot') || propTitle.includes('land') || 
                propCategory.includes('plot') || propCategory.includes('land')) {
              console.log(`[Bayut API] Skipping ${externalId} - land/plot listing`);
              continue;
            }
            
            // STRICT DUBAI-ONLY FILTER - use whitelist
            if (!isDubaiLocation(prop)) {
              console.log(`[Bayut API] Skipping ${externalId} - not in Dubai (strict filter)`);
              continue;
            }
            
            // DUPLICATE PREVENTION #2: Database check with maybeSingle (no error if not found)
            const { data: existing } = await supabase
              .from('properties')
              .select('id, last_synced_at')
              .eq('external_id', externalId)
              .eq('external_source', 'bayut')
              .maybeSingle();

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

        console.log(`[Bayut API] Sync complete: ${propertiesSynced} synced, ${duplicatesBlocked} duplicates blocked`);

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
                duplicates_blocked: duplicatesBlocked,
              } : null,
              status: errors.length > 0 ? 'completed_with_errors' : 'completed',
            })
            .eq('id', syncLogId);
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: `Synced ${propertiesSynced} of ${propertiesFound} properties (${duplicatesBlocked} duplicates blocked)`,
            propertiesFound,
            propertiesSynced,
            duplicatesBlocked,
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
    // CLEANUP NON-DUBAI - Remove Al Helio/Ajman properties
    // ===========================================
    if (action === 'cleanup_non_dubai') {
      console.log(`[Bayut API] CLEANUP: Removing non-Dubai properties...`);
      
      // Delete properties matching non-Dubai patterns
      const { data: deleted, error: deleteError } = await supabase
        .from('properties')
        .delete()
        .or('location_area.ilike.%ajman%,location_area.ilike.%helio%,location_area.eq.Al Helio,location_area.ilike.%sharjah%,title.ilike.%ajman%,title.ilike.%helio%')
        .select('id, title, location_area');
      
      if (deleteError) {
        console.error(`[Bayut API] Cleanup error:`, deleteError);
        return new Response(
          JSON.stringify({ success: false, error: deleteError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log(`[Bayut API] CLEANUP: Deleted ${deleted?.length || 0} non-Dubai properties`);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          deleted: deleted?.length || 0,
          deletedProperties: deleted?.slice(0, 20) || [], // First 20 for reference
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ===========================================
    // BULK SYNC - Scale to 10K Properties (Fire-and-Forget)
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

      // CLEANUP: Mark stuck syncs as timed_out before starting new one
      const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();
      await supabase
        .from('bayut_sync_logs')
        .update({ 
          status: 'timed_out',
          completed_at: new Date().toISOString(),
          errors: { reason: 'Automatically marked as timed_out after 4 hours' }
        })
        .eq('status', 'running')
        .lt('started_at', fourHoursAgo);

      // Create sync log FIRST so we can return the ID immediately
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

      // Define the background sync task
      const runBulkSync = async () => {
        let totalApiCalls = 0;
        let totalPropertiesFound = 0;
        let totalPropertiesSynced = 0;
        let totalPhotosRehosted = 0;
        let totalPhotosCdn = 0;
        let totalAgentsDiscovered = 0;
        let totalAgenciesDiscovered = 0;
        let totalDuplicatesBlocked = 0;
        let totalRejectedNonDubai = 0;
        const allErrors: string[] = [];
        const areaResults: { name: string; synced: number; pages: number }[] = [];
        const discoveredAgentIds = new Set<string>();
        const discoveredAgencyIds = new Set<string>();
        
        // DUPLICATE PREVENTION: Global Set for entire bulk sync session
        const processedExternalIds = new Set<string>();
        
        // Progress tracking helper - update every 50 properties
        const updateProgress = async () => {
          if (syncLogId && totalPropertiesSynced % 50 === 0) {
            await supabase
              .from('bayut_sync_logs')
              .update({
                properties_found: totalPropertiesFound,
                properties_synced: totalPropertiesSynced,
                photos_synced: totalPhotosRehosted,
                api_calls_used: totalApiCalls,
              })
              .eq('id', syncLogId);
          }
        };

        const purposes = include_rentals ? ['for-sale', 'for-rent'] : [purpose];

        try {
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
                  totalPropertiesFound += properties.length;

                  if (properties.length === 0) {
                    console.log(`[Bayut API] No more properties for ${area.name}, stopping pagination`);
                    break; // No more results, stop pagination
                  }

                  areaPagesProcessed++;

                  // Process properties (LITE MODE or FULL MODE)
                  for (const prop of properties) {
                    try {
                      // Basic validation - check ID first
                      if (!prop.id) continue;
                      
                      const externalId = String(prop.id);

                      // DUPLICATE PREVENTION #1: Memory guard - skip if already processed
                      if (processedExternalIds.has(externalId)) {
                        console.log(`[Bayut API] DUPLICATE BLOCKED (memory): ${externalId}`);
                        totalDuplicatesBlocked++;
                        continue;
                      }
                      processedExternalIds.add(externalId);

                      // Basic validation - check price
                      if (!prop.price || prop.price <= 0) continue;

                      // STRICT DUBAI-ONLY FILTER - use whitelist
                      if (!isDubaiLocation(prop)) {
                        console.log(`[Bayut API] Bulk sync: Skipping ${externalId} - not in Dubai (strict filter)`);
                        continue;
                      }

                      // Skip land/plots
                      const propTitle = (prop.title || '').toLowerCase();
                      const propCategory = (prop.category || '').toLowerCase();
                      if (propTitle.includes('plot') || propTitle.includes('land') || 
                          propCategory.includes('plot') || propCategory.includes('land')) {
                        continue;
                      }

                      // DUPLICATE PREVENTION #2: Database check with maybeSingle
                      if (!skip_recently_synced) {
                        const { data: existing } = await supabase
                          .from('properties')
                          .select('id, last_synced_at')
                          .eq('external_id', externalId)
                          .eq('external_source', 'bayut')
                          .maybeSingle();

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
                        // LITE MODE: Rehost cover photo + store photo count metadata
                        // Extract ALL available photos from search response
                        const allPhotos = extractPhotoUrls(prop);
                        
                        // Rehost cover photo to Supabase (owned image)
                        if (allPhotos.length > 0) {
                          try {
                            const rehostedCoverUrl = await rehostPhoto(supabase, allPhotos[0], externalId, 'gallery');
                            if (rehostedCoverUrl) {
                              imageResult.rehostedImages = [rehostedCoverUrl];
                              imageResult.rehostedCount = 1;
                              totalPhotosRehosted++;
                            }
                          } catch (coverError) {
                            console.error(`[Bayut API] Lite mode cover rehost error for ${externalId}:`, coverError);
                          }
                          
                          // Store remaining photos as CDN references (no storage cost)
                          if (allPhotos.length > 1) {
                            imageResult.cdnGalleryUrls = allPhotos.slice(1);
                            imageResult.cdnCount = allPhotos.length - 1;
                            totalPhotosCdn += imageResult.cdnCount;
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
                        // Update progress every 50 properties
                        await updateProgress();
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

          // Update sync log with success
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
                  messages: allErrors.slice(0, 50),
                  total_errors: allErrors.length,
                  photos_cdn: totalPhotosCdn,
                  agents_discovered: totalAgentsDiscovered,
                  agencies_discovered: totalAgenciesDiscovered,
                  duplicates_blocked: totalDuplicatesBlocked,
                  area_results: areaResults,
                } : {
                  duplicates_blocked: totalDuplicatesBlocked,
                  area_results: areaResults,
                },
                status: allErrors.length > 0 ? 'completed_with_errors' : 'completed',
              })
              .eq('id', syncLogId);
          }

          console.log(`[Bayut API] BULK SYNC COMPLETE: ${totalPropertiesSynced} synced, ${totalDuplicatesBlocked} duplicates blocked`);

        } catch (syncError) {
          console.error('[Bayut API] Bulk sync fatal error:', syncError);
          // Update sync log with error
          if (syncLogId) {
            await supabase
              .from('bayut_sync_logs')
              .update({
                completed_at: new Date().toISOString(),
                properties_found: totalPropertiesFound,
                properties_synced: totalPropertiesSynced,
                photos_synced: totalPhotosRehosted,
                api_calls_used: totalApiCalls,
                errors: { 
                  fatal: syncError instanceof Error ? syncError.message : String(syncError),
                  messages: allErrors.slice(0, 50),
                },
                status: 'failed',
              })
              .eq('id', syncLogId);
          }
        }
      };

      // Fire-and-forget: Start the sync in background using EdgeRuntime.waitUntil
      // @ts-ignore - EdgeRuntime is available in Supabase Edge Functions
      EdgeRuntime.waitUntil(runBulkSync());

      // Return immediately with sync ID so UI can poll for progress
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Bulk sync started in background',
          syncLogId,
          estimatedProperties: areas.length * maxPagesPerArea * propertiesPerPage,
          areas: areas.length,
          maxPages: maxPagesPerArea,
          liteMode: lite_mode,
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
// AREA RENTAL BENCHMARKS FOR YIELD CALCULATION
// ===========================================
const AREA_RENTAL_BENCHMARKS: Record<string, { studioRent: number; oneBedRent: number; twoBedRent: number; threeBedRent: number }> = {
  'Dubai Marina': { studioRent: 55000, oneBedRent: 85000, twoBedRent: 130000, threeBedRent: 180000 },
  'Downtown Dubai': { studioRent: 70000, oneBedRent: 110000, twoBedRent: 170000, threeBedRent: 240000 },
  'Palm Jumeirah': { studioRent: 80000, oneBedRent: 130000, twoBedRent: 200000, threeBedRent: 320000 },
  'Business Bay': { studioRent: 50000, oneBedRent: 75000, twoBedRent: 120000, threeBedRent: 170000 },
  'JVC': { studioRent: 35000, oneBedRent: 55000, twoBedRent: 80000, threeBedRent: 110000 },
  'Jumeirah Village Circle': { studioRent: 35000, oneBedRent: 55000, twoBedRent: 80000, threeBedRent: 110000 },
  'Dubai Hills Estate': { studioRent: 55000, oneBedRent: 85000, twoBedRent: 140000, threeBedRent: 200000 },
  'Arabian Ranches': { studioRent: 0, oneBedRent: 0, twoBedRent: 120000, threeBedRent: 180000 },
  'DIFC': { studioRent: 80000, oneBedRent: 120000, twoBedRent: 180000, threeBedRent: 250000 },
  'Jumeirah Beach Residence': { studioRent: 60000, oneBedRent: 90000, twoBedRent: 140000, threeBedRent: 200000 },
  'JBR': { studioRent: 60000, oneBedRent: 90000, twoBedRent: 140000, threeBedRent: 200000 },
  'Jumeirah Lake Towers': { studioRent: 45000, oneBedRent: 70000, twoBedRent: 100000, threeBedRent: 140000 },
  'JLT': { studioRent: 45000, oneBedRent: 70000, twoBedRent: 100000, threeBedRent: 140000 },
  'Dubai Creek Harbour': { studioRent: 55000, oneBedRent: 85000, twoBedRent: 130000, threeBedRent: 180000 },
  'MBR City': { studioRent: 50000, oneBedRent: 80000, twoBedRent: 120000, threeBedRent: 170000 },
  'Mohammed Bin Rashid City': { studioRent: 50000, oneBedRent: 80000, twoBedRent: 120000, threeBedRent: 170000 },
  'Emaar Beachfront': { studioRent: 65000, oneBedRent: 100000, twoBedRent: 160000, threeBedRent: 220000 },
  'Dubai Silicon Oasis': { studioRent: 30000, oneBedRent: 45000, twoBedRent: 65000, threeBedRent: 90000 },
  'Motor City': { studioRent: 35000, oneBedRent: 50000, twoBedRent: 75000, threeBedRent: 100000 },
  'Dubai Sports City': { studioRent: 32000, oneBedRent: 48000, twoBedRent: 70000, threeBedRent: 95000 },
  'Damac Hills': { studioRent: 40000, oneBedRent: 60000, twoBedRent: 90000, threeBedRent: 130000 },
  'Al Barsha': { studioRent: 40000, oneBedRent: 60000, twoBedRent: 85000, threeBedRent: 120000 },
  'Meydan City': { studioRent: 45000, oneBedRent: 70000, twoBedRent: 100000, threeBedRent: 140000 },
};

// Calculate rental yield based on area benchmarks
function calculateRentalYield(price: number, bedrooms: number, area: string): number {
  if (!price || price <= 0) return 0;
  
  // Find benchmark for the area (try exact match first, then partial)
  let benchmark = AREA_RENTAL_BENCHMARKS[area];
  if (!benchmark) {
    // Try partial matching
    for (const [benchmarkArea, data] of Object.entries(AREA_RENTAL_BENCHMARKS)) {
      if (area.toLowerCase().includes(benchmarkArea.toLowerCase()) || 
          benchmarkArea.toLowerCase().includes(area.toLowerCase())) {
        benchmark = data;
        break;
      }
    }
  }
  
  // Default benchmark if area not found
  if (!benchmark) {
    benchmark = { studioRent: 45000, oneBedRent: 65000, twoBedRent: 95000, threeBedRent: 130000 };
  }
  
  // Calculate annual rent based on bedrooms
  let annualRent: number;
  if (bedrooms === 0) {
    annualRent = benchmark.studioRent;
  } else if (bedrooms === 1) {
    annualRent = benchmark.oneBedRent;
  } else if (bedrooms === 2) {
    annualRent = benchmark.twoBedRent;
  } else if (bedrooms === 3) {
    annualRent = benchmark.threeBedRent;
  } else {
    // For 4+ bedrooms, scale up from 3BR
    annualRent = benchmark.threeBedRent * (1 + (bedrooms - 3) * 0.3);
  }
  
  // Calculate yield percentage
  const yieldPercent = (annualRent / price) * 100;
  
  // Return rounded to 2 decimal places, capped at reasonable range
  return Math.min(15, Math.max(0, Number(yieldPercent.toFixed(2))));
}

// Detect completion status from multiple API fields
function detectCompletionStatus(prop: any): 'ready' | 'off_plan' | 'under_construction' {
  // Check direct completion_status field
  const completionStatus = (prop.completion_status || '').toLowerCase();
  if (completionStatus === 'off_plan' || completionStatus === 'offplan') {
    return 'off_plan';
  }
  if (completionStatus === 'under_construction') {
    return 'under_construction';
  }
  
  // Check is_completed boolean
  if (prop.is_completed === false) {
    return 'off_plan';
  }
  
  // Check isOffPlan boolean
  if (prop.isOffPlan === true || prop.is_off_plan === true) {
    return 'off_plan';
  }
  
  // Check completionDate - if in future, it's off-plan
  const completionDate = prop.completionDate || prop.completion_date || prop.handover_date;
  if (completionDate) {
    try {
      const date = new Date(completionDate);
      if (date > new Date()) {
        return 'off_plan';
      }
    } catch (e) {
      // Ignore date parsing errors
    }
  }
  
  // Check title keywords
  const title = (prop.title || '').toLowerCase();
  if (title.includes('off plan') || title.includes('offplan') || 
      title.includes('off-plan') || title.includes('handover') ||
      title.includes('under construction') || title.includes('launching')) {
    return 'off_plan';
  }
  
  // Check for payment plan mentions (typical for off-plan)
  const description = (prop.description || '').toLowerCase();
  if (description.includes('payment plan') || description.includes('post handover')) {
    return 'off_plan';
  }
  
  // Default to ready
  return 'ready';
}

// Parse estimated completion date
function parseCompletionDate(prop: any): Date | null {
  const dateStr = prop.completionDate || prop.completion_date || prop.handover_date || prop.expected_completion;
  if (!dateStr) return null;
  
  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date;
    }
  } catch (e) {
    // Ignore parsing errors
  }
  
  // Try parsing year-only formats like "Q4 2025" or "2026"
  const yearMatch = String(dateStr).match(/20\d{2}/);
  if (yearMatch) {
    return new Date(`${yearMatch[0]}-06-01`); // Default to mid-year
  }
  
  return null;
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

  // Parse bedrooms - ENHANCED PRIORITY ORDER with more field variations
  let bedrooms = 0;
  
  // Try details.bedrooms first (NEW API format)
  if (prop.details?.bedrooms !== undefined && prop.details.bedrooms !== null) {
    bedrooms = parseInt(prop.details.bedrooms, 10) || 0;
  }
  // Try rooms_count (API variation)
  else if (prop.rooms_count !== undefined && prop.rooms_count !== null) {
    bedrooms = parseInt(prop.rooms_count, 10) || 0;
  }
  // Try beds (API variation)
  else if (prop.beds !== undefined && prop.beds !== null) {
    bedrooms = parseInt(prop.beds, 10) || 0;
  }
  // Then direct bedrooms field
  else if (prop.bedrooms !== undefined && prop.bedrooms !== null) {
    bedrooms = parseInt(prop.bedrooms, 10) || 0;
  }
  // Try rooms_en (API variation - string like "3 Bedroom")
  else if (prop.rooms_en) {
    const roomsMatch = prop.rooms_en.match(/(\d+)\s*(?:bed|bedroom)/i);
    if (roomsMatch) {
      bedrooms = parseInt(roomsMatch[1], 10) || 0;
    } else if (prop.rooms_en.toLowerCase().includes('studio')) {
      bedrooms = 0;
    }
  }
  // Then rooms field (legacy)
  else if (prop.rooms !== undefined && prop.rooms !== null) {
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
  
  // Extract bathrooms - ENHANCED with more field variations
  let bathrooms = 0;
  
  // Try details.bathrooms first (NEW API format)
  if (prop.details?.bathrooms !== undefined && prop.details.bathrooms !== null) {
    bathrooms = parseInt(prop.details.bathrooms, 10) || 0;
  }
  // Try baths_count (API variation)
  else if (prop.baths_count !== undefined && prop.baths_count !== null) {
    bathrooms = parseInt(prop.baths_count, 10) || 0;
  }
  // Try bathroom_count (API variation)
  else if (prop.bathroom_count !== undefined && prop.bathroom_count !== null) {
    bathrooms = parseInt(prop.bathroom_count, 10) || 0;
  }
  // Try bath (API variation)
  else if (prop.bath !== undefined && prop.bath !== null) {
    bathrooms = parseInt(prop.bath, 10) || 0;
  }
  // Then baths field
  else if (prop.baths !== undefined && prop.baths !== null) {
    bathrooms = parseInt(prop.baths, 10) || 0;
  }
  // Then bathrooms field
  else if (prop.bathrooms !== undefined && prop.bathrooms !== null) {
    bathrooms = parseInt(prop.bathrooms, 10) || 0;
  }
  
  // VALIDATION: Cross-check bathrooms from title if we got 0
  if (bathrooms === 0) {
    const bathMatch = title.match(/(\d+)\s*(?:bath|bathroom)/i);
    if (bathMatch) {
      const titleBaths = parseInt(bathMatch[1], 10);
      if (!isNaN(titleBaths) && titleBaths > 0) {
        console.log(`[Bayut API] Correcting bathrooms from 0 to ${titleBaths} based on title: "${title}"`);
        bathrooms = titleBaths;
      }
    }
  }
  
  // VALIDATION: If bedrooms > 0 but bathrooms = 0, estimate minimum bathrooms
  if (bedrooms > 0 && bathrooms === 0) {
    // Reasonable estimate: at least 1 bathroom per 2 bedrooms, minimum 1
    const estimatedBaths = Math.max(1, Math.ceil(bedrooms / 2));
    console.log(`[Bayut API] Estimating ${estimatedBaths} bathrooms for ${bedrooms} bedroom property: ${externalId}`);
    bathrooms = estimatedBaths;
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

  // Get price
  const price = Math.max(0, prop.price || 0);
  
  // CALCULATE RENTAL YIELD - NEW!
  const rentalYieldEstimate = calculateRentalYield(price, bedrooms, locationArea);
  
  // DETECT COMPLETION STATUS - IMPROVED!
  const completionStatus = detectCompletionStatus(prop);
  const isOffPlan = completionStatus !== 'ready';
  
  // Parse completion date for off-plan properties
  const estimatedCompletionDate = isOffPlan ? parseCompletionDate(prop) : null;

  return {
    external_id: externalId,
    external_source: 'bayut',
    external_url: prop.url || `https://www.bayut.com/property/details-${externalId}.html`,
    title,
    description: prop.description || null,
    price_aed: price,
    size_sqft: sizeSqft,
    bedrooms: bedrooms,
    bathrooms: bathrooms,
    property_type: propertyType,
    listing_type: prop.purpose === 'for-rent' ? 'rent' : 'sale',
    location_area: locationArea,
    latitude,
    longitude,
    is_off_plan: isOffPlan,
    completion_status: completionStatus, // NEW FIELD
    estimated_completion_date: estimatedCompletionDate?.toISOString().split('T')[0] || null, // NEW FIELD
    rental_yield_estimate: rentalYieldEstimate, // NOW CALCULATED
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

// Extract photo URLs - handles ALL Bayut API structures (search API, detail API, legacy formats)
function extractPhotoUrls(prop: any): string[] {
  const urls: string[] = [];
  
  // Priority 1: media.cover_photo (always first)
  if (prop.media?.cover_photo) {
    urls.push(prop.media.cover_photo);
  }
  
  // Priority 2: media.photos array (detail API returns this)
  if (prop.media?.photos && Array.isArray(prop.media.photos)) {
    for (const photo of prop.media.photos) {
      const url = typeof photo === 'string' ? photo : photo?.url;
      if (url && !urls.includes(url)) {
        urls.push(url);
      }
    }
  }
  
  // Priority 3: photos array at root level (some API responses)
  if (prop.photos && Array.isArray(prop.photos)) {
    for (const photo of prop.photos) {
      const url = typeof photo === 'string' ? photo : photo?.url;
      if (url && !urls.includes(url)) {
        urls.push(url);
      }
    }
  }
  
  // Priority 4: Legacy formats (coverPhoto object, photo_urls)
  if (urls.length === 0) {
    if (prop.coverPhoto?.url) urls.push(prop.coverPhoto.url);
    if (prop.cover_photo_url) urls.push(prop.cover_photo_url);
    if (prop.photo_urls && Array.isArray(prop.photo_urls)) {
      for (const url of prop.photo_urls) {
        if (url && !urls.includes(url)) urls.push(url);
      }
    }
  }
  
  // Priority 5: gallery field (alternative structure)
  if (prop.gallery && Array.isArray(prop.gallery)) {
    for (const img of prop.gallery) {
      const url = typeof img === 'string' ? img : img?.url || img?.image;
      if (url && !urls.includes(url)) {
        urls.push(url);
      }
    }
  }
  
  // Priority 6: images field (alternative structure)
  if (prop.images && Array.isArray(prop.images)) {
    for (const img of prop.images) {
      const url = typeof img === 'string' ? img : img?.url || img?.image_url;
      if (url && !urls.includes(url)) {
        urls.push(url);
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
