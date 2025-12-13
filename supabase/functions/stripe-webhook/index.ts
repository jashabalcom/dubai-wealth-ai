import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

// Map Stripe price IDs to membership tiers
const PRICE_TO_TIER: Record<string, 'investor' | 'elite'> = {
  'price_1RVxhnKSaqiJptMK97zzpD1y': 'investor',
  'price_1RVxhxKSaqiJptMKcWAPF2BM': 'elite',
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature || !endpointSecret) {
      logStep("Missing signature or endpoint secret");
      return new Response(JSON.stringify({ error: "Missing signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err) {
      logStep("Webhook signature verification failed", { error: err instanceof Error ? err.message : err });
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    logStep("Event received", { type: event.type, id: event.id });

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = typeof subscription.customer === 'string' 
          ? subscription.customer 
          : subscription.customer.id;

        const { data: profile } = await supabase
          .from("profiles")
          .select("id, email, full_name")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();

        if (profile) {
          const priceId = subscription.items.data[0]?.price?.id;
          const tier = priceId ? PRICE_TO_TIER[priceId] || 'investor' : 'investor';

          let membershipStatus: 'active' | 'trialing' | 'past_due' | 'cancelled' = 'active';
          if (subscription.status === 'trialing') membershipStatus = 'trialing';
          else if (subscription.status === 'past_due') membershipStatus = 'past_due';
          else if (subscription.status === 'canceled' || subscription.status === 'unpaid') membershipStatus = 'cancelled';

          await supabase
            .from("profiles")
            .update({
              membership_tier: tier,
              membership_status: membershipStatus,
              membership_renews_at: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq("id", profile.id);

          logStep("Profile updated", { userId: profile.id, tier, status: membershipStatus });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = typeof subscription.customer === 'string' 
          ? subscription.customer 
          : subscription.customer.id;

        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();

        if (profile) {
          await supabase
            .from("profiles")
            .update({
              membership_tier: 'free',
              membership_status: 'cancelled',
              membership_renews_at: null,
            })
            .eq("id", profile.id);

          logStep("Profile downgraded", { userId: profile.id });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = typeof invoice.customer === 'string' 
          ? invoice.customer 
          : invoice.customer?.id;

        if (customerId) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, email, full_name, membership_tier")
            .eq("stripe_customer_id", customerId)
            .maybeSingle();

          if (profile) {
            await supabase
              .from("profiles")
              .update({ membership_status: 'past_due' })
              .eq("id", profile.id);

            if (profile.email) {
              const tier = profile.membership_tier as 'investor' | 'elite';
              const amount = tier === 'elite' ? '$97' : '$29';

              await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-payment-failed-email`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
                },
                body: JSON.stringify({
                  email: profile.email,
                  name: profile.full_name || "Member",
                  tier,
                  amount,
                }),
              });
              logStep("Payment failed email sent", { email: profile.email });
            }
          }
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = typeof invoice.customer === 'string' 
          ? invoice.customer 
          : invoice.customer?.id;

        if (customerId) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, membership_status")
            .eq("stripe_customer_id", customerId)
            .maybeSingle();

          if (profile && profile.membership_status === 'past_due') {
            await supabase
              .from("profiles")
              .update({ membership_status: 'active' })
              .eq("id", profile.id);
            
            logStep("Profile status restored to active", { userId: profile.id });
          }
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
