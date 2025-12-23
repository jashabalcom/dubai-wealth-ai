import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

// Price ID mapping - monthly and annual
const TIER_PRICES: Record<string, { monthly: string; annual: string }> = {
  investor: {
    monthly: "price_1Sbv2KHVQx2jO318h20jYHWa",
    annual: "price_1ShQ9DHVQx2jO318EopokNIq",
  },
  elite: {
    monthly: "price_1Sbv2UHVQx2jO318S54njLC4",
    annual: "price_1ShQ9OHVQx2jO318x9l7kYEV",
  },
};

// All valid price IDs for lookup
const ALL_PRICE_IDS = [
  "price_1Sbv2KHVQx2jO318h20jYHWa", // investor monthly
  "price_1ShQ9DHVQx2jO318EopokNIq", // investor annual
  "price_1Sbv2UHVQx2jO318S54njLC4", // elite monthly
  "price_1ShQ9OHVQx2jO318x9l7kYEV", // elite annual
];

// Reverse lookup: price ID to tier
const PRICE_TO_TIER: Record<string, string> = {
  "price_1Sbv2KHVQx2jO318h20jYHWa": "investor",
  "price_1ShQ9DHVQx2jO318EopokNIq": "investor",
  "price_1Sbv2UHVQx2jO318S54njLC4": "elite",
  "price_1ShQ9OHVQx2jO318x9l7kYEV": "elite",
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
    
    const { priceId, tier, billingPeriod = 'monthly' } = await req.json();
    logStep("Received request", { priceId, tier, billingPeriod });

    // Validate tier
    if (!tier || !TIER_PRICES[tier]) {
      throw new Error(`Invalid tier: ${tier}`);
    }

    // Validate price ID
    if (!ALL_PRICE_IDS.includes(priceId)) {
      throw new Error(`Invalid price ID: ${priceId}`);
    }

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { 
      apiVersion: "2025-08-27.basil" 
    });
    
    // Find or create customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    let existingTier: string | null = null;
    let hasExistingSubscription = false;

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });

      // Check for existing active or trialing subscriptions
      const activeSubscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        limit: 10,
      });

      const trialingSubscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "trialing",
        limit: 10,
      });

      const allActiveSubs = [...activeSubscriptions.data, ...trialingSubscriptions.data];
      hasExistingSubscription = allActiveSubs.length > 0;

      if (hasExistingSubscription) {
        // Get the current tier from existing subscription
        existingTier = getTierFromSubscription(allActiveSubs[0]);
        logStep("Found existing subscription", { 
          existingTier, 
          requestedTier: tier,
          subscriptionStatus: allActiveSubs[0].status 
        });

        // Check if requesting same tier with same price (same billing period)
        const existingPriceId = allActiveSubs[0].items.data[0]?.price?.id;
        if (existingPriceId === priceId) {
          throw new Error("You already have an active subscription for this plan. Please use the customer portal to manage it.");
        }

        // Cancel existing subscriptions for upgrade/change - user will pay immediately via checkout
        for (const sub of allActiveSubs) {
          await stripe.subscriptions.cancel(sub.id, { prorate: true });
          logStep("Cancelled existing subscription for upgrade", { 
            subId: sub.id, 
            previousTier: existingTier,
            newTier: tier,
            billingPeriod
          });
        }
      }

      // Sync stripe_customer_id to profile if not already set
      await supabaseClient
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
        .is('stripe_customer_id', null);

    } else {
      // Create new customer
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

    const origin = req.headers.get("origin") || "https://bswllmynuxkhekqqeznr.lovable.app";
    
    // Trial decision: no trial for upgrades (when they had an existing subscription)
    // Also no trial for annual plans (immediate value)
    const hasTrial = !hasExistingSubscription && billingPeriod === 'monthly';
    logStep("Trial decision", { hasTrial, hadExistingSubscription: hasExistingSubscription, existingTier, billingPeriod });

    // Create checkout session with smart trial handling
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,
      metadata: {
        user_id: user.id,
        tier: tier,
        billing_period: billingPeriod,
        upgraded_from: existingTier || '',
      },
    };

    // Add trial period only for new monthly subscribers (not upgrades, not annual)
    if (hasTrial) {
      sessionConfig.subscription_data = {
        trial_period_days: 14,
        metadata: {
          tier,
          billing_period: billingPeriod,
          supabase_user_id: user.id,
        },
      };
      logStep("Adding 14-day trial period");
    } else {
      sessionConfig.subscription_data = {
        metadata: {
          tier,
          billing_period: billingPeriod,
          supabase_user_id: user.id,
          upgraded_from: existingTier || '',
        },
      };
      logStep("No trial - upgrade or annual flow", { billingPeriod });
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    logStep("Checkout session created", { 
      sessionId: session.id, 
      url: session.url,
      hasTrial,
      upgradedFrom: existingTier,
      billingPeriod
    });

    return new Response(JSON.stringify({ url: session.url }), {
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
