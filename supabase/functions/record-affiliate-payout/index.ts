import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  console.log(`[RECORD-AFFILIATE-PAYOUT] ${step}`, details ? JSON.stringify(details) : '');
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get the authorization header to verify admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Create a client with the user's token to verify their role
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { 
        auth: { persistSession: false },
        global: { headers: { Authorization: authHeader } }
      }
    );

    // Get the current user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Check if user is admin
    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      throw new Error("Admin access required");
    }

    logStep("Admin verified", { user_id: user.id });

    const { affiliate_id, paypal_transaction_id, admin_notes } = await req.json();

    if (!affiliate_id || !paypal_transaction_id) {
      throw new Error("affiliate_id and paypal_transaction_id are required");
    }

    logStep("Processing payout", { affiliate_id, paypal_transaction_id });

    // Get affiliate details
    const { data: affiliate, error: affiliateError } = await supabaseAdmin
      .from('affiliates')
      .select('*')
      .eq('id', affiliate_id)
      .single();

    if (affiliateError || !affiliate) {
      throw new Error("Affiliate not found");
    }

    logStep("Affiliate found", { 
      affiliate_id: affiliate.id, 
      pending_earnings: affiliate.pending_earnings 
    });

    // Get approved (unpaid) commissions for this affiliate
    const { data: approvedCommissions, error: commissionsError } = await supabaseAdmin
      .from('commissions')
      .select('*')
      .eq('affiliate_id', affiliate_id)
      .eq('status', 'approved')
      .is('payout_id', null);

    if (commissionsError) {
      throw new Error("Error fetching commissions");
    }

    if (!approvedCommissions || approvedCommissions.length === 0) {
      throw new Error("No approved commissions found for payout");
    }

    // Calculate total payout amount
    const totalAmount = approvedCommissions.reduce(
      (sum, c) => sum + Number(c.commission_amount),
      0
    );

    logStep("Commissions found", { 
      count: approvedCommissions.length, 
      total_amount: totalAmount 
    });

    // Create payout record
    const { data: payout, error: payoutError } = await supabaseAdmin
      .from('affiliate_payouts')
      .insert({
        affiliate_id,
        amount: totalAmount,
        currency: 'USD',
        commission_count: approvedCommissions.length,
        status: 'completed',
        payout_method: 'paypal',
        paypal_transaction_id,
        admin_notes,
        processed_by: user.id,
        processed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (payoutError || !payout) {
      logStep("Error creating payout record", payoutError);
      throw new Error("Failed to create payout record");
    }

    logStep("Payout record created", { payout_id: payout.id });

    // Mark all commissions as paid
    const commissionIds = approvedCommissions.map(c => c.id);
    const { error: updateCommissionsError } = await supabaseAdmin
      .from('commissions')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        payout_id: payout.id
      })
      .in('id', commissionIds);

    if (updateCommissionsError) {
      logStep("Error updating commissions", updateCommissionsError);
    }

    // Update affiliate pending and total earnings
    const { error: updateAffiliateError } = await supabaseAdmin
      .from('affiliates')
      .update({
        pending_earnings: 0,
        total_earnings: (affiliate.total_earnings || 0) + totalAmount
      })
      .eq('id', affiliate_id);

    if (updateAffiliateError) {
      logStep("Error updating affiliate", updateAffiliateError);
    }

    // Create notification for affiliate
    const { error: notificationError } = await supabaseAdmin
      .from('affiliate_notifications')
      .insert({
        affiliate_id,
        notification_type: 'payout_completed',
        title: 'Payout Sent!',
        message: `$${totalAmount.toFixed(2)} has been sent to your PayPal account.`,
        metadata: {
          payout_id: payout.id,
          amount: totalAmount,
          commission_count: approvedCommissions.length,
          paypal_transaction_id
        },
        delivery_method: 'both'
      });

    if (notificationError) {
      logStep("Error creating notification", notificationError);
    }

    logStep("Payout processing complete", {
      payout_id: payout.id,
      amount: totalAmount,
      commissions_paid: approvedCommissions.length
    });

    return new Response(JSON.stringify({
      success: true,
      payout_id: payout.id,
      amount: totalAmount,
      commissions_paid: approvedCommissions.length
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: error instanceof Error && error.message === "Unauthorized" ? 401 : 500,
    });
  }
});
