import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[AGENT-CHECK-SUB] ${step}${detailsStr}`);
};

// Tier configuration matching frontend
const TIER_CONFIG = {
  basic: { max_listings: 3, featured_listings: 0, show_direct_contact: false, priority_ranking: 0 },
  preferred: { max_listings: 15, featured_listings: 2, show_direct_contact: true, priority_ranking: 50 },
  premium: { max_listings: -1, featured_listings: 10, show_direct_contact: true, priority_ranking: 100 },
};

const PRODUCT_TIER_MAP: Record<string, keyof typeof TIER_CONFIG> = {
  'prod_TZhJGjhivFcpVY': 'preferred',
  'prod_TZhLz1WYAlbzui': 'premium',
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

    const { agentId } = await req.json();
    if (!agentId) {
      throw new Error("Agent ID is required");
    }
    logStep("Checking agent", { agentId });

    // Verify admin is making the request
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;
    
    if (!user) throw new Error("User not authenticated");

    // Check if user is admin
    const { data: roleData } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      throw new Error("Only admins can check agent subscriptions");
    }
    logStep("Admin verified");

    // Get agent details
    const { data: agent, error: agentError } = await supabaseClient
      .from('agents')
      .select('id, email, stripe_customer_id, subscription_tier')
      .eq('id', agentId)
      .single();

    if (agentError || !agent) {
      throw new Error("Agent not found");
    }

    if (!agent.stripe_customer_id) {
      logStep("Agent has no Stripe customer, setting to basic");
      
      // Update agent to basic tier
      await supabaseClient
        .from('agents')
        .update({
          subscription_tier: 'basic',
          subscription_status: 'inactive',
          subscription_expires_at: null,
          ...TIER_CONFIG.basic,
        })
        .eq('id', agentId);

      return new Response(JSON.stringify({
        subscribed: false,
        tier: 'basic',
        subscription_end: null,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
      apiVersion: "2025-08-27.basil" 
    });

    // Get active subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: agent.stripe_customer_id,
      status: 'active',
      limit: 10,
    });

    let tier: keyof typeof TIER_CONFIG = 'basic';
    let subscriptionEnd: string | null = null;
    let subscriptionId: string | null = null;

    if (subscriptions.data.length > 0) {
      // Find the highest tier subscription
      for (const sub of subscriptions.data) {
        const productId = sub.items.data[0]?.price?.product as string;
        const subTier = PRODUCT_TIER_MAP[productId];
        
        if (subTier) {
          if (subTier === 'premium' || (subTier === 'preferred' && tier === 'basic')) {
            tier = subTier;
            subscriptionEnd = new Date(sub.current_period_end * 1000).toISOString();
            subscriptionId = sub.id;
          }
        }
      }
      logStep("Found active subscription", { tier, subscriptionEnd });
    } else {
      logStep("No active subscriptions found");
    }

    const tierConfig = TIER_CONFIG[tier];

    // Update agent with subscription status
    const { error: updateError } = await supabaseClient
      .from('agents')
      .update({
        subscription_tier: tier,
        subscription_status: tier === 'basic' ? 'inactive' : 'active',
        subscription_expires_at: subscriptionEnd,
        stripe_subscription_id: subscriptionId,
        max_listings: tierConfig.max_listings,
        featured_listings_remaining: tierConfig.featured_listings,
        show_direct_contact: tierConfig.show_direct_contact,
        priority_ranking: tierConfig.priority_ranking,
      })
      .eq('id', agentId);

    if (updateError) {
      logStep("Error updating agent", { error: updateError.message });
    } else {
      logStep("Agent updated successfully", { tier });
    }

    return new Response(JSON.stringify({
      subscribed: tier !== 'basic',
      tier,
      subscription_end: subscriptionEnd,
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
