import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SITE_URL = Deno.env.get("SITE_URL") || "https://dubairealestateinvestor.com";
const SITE_NAME = "Dubai Real Estate Investor";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GettingStartedRequest {
  email: string;
  name: string;
  tier: "investor" | "elite";
  siteUrl?: string;
}

const getEmailHtml = (name: string, tier: string, siteUrl: string) => {
  const isElite = tier === "elite";
  
  const eliteFeatures = isElite ? `
    <div style="background-color: rgba(203, 184, 158, 0.1); border-radius: 12px; padding: 24px; margin-top: 24px; border: 1px solid rgba(203, 184, 158, 0.3);">
      <p style="color: #CBB89E; font-size: 18px; font-weight: 600; margin: 0 0 8px 0;">🌟 Your Elite Features</p>
      <p style="color: #EAE8E3; font-size: 14px; margin: 0 0 12px 0;">Do not forget to explore your exclusive Elite tools:</p>
      <p style="color: #EAE8E3; font-size: 14px; line-height: 2; margin: 0;">
        • <strong>Golden Visa Wizard</strong> - AI-powered visa guidance<br />
        • <strong>AI Investment Blueprint</strong> - Personalized strategy<br />
        • <strong>Portfolio Dashboard</strong> - Track your investments<br />
        • <strong>Elite Deal Room</strong> - Exclusive community access
      </p>
    </div>
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
      <p style="color: #CBB89E; font-size: 24px; font-weight: 700; margin: 0;">${SITE_NAME}</p>
    </div>
    
    <!-- Content -->
    <h1 style="color: #FFFFFF; font-size: 28px; font-weight: 700; text-align: center; margin: 24px 0;">Welcome, ${name}! 🎉</h1>
    
    <p style="color: #EAE8E3; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
      You have just joined an exclusive community of smart investors building wealth through Dubai real estate.
      ${isElite ? " As an Elite member, you have access to our most powerful tools and insights." : ""}
    </p>
    
    <p style="color: #CBB89E; font-size: 18px; font-weight: 600; margin: 0 0 20px 0;">Here are 3 things to do in your first 10 minutes:</p>
    
    <!-- Card 1 -->
    <div style="background-color: #101010; border-radius: 12px; padding: 24px; margin-bottom: 16px; border: 1px solid rgba(203, 184, 158, 0.15);">
      <p style="font-size: 32px; margin: 0 0 12px 0;">👤</p>
      <p style="color: #FFFFFF; font-size: 18px; font-weight: 600; margin: 0 0 8px 0;">1. Complete Your Investor Profile</p>
      <p style="color: #EAE8E3; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0; opacity: 0.8;">Tell us about your investment goals, budget, and timeline. This helps us personalize your experience.</p>
      <a href="${siteUrl}/profile" style="background-color: #CBB89E; color: #0A0F1D; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; text-decoration: none; display: inline-block;">Complete Profile →</a>
    </div>
    
    <!-- Card 2 -->
    <div style="background-color: #101010; border-radius: 12px; padding: 24px; margin-bottom: 16px; border: 1px solid rgba(203, 184, 158, 0.15);">
      <p style="font-size: 32px; margin: 0 0 12px 0;">🧮</p>
      <p style="color: #FFFFFF; font-size: 18px; font-weight: 600; margin: 0 0 8px 0;">2. Try the ROI Calculator</p>
      <p style="color: #EAE8E3; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0; opacity: 0.8;">Run the numbers on any Dubai property. See projected returns and cash flow analysis.</p>
      <a href="${siteUrl}/tools/roi" style="background-color: #CBB89E; color: #0A0F1D; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; text-decoration: none; display: inline-block;">Calculate ROI →</a>
    </div>
    
    <!-- Card 3 -->
    <div style="background-color: #101010; border-radius: 12px; padding: 24px; margin-bottom: 16px; border: 1px solid rgba(203, 184, 158, 0.15);">
      <p style="font-size: 32px; margin: 0 0 12px 0;">🏠</p>
      <p style="color: #FFFFFF; font-size: 18px; font-weight: 600; margin: 0 0 8px 0;">3. Browse Properties in Your Budget</p>
      <p style="color: #EAE8E3; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0; opacity: 0.8;">Explore curated listings across Dubai top investment areas.</p>
      <a href="${siteUrl}/properties" style="background-color: #CBB89E; color: #0A0F1D; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; text-decoration: none; display: inline-block;">Browse Properties →</a>
    </div>
    
    ${eliteFeatures}
    
    <!-- CTA -->
    <div style="text-align: center; margin: 32px 0;">
      <a href="${siteUrl}/dashboard" style="background-color: #CBB89E; color: #0A0F1D; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; text-decoration: none; display: inline-block;">Go to Dashboard →</a>
    </div>
    
    <p style="color: #EAE8E3; font-size: 14px; text-align: center; margin: 32px 0 0 0; line-height: 1.8;">
      Happy investing!<br /><strong>The ${SITE_NAME} Team</strong>
    </p>
    
    <!-- Footer -->
    <div style="padding-top: 32px; border-top: 1px solid rgba(203, 184, 158, 0.2); margin-top: 32px;">
      <p style="color: #898989; font-size: 12px; text-align: center; margin: 0 0 16px 0;">
        Questions? Contact <a href="mailto:support@dubairealestateinvestor.com" style="color: #898989; text-decoration: underline;">support@dubairealestateinvestor.com</a>
      </p>
      <p style="color: #666666; font-size: 11px; text-align: center; margin: 0;">© ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.</p>
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
    const { email, name, tier, siteUrl = SITE_URL }: GettingStartedRequest = await req.json();
    
    console.log(`[GETTING-STARTED-EMAIL] Sending to ${email}`);

    const html = getEmailHtml(name, tier, siteUrl);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `${SITE_NAME} <hello@dubairealestateinvestor.com>`,
        to: [email],
        subject: `Welcome to ${SITE_NAME}, ${name}! Here is how to get started`,
        html,
      }),
    });

    const emailResponse = await res.json();

    if (!res.ok) {
      console.error("[GETTING-STARTED-EMAIL] Resend API error:", emailResponse);
      throw new Error(emailResponse.message || "Failed to send email");
    }

    console.log("[GETTING-STARTED-EMAIL] Sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("[GETTING-STARTED-EMAIL] Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
