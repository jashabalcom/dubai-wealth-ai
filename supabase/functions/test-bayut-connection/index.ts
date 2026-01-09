import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const API_HOST = 'uae-real-estate2.p.rapidapi.com';
const API_BASE = `https://${API_HOST}`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const rapidApiKeyRaw = Deno.env.get('RAPIDAPI_KEY');
  const rapidApiKey = rapidApiKeyRaw?.trim();

  // Check if key exists
  if (!rapidApiKey) {
    console.error('[Test Bayut] RAPIDAPI_KEY not configured');
    return new Response(
      JSON.stringify({
        success: false,
        error: 'RAPIDAPI_KEY not configured',
        diagnosis: {
          keyExists: false,
          keyLength: 0,
          apiHost: API_HOST,
          recommendation: 'Please add your RapidAPI key in Settings > Secrets'
        }
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  console.log(`[Test Bayut] Testing connection with key length: ${rapidApiKey.length}`);

  try {
    // Test 1: Basic location search (cheapest API call)
    const testUrl = `${API_BASE}/locations_search?query=dubai`;
    console.log(`[Test Bayut] GET ${testUrl}`);
    
    const startTime = Date.now();
    const testResponse = await fetch(testUrl, {
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': API_HOST,
      },
    });
    const responseTime = Date.now() - startTime;

    const responseText = await testResponse.text();
    console.log(`[Test Bayut] Response status: ${testResponse.status}, time: ${responseTime}ms`);

    if (!testResponse.ok) {
      console.error(`[Test Bayut] API Error: ${testResponse.status} - ${responseText}`);
      
      // Diagnose the error
      let diagnosis = '';
      let recommendation = '';
      
      if (testResponse.status === 401) {
        diagnosis = 'Invalid or expired API key';
        recommendation = 'Please update your RapidAPI key. Go to rapidapi.com, subscribe to "UAE Real Estate 2" API, and copy your new key.';
      } else if (testResponse.status === 403) {
        diagnosis = 'API access forbidden - subscription may have expired or quota exceeded';
        recommendation = 'Check your RapidAPI subscription status and quota limits for the UAE Real Estate 2 API.';
      } else if (testResponse.status === 429) {
        diagnosis = 'Rate limit exceeded';
        recommendation = 'You have exceeded the API rate limit. Wait a few minutes or upgrade your RapidAPI plan.';
      } else if (testResponse.status === 500 || testResponse.status === 502 || testResponse.status === 503) {
        diagnosis = 'RapidAPI server error';
        recommendation = 'The RapidAPI server is experiencing issues. Try again in a few minutes.';
      } else {
        diagnosis = `HTTP ${testResponse.status} error`;
        recommendation = 'Check the RapidAPI dashboard for more details.';
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: `API Error: ${testResponse.status}`,
          diagnosis: {
            keyExists: true,
            keyLength: rapidApiKey.length,
            keyPrefix: rapidApiKey.substring(0, 8) + '...',
            apiHost: API_HOST,
            httpStatus: testResponse.status,
            responseBody: responseText.substring(0, 500),
            issue: diagnosis,
            recommendation,
            responseTime,
          }
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse successful response
    let testData;
    try {
      testData = JSON.parse(responseText);
    } catch (e) {
      console.error('[Test Bayut] Failed to parse response:', e);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid JSON response from API',
          diagnosis: {
            keyExists: true,
            responseBody: responseText.substring(0, 500),
          }
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const locationsFound = testData.results?.length || 0;
    console.log(`[Test Bayut] Success! Found ${locationsFound} locations`);

    // Test 2: Quick property search to verify full access
    let propertyTestResult = null;
    try {
      const propertyUrl = `${API_BASE}/properties_search?page=0&hitsPerPage=1`;
      const propertyResponse = await fetch(propertyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': API_HOST,
        },
        body: JSON.stringify({
          purpose: 'for-sale',
          locations_ids: [36], // Dubai Marina
          index: 'latest',
        }),
      });

      if (propertyResponse.ok) {
        const propertyData = await propertyResponse.json();
        propertyTestResult = {
          success: true,
          propertiesAvailable: propertyData.nbHits || propertyData.count || 0,
          sampleProperty: propertyData.results?.[0]?.title || null,
        };
      } else {
        const propertyError = await propertyResponse.text();
        propertyTestResult = {
          success: false,
          error: `${propertyResponse.status}: ${propertyError.substring(0, 200)}`,
        };
      }
    } catch (e) {
      propertyTestResult = {
        success: false,
        error: e instanceof Error ? e.message : String(e),
      };
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'API connection successful',
        apiVersion: 'uae-real-estate2',
        tests: {
          locationSearch: {
            success: true,
            locationsFound,
            responseTime,
          },
          propertySearch: propertyTestResult,
        },
        diagnosis: {
          keyExists: true,
          keyLength: rapidApiKey.length,
          keyPrefix: rapidApiKey.substring(0, 8) + '...',
          apiHost: API_HOST,
          allTestsPassed: propertyTestResult?.success === true,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Test Bayut] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Connection failed',
        details: error instanceof Error ? error.message : String(error),
        diagnosis: {
          keyExists: true,
          keyLength: rapidApiKey.length,
          recommendation: 'Check network connectivity and RapidAPI status.',
        }
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
