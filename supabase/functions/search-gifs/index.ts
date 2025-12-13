import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TENOR_API_KEY = Deno.env.get("TENOR_API_KEY");
    if (!TENOR_API_KEY) {
      throw new Error("TENOR_API_KEY not configured");
    }

    const { query, limit = 20 } = await req.json();

    // Use Tenor API v2
    const endpoint = query && query !== 'trending'
      ? 'search'
      : 'featured';

    const params = new URLSearchParams({
      key: TENOR_API_KEY,
      client_key: 'dubai_wealth_hub',
      limit: String(limit),
      media_filter: 'gif,tinygif',
    });

    if (query && query !== 'trending') {
      params.append('q', query);
    }

    const response = await fetch(
      `https://tenor.googleapis.com/v2/${endpoint}?${params.toString()}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Tenor API error:', errorText);
      throw new Error(`Tenor API error: ${response.status}`);
    }

    const data = await response.json();

    return new Response(
      JSON.stringify({ results: data.results || [] }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Error fetching GIFs:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage, results: [] }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});