import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StaleDataItem {
  id: string;
  data_key: string;
  display_name: string;
  data_category: string;
  expires_at: string | null;
  verified_at: string | null;
  confidence_level: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[check-data-freshness] Starting data freshness check...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date();
    const warningThreshold = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    // Find expired data (past expiration date)
    const { data: expiredData, error: expiredError } = await supabase
      .from('dubai_data_registry')
      .select('id, data_key, display_name, data_category, expires_at, verified_at, confidence_level')
      .eq('is_active', true)
      .lt('expires_at', now.toISOString());

    if (expiredError) {
      console.error('[check-data-freshness] Error fetching expired data:', expiredError);
      throw expiredError;
    }

    // Find data expiring soon (within 7 days)
    const { data: expiringSoon, error: expiringError } = await supabase
      .from('dubai_data_registry')
      .select('id, data_key, display_name, data_category, expires_at, verified_at, confidence_level')
      .eq('is_active', true)
      .gte('expires_at', now.toISOString())
      .lte('expires_at', warningThreshold.toISOString());

    if (expiringError) {
      console.error('[check-data-freshness] Error fetching expiring data:', expiringError);
      throw expiringError;
    }

    // Find data that hasn't been verified in over 90 days
    const staleVerificationThreshold = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const { data: staleData, error: staleError } = await supabase
      .from('dubai_data_registry')
      .select('id, data_key, display_name, data_category, expires_at, verified_at, confidence_level')
      .eq('is_active', true)
      .lt('verified_at', staleVerificationThreshold.toISOString());

    if (staleError) {
      console.error('[check-data-freshness] Error fetching stale data:', staleError);
      throw staleError;
    }

    // Mark expired data as stale by updating confidence level
    if (expiredData && expiredData.length > 0) {
      console.log(`[check-data-freshness] Found ${expiredData.length} expired data entries`);
      
      for (const item of expiredData) {
        const { error: updateError } = await supabase
          .from('dubai_data_registry')
          .update({ 
            confidence_level: 'unverified',
            updated_at: now.toISOString()
          })
          .eq('id', item.id);

        if (updateError) {
          console.error(`[check-data-freshness] Error updating item ${item.id}:`, updateError);
        } else {
          console.log(`[check-data-freshness] Marked ${item.data_key} as unverified`);
        }
      }
    }

    // Similarly check area_market_data
    const { data: expiredAreaData, error: areaError } = await supabase
      .from('area_market_data')
      .select('id, area_name, expires_at, verified_at, confidence_level')
      .eq('is_active', true)
      .lt('expires_at', now.toISOString());

    if (!areaError && expiredAreaData && expiredAreaData.length > 0) {
      console.log(`[check-data-freshness] Found ${expiredAreaData.length} expired area data entries`);
      
      for (const item of expiredAreaData) {
        const { error: updateError } = await supabase
          .from('area_market_data')
          .update({ 
            confidence_level: 'unverified',
            updated_at: now.toISOString()
          })
          .eq('id', item.id);

        if (updateError) {
          console.error(`[check-data-freshness] Error updating area ${item.id}:`, updateError);
        }
      }
    }

    const summary = {
      checkedAt: now.toISOString(),
      expiredCount: expiredData?.length || 0,
      expiringSoonCount: expiringSoon?.length || 0,
      staleVerificationCount: staleData?.length || 0,
      expiredAreaDataCount: expiredAreaData?.length || 0,
      expiredItems: expiredData?.map((d: StaleDataItem) => ({
        key: d.data_key,
        name: d.display_name,
        category: d.data_category,
        expiredAt: d.expires_at
      })) || [],
      expiringSoonItems: expiringSoon?.map((d: StaleDataItem) => ({
        key: d.data_key,
        name: d.display_name,
        category: d.data_category,
        expiresAt: d.expires_at
      })) || []
    };

    console.log('[check-data-freshness] Summary:', JSON.stringify(summary, null, 2));

    // Log activity for admin dashboard
    if (summary.expiredCount > 0 || summary.expiringSoonCount > 0) {
      await supabase.from('admin_activity_log').insert({
        activity_type: 'data_freshness_check',
        title: 'Data Freshness Alert',
        description: `Found ${summary.expiredCount} expired and ${summary.expiringSoonCount} expiring data entries`,
        metadata: summary
      });
    }

    return new Response(JSON.stringify({
      success: true,
      ...summary
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('[check-data-freshness] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
