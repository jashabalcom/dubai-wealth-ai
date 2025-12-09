import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[AGENT-CHECKOUT] ${step}${detailsStr}`);
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
    
    const { agentId, priceId, tier } = await req.json();
    logStep("Received request", { agentId, priceId, tier });

    if (!agentId || !priceId || !tier) {
      throw new Error("Missing required parameters: agentId, priceId, tier");
    }

    // Verify admin is making the request
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;
    
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    // Check if user is admin
    const { data: roleData } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      throw new Error("Only admins can create agent subscriptions");
    }
    logStep("Admin verified");

    // Get agent details
    const { data: agent, error: agentError } = await supabaseClient
      .from('agents')
      .select('id, email, full_name, stripe_customer_id')
      .eq('id', agentId)
      .single();

    if (agentError || !agent) {
      throw new Error("Agent not found");
    }

    if (!agent.email) {
      throw new Error("Agent must have an email address for billing");
    }
    logStep("Agent found", { agentId: agent.id, email: agent.email });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
      apiVersion: "2025-08-27.basil" 
    });

    // Check if agent already has a Stripe customer
    let customerId = agent.stripe_customer_id;
    
    if (!customerId) {
      // Check if customer exists by email
      const customers = await stripe.customers.list({ email: agent.email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        logStep("Found existing customer by email", { customerId });
      }
    } else {
      logStep("Using existing customer", { customerId });
    }

    const origin = req.headers.get("origin") || "https://bswllmynuxkhekqqeznr.lovable.app";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : agent.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/admin/agents?subscription_success=true&agent_id=${agentId}`,
      cancel_url: `${origin}/admin/agents?subscription_canceled=true`,
      metadata: {
        agent_id: agentId,
        tier: tier,
        admin_user_id: user.id,
      },
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

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
