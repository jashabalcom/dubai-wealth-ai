import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const photoName = url.searchParams.get('photoName');
    const maxWidth = url.searchParams.get('maxWidth') || '400';
    const maxHeight = url.searchParams.get('maxHeight') || '300';

    if (!photoName) {
      return new Response(
        JSON.stringify({ error: 'photoName parameter is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const GOOGLE_PLACES_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY');
    if (!GOOGLE_PLACES_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Google Places API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch the photo from Google Places API
    const photoUrl = `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=${maxHeight}&maxWidthPx=${maxWidth}&key=${GOOGLE_PLACES_API_KEY}`;
    
    console.log(`Fetching photo: ${photoName}`);

    const response = await fetch(photoUrl, {
      headers: {
        'Accept': 'image/*',
      },
    });

    if (!response.ok) {
      console.error(`Google Places Photo API error: ${response.status}`);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch photo' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the image data
    const imageData = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Return the image with caching headers
    return new Response(imageData, {
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      },
    });

  } catch (error) {
    console.error('Photo proxy error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
