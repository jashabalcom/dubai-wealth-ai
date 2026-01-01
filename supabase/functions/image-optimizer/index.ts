import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ImageParams {
  url: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const imageUrl = url.searchParams.get('url');
    const width = parseInt(url.searchParams.get('width') || '0') || undefined;
    const height = parseInt(url.searchParams.get('height') || '0') || undefined;
    const quality = parseInt(url.searchParams.get('quality') || '80');
    const format = (url.searchParams.get('format') as ImageParams['format']) || 'webp';

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'Image URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check Accept header for format preference
    const acceptHeader = req.headers.get('Accept') || '';
    let outputFormat = format;
    if (acceptHeader.includes('image/avif') && format === 'webp') {
      outputFormat = 'avif';
    }

    // For Supabase Storage URLs, use built-in transforms
    if (imageUrl.includes('supabase.co/storage')) {
      const transformUrl = new URL(imageUrl);
      const pathParts = transformUrl.pathname.split('/');
      const objectIndex = pathParts.indexOf('object');
      
      if (objectIndex !== -1) {
        // Convert to render endpoint with transforms
        pathParts[objectIndex] = 'render/image';
        transformUrl.pathname = pathParts.join('/');
        
        // Add transform params
        if (width) transformUrl.searchParams.set('width', width.toString());
        if (height) transformUrl.searchParams.set('height', height.toString());
        transformUrl.searchParams.set('quality', quality.toString());
        transformUrl.searchParams.set('format', outputFormat);
        
        // Redirect to transformed image
        return new Response(null, {
          status: 302,
          headers: {
            ...corsHeaders,
            'Location': transformUrl.toString(),
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        });
      }
    }

    // For external images, fetch and return with caching headers
    const imageResponse = await fetch(imageUrl);
    
    if (!imageResponse.ok) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch image' }),
        { status: imageResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const imageBlob = await imageResponse.blob();
    const contentType = outputFormat === 'avif' ? 'image/avif' : 
                        outputFormat === 'webp' ? 'image/webp' :
                        outputFormat === 'png' ? 'image/png' : 'image/jpeg';

    return new Response(imageBlob, {
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Vary': 'Accept',
      },
    });
  } catch (error) {
    console.error('Image optimization error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to optimize image' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
