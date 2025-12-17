import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { escapeHtml } from "../_shared/html-escape.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MortgageLeadEmailRequest {
  leadData: {
    full_name: string;
    email: string;
    phone: string;
    property_price: number;
    down_payment_amount: number;
    down_payment_percent: number;
    loan_amount: number;
    interest_rate: number;
    loan_term_years: number;
    monthly_payment: number;
    employment_status: string;
    monthly_income_range: string;
    purchase_timeline: string;
    first_time_buyer: boolean;
  };
}

const formatAED = (amount: number): string => {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    maximumFractionDigits: 0,
  }).format(amount);
};

const sendEmail = async (to: string[], subject: string, html: string) => {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Dubai Wealth Hub <inquiries@dubairealestateinvestor.com>",
      to,
      subject,
      html,
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send email: ${error}`);
  }
  
  return response.json();
};

const getUserEmailHtml = (data: MortgageLeadEmailRequest['leadData']): string => {
  const safeName = escapeHtml(data.full_name);
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #0A0F1D 0%, #1a1f2e 100%); padding: 40px; text-align: center;">
              <h1 style="color: #CBB89E; margin: 0; font-size: 28px; font-weight: 600;">Mortgage Pre-Qualification</h1>
              <p style="color: #ffffff; margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Request Received</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Dear ${safeName},
              </p>
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Thank you for your mortgage pre-qualification request. Our team will review your information and connect you with our trusted banking partners shortly.
              </p>
              
              <div style="background-color: #f8f9fa; border-radius: 8px; padding: 24px; margin: 24px 0;">
                <h3 style="color: #0A0F1D; margin: 0 0 16px; font-size: 18px;">Your Request Summary</h3>
                <table width="100%" style="font-size: 14px; color: #555;">
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef;">Property Price</td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef; text-align: right; font-weight: 600; color: #0A0F1D;">${formatAED(data.property_price)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef;">Down Payment</td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef; text-align: right; font-weight: 600; color: #0A0F1D;">${formatAED(data.down_payment_amount)} (${data.down_payment_percent}%)</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef;">Loan Amount</td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef; text-align: right; font-weight: 600; color: #0A0F1D;">${formatAED(data.loan_amount)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef;">Loan Term</td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef; text-align: right; font-weight: 600; color: #0A0F1D;">${data.loan_term_years} years</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">Est. Monthly Payment</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #CBB89E; font-size: 16px;">${formatAED(data.monthly_payment)}/mo</td>
                  </tr>
                </table>
              </div>

              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                <strong>What happens next?</strong>
              </p>
              <ol style="color: #555; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li>Our team reviews your information (within 24 hours)</li>
                <li>We match you with suitable banking partners</li>
                <li>A mortgage specialist will contact you via your preferred method</li>
                <li>You'll receive personalized rate offers</li>
              </ol>

              <p style="color: #777; font-size: 14px; line-height: 1.6; margin: 30px 0 0;">
                Best regards,<br>
                <strong style="color: #0A0F1D;">Dubai Wealth Hub Team</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="color: #999; font-size: 12px; margin: 0;">
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
};

const getAdminEmailHtml = (data: MortgageLeadEmailRequest['leadData']): string => {
  const safeName = escapeHtml(data.full_name);
  const safeEmail = escapeHtml(data.email);
  const safePhone = escapeHtml(data.phone);
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">🏦 New Mortgage Lead</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px;">
              <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <p style="color: #166534; margin: 0; font-weight: 600;">New pre-qualification request received!</p>
              </div>

              <h3 style="color: #0A0F1D; margin: 0 0 16px; font-size: 16px; border-bottom: 2px solid #e9ecef; padding-bottom: 8px;">Contact Information</h3>
              <table width="100%" style="font-size: 14px; color: #555; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 6px 0; width: 140px;"><strong>Name:</strong></td>
                  <td style="padding: 6px 0;">${safeName}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0;"><strong>Email:</strong></td>
                  <td style="padding: 6px 0;"><a href="mailto:${safeEmail}" style="color: #2563eb;">${safeEmail}</a></td>
                </tr>
                <tr>
                  <td style="padding: 6px 0;"><strong>Phone:</strong></td>
                  <td style="padding: 6px 0;"><a href="tel:${safePhone}" style="color: #2563eb;">${safePhone}</a></td>
                </tr>
              </table>

              <h3 style="color: #0A0F1D; margin: 0 0 16px; font-size: 16px; border-bottom: 2px solid #e9ecef; padding-bottom: 8px;">Loan Details</h3>
              <table width="100%" style="font-size: 14px; color: #555; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 6px 0; width: 140px;"><strong>Property Price:</strong></td>
                  <td style="padding: 6px 0;">${formatAED(data.property_price)}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0;"><strong>Down Payment:</strong></td>
                  <td style="padding: 6px 0;">${formatAED(data.down_payment_amount)} (${data.down_payment_percent}%)</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0;"><strong>Loan Amount:</strong></td>
                  <td style="padding: 6px 0;">${formatAED(data.loan_amount)}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0;"><strong>Interest Rate:</strong></td>
                  <td style="padding: 6px 0;">${data.interest_rate}%</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0;"><strong>Loan Term:</strong></td>
                  <td style="padding: 6px 0;">${data.loan_term_years} years</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0;"><strong>Monthly Payment:</strong></td>
                  <td style="padding: 6px 0; color: #16a34a; font-weight: 600;">${formatAED(data.monthly_payment)}/mo</td>
                </tr>
              </table>

              <h3 style="color: #0A0F1D; margin: 0 0 16px; font-size: 16px; border-bottom: 2px solid #e9ecef; padding-bottom: 8px;">Qualification Info</h3>
              <table width="100%" style="font-size: 14px; color: #555;">
                <tr>
                  <td style="padding: 6px 0; width: 140px;"><strong>Employment:</strong></td>
                  <td style="padding: 6px 0;">${escapeHtml(data.employment_status)}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0;"><strong>Income Range:</strong></td>
                  <td style="padding: 6px 0;">${escapeHtml(data.monthly_income_range)}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0;"><strong>Timeline:</strong></td>
                  <td style="padding: 6px 0;">${escapeHtml(data.purchase_timeline)}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0;"><strong>First-Time Buyer:</strong></td>
                  <td style="padding: 6px 0;">${data.first_time_buyer ? 'Yes' : 'No'}</td>
                </tr>
              </table>

              <div style="margin-top: 30px; text-align: center;">
                <a href="https://dubaiwealthhub.com/admin/mortgage-leads" style="display: inline-block; background: linear-gradient(135deg, #0A0F1D 0%, #1a1f2e 100%); color: #CBB89E; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">View in Admin Dashboard</a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { leadData }: MortgageLeadEmailRequest = await req.json();
    const adminEmail = Deno.env.get("ADMIN_INQUIRY_EMAIL");

    console.log("Sending mortgage lead emails for:", leadData.email);

    // Send confirmation email to user
    const userEmailResponse = await sendEmail(
      [leadData.email],
      "Your Mortgage Pre-Qualification Request - Dubai Wealth Hub",
      getUserEmailHtml(leadData)
    );
    console.log("User email sent:", userEmailResponse);

    // Send alert email to admin
    if (adminEmail) {
      const adminEmailResponse = await sendEmail(
        [adminEmail],
        `🏦 New Mortgage Lead: ${escapeHtml(leadData.full_name)} - ${formatAED(leadData.loan_amount)}`,
        getAdminEmailHtml(leadData)
      );
      console.log("Admin email sent:", adminEmailResponse);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending mortgage lead emails:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
