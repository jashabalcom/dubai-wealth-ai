import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-SUBSCRIPTION-INTENT] ${step}${detailsStr}`);
};

// Price ID mapping
const TIER_PRICES: Record<string, string> = {
  investor: "price_1Sbv2KHVQx2jO318h20jYHWa",
  elite: "price_1Sbv2UHVQx2jO318S54njLC4",
};

const TIER_NAMES: Record<string, string> = {
  investor: "Dubai Investor",
  elite: "Dubai Elite Investor",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { tier, isUpgrade } = await req.json();
    if (!tier || !TIER_PRICES[tier]) {
      throw new Error(`Invalid tier: ${tier}`);
    }
    logStep("Processing tier", { tier, isUpgrade });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Find or create customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string;

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });

      // Check for existing active subscription
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        limit: 10,
      });

      // Also check trialing subscriptions
      const trialingSubscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "trialing",
        limit: 10,
      });

      const allActiveSubs = [...subscriptions.data, ...trialingSubscriptions.data];

      if (allActiveSubs.length > 0 && isUpgrade) {
        // Cancel existing subscriptions for upgrade
        for (const sub of allActiveSubs) {
          await stripe.subscriptions.cancel(sub.id, { prorate: true });
          logStep("Cancelled existing subscription for upgrade", { subId: sub.id });
        }
      } else if (allActiveSubs.length > 0 && !isUpgrade) {
        // Already has active subscription
        throw new Error("You already have an active subscription. Please use the customer portal to manage it.");
      }
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
      logStep("Created new customer", { customerId });

      // Update profile with Stripe customer ID
      await supabaseClient
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    // Create subscription with incomplete status to get client_secret
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: TIER_PRICES[tier] }],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
      trial_period_days: isUpgrade ? undefined : 14, // No trial for upgrades
      metadata: {
        tier,
        supabase_user_id: user.id,
      },
    });

    logStep("Created subscription", { subscriptionId: subscription.id });

    const invoice = subscription.latest_invoice as Stripe.Invoice;
    const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;

    if (!paymentIntent?.client_secret) {
      throw new Error("Failed to get payment intent client secret");
    }

    logStep("Returning client secret");

    return new Response(JSON.stringify({
      clientSecret: paymentIntent.client_secret,
      subscriptionId: subscription.id,
      tierName: TIER_NAMES[tier],
      trialDays: isUpgrade ? 0 : 14,
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
