import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getSecurityHeaders } from "../_shared/security.ts";
import { 
  checkRateLimit, 
  getIpRateLimitKey, 
  getClientIp, 
  rateLimitResponse 
} from "../_shared/rate-limit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  console.log(`[TRACK-AFFILIATE-CLICK] ${step}`, details ? JSON.stringify(details) : '');
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Rate limiting: 100 requests per minute per IP (prevent click fraud)
    const clientIp = getClientIp(req);
    const rateLimitKey = getIpRateLimitKey("track-affiliate-click", clientIp);
    const rateLimit = await checkRateLimit(rateLimitKey, 100, 60);

    if (!rateLimit.allowed) {
      logStep("Rate limit exceeded", { ip: clientIp });
      return rateLimitResponse(rateLimit.resetAt, corsHeaders);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { referral_code, landing_page, referrer_url, user_agent, fingerprint } = await req.json();

    if (!referral_code) {
      return new Response(JSON.stringify({ error: "No referral code provided" }), {
        headers: { ...corsHeaders, ...getSecurityHeaders(), "Content-Type": "application/json" },
        status: 400,
      });
    }

    logStep("Looking up affiliate", { referral_code });

    // Find affiliate by referral code
    const { data: affiliate, error: affiliateError } = await supabase
      .from('affiliates')
      .select('id, status')
      .eq('referral_code', referral_code.toUpperCase())
      .eq('status', 'approved')
      .maybeSingle();

    if (affiliateError) {
      logStep("Error finding affiliate", affiliateError);
      throw affiliateError;
    }

    if (!affiliate) {
      logStep("Affiliate not found or not approved", { referral_code });
      return new Response(JSON.stringify({ error: "Invalid referral code" }), {
        headers: { ...corsHeaders, ...getSecurityHeaders(), "Content-Type": "application/json" },
        status: 404,
      });
    }

    logStep("Found affiliate", { affiliate_id: affiliate.id });

    // Get IP from headers (Cloudflare/proxy aware)
    const ip = req.headers.get('cf-connecting-ip') || 
               req.headers.get('x-forwarded-for')?.split(',')[0] || 
               req.headers.get('x-real-ip') ||
               'unknown';

    // Create a hash of the IP for privacy
    const encoder = new TextEncoder();
    const data = encoder.encode(ip + Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const ipHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32);

    // Check for duplicate clicks from same fingerprint in last 24 hours (fraud prevention)
    const { data: recentClicks } = await supabase
      .from('affiliate_clicks')
      .select('id')
      .eq('affiliate_id', affiliate.id)
      .eq('ip_hash', ipHash)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .limit(1);

    if (recentClicks && recentClicks.length > 0) {
      logStep("Duplicate click detected, skipping", { ip_hash: ipHash });
      return new Response(JSON.stringify({ success: true, duplicate: true }), {
        headers: { ...corsHeaders, ...getSecurityHeaders(), "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Record the click
    const { error: clickError } = await supabase
      .from('affiliate_clicks')
      .insert({
        affiliate_id: affiliate.id,
        ip_hash: ipHash,
        user_agent: user_agent?.substring(0, 500),
        referrer_url: referrer_url?.substring(0, 1000),
        landing_page: landing_page?.substring(0, 1000),
        country_code: req.headers.get('cf-ipcountry') || null
      });

    if (clickError) {
      logStep("Error recording click", clickError);
      throw clickError;
    }

    logStep("Click recorded successfully");

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, ...getSecurityHeaders(), "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, ...getSecurityHeaders(), "Content-Type": "application/json" },
      status: 500,
    });
  }
});
