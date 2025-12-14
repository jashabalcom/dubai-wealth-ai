import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubscriptionConfirmedRequest {
  email: string;
  name: string;
  tier: "investor" | "elite";
  amount: string;
  nextBillingDate: string;
  siteUrl?: string;
}

const getEmailHtml = (name: string, tier: string, amount: string, nextBillingDate: string, siteUrl: string) => {
  const isElite = tier === "elite";
  const tierName = isElite ? "Dubai Elite" : "Dubai Investor";
  
  const eliteLink = isElite ? `
    <p style="color: #EAE8E3; font-size: 15px; margin: 0 0 12px 0;">🌟 <a href="${siteUrl}/golden-visa" style="color: #CBB89E; text-decoration: underline;">Golden Visa Wizard</a></p>
  ` : "";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="background-color: #0A0F1D; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0;">
  <div style="margin: 0 auto; padding: 40px 20px; max-width: 600px;">
    
    <!-- Header -->
    <div style="text-align: center; padding-bottom: 32px; border-bottom: 1px solid rgba(203, 184, 158, 0.2);">
      <p style="color: #CBB89E; font-size: 24px; font-weight: 700; margin: 0;">Dubai Wealth Hub</p>
    </div>
    
    <!-- Success Banner -->
    <div style="background-color: rgba(34, 197, 94, 0.15); border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center; border: 1px solid rgba(34, 197, 94, 0.3);">
      <p style="font-size: 32px; color: #22C55E; margin: 0 0 8px 0;">✓</p>
      <p style="color: #86EFAC; font-size: 16px; font-weight: 600; margin: 0;">Payment Successful</p>
    </div>
    
    <h1 style="color: #FFFFFF; font-size: 28px; font-weight: 700; text-align: center; margin: 0 0 16px 0;">Welcome to ${tierName}, ${name}!</h1>
    
    <p style="color: #EAE8E3; font-size: 16px; line-height: 1.6; text-align: center; margin: 0 0 32px 0;">
      Thank you for your subscription. You now have full access to all ${isElite ? "Elite" : "Investor"} features.
    </p>
    
    <!-- Receipt Card -->
    <div style="background-color: #101010; border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid rgba(203, 184, 158, 0.15);">
      <p style="color: #FFFFFF; font-size: 16px; font-weight: 600; margin: 0 0 16px 0;">Receipt Summary</p>
      <hr style="border-color: rgba(203, 184, 158, 0.15); margin: 16px 0;" />
      
      <p style="color: #898989; font-size: 14px; margin: 0 0 4px 0;">Plan</p>
      <p style="color: #FFFFFF; font-size: 15px; font-weight: 500; margin: 0 0 12px 0;">${tierName} Membership</p>
      
      <p style="color: #898989; font-size: 14px; margin: 0 0 4px 0;">Amount</p>
      <p style="color: #FFFFFF; font-size: 15px; font-weight: 500; margin: 0 0 12px 0;">${amount}/month</p>
      
      <p style="color: #898989; font-size: 14px; margin: 0 0 4px 0;">Next billing date</p>
      <p style="color: #FFFFFF; font-size: 15px; font-weight: 500; margin: 0;">${nextBillingDate}</p>
    </div>
    
    <!-- Quick Links -->
    <div style="margin-bottom: 24px;">
      <p style="color: #CBB89E; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px 0;">Quick Links</p>
      <p style="color: #EAE8E3; font-size: 15px; margin: 0 0 12px 0;">📚 <a href="${siteUrl}/academy" style="color: #CBB89E; text-decoration: underline;">Browse Academy Courses</a></p>
      <p style="color: #EAE8E3; font-size: 15px; margin: 0 0 12px 0;">🧮 <a href="${siteUrl}/tools" style="color: #CBB89E; text-decoration: underline;">Investment Calculators</a></p>
      <p style="color: #EAE8E3; font-size: 15px; margin: 0 0 12px 0;">🏠 <a href="${siteUrl}/properties" style="color: #CBB89E; text-decoration: underline;">Browse Properties</a></p>
      <p style="color: #EAE8E3; font-size: 15px; margin: 0 0 12px 0;">💬 <a href="${siteUrl}/community" style="color: #CBB89E; text-decoration: underline;">Join the Community</a></p>
      ${eliteLink}
    </div>
    
    <!-- CTA -->
    <div style="text-align: center; margin: 32px 0;">
      <a href="${siteUrl}/dashboard" style="background-color: #CBB89E; color: #0A0F1D; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; text-decoration: none; display: inline-block;">Go to Dashboard →</a>
    </div>
    
    <p style="color: #898989; font-size: 13px; margin: 0; text-align: center;">
      Manage your subscription anytime from your <a href="${siteUrl}/settings" style="color: #CBB89E; text-decoration: underline;">account settings</a>.
    </p>
    
    <!-- Footer -->
    <div style="padding-top: 32px; border-top: 1px solid rgba(203, 184, 158, 0.2); margin-top: 32px;">
      <p style="color: #898989; font-size: 12px; text-align: center; margin: 0 0 16px 0;">
        <a href="mailto:support@dubaiwealthhub.com" style="color: #898989; text-decoration: underline;">support@dubaiwealthhub.com</a>
      </p>
      <p style="color: #666666; font-size: 11px; text-align: center; margin: 0;">© ${new Date().getFullYear()} Dubai Wealth Hub. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, tier, amount, nextBillingDate, siteUrl = "https://dubaiwealthhub.com" }: SubscriptionConfirmedRequest = await req.json();
    
    console.log(`[SUBSCRIPTION-CONFIRMED-EMAIL] Sending to ${email}`);

    const html = getEmailHtml(name, tier, amount, nextBillingDate, siteUrl);

    const tierName = tier === "elite" ? "Dubai Elite" : "Dubai Investor";

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Dubai Wealth Hub <subscriptions@dubairealestateinvestor.com>",
        to: [email],
        subject: `Welcome to ${tierName}! Your subscription is confirmed`,
        html,
      }),
    });

    const emailResponse = await res.json();

    if (!res.ok) {
      console.error("[SUBSCRIPTION-CONFIRMED-EMAIL] Resend API error:", emailResponse);
      throw new Error(emailResponse.message || "Failed to send email");
    }

    console.log("[SUBSCRIPTION-CONFIRMED-EMAIL] Sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("[SUBSCRIPTION-CONFIRMED-EMAIL] Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
