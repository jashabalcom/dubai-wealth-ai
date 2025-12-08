import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name }: WelcomeEmailRequest = await req.json();

    console.log(`Sending welcome email to: ${email}`);

    const firstName = name?.split(" ")[0] || "Investor";

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #0A0F1D; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0A0F1D; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #101010; border-radius: 16px; overflow: hidden;">
                
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 30px; text-align: center; border-bottom: 1px solid rgba(203, 184, 158, 0.2);">
                    <h1 style="margin: 0; font-size: 28px; font-weight: 300; color: #CBB89E; letter-spacing: 2px;">
                      DUBAI WEALTH HUB
                    </h1>
                  </td>
                </tr>
                
                <!-- Main Content -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 20px; font-size: 24px; color: #FFFFFF; font-weight: 400;">
                      Welcome, ${firstName}!
                    </h2>
                    
                    <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #EAE8E3;">
                      Thank you for joining Dubai Wealth Hub – your gateway to intelligent Dubai real estate investing.
                    </p>
                    
                    <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #EAE8E3;">
                      You now have access to our powerful platform designed to help you make smarter investment decisions in one of the world's most dynamic property markets.
                    </p>
                    
                    <!-- Features -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                      <tr>
                        <td style="padding: 15px; background-color: rgba(203, 184, 158, 0.1); border-radius: 8px; margin-bottom: 10px;">
                          <p style="margin: 0; font-size: 14px; color: #CBB89E; font-weight: 600;">📚 Dubai Real Estate Academy</p>
                          <p style="margin: 5px 0 0; font-size: 14px; color: #EAE8E3;">Expert-led courses on Dubai investing</p>
                        </td>
                      </tr>
                      <tr><td style="height: 10px;"></td></tr>
                      <tr>
                        <td style="padding: 15px; background-color: rgba(203, 184, 158, 0.1); border-radius: 8px;">
                          <p style="margin: 0; font-size: 14px; color: #CBB89E; font-weight: 600;">🤖 AI Investment Assistant</p>
                          <p style="margin: 5px 0 0; font-size: 14px; color: #EAE8E3;">24/7 personalized investment guidance</p>
                        </td>
                      </tr>
                      <tr><td style="height: 10px;"></td></tr>
                      <tr>
                        <td style="padding: 15px; background-color: rgba(203, 184, 158, 0.1); border-radius: 8px;">
                          <p style="margin: 0; font-size: 14px; color: #CBB89E; font-weight: 600;">📊 Investment Tools</p>
                          <p style="margin: 5px 0 0; font-size: 14px; color: #EAE8E3;">ROI calculators & market analysis</p>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <a href="https://dubai-wealth-hub.lovable.app/dashboard" 
                             style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #CBB89E, #A69374); color: #0A0F1D; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px;">
                            Explore Your Dashboard
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 40px; background-color: rgba(203, 184, 158, 0.05); border-top: 1px solid rgba(203, 184, 158, 0.2);">
                    <p style="margin: 0 0 10px; font-size: 14px; color: #EAE8E3; text-align: center;">
                      Questions? Reply to this email – we're here to help.
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #888; text-align: center;">
                      © ${new Date().getFullYear()} Dubai Wealth Hub. All rights reserved.
                    </p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Dubai Wealth Hub <onboarding@resend.dev>",
        to: [email],
        subject: "Welcome to Dubai Wealth Hub – Your Journey Starts Now",
        html: emailHtml,
      }),
    });

    const emailResponse = await res.json();

    if (!res.ok) {
      console.error("Resend API error:", emailResponse);
      throw new Error(emailResponse.message || "Failed to send email");
    }

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending welcome email:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
