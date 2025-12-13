import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactFormRequest {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

// HTML escape function to prevent injection
function escapeHtml(text: string | undefined | null): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const sendEmail = async (to: string[], subject: string, html: string) => {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Dubai Wealth Hub <onboarding@resend.dev>",
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

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, phone, subject, message }: ContactFormRequest = await req.json();

    console.log("Received contact form submission:", { name, email, subject });

    // Escape all user inputs
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safePhone = escapeHtml(phone);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message);

    const adminEmail = Deno.env.get("ADMIN_INQUIRY_EMAIL") || "admin@example.com";
    
    // Send notification email to admin
    const adminEmailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #0A0F1D; border-bottom: 2px solid #CBB89E; padding-bottom: 10px;">New Contact Form Submission</h2>
        
        <div style="background: #f8f8f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          ${safePhone ? `<p><strong>Phone:</strong> ${safePhone}</p>` : ''}
          <p><strong>Subject:</strong> ${safeSubject}</p>
        </div>
        
        <div style="background: #fff; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
          <h3 style="color: #0A0F1D; margin-top: 0;">Message:</h3>
          <p style="white-space: pre-wrap; color: #333;">${safeMessage}</p>
        </div>
        
        <p style="color: #666; font-size: 12px; margin-top: 20px;">
          Sent from Dubai Wealth Hub Contact Form
        </p>
      </div>
    `;

    await sendEmail([adminEmail], `New Contact Form: ${safeSubject}`, adminEmailHtml);
    console.log("Admin email sent successfully");

    // Send confirmation email to user
    const userEmailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #0A0F1D; font-size: 24px;">Thank you for contacting us, ${safeName}!</h1>
        
        <p style="color: #333; line-height: 1.6;">
          We have received your message regarding "<strong>${safeSubject}</strong>" and will get back to you as soon as possible.
        </p>
        
        <p style="color: #333; line-height: 1.6;">
          Our team typically responds within 24-48 business hours.
        </p>
        
        <div style="background: linear-gradient(135deg, #CBB89E 0%, #a89878 100%); padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center;">
          <p style="color: #0A0F1D; margin: 0; font-weight: 500;">
            In the meantime, explore our investment resources and tools.
          </p>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          Best regards,<br>
          <strong>The Dubai Wealth Hub Team</strong>
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center;">
          Balcom Prive LLC | Dubai Wealth Hub<br>
          This is an automated message. Please do not reply directly to this email.
        </p>
      </div>
    `;

    await sendEmail([email], "We received your message - Dubai Wealth Hub", userEmailHtml);
    console.log("User confirmation email sent successfully");

    return new Response(
      JSON.stringify({ success: true, message: "Emails sent successfully" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
