import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[INVESTOR-METRICS] ${step}${detailsStr}`);
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
    logStep("Function started - Investor Metrics Aggregation");

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

    // ============ REVENUE METRICS ============
    logStep("Fetching Stripe data");

    const [activeSubscriptions, allSubscriptions, balanceTransactions] = await Promise.all([
      stripe.subscriptions.list({ status: "active", limit: 100, expand: ["data.items.data.price"] }),
      stripe.subscriptions.list({ limit: 100, expand: ["data.items.data.price"] }),
      stripe.balanceTransactions.list({ limit: 100, type: "charge" }),
    ]);

    // Calculate MRR breakdown
    let mrr = 0;
    let b2cRevenue = 0;
    let b2bRevenue = 0;
    let investorCount = 0;
    let eliteCount = 0;
    let agentBasicCount = 0;
    let agentPreferredCount = 0;
    let agentPremiumCount = 0;

    const INVESTOR_PRICE_ID = "price_1Sbv2KHVQx2jO318h20jYHWa";
    const ELITE_PRICE_ID = "price_1Sbv2UHVQx2jO318S54njLC4";
    // Agent price IDs (adjust based on actual Stripe prices)
    const AGENT_BASIC_ID = "price_agent_basic";
    const AGENT_PREFERRED_ID = "price_agent_preferred";
    const AGENT_PREMIUM_ID = "price_agent_premium";

    for (const sub of activeSubscriptions.data) {
      for (const item of sub.items.data) {
        const priceId = item.price.id;
        const amount = (item.price.unit_amount || 0) / 100;
        
        if (priceId === INVESTOR_PRICE_ID) {
          investorCount++;
          b2cRevenue += amount;
          mrr += amount;
        } else if (priceId === ELITE_PRICE_ID) {
          eliteCount++;
          b2cRevenue += amount;
          mrr += amount;
        } else if (priceId === AGENT_BASIC_ID) {
          agentBasicCount++;
          b2bRevenue += amount;
          mrr += amount;
        } else if (priceId === AGENT_PREFERRED_ID) {
          agentPreferredCount++;
          b2bRevenue += amount;
          mrr += amount;
        } else if (priceId === AGENT_PREMIUM_ID) {
          agentPremiumCount++;
          b2bRevenue += amount;
          mrr += amount;
        } else {
          mrr += amount;
        }
      }
    }

    // ============ CHURN & RETENTION ============
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const canceledSubs = await stripe.subscriptions.list({
      status: "canceled",
      created: { gte: Math.floor(thirtyDaysAgo.getTime() / 1000) },
      limit: 100,
    });

    const totalSubscribers = investorCount + eliteCount + agentBasicCount + agentPreferredCount + agentPremiumCount;
    const churnCount = canceledSubs.data.length;
    const churnRate = totalSubscribers > 0 ? (churnCount / totalSubscribers) * 100 : 0;
    const retentionRate = 100 - churnRate;

    // ============ UNIT ECONOMICS ============
    const arpu = totalSubscribers > 0 ? mrr / totalSubscribers : 0;
    const arr = mrr * 12;
    
    // LTV calculation: ARPU / Monthly Churn Rate (as decimal)
    const monthlyChurnRate = churnRate / 100;
    const ltv = monthlyChurnRate > 0 ? arpu / monthlyChurnRate : arpu * 36; // Default to 36 months if no churn
    
    // LTV:CAC ratio (CAC needs marketing data - estimate for now)
    // Fetch marketing spend from database
    const { data: marketingData } = await supabaseClient
      .from('marketing_campaigns')
      .select('ad_spend, conversions')
      .gte('date', thirtyDaysAgo.toISOString().split('T')[0]);
    
    const totalAdSpend = marketingData?.reduce((sum, m) => sum + (m.ad_spend || 0), 0) || 0;
    const totalConversions = marketingData?.reduce((sum, m) => sum + (m.conversions || 0), 0) || 1;
    const cac = totalConversions > 0 ? totalAdSpend / totalConversions : 0;
    const ltvCacRatio = cac > 0 ? ltv / cac : 0;

    // Payback period (months to recover CAC)
    const paybackMonths = arpu > 0 ? cac / arpu : 0;

    // ============ GROWTH METRICS ============
    // Get historical snapshots for growth calculation
    const { data: snapshots } = await supabaseClient
      .from('admin_metrics_snapshots')
      .select('*')
      .order('snapshot_date', { ascending: false })
      .limit(60);

    let mrrGrowthMoM = 0;
    let userGrowthMoM = 0;
    let revenueGrowthMoM = 0;

    if (snapshots && snapshots.length >= 2) {
      const latest = snapshots[0];
      const thirtyDaysSnapshot = snapshots.find(s => {
        const date = new Date(s.snapshot_date);
        return date <= thirtyDaysAgo;
      });

      if (thirtyDaysSnapshot) {
        mrrGrowthMoM = latest.mrr && thirtyDaysSnapshot.mrr 
          ? ((latest.mrr - thirtyDaysSnapshot.mrr) / thirtyDaysSnapshot.mrr) * 100 
          : 0;
        userGrowthMoM = latest.total_users && thirtyDaysSnapshot.total_users
          ? ((latest.total_users - thirtyDaysSnapshot.total_users) / thirtyDaysSnapshot.total_users) * 100
          : 0;
      }
    }

    // Calculate runway (if we have cash position data)
    // Assuming we track this, otherwise estimate from MRR
    const monthlyBurn = totalAdSpend; // Simplified - add more cost data as needed
    const netMRR = mrr - monthlyBurn;

    // ============ PRODUCT METRICS ============
    // Get platform engagement data
    const [
      { count: totalUsers },
      { count: totalProperties },
      { count: totalNeighborhoods },
      { count: totalLessons },
      { count: lessonsCompleted },
      { count: totalPosts },
      { count: aiQueriesCount },
    ] = await Promise.all([
      supabaseClient.from('profiles').select('*', { count: 'exact', head: true }),
      supabaseClient.from('properties').select('*', { count: 'exact', head: true }),
      supabaseClient.from('neighborhoods').select('*', { count: 'exact', head: true }),
      supabaseClient.from('lessons').select('*', { count: 'exact', head: true }),
      supabaseClient.from('lesson_progress').select('*', { count: 'exact', head: true }).eq('is_completed', true),
      supabaseClient.from('community_posts').select('*', { count: 'exact', head: true }),
      supabaseClient.from('ai_usage').select('*', { count: 'exact', head: true }),
    ]);

    // Weekly active users (users who logged in last 7 days)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const { count: wau } = await supabaseClient
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('last_sign_in_at', sevenDaysAgo.toISOString());

    // Monthly active users
    const { count: mau } = await supabaseClient
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('last_sign_in_at', thirtyDaysAgo.toISOString());

    // ============ COHORT ANALYSIS ============
    // Get user signups by month for cohort analysis
    const { data: cohortData } = await supabaseClient
      .from('profiles')
      .select('created_at, membership_tier')
      .order('created_at', { ascending: true });

    const cohorts: Record<string, { signups: number; conversions: number; retained: number }> = {};
    
    cohortData?.forEach(user => {
      const month = user.created_at.substring(0, 7); // YYYY-MM
      if (!cohorts[month]) {
        cohorts[month] = { signups: 0, conversions: 0, retained: 0 };
      }
      cohorts[month].signups++;
      if (user.membership_tier !== 'free') {
        cohorts[month].conversions++;
      }
    });

    // ============ REVENUE BREAKDOWN ============
    const revenueByTier = {
      investor: { count: investorCount, revenue: investorCount * 29 },
      elite: { count: eliteCount, revenue: eliteCount * 97 },
      agentBasic: { count: agentBasicCount, revenue: agentBasicCount * 99 },
      agentPreferred: { count: agentPreferredCount, revenue: agentPreferredCount * 199 },
      agentPremium: { count: agentPremiumCount, revenue: agentPremiumCount * 299 },
    };

    // Total all-time revenue from Stripe
    const allPayments = await stripe.paymentIntents.list({ limit: 100 });
    const totalRevenue = allPayments.data
      .filter((p: { status: string }) => p.status === "succeeded")
      .reduce((sum: number, p: { amount: number }) => sum + (p.amount / 100), 0);

    logStep("Investor metrics compiled successfully");

    const response = {
      // Revenue Metrics
      mrr,
      arr,
      totalRevenue,
      b2cRevenue,
      b2bRevenue,
      revenueByTier,
      
      // Unit Economics
      arpu,
      ltv,
      cac,
      ltvCacRatio,
      paybackMonths,
      
      // Churn & Retention
      churnRate,
      churnCount,
      retentionRate,
      
      // Growth Metrics
      mrrGrowthMoM,
      userGrowthMoM,
      revenueGrowthMoM,
      
      // Subscriber Breakdown
      totalSubscribers,
      investorCount,
      eliteCount,
      agentBasicCount,
      agentPreferredCount,
      agentPremiumCount,
      
      // Product Metrics
      totalUsers: totalUsers || 0,
      wau: wau || 0,
      mau: mau || 0,
      totalProperties: totalProperties || 0,
      totalNeighborhoods: totalNeighborhoods || 0,
      totalLessons: totalLessons || 0,
      lessonsCompleted: lessonsCompleted || 0,
      totalPosts: totalPosts || 0,
      aiQueriesCount: aiQueriesCount || 0,
      
      // Cohort Data
      cohorts,
      
      // Runway
      monthlyBurn,
      netMRR,
      
      // Timestamp
      generatedAt: new Date().toISOString(),
    };

    return new Response(JSON.stringify(response), {
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
