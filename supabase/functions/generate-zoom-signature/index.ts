import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// HMAC-SHA256 implementation for Deno
async function createHmacSha256(key: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const messageData = encoder.encode(message);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  const bytes = new Uint8Array(signature);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Generate Zoom Meeting SDK signature
async function generateSignature(
  sdkKey: string,
  sdkSecret: string,
  meetingNumber: string,
  role: number
): Promise<string> {
  const iat = Math.floor(Date.now() / 1000) - 30;
  const exp = iat + 60 * 60 * 2; // 2 hours

  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    sdkKey,
    mn: meetingNumber,
    role,
    iat,
    exp,
    tokenExp: exp,
  };

  const base64Header = btoa(JSON.stringify(header))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  
  const base64Payload = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const message = `${base64Header}.${base64Payload}`;
  const signature = await createHmacSha256(sdkSecret, message);
  
  const base64Signature = signature
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return `${message}.${base64Signature}`;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { meetingNumber, role = 0 } = await req.json();

    if (!meetingNumber) {
      console.error('Missing meetingNumber in request');
      return new Response(
        JSON.stringify({ error: 'Meeting number is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const sdkKey = Deno.env.get('ZOOM_SDK_KEY');
    const sdkSecret = Deno.env.get('ZOOM_SDK_SECRET');

    if (!sdkKey || !sdkSecret) {
      console.error('Zoom SDK credentials not configured');
      return new Response(
        JSON.stringify({ error: 'Zoom SDK not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clean meeting number (remove spaces, dashes)
    const cleanMeetingNumber = meetingNumber.toString().replace(/[\s-]/g, '');
    
    console.log(`Generating signature for meeting: ${cleanMeetingNumber}, role: ${role}`);

    const signature = await generateSignature(
      sdkKey,
      sdkSecret,
      cleanMeetingNumber,
      role
    );

    console.log('Signature generated successfully');

    return new Response(
      JSON.stringify({
        signature,
        sdkKey,
        meetingNumber: cleanMeetingNumber,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating Zoom signature:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate signature' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
