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

// Reverse lookup: price ID to tier
const PRICE_TO_TIER: Record<string, string> = {
  "price_1Sbv2KHVQx2jO318h20jYHWa": "investor",
  "price_1Sbv2UHVQx2jO318S54njLC4": "elite",
};

const TIER_NAMES: Record<string, string> = {
  investor: "Dubai Investor",
  elite: "Dubai Elite Investor",
};

// Helper to get current tier from subscription
const getTierFromSubscription = (subscription: Stripe.Subscription): string | null => {
  const priceId = subscription.items.data[0]?.price?.id;
  return priceId ? PRICE_TO_TIER[priceId] || null : null;
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

    const { tier, isUpgrade: explicitUpgrade } = await req.json();
    if (!tier || !TIER_PRICES[tier]) {
      throw new Error(`Invalid tier: ${tier}`);
    }
    logStep("Processing tier", { tier, explicitUpgrade });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Find or create customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string;
    let existingTier: string | null = null;
    let hasExistingSubscription = false;

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });

      // Check for existing active or trialing subscriptions
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        limit: 10,
      });

      const trialingSubscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "trialing",
        limit: 10,
      });

      const allActiveSubs = [...subscriptions.data, ...trialingSubscriptions.data];
      hasExistingSubscription = allActiveSubs.length > 0;

      if (hasExistingSubscription) {
        // Get the current tier from existing subscription
        existingTier = getTierFromSubscription(allActiveSubs[0]);
        logStep("Found existing subscription", { 
          existingTier, 
          requestedTier: tier,
          subscriptionStatus: allActiveSubs[0].status 
        });

        // Smart upgrade detection:
        // 1. Explicit upgrade flag passed from frontend
        // 2. OR requesting a DIFFERENT tier than current (implicit upgrade)
        const isActualUpgrade = explicitUpgrade || (existingTier !== null && existingTier !== tier);

        if (isActualUpgrade) {
          // Cancel existing subscriptions for upgrade - user pays immediately, no trial
          for (const sub of allActiveSubs) {
            await stripe.subscriptions.cancel(sub.id, { prorate: true });
            logStep("Cancelled existing subscription for upgrade", { 
              subId: sub.id, 
              previousTier: existingTier,
              newTier: tier 
            });
          }
        } else {
          // Same tier requested and not an explicit upgrade - redirect to portal
          throw new Error("You already have an active subscription for this tier. Please use the customer portal to manage it.");
        }
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

    // Trial decision: no trial for upgrades (when they had an existing subscription)
    const hasTrial = !hasExistingSubscription;
    logStep("Trial decision", { hasTrial, hadExistingSubscription: hasExistingSubscription, existingTier });

    // Create subscription - for trials, we use pending_setup_intent; for immediate charges, payment_intent
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: TIER_PRICES[tier] }],
      payment_behavior: "default_incomplete",
      payment_settings: { 
        save_default_payment_method: "on_subscription",
        payment_method_types: ['card'],
      },
      expand: ["pending_setup_intent", "latest_invoice.payment_intent"],
      trial_period_days: hasTrial ? 14 : undefined,
      metadata: {
        tier,
        supabase_user_id: user.id,
        upgraded_from: existingTier || undefined,
      },
    });

    logStep("Created subscription", { 
      subscriptionId: subscription.id, 
      status: subscription.status,
      hasPendingSetupIntent: !!subscription.pending_setup_intent,
      hasLatestInvoice: !!subscription.latest_invoice 
    });

    let clientSecret: string | null = null;
    let intentType: 'setup' | 'payment' = 'payment';

    // For trial subscriptions, Stripe creates a pending_setup_intent to collect payment method
    if (subscription.pending_setup_intent) {
      const setupIntent = subscription.pending_setup_intent as Stripe.SetupIntent;
      clientSecret = setupIntent.client_secret;
      intentType = 'setup';
      logStep("Using setup intent for trial", { setupIntentId: setupIntent.id });
    } else if (subscription.latest_invoice) {
      // For immediate charges (upgrades), use payment intent from invoice
      const invoice = subscription.latest_invoice as Stripe.Invoice;
      const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;
      if (paymentIntent?.client_secret) {
        clientSecret = paymentIntent.client_secret;
        intentType = 'payment';
        logStep("Using payment intent", { paymentIntentId: paymentIntent.id });
      }
    }

    if (!clientSecret) {
      logStep("ERROR: No client secret obtained", { 
        subscriptionStatus: subscription.status,
        pendingSetupIntent: !!subscription.pending_setup_intent,
        latestInvoice: !!subscription.latest_invoice 
      });
      throw new Error("Failed to get payment intent client secret");
    }

    logStep("Returning client secret", { intentType, subscriptionId: subscription.id });

    return new Response(JSON.stringify({
      clientSecret,
      subscriptionId: subscription.id,
      tierName: TIER_NAMES[tier],
      trialDays: hasTrial ? 14 : 0,
      intentType,
      upgradedFrom: existingTier,
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
