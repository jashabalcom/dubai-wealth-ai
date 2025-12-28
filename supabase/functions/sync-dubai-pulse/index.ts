import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/*
 * Dubai Pulse API Integration - Real Estate Transaction Sync
 * 
 * This function syncs real estate transaction data from Dubai Pulse (dubaipulse.gov.ae)
 * 
 * Dubai Pulse Open Data API provides:
 * - Real estate transactions (sales, mortgages, gifts)
 * - Property details (type, area, size, price)
 * - Location information (area, building, project)
 * - Historical transaction data
 * 
 * Required secrets:
 * - DUBAI_PULSE_CLIENT_ID (OAuth2 client ID)
 * - DUBAI_PULSE_CLIENT_SECRET (OAuth2 client secret)
 * 
 * API Documentation: https://www.dubaipulse.gov.ae/
 */

// ============= Type Definitions =============

interface DubaiPulseAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface DubaiPulseTransaction {
  transaction_id?: string;
  TRANSACTION_ID?: string;
  instance_date?: string;
  INSTANCE_DATE?: string;
  trans_group?: string;
  TRANS_GROUP?: string;
  property_type?: string;
  PROPERTY_TYPE?: string;
  property_sub_type?: string;
  PROPERTY_SUB_TYPE?: string;
  property_usage?: string;
  PROPERTY_USAGE?: string;
  area_name?: string;
  AREA_EN?: string;
  building_name?: string;
  BUILDING_NAME_EN?: string;
  project_name?: string;
  PROJECT_EN?: string;
  developer_name?: string;
  MASTER_PROJECT_EN?: string;
  rooms?: string;
  ROOMS_EN?: string;
  has_parking?: boolean | string;
  HAS_PARKING?: string;
  procedure_area?: number;
  PROCEDURE_AREA?: number;
  actual_worth?: number;
  ACTUAL_WORTH?: number;
  meter_sale_price?: number;
  METER_SALE_PRICE?: number;
  reg_type?: string;
  REG_TYPE_EN?: string;
  nearest_metro?: string;
  NEAREST_METRO_EN?: string;
  nearest_mall?: string;
  NEAREST_MALL_EN?: string;
}

interface DubaiPulseApiResponse {
  result?: {
    records?: DubaiPulseTransaction[];
    total?: number;
    _links?: {
      next?: string;
    };
  };
  data?: DubaiPulseTransaction[];
  results?: DubaiPulseTransaction[];
  total?: number;
  next?: string | null;
  count?: number;
}

interface SyncOptions {
  syncType?: 'full' | 'incremental';
  dateFrom?: string;
  dateTo?: string;
  areaFilter?: string;
  limit?: number;
}

interface SyncResult {
  success: boolean;
  transactionsSynced: number;
  areasUpdated: number;
  errors: string[];
  duration: number;
}

// ============= Configuration =============

// Dubai Pulse API endpoints - adjust based on actual API documentation
const DUBAI_PULSE_CONFIG = {
  // OAuth2 token endpoint
  authUrl: 'https://api.dubaipulse.gov.ae/oauth/token',
  // Alternative auth endpoints to try
  altAuthUrls: [
    'https://api.dubaipulse.gov.ae/auth/token',
    'https://gateway.dubaipulse.gov.ae/oauth2/token',
  ],
  // Real estate transactions endpoint
  transactionsUrl: 'https://api.dubaipulse.gov.ae/datasource/dld-transactions/dld_transactions/view',
  // Alternative data endpoints
  altDataUrls: [
    'https://gateway.dubaipulse.gov.ae/dld/v1/transactions',
    'https://api.dubaipulse.gov.ae/v1/real-estate/transactions',
  ],
  // Pagination settings
  pageSize: 1000,
  maxPages: 100, // Safety limit
  // Rate limiting
  requestDelay: 100, // ms between requests
};

// ============= OAuth2 Authentication =============

async function getAccessToken(clientId: string, clientSecret: string): Promise<string> {
  console.log('Authenticating with Dubai Pulse OAuth2...');
  
  const authUrls = [DUBAI_PULSE_CONFIG.authUrl, ...DUBAI_PULSE_CONFIG.altAuthUrls];
  let lastError: Error | null = null;

  for (const authUrl of authUrls) {
    try {
      console.log(`Trying auth URL: ${authUrl}`);
      
      // Try client_credentials grant
      const response = await fetch(authUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: clientSecret,
        }),
      });

      if (!response.ok) {
        // Try with Basic Auth header instead
        const basicAuth = btoa(`${clientId}:${clientSecret}`);
        const altResponse = await fetch(authUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${basicAuth}`,
            'Accept': 'application/json',
          },
          body: new URLSearchParams({
            grant_type: 'client_credentials',
          }),
        });

        if (!altResponse.ok) {
          const errorText = await response.text();
          console.log(`Auth failed at ${authUrl}: ${response.status} - ${errorText}`);
          continue;
        }

        const authData: DubaiPulseAuthResponse = await altResponse.json();
        console.log('Authentication successful (Basic Auth)');
        return authData.access_token;
      }

      const authData: DubaiPulseAuthResponse = await response.json();
      console.log('Authentication successful');
      return authData.access_token;

    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.log(`Auth error at ${authUrl}: ${lastError.message}`);
    }
  }

  throw new Error(`OAuth2 authentication failed: ${lastError?.message || 'All endpoints failed'}`);
}

// ============= Data Fetching with Pagination =============

async function fetchTransactions(
  accessToken: string,
  options: SyncOptions
): Promise<DubaiPulseTransaction[]> {
  const allTransactions: DubaiPulseTransaction[] = [];
  const errors: string[] = [];
  
  let offset = 0;
  let hasMore = true;
  let pageCount = 0;

  console.log(`Fetching transactions with options: ${JSON.stringify(options)}`);

  while (hasMore && pageCount < DUBAI_PULSE_CONFIG.maxPages) {
    try {
      // Build query parameters
      const params = new URLSearchParams({
        limit: String(options.limit || DUBAI_PULSE_CONFIG.pageSize),
        offset: String(offset),
      });

      // Add date filters if provided
      if (options.dateFrom) {
        params.append('filters', JSON.stringify({
          INSTANCE_DATE: { $gte: options.dateFrom }
        }));
      }
      if (options.dateTo) {
        const existingFilters = params.get('filters');
        if (existingFilters) {
          const filters = JSON.parse(existingFilters);
          filters.INSTANCE_DATE = { ...filters.INSTANCE_DATE, $lte: options.dateTo };
          params.set('filters', JSON.stringify(filters));
        } else {
          params.append('filters', JSON.stringify({
            INSTANCE_DATE: { $lte: options.dateTo }
          }));
        }
      }

      // Add area filter if provided
      if (options.areaFilter) {
        const existingFilters = params.get('filters');
        const filters = existingFilters ? JSON.parse(existingFilters) : {};
        filters.AREA_EN = options.areaFilter;
        params.set('filters', JSON.stringify(filters));
      }

      const url = `${DUBAI_PULSE_CONFIG.transactionsUrl}?${params.toString()}`;
      console.log(`Fetching page ${pageCount + 1}, offset ${offset}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error ${response.status}: ${errorText}`);
      }

      const data: DubaiPulseApiResponse = await response.json();
      
      // Handle different API response formats
      const records = data.result?.records || data.results || data.data || [];
      const total = data.result?.total || data.total || data.count || 0;

      console.log(`Page ${pageCount + 1}: Received ${records.length} records (total: ${total})`);
      
      allTransactions.push(...records);

      // Check if there are more pages
      offset += records.length;
      hasMore = records.length === DUBAI_PULSE_CONFIG.pageSize && offset < total;
      pageCount++;

      // Rate limiting delay
      if (hasMore) {
        await new Promise(resolve => setTimeout(resolve, DUBAI_PULSE_CONFIG.requestDelay));
      }

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      errors.push(`Page ${pageCount + 1}: ${errorMsg}`);
      console.error(`Error fetching page ${pageCount + 1}:`, error);
      
      // Continue with next page on error, but limit consecutive errors
      if (errors.length > 5) {
        console.error('Too many consecutive errors, stopping pagination');
        break;
      }
      
      offset += DUBAI_PULSE_CONFIG.pageSize;
      pageCount++;
    }
  }

  console.log(`Fetched ${allTransactions.length} total transactions across ${pageCount} pages`);
  
  if (errors.length > 0) {
    console.warn(`Encountered ${errors.length} errors during fetch:`, errors);
  }

  return allTransactions;
}

// ============= Data Transformation =============

interface TransformedTransaction {
  transaction_id: string | null;
  instance_date: string;
  trans_group: string;
  property_type: string | null;
  property_sub_type: string | null;
  property_usage: string | null;
  area_name: string;
  building_name: string | null;
  project_name: string | null;
  developer_name: string | null;
  rooms: string | null;
  has_parking: boolean | null;
  procedure_area_sqm: number | null;
  procedure_area_sqft: number | null;
  actual_worth: number | null;
  meter_sale_price: number | null;
  sqft_sale_price: number | null;
  reg_type: string | null;
  nearest_metro: string | null;
  nearest_mall: string | null;
  raw_data: DubaiPulseTransaction;
}

function transformTransaction(raw: DubaiPulseTransaction): TransformedTransaction {
  // Handle both camelCase and UPPER_CASE field names from API
  const transactionId = raw.transaction_id || raw.TRANSACTION_ID || null;
  const instanceDate = raw.instance_date || raw.INSTANCE_DATE || new Date().toISOString().split('T')[0];
  const transGroup = raw.trans_group || raw.TRANS_GROUP || 'Sales';
  const propertyType = raw.property_type || raw.PROPERTY_TYPE || null;
  const propertySub = raw.property_sub_type || raw.PROPERTY_SUB_TYPE || null;
  const propertyUsage = raw.property_usage || raw.PROPERTY_USAGE || null;
  const areaName = raw.area_name || raw.AREA_EN || 'Unknown';
  const buildingName = raw.building_name || raw.BUILDING_NAME_EN || null;
  const projectName = raw.project_name || raw.PROJECT_EN || null;
  const developerName = raw.developer_name || raw.MASTER_PROJECT_EN || null;
  const rooms = raw.rooms || raw.ROOMS_EN || null;
  const regType = raw.reg_type || raw.REG_TYPE_EN || null;
  const nearestMetro = raw.nearest_metro || raw.NEAREST_METRO_EN || null;
  const nearestMall = raw.nearest_mall || raw.NEAREST_MALL_EN || null;

  // Parse has_parking (can be boolean or string)
  let hasParking: boolean | null = null;
  const parkingVal = raw.has_parking ?? raw.HAS_PARKING;
  if (parkingVal !== undefined && parkingVal !== null) {
    if (typeof parkingVal === 'boolean') {
      hasParking = parkingVal;
    } else if (typeof parkingVal === 'string') {
      hasParking = parkingVal.toLowerCase() === 'yes' || parkingVal === '1' || parkingVal.toLowerCase() === 'true';
    }
  }

  // Parse numeric values
  const procedureAreaSqm = parseFloat(String(raw.procedure_area || raw.PROCEDURE_AREA || 0)) || null;
  const procedureAreaSqft = procedureAreaSqm ? procedureAreaSqm * 10.764 : null;
  const actualWorth = parseFloat(String(raw.actual_worth || raw.ACTUAL_WORTH || 0)) || null;
  const meterSalePrice = parseFloat(String(raw.meter_sale_price || raw.METER_SALE_PRICE || 0)) || null;
  
  // Calculate sqft price from meter price (1 sqm = 10.764 sqft)
  const sqftSalePrice = meterSalePrice ? meterSalePrice / 10.764 : null;

  return {
    transaction_id: transactionId,
    instance_date: instanceDate,
    trans_group: transGroup,
    property_type: propertyType,
    property_sub_type: propertySub,
    property_usage: propertyUsage,
    area_name: normalizeAreaName(areaName),
    building_name: buildingName,
    project_name: projectName,
    developer_name: developerName,
    rooms: rooms,
    has_parking: hasParking,
    procedure_area_sqm: procedureAreaSqm,
    procedure_area_sqft: procedureAreaSqft,
    actual_worth: actualWorth,
    meter_sale_price: meterSalePrice,
    sqft_sale_price: sqftSalePrice,
    reg_type: regType,
    nearest_metro: nearestMetro,
    nearest_mall: nearestMall,
    raw_data: raw,
  };
}

// Normalize area names for consistency
function normalizeAreaName(name: string): string {
  if (!name) return 'Unknown';
  
  // Common normalizations
  const normalizations: Record<string, string> = {
    'DUBAI MARINA': 'Dubai Marina',
    'BUSINESS BAY': 'Business Bay',
    'DOWNTOWN DUBAI': 'Downtown Dubai',
    'PALM JUMEIRAH': 'Palm Jumeirah',
    'JUMEIRAH BEACH RESIDENCE': 'JBR',
    'JBR': 'JBR',
    'JUMEIRAH LAKE TOWERS': 'JLT',
    'JLT': 'JLT',
    'DUBAI HILLS ESTATE': 'Dubai Hills Estate',
    'ARABIAN RANCHES': 'Arabian Ranches',
    'DUBAI CREEK HARBOUR': 'Dubai Creek Harbour',
    'CITY WALK': 'City Walk',
    'DUBAI SILICON OASIS': 'Dubai Silicon Oasis',
    'INTERNATIONAL CITY': 'International City',
    'MOTOR CITY': 'Motor City',
    'SPORTS CITY': 'Sports City',
    'DISCOVERY GARDENS': 'Discovery Gardens',
    'AL BARSHA': 'Al Barsha',
    'JUMEIRAH': 'Jumeirah',
    'JUMEIRAH VILLAGE CIRCLE': 'JVC',
    'JVC': 'JVC',
    'JUMEIRAH VILLAGE TRIANGLE': 'JVT',
    'JVT': 'JVT',
    'EMIRATES HILLS': 'Emirates Hills',
    'THE SPRINGS': 'The Springs',
    'THE MEADOWS': 'The Meadows',
    'THE GREENS': 'The Greens',
    'THE VIEWS': 'The Views',
    'MIRDIF': 'Mirdif',
    'AL QUOZ': 'Al Quoz',
    'DEIRA': 'Deira',
    'BUR DUBAI': 'Bur Dubai',
  };

  const upperName = name.toUpperCase().trim();
  
  if (normalizations[upperName]) {
    return normalizations[upperName];
  }

  // Title case for unknown areas
  return name.trim().replace(/\w\S*/g, txt => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

// ============= Database Operations =============

async function upsertTransactions(
  supabase: SupabaseClient,
  transactions: TransformedTransaction[]
): Promise<{ inserted: number; errors: string[] }> {
  const errors: string[] = [];
  let inserted = 0;

  // Batch insert in chunks of 500
  const chunkSize = 500;
  
  for (let i = 0; i < transactions.length; i += chunkSize) {
    const chunk = transactions.slice(i, i + chunkSize);
    
    try {
      const { error, count } = await supabase
        .from('market_transactions')
        .upsert(chunk, { 
          onConflict: 'transaction_id',
          ignoreDuplicates: false,
        });

      if (error) {
        errors.push(`Batch ${Math.floor(i / chunkSize) + 1}: ${error.message}`);
        console.error(`Upsert error for batch ${Math.floor(i / chunkSize) + 1}:`, error);
      } else {
        inserted += chunk.length;
        console.log(`Inserted batch ${Math.floor(i / chunkSize) + 1}: ${chunk.length} records`);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      errors.push(`Batch ${Math.floor(i / chunkSize) + 1}: ${msg}`);
    }
  }

  return { inserted, errors };
}

// ============= Area Statistics Aggregation =============

async function computeAreaStats(supabase: SupabaseClient): Promise<number> {
  console.log('Computing area market statistics...');

  // Get current date info for period calculations
  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 7);
  const lastQuarter = new Date(now.getFullYear(), now.getMonth() - 3, 1).toISOString().slice(0, 7);
  const lastYear = new Date(now.getFullYear() - 1, now.getMonth(), 1).toISOString().slice(0, 7);

  // Get unique areas from transactions
  const { data: areas, error: areasError } = await supabase
    .from('market_transactions')
    .select('area_name')
    .not('area_name', 'is', null);

  if (areasError) {
    console.error('Error fetching areas:', areasError);
    return 0;
  }

  const uniqueAreas = [...new Set(areas?.map(a => a.area_name) || [])];
  console.log(`Computing stats for ${uniqueAreas.length} areas`);

  let areasUpdated = 0;

  for (const areaName of uniqueAreas) {
    try {
      // Get transactions for this area from the last 12 months
      const { data: transactions, error: txError } = await supabase
        .from('market_transactions')
        .select('*')
        .eq('area_name', areaName)
        .gte('instance_date', lastYear)
        .order('instance_date', { ascending: false });

      if (txError || !transactions || transactions.length === 0) {
        continue;
      }

      // Calculate statistics
      const stats = calculateAreaStatistics(transactions, areaName, now);

      // Upsert area stats
      const { error: upsertError } = await supabase
        .from('area_market_stats')
        .upsert({
          area_name: areaName,
          period_type: 'monthly',
          period_start: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0],
          period_end: now.toISOString().split('T')[0],
          ...stats,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'area_name,period_type,period_start',
        });

      if (upsertError) {
        console.error(`Error upserting stats for ${areaName}:`, upsertError);
      } else {
        areasUpdated++;
      }

    } catch (error) {
      console.error(`Error computing stats for ${areaName}:`, error);
    }
  }

  console.log(`Updated statistics for ${areasUpdated} areas`);
  return areasUpdated;
}

interface AreaStats {
  total_transactions: number;
  total_sales_value: number;
  avg_price_sqm: number | null;
  avg_price_sqft: number | null;
  median_price_sqm: number | null;
  min_price_sqm: number | null;
  max_price_sqm: number | null;
  apartment_count: number;
  villa_count: number;
  townhouse_count: number;
  apartment_avg_price: number | null;
  villa_avg_price: number | null;
  townhouse_avg_price: number | null;
  ready_count: number;
  offplan_count: number;
  ready_avg_price: number | null;
  offplan_avg_price: number | null;
  mom_price_change: number | null;
  qoq_price_change: number | null;
  yoy_price_change: number | null;
}

function calculateAreaStatistics(transactions: any[], areaName: string, now: Date): AreaStats {
  // Filter to sales transactions only
  const salesTx = transactions.filter(t => 
    t.trans_group?.toLowerCase().includes('sale') || 
    t.trans_group === 'Sales'
  );

  // Calculate total transactions and sales value
  const totalTransactions = salesTx.length;
  const totalSalesValue = salesTx.reduce((sum, t) => sum + (t.actual_worth || 0), 0);

  // Calculate price per sqm statistics
  const pricesPerSqm = salesTx
    .filter(t => t.meter_sale_price && t.meter_sale_price > 0)
    .map(t => t.meter_sale_price);

  const avgPriceSqm = pricesPerSqm.length > 0 
    ? pricesPerSqm.reduce((a, b) => a + b, 0) / pricesPerSqm.length 
    : null;
  const avgPriceSqft = avgPriceSqm ? avgPriceSqm / 10.764 : null;

  // Median calculation
  let medianPriceSqm: number | null = null;
  if (pricesPerSqm.length > 0) {
    const sorted = [...pricesPerSqm].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    medianPriceSqm = sorted.length % 2 !== 0 
      ? sorted[mid] 
      : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  const minPriceSqm = pricesPerSqm.length > 0 ? Math.min(...pricesPerSqm) : null;
  const maxPriceSqm = pricesPerSqm.length > 0 ? Math.max(...pricesPerSqm) : null;

  // Property type breakdown
  const apartments = salesTx.filter(t => 
    t.property_type?.toLowerCase().includes('apartment') ||
    t.property_type?.toLowerCase().includes('flat')
  );
  const villas = salesTx.filter(t => 
    t.property_type?.toLowerCase().includes('villa')
  );
  const townhouses = salesTx.filter(t => 
    t.property_type?.toLowerCase().includes('townhouse') ||
    t.property_type?.toLowerCase().includes('town house')
  );

  const apartmentAvg = apartments.length > 0
    ? apartments.reduce((s, t) => s + (t.actual_worth || 0), 0) / apartments.length
    : null;
  const villaAvg = villas.length > 0
    ? villas.reduce((s, t) => s + (t.actual_worth || 0), 0) / villas.length
    : null;
  const townhouseAvg = townhouses.length > 0
    ? townhouses.reduce((s, t) => s + (t.actual_worth || 0), 0) / townhouses.length
    : null;

  // Ready vs Off-plan breakdown
  const ready = salesTx.filter(t => 
    t.reg_type?.toLowerCase().includes('ready') ||
    t.reg_type?.toLowerCase().includes('existing')
  );
  const offplan = salesTx.filter(t => 
    t.reg_type?.toLowerCase().includes('off') ||
    t.reg_type?.toLowerCase().includes('pre')
  );

  const readyAvg = ready.length > 0
    ? ready.reduce((s, t) => s + (t.actual_worth || 0), 0) / ready.length
    : null;
  const offplanAvg = offplan.length > 0
    ? offplan.reduce((s, t) => s + (t.actual_worth || 0), 0) / offplan.length
    : null;

  // Calculate period changes
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastQuarterStart = new Date(now.getFullYear(), now.getMonth() - 3, 1);
  const lastYearStart = new Date(now.getFullYear() - 1, now.getMonth(), 1);

  const currentMonthTx = salesTx.filter(t => new Date(t.instance_date) >= currentMonthStart);
  const lastMonthTx = salesTx.filter(t => {
    const d = new Date(t.instance_date);
    return d >= lastMonthStart && d < currentMonthStart;
  });
  const lastQuarterTx = salesTx.filter(t => {
    const d = new Date(t.instance_date);
    return d >= lastQuarterStart && d < lastMonthStart;
  });
  const lastYearTx = salesTx.filter(t => {
    const d = new Date(t.instance_date);
    return d >= lastYearStart && d < new Date(now.getFullYear(), now.getMonth() - 12 + 1, 1);
  });

  const currentAvg = calculateAvgPrice(currentMonthTx);
  const lastMonthAvg = calculateAvgPrice(lastMonthTx);
  const lastQuarterAvg = calculateAvgPrice(lastQuarterTx);
  const lastYearAvg = calculateAvgPrice(lastYearTx);

  const momChange = currentAvg && lastMonthAvg 
    ? ((currentAvg - lastMonthAvg) / lastMonthAvg) * 100 
    : null;
  const qoqChange = currentAvg && lastQuarterAvg 
    ? ((currentAvg - lastQuarterAvg) / lastQuarterAvg) * 100 
    : null;
  const yoyChange = currentAvg && lastYearAvg 
    ? ((currentAvg - lastYearAvg) / lastYearAvg) * 100 
    : null;

  return {
    total_transactions: totalTransactions,
    total_sales_value: totalSalesValue,
    avg_price_sqm: avgPriceSqm,
    avg_price_sqft: avgPriceSqft,
    median_price_sqm: medianPriceSqm,
    min_price_sqm: minPriceSqm,
    max_price_sqm: maxPriceSqm,
    apartment_count: apartments.length,
    villa_count: villas.length,
    townhouse_count: townhouses.length,
    apartment_avg_price: apartmentAvg,
    villa_avg_price: villaAvg,
    townhouse_avg_price: townhouseAvg,
    ready_count: ready.length,
    offplan_count: offplan.length,
    ready_avg_price: readyAvg,
    offplan_avg_price: offplanAvg,
    mom_price_change: momChange,
    qoq_price_change: qoqChange,
    yoy_price_change: yoyChange,
  };
}

function calculateAvgPrice(transactions: any[]): number | null {
  const prices = transactions
    .filter(t => t.meter_sale_price && t.meter_sale_price > 0)
    .map(t => t.meter_sale_price);
  
  return prices.length > 0 
    ? prices.reduce((a, b) => a + b, 0) / prices.length 
    : null;
}

// ============= Main Handler =============

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const errors: string[] = [];

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check for API credentials
    const clientId = Deno.env.get('DUBAI_PULSE_CLIENT_ID');
    const clientSecret = Deno.env.get('DUBAI_PULSE_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      console.log('Dubai Pulse API credentials not configured');
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Dubai Pulse API credentials not configured. Add DUBAI_PULSE_CLIENT_ID and DUBAI_PULSE_CLIENT_SECRET secrets.',
          status: 'pending_credentials',
          requiredSecrets: ['DUBAI_PULSE_CLIENT_ID', 'DUBAI_PULSE_CLIENT_SECRET'],
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Parse request body for sync options
    const options: SyncOptions = await req.json().catch(() => ({}));
    const { syncType = 'incremental', dateFrom, dateTo, areaFilter, limit } = options;

    console.log(`Starting Dubai Pulse sync: type=${syncType}`);
    console.log(`Options: dateFrom=${dateFrom}, dateTo=${dateTo}, area=${areaFilter}`);

    // Set default date range for incremental sync
    let effectiveDateFrom = dateFrom;
    if (syncType === 'incremental' && !dateFrom) {
      // Default to last 7 days for incremental
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      effectiveDateFrom = weekAgo.toISOString().split('T')[0];
    }

    // Step 1: Authenticate
    console.log('Step 1: Authenticating with Dubai Pulse...');
    const accessToken = await getAccessToken(clientId, clientSecret);

    // Step 2: Fetch transactions
    console.log('Step 2: Fetching transactions...');
    const rawTransactions = await fetchTransactions(accessToken, {
      syncType,
      dateFrom: effectiveDateFrom,
      dateTo,
      areaFilter,
      limit,
    });

    if (rawTransactions.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No new transactions found for the specified criteria',
          transactionsSynced: 0,
          areasUpdated: 0,
          duration: Date.now() - startTime,
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Step 3: Transform data
    console.log('Step 3: Transforming data...');
    const transformedTransactions = rawTransactions.map(transformTransaction);

    // Step 4: Upsert to database
    console.log('Step 4: Upserting to database...');
    const { inserted, errors: upsertErrors } = await upsertTransactions(supabase, transformedTransactions);
    errors.push(...upsertErrors);

    // Step 5: Compute aggregated stats
    console.log('Step 5: Computing area statistics...');
    const areasUpdated = await computeAreaStats(supabase);

    // Log sync completion
    const duration = Date.now() - startTime;
    console.log(`Sync completed in ${duration}ms: ${inserted} transactions, ${areasUpdated} areas updated`);

    // Log to bayut_sync_logs for tracking (reusing existing table)
    try {
      await supabase.from('bayut_sync_logs').insert({
        sync_type: `dubai_pulse_${syncType}`,
        status: errors.length > 0 ? 'partial' : 'completed',
        properties_found: rawTransactions.length,
        properties_synced: inserted,
        started_at: new Date(startTime).toISOString(),
        completed_at: new Date().toISOString(),
        errors: errors.length > 0 ? errors : null,
      });
    } catch (logError) {
      console.warn('Failed to log sync:', logError);
    }

    const result: SyncResult = {
      success: true,
      transactionsSynced: inserted,
      areasUpdated,
      errors,
      duration,
    };

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Dubai Pulse sync error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        duration: Date.now() - startTime,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
