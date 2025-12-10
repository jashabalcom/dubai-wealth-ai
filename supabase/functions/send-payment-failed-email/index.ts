import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentFailedRequest {
  email: string;
  name: string;
  tier: "investor" | "elite";
  amount: string;
  retryDate?: string;
  siteUrl?: string;
}

const getEmailHtml = (name: string, tier: string, amount: string, retryDate: string | undefined, siteUrl: string) => {
  const isElite = tier === "elite";
  const tierName = isElite ? "Dubai Elite" : "Dubai Investor";
  
  const retrySection = retryDate ? `
    <div style="background-color: rgba(203, 184, 158, 0.08); border-radius: 8px; padding: 16px 20px; margin-bottom: 24px;">
      <p style="color: #EAE8E3; font-size: 14px; line-height: 1.6; margin: 0; text-align: center;">
        We will automatically retry your payment on <strong>${retryDate}</strong>. Please update your payment method before then to avoid service interruption.
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
      <p style="color: #CBB89E; font-size: 24px; font-weight: 700; margin: 0;">Dubai Wealth Hub</p>
    </div>
    
    <!-- Warning Banner -->
    <div style="background-color: rgba(245, 158, 11, 0.15); border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center; border: 1px solid rgba(245, 158, 11, 0.3);">
      <p style="font-size: 32px; margin: 0 0 8px 0;">⚠️</p>
      <p style="color: #FCD34D; font-size: 16px; font-weight: 600; margin: 0;">Payment Issue</p>
    </div>
    
    <h1 style="color: #FFFFFF; font-size: 26px; font-weight: 700; text-align: center; margin: 0 0 16px 0;">${name}, we could not process your payment</h1>
    
    <p style="color: #EAE8E3; font-size: 16px; line-height: 1.6; text-align: center; margin: 0 0 24px 0;">
      We tried to charge your card for your ${tierName} membership (${amount}/month), but the payment was unsuccessful.
    </p>
    
    <!-- Reasons Card -->
    <div style="background-color: #101010; border-radius: 12px; padding: 20px 24px; margin-bottom: 24px; border: 1px solid rgba(203, 184, 158, 0.15);">
      <p style="color: #FFFFFF; font-size: 15px; font-weight: 600; margin: 0 0 12px 0;">Common reasons this happens:</p>
      <p style="color: #898989; font-size: 14px; margin: 0 0 6px 0;">• Expired or cancelled card</p>
      <p style="color: #898989; font-size: 14px; margin: 0 0 6px 0;">• Insufficient funds</p>
      <p style="color: #898989; font-size: 14px; margin: 0 0 6px 0;">• Card issuer declined the transaction</p>
      <p style="color: #898989; font-size: 14px; margin: 0;">• Outdated billing information</p>
    </div>
    
    <!-- CTA -->
    <div style="text-align: center; margin: 32px 0;">
      <p style="color: #EAE8E3; font-size: 15px; margin: 0 0 16px 0;">Please update your payment method to avoid losing access:</p>
      <a href="${siteUrl}/settings" style="background-color: #CBB89E; color: #0A0F1D; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; text-decoration: none; display: inline-block;">Update Payment Method →</a>
    </div>
    
    ${retrySection}
    
    <!-- Urgency Section -->
    <div style="background-color: rgba(239, 68, 68, 0.08); border-radius: 12px; padding: 20px 24px; margin-bottom: 24px; border: 1px solid rgba(239, 68, 68, 0.2);">
      <p style="color: #FCA5A5; font-size: 15px; font-weight: 600; margin: 0 0 12px 0;">What happens if I do not update?</p>
      <p style="color: #EAE8E3; font-size: 14px; margin: 0 0 12px 0;">After 3 failed payment attempts, your subscription will be cancelled and you will lose access to:</p>
      <p style="color: #898989; font-size: 13px; margin: 0 0 4px 0;">• Academy courses and video lessons</p>
      <p style="color: #898989; font-size: 13px; margin: 0 0 4px 0;">• Investment calculators and AI tools</p>
      <p style="color: #898989; font-size: 13px; margin: 0 0 4px 0;">• Community access and connections</p>
      <p style="color: #898989; font-size: 13px; margin: 0;">• Saved properties and portfolio</p>
    </div>
    
    <p style="color: #898989; font-size: 14px; margin: 0; text-align: center;">
      Need help? Reply to this email or contact us at <a href="mailto:support@dubaiwealthhub.com" style="color: #CBB89E; text-decoration: underline;">support@dubaiwealthhub.com</a>
    </p>
    
    <!-- Footer -->
    <div style="padding-top: 32px; border-top: 1px solid rgba(203, 184, 158, 0.2); margin-top: 32px;">
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
    const { email, name, tier, amount, retryDate, siteUrl = "https://dubaiwealthhub.com" }: PaymentFailedRequest = await req.json();
    
    console.log(`[PAYMENT-FAILED-EMAIL] Sending to ${email}`);

    const html = getEmailHtml(name, tier, amount, retryDate, siteUrl);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Dubai Wealth Hub <billing@dubaiwealthhub.com>",
        to: [email],
        subject: "Action needed: Payment failed for your subscription",
        html,
      }),
    });

    const emailResponse = await res.json();

    if (!res.ok) {
      console.error("[PAYMENT-FAILED-EMAIL] Resend API error:", emailResponse);
      throw new Error(emailResponse.message || "Failed to send email");
    }

    console.log("[PAYMENT-FAILED-EMAIL] Sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("[PAYMENT-FAILED-EMAIL] Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
