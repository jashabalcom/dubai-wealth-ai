import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TrialEndingRequest {
  email: string;
  name: string;
  tier: "investor" | "elite";
  daysRemaining: number;
  trialEndDate: string;
  siteUrl?: string;
}

const getEmailHtml = (name: string, tier: string, daysRemaining: number, trialEndDate: string, siteUrl: string) => {
  const isElite = tier === "elite";
  const tierName = isElite ? "Dubai Elite" : "Dubai Investor";
  const price = isElite ? "$97" : "$29";
  
  const eliteFeatures = isElite ? `
    <p style="color: #EAE8E3; font-size: 15px; margin: 0 0 10px 0; opacity: 0.9;">❌ Golden Visa Wizard</p>
    <p style="color: #EAE8E3; font-size: 15px; margin: 0 0 10px 0; opacity: 0.9;">❌ AI Investment Blueprint</p>
    <p style="color: #EAE8E3; font-size: 15px; margin: 0 0 10px 0; opacity: 0.9;">❌ Portfolio tracking dashboard</p>
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
    
    <!-- Urgency Banner -->
    <div style="background-color: rgba(239, 68, 68, 0.15); border-radius: 8px; padding: 12px 20px; margin: 24px 0; text-align: center; border: 1px solid rgba(239, 68, 68, 0.3);">
      <p style="color: #FCA5A5; font-size: 16px; font-weight: 600; margin: 0;">⏰ ${daysRemaining} ${daysRemaining === 1 ? "day" : "days"} remaining</p>
    </div>
    
    <h1 style="color: #FFFFFF; font-size: 28px; font-weight: 700; text-align: center; margin: 0 0 24px 0;">${name}, your trial is ending soon</h1>
    
    <p style="color: #EAE8E3; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
      Your ${tierName} membership trial ends on <strong>${trialEndDate}</strong>. After this date, you will lose access to:
    </p>
    
    <!-- Features List -->
    <div style="background-color: #101010; border-radius: 12px; padding: 20px 24px; margin-bottom: 24px; border: 1px solid rgba(203, 184, 158, 0.15);">
      <p style="color: #EAE8E3; font-size: 15px; margin: 0 0 10px 0; opacity: 0.9;">❌ Academy courses and lessons</p>
      <p style="color: #EAE8E3; font-size: 15px; margin: 0 0 10px 0; opacity: 0.9;">❌ Investment calculators and AI analysis</p>
      <p style="color: #EAE8E3; font-size: 15px; margin: 0 0 10px 0; opacity: 0.9;">❌ Property search and saved favorites</p>
      <p style="color: #EAE8E3; font-size: 15px; margin: 0 0 10px 0; opacity: 0.9;">❌ Community access and connections</p>
      ${eliteFeatures}
    </div>
    
    <!-- CTA -->
    <div style="text-align: center; margin: 32px 0;">
      <p style="color: #EAE8E3; font-size: 18px; margin: 0 0 20px 0;">Continue for just <span style="color: #CBB89E; font-weight: 700;">${price}/month</span></p>
      <a href="${siteUrl}/settings" style="background-color: #CBB89E; color: #0A0F1D; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; text-decoration: none; display: inline-block;">Keep My Access →</a>
    </div>
    
    <!-- Reassurance -->
    <div style="background-color: rgba(203, 184, 158, 0.08); border-radius: 8px; padding: 16px 20px; margin-top: 24px;">
      <p style="color: #898989; font-size: 13px; line-height: 1.6; margin: 0; text-align: center;">
        💳 Your card will be charged automatically on ${trialEndDate} unless you cancel.<br /><br />
        🔒 Cancel anytime from your account settings. No questions asked.
      </p>
    </div>
    
    <p style="color: #898989; font-size: 14px; text-align: center; margin: 32px 0 0 0; line-height: 1.8;">
      Questions about your subscription? Reply to this email or contact <strong>support@dubaiwealthhub.com</strong>
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
    const { email, name, tier, daysRemaining, trialEndDate, siteUrl = "https://dubaiwealthhub.com" }: TrialEndingRequest = await req.json();
    
    console.log(`[TRIAL-ENDING-EMAIL] Sending to ${email}, ${daysRemaining} days remaining`);

    const html = getEmailHtml(name, tier, daysRemaining, trialEndDate, siteUrl);

    const subject = daysRemaining <= 1 
      ? `${name}, your trial ends tomorrow! Do not lose access`
      : `${name}, ${daysRemaining} days left in your trial`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Dubai Wealth Hub <onboarding@resend.dev>",
        to: [email],
        subject,
        html,
      }),
    });

    const emailResponse = await res.json();

    if (!res.ok) {
      console.error("[TRIAL-ENDING-EMAIL] Resend API error:", emailResponse);
      throw new Error(emailResponse.message || "Failed to send email");
    }

    console.log("[TRIAL-ENDING-EMAIL] Sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("[TRIAL-ENDING-EMAIL] Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
