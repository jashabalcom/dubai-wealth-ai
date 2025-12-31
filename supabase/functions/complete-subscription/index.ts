import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[COMPLETE-SUBSCRIPTION] ${step}${detailsStr}`);
};

const TIER_NAMES: Record<string, string> = {
  investor: "Dubai Investor",
  elite: "Dubai Elite Investor",
  private: "Dubai Private",
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

    const { setupIntentId, tier, billingPeriod, priceId, customerId } = await req.json();
    
    if (!setupIntentId) throw new Error("Missing setupIntentId");
    if (!tier) throw new Error("Missing tier");
    if (!priceId) throw new Error("Missing priceId");
    if (!customerId) throw new Error("Missing customerId");
    
    logStep("Processing subscription completion", { setupIntentId, tier, billingPeriod, priceId, customerId });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Retrieve the SetupIntent to get the payment method
    const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);
    
    if (setupIntent.status !== 'succeeded') {
      throw new Error(`SetupIntent is not succeeded. Status: ${setupIntent.status}`);
    }

    const paymentMethodId = setupIntent.payment_method as string;
    if (!paymentMethodId) {
      throw new Error("No payment method found on SetupIntent");
    }

    logStep("SetupIntent retrieved", { 
      status: setupIntent.status, 
      paymentMethodId 
    });

    // Set the payment method as the customer's default
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    logStep("Set default payment method", { customerId, paymentMethodId });

    // Create the subscription with the attached payment method
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      default_payment_method: paymentMethodId,
      payment_behavior: "error_if_incomplete",
      payment_settings: {
        save_default_payment_method: "on_subscription",
      },
      metadata: {
        tier,
        billing_period: billingPeriod,
        supabase_user_id: user.id,
        upgraded_from: setupIntent.metadata?.upgraded_from || undefined,
      },
    });

    logStep("Subscription created", { 
      subscriptionId: subscription.id, 
      status: subscription.status 
    });

    // Update the user's profile with subscription info
    await supabaseClient
      .from('profiles')
      .update({ 
        membership_tier: tier,
        stripe_customer_id: customerId,
      })
      .eq('id', user.id);

    return new Response(JSON.stringify({
      success: true,
      subscriptionId: subscription.id,
      status: subscription.status,
      tierName: TIER_NAMES[tier],
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
