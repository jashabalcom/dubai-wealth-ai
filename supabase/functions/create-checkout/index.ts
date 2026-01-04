import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getSecurityHeaders } from "../_shared/security.ts";
import { 
  checkRateLimit, 
  getUserRateLimitKey, 
  rateLimitResponse 
} from "../_shared/rate-limit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

// Dubai REI Price ID mapping - monthly and annual
const TIER_PRICES: Record<string, { monthly: string; annual: string }> = {
  investor: {
    monthly: "price_1SkXRkHw4VrnO885MoTLD6iC",
    annual: "price_1SkXRwHw4VrnO885DWKPmskP",
  },
  elite: {
    monthly: "price_1SkXS8Hw4VrnO885hyP39hIh",
    annual: "price_1SkXSKHw4VrnO885KvdKUvGE",
  },
  private: {
    monthly: "price_1SkXSWHw4VrnO885DzNEfjAu",
    annual: "price_1SkXShHw4VrnO885j5BkoDu4",
  },
};

// All valid price IDs for lookup
const ALL_PRICE_IDS = [
  "price_1SkXRkHw4VrnO885MoTLD6iC", // investor monthly
  "price_1SkXRwHw4VrnO885DWKPmskP", // investor annual
  "price_1SkXS8Hw4VrnO885hyP39hIh", // elite monthly
  "price_1SkXSKHw4VrnO885KvdKUvGE", // elite annual
  "price_1SkXSWHw4VrnO885DzNEfjAu", // private monthly
  "price_1SkXShHw4VrnO885j5BkoDu4", // private annual
];

// Reverse lookup: price ID to tier
const PRICE_TO_TIER: Record<string, string> = {
  "price_1SkXRkHw4VrnO885MoTLD6iC": "investor",
  "price_1SkXRwHw4VrnO885DWKPmskP": "investor",
  "price_1SkXS8Hw4VrnO885hyP39hIh": "elite",
  "price_1SkXSKHw4VrnO885KvdKUvGE": "elite",
  "price_1SkXSWHw4VrnO885DzNEfjAu": "private",
  "price_1SkXShHw4VrnO885j5BkoDu4": "private",
};

// Default trial days per source (can be overridden by frontend)
const DEFAULT_TRIAL_DAYS: Record<string, number> = {
  'webinar': 7,
  'lead-magnet': 14,
  'partner': 30,
  'special-offer': 14,
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
    
    const { priceId, tier, billingPeriod = 'monthly', trialSource, trialDays: customTrialDays } = await req.json();
    logStep("Received request", { priceId, tier, billingPeriod, trialSource, customTrialDays });

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

    // Rate limiting: 10 requests per hour per authenticated user
    const rateLimitKey = getUserRateLimitKey("create-checkout", user.id);
    const rateLimit = await checkRateLimit(rateLimitKey, 10, 3600);

    if (!rateLimit.allowed) {
      logStep("Rate limit exceeded", { userId: user.id });
      return rateLimitResponse(rateLimit.resetAt, corsHeaders);
    }

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
    
    // Trial decision: Only apply trial if trialSource is provided (webinar, lead-magnet, partner, etc.)
    // Direct checkout from pricing page = no trial (trialSource will be undefined)
    const validTrialSources = Object.keys(DEFAULT_TRIAL_DAYS);
    const isValidTrialSource = trialSource && validTrialSources.includes(trialSource);
    const hasTrial = !hasExistingSubscription && billingPeriod === 'monthly' && isValidTrialSource;
    
    // Determine trial days: custom value from frontend (if valid) or default for source
    let trialDays = 0;
    if (hasTrial && trialSource) {
      if (customTrialDays && typeof customTrialDays === 'number' && customTrialDays >= 1 && customTrialDays <= 30) {
        trialDays = customTrialDays;
      } else {
        trialDays = DEFAULT_TRIAL_DAYS[trialSource] || 14;
      }
    }
    
    logStep("Trial decision", { hasTrial, trialDays, hadExistingSubscription: hasExistingSubscription, existingTier, billingPeriod, trialSource, isValidTrialSource });

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
        trial_source: trialSource || '',
      },
    };

    // Add trial period only for new monthly subscribers (not upgrades, not annual)
    if (hasTrial && trialDays > 0) {
      sessionConfig.subscription_data = {
        trial_period_days: trialDays,
        metadata: {
          tier,
          billing_period: billingPeriod,
          supabase_user_id: user.id,
          trial_source: trialSource || '',
        },
      };
      logStep(`Adding ${trialDays}-day trial period from source: ${trialSource}`);
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
      trialDays,
      upgradedFrom: existingTier,
      billingPeriod
    });

    return new Response(JSON.stringify({ url: session.url }), {
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
