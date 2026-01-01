import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  console.log(`[PROCESS-COMMISSIONS] ${step}`, details ? JSON.stringify(details) : '');
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

    // Get qualification period from settings
    const { data: qualSettings } = await supabase
      .from('affiliate_settings')
      .select('setting_value')
      .eq('setting_key', 'qualification_period_days')
      .single();

    const qualificationDays = qualSettings?.setting_value?.days || 60;
    logStep("Qualification period", { days: qualificationDays });

    // Find pending referrals that have passed qualification date
    const { data: pendingReferrals, error: referralsError } = await supabase
      .from('referrals')
      .select(`
        *,
        affiliates!inner(
          id,
          user_id,
          commission_rate,
          status
        )
      `)
      .eq('status', 'pending')
      .lte('qualification_date', new Date().toISOString())
      .eq('affiliates.status', 'approved');

    if (referralsError) {
      logStep("Error fetching referrals", referralsError);
      throw referralsError;
    }

    logStep("Found pending referrals", { count: pendingReferrals?.length || 0 });

    let processed = 0;
    let qualified = 0;
    let churned = 0;

    // Get default commission rate
    const { data: rateSettings } = await supabase
      .from('affiliate_settings')
      .select('setting_value')
      .eq('setting_key', 'default_commission_rate')
      .single();

    const defaultRate = rateSettings?.setting_value?.rate || 0.50;

    for (const referral of pendingReferrals || []) {
      try {
        logStep("Processing referral", { referral_id: referral.id });

        // Get user's email to check Stripe subscription
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(referral.referred_user_id);
        
        if (userError || !userData?.user?.email) {
          logStep("Could not find user", { user_id: referral.referred_user_id });
          continue;
        }

        const email = userData.user.email;

        // Check if user has active subscription in Stripe
        const customers = await stripe.customers.list({ email, limit: 1 });
        
        if (customers.data.length === 0) {
          logStep("No Stripe customer found, marking as churned", { email });
          
          await supabase
            .from('referrals')
            .update({
              status: 'churned',
              churned_at: new Date().toISOString(),
              churn_reason: 'no_subscription'
            })
            .eq('id', referral.id);

          churned++;
          continue;
        }

        const customerId = customers.data[0].id;

        // Check for active subscription
        const subscriptions = await stripe.subscriptions.list({
          customer: customerId,
          status: 'active',
          limit: 1
        });

        if (subscriptions.data.length === 0) {
          logStep("No active subscription, marking as churned", { customer_id: customerId });
          
          await supabase
            .from('referrals')
            .update({
              status: 'churned',
              churned_at: new Date().toISOString(),
              churn_reason: 'subscription_cancelled'
            })
            .eq('id', referral.id);

          churned++;
          continue;
        }

        const subscription = subscriptions.data[0];
        const price = subscription.items.data[0]?.price;
        const productId = typeof price?.product === 'string' ? price.product : price?.product?.id;
        const amount = (price?.unit_amount || 0) / 100;
        const interval = price?.recurring?.interval || 'month';

        logStep("Found active subscription", {
          subscription_id: subscription.id,
          product_id: productId,
          amount,
          interval
        });

        // Mark referral as qualified
        await supabase
          .from('referrals')
          .update({
            status: 'qualified',
            qualified_at: new Date().toISOString(),
            first_subscription_id: subscription.id,
            first_subscription_product: productId,
            first_subscription_amount: amount
          })
          .eq('id', referral.id);

        // Calculate commission
        const affiliate = referral.affiliates;
        const commissionRate = affiliate.commission_rate || defaultRate;
        const commissionAmount = amount * commissionRate;

        // Determine product type from product ID
        let productType = 'unknown';
        if (productId) {
          // Map product IDs to types (you may need to adjust these)
          if (productId.includes('investor')) productType = 'dubai_investor';
          else if (productId.includes('elite')) productType = 'dubai_elite';
          else if (productId.includes('private')) productType = 'dubai_private';
          else if (productId.includes('preferred')) productType = 'agent_preferred';
          else if (productId.includes('premium')) productType = 'agent_premium';
          else productType = productId;
        }

        // Create commission record
        const { error: commissionError } = await supabase
          .from('commissions')
          .insert({
            affiliate_id: affiliate.id,
            referral_id: referral.id,
            product_type: productType,
            billing_period: interval === 'year' ? 'annual' : 'monthly',
            gross_amount: amount,
            commission_rate: commissionRate,
            commission_amount: commissionAmount,
            currency: price?.currency?.toUpperCase() || 'USD',
            status: 'approved', // Auto-approve after qualification
            approved_at: new Date().toISOString()
          });

        if (commissionError) {
          logStep("Error creating commission", commissionError);
        } else {
          logStep("Commission created", {
            affiliate_id: affiliate.id,
            amount: commissionAmount
          });
          qualified++;
        }

        processed++;
      } catch (err) {
        logStep("Error processing referral", { referral_id: referral.id, error: err });
      }
    }

    logStep("Processing complete", { processed, qualified, churned });

    return new Response(JSON.stringify({
      success: true,
      processed,
      qualified,
      churned
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
