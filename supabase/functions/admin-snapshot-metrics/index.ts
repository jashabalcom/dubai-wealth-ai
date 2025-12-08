import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ADMIN-SNAPSHOT-METRICS] ${step}${detailsStr}`);
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

    // For manual triggers, verify admin access
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
      if (userError || !userData.user) throw new Error("Authentication failed");

      const { data: isAdmin } = await supabaseClient
        .rpc('has_role', { _user_id: userData.user.id, _role: 'admin' });
      
      if (!isAdmin) throw new Error("Access denied - admin only");
      logStep("Admin verified");
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not configured");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Get subscription counts and MRR
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
          mrr += amount;
        }
      }
    }

    // Get user counts from profiles
    const { count: totalUsers } = await supabaseClient
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    const { count: freeCount } = await supabaseClient
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('membership_tier', 'free');

    // Get today's new signups
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: newSignupsToday } = await supabaseClient
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    // Get churn (canceled in last 24h)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const canceledSubs = await stripe.subscriptions.list({
      status: "canceled",
      created: { gte: Math.floor(yesterday.getTime() / 1000) },
      limit: 100,
    });

    // Get total revenue
    const allPayments = await stripe.paymentIntents.list({ limit: 100 });
    const totalRevenue = allPayments.data
      .filter((p: { status: string }) => p.status === "succeeded")
      .reduce((sum: number, p: { amount: number }) => sum + (p.amount / 100), 0);

    const snapshotDate = new Date().toISOString().split('T')[0];
    const arr = mrr * 12;

    logStep("Metrics calculated", { mrr, arr, investorCount, eliteCount, totalUsers });

    // Upsert the snapshot (update if exists for today, insert if not)
    const { error: upsertError } = await supabaseClient
      .from('admin_metrics_snapshots')
      .upsert({
        snapshot_date: snapshotDate,
        mrr,
        arr,
        total_users: totalUsers || 0,
        investor_count: investorCount,
        elite_count: eliteCount,
        free_count: freeCount || 0,
        total_revenue: totalRevenue,
        new_signups_today: newSignupsToday || 0,
        churn_count: canceledSubs.data.length,
      }, { onConflict: 'snapshot_date' });

    if (upsertError) {
      logStep("Error upserting snapshot", { error: upsertError.message });
      throw upsertError;
    }

    logStep("Snapshot saved successfully", { date: snapshotDate });

    return new Response(JSON.stringify({ 
      success: true, 
      snapshot_date: snapshotDate,
      mrr,
      arr,
      total_users: totalUsers,
      investor_count: investorCount,
      elite_count: eliteCount,
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
