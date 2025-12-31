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

// Map Stripe price IDs to membership tiers - Dubai REI products
const PRICE_TO_TIER: Record<string, { tier: 'investor' | 'elite' | 'private'; period: 'monthly' | 'annual'; amount: number }> = {
  // Investor tier
  'price_1SkXRkHw4VrnO885MoTLD6iC': { tier: 'investor', period: 'monthly', amount: 29 },
  'price_1SkXRwHw4VrnO885DWKPmskP': { tier: 'investor', period: 'annual', amount: 290 },
  // Elite tier
  'price_1SkXS8Hw4VrnO885hyP39hIh': { tier: 'elite', period: 'monthly', amount: 97 },
  'price_1SkXSKHw4VrnO885KvdKUvGE': { tier: 'elite', period: 'annual', amount: 970 },
  // Private tier
  'price_1SkXSWHw4VrnO885DzNEfjAu': { tier: 'private', period: 'monthly', amount: 149 },
  'price_1SkXShHw4VrnO885j5BkoDu4': { tier: 'private', period: 'annual', amount: 1500 },
};

// Helper to send admin notification
async function sendAdminNotification(type: 'new_subscription' | 'cancellation' | 'payment_failed', details: {
  email: string;
  name?: string;
  tier?: string;
  amount?: number;
}) {
  const adminEmail = Deno.env.get("ADMIN_INQUIRY_EMAIL");
  const resendKey = Deno.env.get("RESEND_API_KEY");
  
  if (!adminEmail || !resendKey) {
    logStep("Admin notification skipped - missing config", { adminEmail: !!adminEmail, resendKey: !!resendKey });
    return;
  }

  let subject = '';
  let body = '';
  
  switch (type) {
    case 'new_subscription':
      subject = `🎉 New Subscriber: ${details.tier} - ${details.email}`;
      body = `
        <h2>New Subscription!</h2>
        <p><strong>Email:</strong> ${details.email}</p>
        <p><strong>Name:</strong> ${details.name || 'Not provided'}</p>
        <p><strong>Tier:</strong> ${details.tier}</p>
        <p><strong>Amount:</strong> $${details.amount}</p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
      `;
      break;
    case 'cancellation':
      subject = `⚠️ Cancellation: ${details.tier} - ${details.email}`;
      body = `
        <h2>Subscription Cancelled</h2>
        <p><strong>Email:</strong> ${details.email}</p>
        <p><strong>Name:</strong> ${details.name || 'Not provided'}</p>
        <p><strong>Previous Tier:</strong> ${details.tier}</p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
      `;
      break;
    case 'payment_failed':
      subject = `🚨 Payment Failed: ${details.email}`;
      body = `
        <h2>Payment Failed</h2>
        <p><strong>Email:</strong> ${details.email}</p>
        <p><strong>Name:</strong> ${details.name || 'Not provided'}</p>
        <p><strong>Tier:</strong> ${details.tier}</p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
      `;
      break;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: "Dubai Wealth Hub <notifications@dubairealestateinvestor.com>",
        to: [adminEmail],
        subject,
        html: body,
      }),
    });
    
    if (res.ok) {
      logStep("Admin notification sent", { type, email: details.email });
    } else {
      const err = await res.text();
      logStep("Admin notification failed", { error: err });
    }
  } catch (error) {
    logStep("Admin notification error", { error: String(error) });
  }
}

// Helper to send subscription confirmation email
async function sendConfirmationEmail(profile: { email: string; full_name?: string }, tierInfo: { tier: string; amount: number; period: string }, nextBillingDate: string) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  
  if (!supabaseUrl || !anonKey || !profile.email) return;

  const amountDisplay = tierInfo.period === 'annual' 
    ? `$${tierInfo.amount}/year` 
    : `$${tierInfo.amount}/month`;

  try {
    await fetch(`${supabaseUrl}/functions/v1/send-subscription-confirmed-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify({
        email: profile.email,
        name: profile.full_name || "Member",
        tier: tierInfo.tier,
        amount: amountDisplay,
        nextBillingDate,
      }),
    });
    logStep("Confirmation email sent", { email: profile.email });
  } catch (error) {
    logStep("Confirmation email error", { error: String(error) });
  }
}

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
      logStep("Missing signature or endpoint secret", { hasSignature: !!signature, hasSecret: !!endpointSecret });
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
          const tierInfo = priceId ? PRICE_TO_TIER[priceId] : null;
          const tier = tierInfo?.tier || 'investor';

          let membershipStatus: 'active' | 'trialing' | 'past_due' | 'cancelled' = 'active';
          if (subscription.status === 'trialing') membershipStatus = 'trialing';
          else if (subscription.status === 'past_due') membershipStatus = 'past_due';
          else if (subscription.status === 'canceled' || subscription.status === 'unpaid') membershipStatus = 'cancelled';

          const renewsAt = new Date(subscription.current_period_end * 1000).toISOString();

          await supabase
            .from("profiles")
            .update({
              membership_tier: tier,
              membership_status: membershipStatus,
              membership_renews_at: renewsAt,
            })
            .eq("id", profile.id);

          logStep("Profile updated", { userId: profile.id, tier, status: membershipStatus, priceId });

          // Send confirmation email for new subscriptions or when status becomes active
          if (event.type === "customer.subscription.created" || 
              (event.type === "customer.subscription.updated" && subscription.status === 'active')) {
            const nextBillingDate = new Date(subscription.current_period_end * 1000).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
            
            if (tierInfo && profile.email) {
              await sendConfirmationEmail(
                { email: profile.email, full_name: profile.full_name },
                { tier: tierInfo.tier, amount: tierInfo.amount, period: tierInfo.period },
                nextBillingDate
              );
            }
          }

          // Send admin notification for new subscriptions
          if (event.type === "customer.subscription.created" && tierInfo && profile.email) {
            await sendAdminNotification('new_subscription', {
              email: profile.email,
              name: profile.full_name,
              tier: tierInfo.tier,
              amount: tierInfo.amount,
            });
          }
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
          .select("id, email, full_name, membership_tier")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();

        if (profile) {
          const previousTier = profile.membership_tier;
          
          await supabase
            .from("profiles")
            .update({
              membership_tier: 'free',
              membership_status: 'cancelled',
              membership_renews_at: null,
            })
            .eq("id", profile.id);

          logStep("Profile downgraded", { userId: profile.id });

          // Send admin notification for cancellation
          if (profile.email) {
            await sendAdminNotification('cancellation', {
              email: profile.email,
              name: profile.full_name,
              tier: previousTier,
            });
          }
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
              const tier = profile.membership_tier as 'investor' | 'elite' | 'private';
              const amount = tier === 'private' ? '$149' : tier === 'elite' ? '$97' : '$29';

              // Send user notification
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

              // Send admin notification
              await sendAdminNotification('payment_failed', {
                email: profile.email,
                name: profile.full_name,
                tier,
              });
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
