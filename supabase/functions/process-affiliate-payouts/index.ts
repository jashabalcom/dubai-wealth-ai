import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  console.log(`[PROCESS-AFFILIATE-PAYOUTS] ${step}`, details ? JSON.stringify(details) : '');
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Get minimum payout threshold
    const { data: minSettings } = await supabase
      .from('affiliate_settings')
      .select('setting_value')
      .eq('setting_key', 'minimum_payout_amount')
      .single();

    const minPayout = minSettings?.setting_value?.amount || 50;
    logStep("Minimum payout threshold", { amount: minPayout });

    // Get all affiliates with approved commissions and connected Stripe
    const { data: affiliatesWithCommissions, error: affiliatesError } = await supabase
      .from('affiliates')
      .select(`
        id,
        user_id,
        referral_code,
        stripe_connect_id,
        stripe_connect_status
      `)
      .eq('status', 'approved')
      .not('stripe_connect_id', 'is', null);

    if (affiliatesError) {
      logStep("Error fetching affiliates", affiliatesError);
      throw affiliatesError;
    }

    logStep("Found affiliates with Stripe", { count: affiliatesWithCommissions?.length || 0 });

    let payoutsProcessed = 0;
    let payoutsFailed = 0;
    let totalPaid = 0;

    for (const affiliate of affiliatesWithCommissions || []) {
      try {
        logStep("Processing affiliate", { affiliate_id: affiliate.id });

        // Check if Stripe account is ready for payouts
        const account = await stripe.accounts.retrieve(affiliate.stripe_connect_id);
        
        if (!account.payouts_enabled) {
          logStep("Payouts not enabled for account", { 
            account_id: affiliate.stripe_connect_id,
            details_submitted: account.details_submitted
          });

          // Update status if needed
          if (affiliate.stripe_connect_status !== 'pending') {
            await supabase
              .from('affiliates')
              .update({ stripe_connect_status: 'pending' })
              .eq('id', affiliate.id);
          }
          continue;
        }

        // Update status to active if payouts enabled
        if (affiliate.stripe_connect_status !== 'active') {
          await supabase
            .from('affiliates')
            .update({ stripe_connect_status: 'active' })
            .eq('id', affiliate.id);
        }

        // Get approved (unpaid) commissions for this affiliate
        const { data: approvedCommissions, error: commissionsError } = await supabase
          .from('commissions')
          .select('*')
          .eq('affiliate_id', affiliate.id)
          .eq('status', 'approved')
          .is('payout_id', null);

        if (commissionsError) {
          logStep("Error fetching commissions", commissionsError);
          continue;
        }

        if (!approvedCommissions || approvedCommissions.length === 0) {
          logStep("No approved commissions", { affiliate_id: affiliate.id });
          continue;
        }

        // Calculate total payout amount
        const totalAmount = approvedCommissions.reduce(
          (sum, c) => sum + Number(c.commission_amount),
          0
        );

        logStep("Total commission amount", {
          affiliate_id: affiliate.id,
          amount: totalAmount,
          commission_count: approvedCommissions.length
        });

        // Check minimum threshold
        if (totalAmount < minPayout) {
          logStep("Below minimum threshold", {
            affiliate_id: affiliate.id,
            amount: totalAmount,
            minimum: minPayout
          });
          continue;
        }

        // Create payout record
        const { data: payout, error: payoutError } = await supabase
          .from('affiliate_payouts')
          .insert({
            affiliate_id: affiliate.id,
            amount: totalAmount,
            currency: 'USD',
            commission_count: approvedCommissions.length,
            status: 'processing'
          })
          .select()
          .single();

        if (payoutError || !payout) {
          logStep("Error creating payout record", payoutError);
          continue;
        }

        try {
          // Create Stripe transfer to connected account
          const transfer = await stripe.transfers.create({
            amount: Math.round(totalAmount * 100), // Convert to cents
            currency: 'usd',
            destination: affiliate.stripe_connect_id,
            metadata: {
              payout_id: payout.id,
              affiliate_id: affiliate.id,
              commission_count: approvedCommissions.length.toString()
            }
          });

          logStep("Transfer created", {
            transfer_id: transfer.id,
            amount: totalAmount
          });

          // Update payout with transfer ID
          await supabase
            .from('affiliate_payouts')
            .update({
              stripe_transfer_id: transfer.id,
              status: 'completed',
              processed_at: new Date().toISOString()
            })
            .eq('id', payout.id);

          // Mark all commissions as paid
          const commissionIds = approvedCommissions.map(c => c.id);
          await supabase
            .from('commissions')
            .update({
              status: 'paid',
              paid_at: new Date().toISOString(),
              payout_id: payout.id
            })
            .in('id', commissionIds);

          // Create notification
          await supabase
            .from('affiliate_notifications')
            .insert({
              affiliate_id: affiliate.id,
              notification_type: 'payout_completed',
              title: 'Payout Sent!',
              message: `$${totalAmount.toFixed(2)} has been transferred to your connected Stripe account.`,
              metadata: {
                payout_id: payout.id,
                amount: totalAmount,
                commission_count: approvedCommissions.length
              },
              delivery_method: 'both'
            });

          payoutsProcessed++;
          totalPaid += totalAmount;

        } catch (stripeError) {
          logStep("Stripe transfer failed", stripeError);

          // Update payout as failed
          await supabase
            .from('affiliate_payouts')
            .update({
              status: 'failed',
              failure_reason: stripeError instanceof Error ? stripeError.message : 'Unknown error'
            })
            .eq('id', payout.id);

          payoutsFailed++;
        }

      } catch (err) {
        logStep("Error processing affiliate", { affiliate_id: affiliate.id, error: err });
        payoutsFailed++;
      }
    }

    logStep("Payout processing complete", {
      payoutsProcessed,
      payoutsFailed,
      totalPaid
    });

    return new Response(JSON.stringify({
      success: true,
      payoutsProcessed,
      payoutsFailed,
      totalPaid
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
