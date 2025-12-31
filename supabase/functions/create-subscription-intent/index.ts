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

// Dubai REI Price ID mapping - includes both monthly AND annual prices
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

// Reverse lookup: price ID to tier
const PRICE_TO_TIER: Record<string, string> = {
  // Investor
  "price_1SkXRkHw4VrnO885MoTLD6iC": "investor",
  "price_1SkXRwHw4VrnO885DWKPmskP": "investor",
  // Elite
  "price_1SkXS8Hw4VrnO885hyP39hIh": "elite",
  "price_1SkXSKHw4VrnO885KvdKUvGE": "elite",
  // Private
  "price_1SkXSWHw4VrnO885DzNEfjAu": "private",
  "price_1SkXShHw4VrnO885j5BkoDu4": "private",
};

const TIER_NAMES: Record<string, string> = {
  investor: "Dubai Investor",
  elite: "Dubai Elite Investor",
  private: "Dubai Private",
};

// Default trial days per source
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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { tier, billingPeriod = 'monthly', isUpgrade: explicitUpgrade, trialSource, trialDays: customTrialDays } = await req.json();
    if (!tier || !TIER_PRICES[tier]) {
      throw new Error(`Invalid tier: ${tier}`);
    }
    
    // Get the correct price ID based on billing period
    const priceId = TIER_PRICES[tier][billingPeriod === 'annual' ? 'annual' : 'monthly'];
    logStep("Processing tier", { tier, billingPeriod, priceId, explicitUpgrade, trialSource, customTrialDays });

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

    // Trial decision: Only apply trial if trialSource is provided and no existing subscription
    const validTrialSources = Object.keys(DEFAULT_TRIAL_DAYS);
    const isValidTrialSource = trialSource && validTrialSources.includes(trialSource);
    const hasTrial = !hasExistingSubscription && isValidTrialSource;
    
    // Determine trial days
    let trialDays = 0;
    if (hasTrial && trialSource) {
      if (customTrialDays && typeof customTrialDays === 'number' && customTrialDays >= 1 && customTrialDays <= 30) {
        trialDays = customTrialDays;
      } else {
        trialDays = DEFAULT_TRIAL_DAYS[trialSource] || 14;
      }
    }
    
    logStep("Trial decision", { hasTrial, trialDays, hadExistingSubscription: hasExistingSubscription, existingTier, trialSource });

    // NEW APPROACH: For non-trial subscriptions, create a SetupIntent first
    // This allows us to collect the payment method BEFORE creating the subscription
    // which solves the "PaymentIntent is null" problem with default_incomplete
    
    if (hasTrial && trialDays > 0) {
      // TRIAL FLOW: Create subscription with trial, use pending_setup_intent
      logStep("Creating trial subscription with pending_setup_intent");
      
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: "default_incomplete",
        payment_settings: { 
          save_default_payment_method: "on_subscription",
        },
        expand: ["pending_setup_intent"],
        trial_period_days: trialDays,
        metadata: {
          tier,
          billing_period: billingPeriod,
          supabase_user_id: user.id,
          upgraded_from: existingTier || undefined,
          trial_source: trialSource || undefined,
        },
      });

      const setupIntent = subscription.pending_setup_intent as Stripe.SetupIntent;
      if (!setupIntent?.client_secret) {
        throw new Error("Failed to create setup intent for trial subscription");
      }

      logStep("Trial subscription created", { 
        subscriptionId: subscription.id, 
        setupIntentId: setupIntent.id,
        trialDays 
      });

      return new Response(JSON.stringify({
        clientSecret: setupIntent.client_secret,
        subscriptionId: subscription.id,
        tierName: TIER_NAMES[tier],
        trialDays,
        intentType: 'setup',
        upgradedFrom: existingTier,
        billingPeriod,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      // NON-TRIAL FLOW: Create a SetupIntent first, subscription created after payment method is collected
      logStep("Creating SetupIntent for non-trial subscription");
      
      const setupIntent = await stripe.setupIntents.create({
        customer: customerId,
        automatic_payment_methods: { enabled: true },
        metadata: {
          tier,
          billing_period: billingPeriod,
          supabase_user_id: user.id,
          upgraded_from: existingTier || undefined,
          price_id: priceId,
        },
      });

      if (!setupIntent.client_secret) {
        throw new Error("Failed to create setup intent");
      }

      logStep("SetupIntent created for non-trial", { 
        setupIntentId: setupIntent.id,
        customerId 
      });

      return new Response(JSON.stringify({
        clientSecret: setupIntent.client_secret,
        setupIntentId: setupIntent.id,
        customerId,
        tierName: TIER_NAMES[tier],
        trialDays: 0,
        intentType: 'setup',
        upgradedFrom: existingTier,
        billingPeriod,
        tier,
        priceId,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
