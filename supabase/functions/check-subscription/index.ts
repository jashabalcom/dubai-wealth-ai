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

// Product to tier mapping
const PRODUCT_TIER_MAP: Record<string, 'investor' | 'elite'> = {
  "prod_TZ38QBXp8kGx7k": "investor",
  "prod_TZ38flxttNDJ5W": "elite",
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

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 10,
    });
    
    const hasActiveSub = subscriptions.data.length > 0;
    let tier: 'free' | 'investor' | 'elite' = 'free';
    let subscriptionEnd = null;

    if (hasActiveSub) {
      // Find the highest tier subscription
      for (const subscription of subscriptions.data) {
        const productId = subscription.items.data[0].price.product as string;
        const subTier = PRODUCT_TIER_MAP[productId];
        
        if (subTier === 'elite') {
          tier = 'elite';
          subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
          break;
        } else if (subTier === 'investor') {
          if (tier === 'free') {
            tier = 'investor';
            subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
          }
        }
      }
      logStep("Active subscription found", { tier, subscriptionEnd });
    } else {
      logStep("No active subscription found");
    }

    // Update the profile in Supabase
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({ 
        membership_tier: tier,
        membership_status: hasActiveSub ? 'active' : 'expired',
        membership_renews_at: subscriptionEnd
      })
      .eq('id', user.id);

    if (updateError) {
      logStep("Error updating profile", { error: updateError.message });
    } else {
      logStep("Profile updated successfully", { tier });
    }

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      tier: tier,
      subscription_end: subscriptionEnd
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
