import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ADMIN-REVENUE-STATS] ${step}${detailsStr}`);
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

    // Verify admin access
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Authentication failed");

    // Check admin role
    const { data: isAdmin } = await supabaseClient
      .rpc('has_role', { _user_id: userData.user.id, _role: 'admin' });
    
    if (!isAdmin) throw new Error("Access denied - admin only");
    logStep("Admin verified", { userId: userData.user.id });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not configured");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Get all active subscriptions for MRR calculation
    logStep("Fetching active subscriptions");
    const subscriptions = await stripe.subscriptions.list({
      status: "active",
      limit: 100,
      expand: ["data.items.data.price"],
    });

    let mrr = 0;
    let investorCount = 0;
    let eliteCount = 0;

    const INVESTOR_PRICE_ID = "price_1Sbv2KHVQx2jO318h20jYHWa";
    const ELITE_PRICE_ID = "price_1Sbv2UHVQx2jO318S54njLC4";

    for (const sub of subscriptions.data) {
      for (const item of sub.items.data) {
        const priceId = item.price.id;
        const amount = (item.price.unit_amount || 0) / 100;
        
        if (priceId === INVESTOR_PRICE_ID) {
          investorCount++;
          mrr += amount;
        } else if (priceId === ELITE_PRICE_ID) {
          eliteCount++;
          mrr += amount;
        } else {
          // Other subscriptions
          mrr += amount;
        }
      }
    }
    logStep("MRR calculated", { mrr, investorCount, eliteCount });

    // Get recent payments for total revenue
    logStep("Fetching recent payments");
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const payments = await stripe.paymentIntents.list({
      created: { gte: Math.floor(thirtyDaysAgo.getTime() / 1000) },
      limit: 100,
    });

    const recentRevenue = payments.data
      .filter((p: { status: string }) => p.status === "succeeded")
      .reduce((sum: number, p: { amount: number }) => sum + (p.amount / 100), 0);

    // Get all-time revenue
    const allPayments = await stripe.paymentIntents.list({
      limit: 100,
    });
    const totalRevenue = allPayments.data
      .filter((p: { status: string }) => p.status === "succeeded")
      .reduce((sum: number, p: { amount: number }) => sum + (p.amount / 100), 0);

    // Get canceled subscriptions (churn) in last 30 days
    const canceledSubs = await stripe.subscriptions.list({
      status: "canceled",
      created: { gte: Math.floor(thirtyDaysAgo.getTime() / 1000) },
      limit: 100,
    });
    const churnCount = canceledSubs.data.length;

    // Calculate metrics
    const totalSubscribers = investorCount + eliteCount;
    const arr = mrr * 12;
    const arpu = totalSubscribers > 0 ? mrr / totalSubscribers : 0;
    const churnRate = totalSubscribers > 0 ? (churnCount / totalSubscribers) * 100 : 0;
    const ltv = churnRate > 0 ? arpu / (churnRate / 100) : arpu * 12;

    // Get recent invoices for activity feed
    const recentInvoices = await stripe.invoices.list({
      limit: 10,
      status: "paid",
    });

    const recentPayments = recentInvoices.data.map((inv: { id: string; customer_email: string | null; amount_paid: number | null; currency: string | null; created: number }) => ({
      id: inv.id,
      customer_email: inv.customer_email,
      amount: (inv.amount_paid || 0) / 100,
      currency: inv.currency?.toUpperCase() || "USD",
      created: inv.created,
    }));

    logStep("Stats compiled successfully");

    return new Response(JSON.stringify({
      mrr,
      arr,
      totalRevenue,
      recentRevenue,
      arpu,
      ltv,
      churnRate,
      churnCount,
      investorCount,
      eliteCount,
      totalSubscribers,
      recentPayments,
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
