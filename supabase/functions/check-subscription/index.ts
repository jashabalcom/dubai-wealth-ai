import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

// Dubai REI Product to tier mapping (correct product IDs)
const PRODUCT_TIER_MAP: Record<string, 'investor' | 'elite' | 'private'> = {
  // Dubai REI Products
  "prod_ThxMtreIVfefZK": "investor",
  "prod_ThxMsDNaQxY8bp": "elite",
  "prod_ThxN30jXTwBfoE": "private",
  // Legacy products (keep for backwards compatibility)
  "prod_TZ38QBXp8kGx7k": "investor",
  "prod_TZ38flxttNDJ5W": "elite",
};

// Tier hierarchy: higher number = higher access
const TIER_LEVELS: Record<string, number> = {
  free: 0,
  investor: 1,
  elite: 2,
  private: 3,
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
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found, returning free tier");
      
      // Update profile to free tier
      await supabaseClient
        .from('profiles')
        .update({ 
          membership_tier: 'free',
          membership_status: 'active',
          membership_renews_at: null
        })
        .eq('id', user.id);
      
      return new Response(JSON.stringify({ 
        subscribed: false,
        tier: 'free',
        subscription_end: null
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Update profile with Stripe customer ID if not already set
    await supabaseClient
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', user.id);

    // Include trialing subscriptions as well as active
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 10,
    });
    
    // Filter to active or trialing subscriptions
    const validSubscriptions = subscriptions.data.filter(
      (sub: Stripe.Subscription) => sub.status === 'active' || sub.status === 'trialing'
    );
    
    const hasActiveSub = validSubscriptions.length > 0;
    let tier: 'free' | 'investor' | 'elite' | 'private' = 'free';
    let subscriptionEnd = null;
    let isTrialing = false;
    let trialEnd = null;
    let highestTierLevel = 0;

    if (hasActiveSub) {
      // Find the highest tier subscription
      for (const subscription of validSubscriptions) {
        const productId = subscription.items.data[0].price.product as string;
        const subTier = PRODUCT_TIER_MAP[productId];
        
        if (subTier) {
          const subTierLevel = TIER_LEVELS[subTier] || 0;
          
          if (subTierLevel > highestTierLevel) {
            highestTierLevel = subTierLevel;
            tier = subTier;
            subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
            isTrialing = subscription.status === 'trialing';
            if (subscription.trial_end) {
              trialEnd = new Date(subscription.trial_end * 1000).toISOString();
            }
          }
        } else {
          logStep("Unknown product ID", { productId });
        }
      }
      logStep("Active/trialing subscription found", { tier, subscriptionEnd, isTrialing, trialEnd });
    } else {
      logStep("No active subscription found");
    }

    // Update the profile in Supabase
    const membershipStatus = isTrialing ? 'trialing' : (hasActiveSub ? 'active' : 'expired');
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({ 
        membership_tier: tier,
        membership_status: membershipStatus,
        membership_renews_at: subscriptionEnd
      })
      .eq('id', user.id);

    if (updateError) {
      logStep("Error updating profile", { error: updateError.message });
    } else {
      logStep("Profile updated successfully", { tier, status: membershipStatus });
    }

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      tier: tier,
      subscription_end: subscriptionEnd,
      is_trialing: isTrialing,
      trial_end: trialEnd
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
