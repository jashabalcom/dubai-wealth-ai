import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { escapeHtml } from "../_shared/html-escape.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROPERTY-INQUIRY] ${step}${detailsStr}`);
};

// Admin email for receiving Basic tier inquiries
const ADMIN_EMAIL = Deno.env.get("ADMIN_INQUIRY_EMAIL") || "admin@dubaiwealth.club";

interface InquiryRequest {
  propertyId: string;
  propertyTitle: string;
  inquiryType: 'viewing' | 'enquiry';
  name: string;
  email: string;
  phone: string;
  message?: string;
  userId?: string;
}

async function sendEmail(to: string, subject: string, html: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "Dubai Wealth Hub <inquiries@dubairealestateinvestor.com>",
      to: [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send email: ${error}`);
  }

  return response.json();
}

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
    logStep("Function started");

    const inquiry: InquiryRequest = await req.json();
    logStep("Received inquiry", { propertyId: inquiry.propertyId, type: inquiry.inquiryType });

    // Get property with agent info
    const { data: property, error: propError } = await supabaseClient
      .from('properties')
      .select(`
        id, title, location_area, price_aed,
        agent:agents(
          id, full_name, email,
          subscription_tier, show_direct_contact
        )
      `)
      .eq('id', inquiry.propertyId)
      .single();

    if (propError || !property) {
      throw new Error("Property not found");
    }

    // Agent comes back as an array from the join, get first element
    const agentData = property.agent as any;
    const agent = Array.isArray(agentData) ? agentData[0] : agentData;

    logStep("Property found", { 
      title: property.title, 
      hasAgent: !!agent,
      agentTier: agent?.subscription_tier 
    });

    // Determine where to route the inquiry
    const agentTier = agent?.subscription_tier || 'basic';
    const canShowDirectContact = agent?.show_direct_contact === true;
    
    // Basic tier or no agent: route to admin
    // Preferred/Premium with show_direct_contact: route to agent
    const routeToAgent = agent && canShowDirectContact && (agentTier === 'preferred' || agentTier === 'premium');
    
    const recipientEmail = routeToAgent && agent.email ? agent.email : ADMIN_EMAIL;
    const recipientName = routeToAgent ? agent.full_name : 'Dubai Wealth Hub Admin';

    logStep("Routing decision", { 
      routeToAgent, 
      recipientEmail, 
      agentTier,
      canShowDirectContact 
    });

    // Save inquiry to database
    const { data: savedInquiry, error: insertError } = await supabaseClient
      .from('property_inquiries')
      .insert({
        property_id: inquiry.propertyId,
        agent_id: agent?.id || null,
        user_id: inquiry.userId || null,
        name: inquiry.name,
        email: inquiry.email,
        phone: inquiry.phone,
        message: inquiry.message,
        inquiry_type: inquiry.inquiryType,
        source: routeToAgent ? 'direct' : 'platform_routed',
        status: 'new',
      })
      .select()
      .single();

    if (insertError) {
      logStep("Warning: Failed to save inquiry", { error: insertError.message });
    } else {
      logStep("Inquiry saved", { inquiryId: savedInquiry?.id });
    }

    // Format price
    const priceFormatted = new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      maximumFractionDigits: 0,
    }).format(property.price_aed);

    // Prepare email content with escaped user inputs
    const inquiryTypeLabel = inquiry.inquiryType === 'viewing' ? 'Viewing Request' : 'Property Enquiry';
    const safeName = escapeHtml(inquiry.name);
    const safeEmail = escapeHtml(inquiry.email);
    const safePhone = escapeHtml(inquiry.phone);
    const safeMessage = escapeHtml(inquiry.message);
    
    const emailSubject = `[${inquiryTypeLabel}] ${property.title}`;
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #CBB89E, #B8A88A); padding: 20px; text-align: center; }
          .header h1 { color: #0A0F1D; margin: 0; font-size: 24px; }
          .content { padding: 20px; background: #f9f9f9; }
          .property-box { background: white; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #CBB89E; }
          .lead-box { background: white; padding: 15px; border-radius: 8px; }
          .label { font-weight: bold; color: #666; font-size: 12px; text-transform: uppercase; }
          .value { font-size: 16px; margin-bottom: 10px; }
          .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; }
          ${!routeToAgent ? '.notice { background: #FEF3C7; padding: 10px; border-radius: 4px; margin-bottom: 15px; font-size: 14px; }' : ''}
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New ${inquiryTypeLabel}</h1>
          </div>
          <div class="content">
            ${!routeToAgent ? `
            <div class="notice">
              <strong>Note:</strong> This inquiry was routed to you because the listing agent is on the Basic tier. 
              ${agent ? `Agent: ${agent.full_name}` : 'No agent assigned.'}
            </div>
            ` : ''}
            
            <div class="property-box">
              <div class="label">Property</div>
              <div class="value" style="font-size: 18px; font-weight: bold;">${property.title}</div>
              <div class="label">Location</div>
              <div class="value">${property.location_area}</div>
              <div class="label">Price</div>
              <div class="value" style="color: #CBB89E; font-weight: bold;">${priceFormatted}</div>
            </div>
            
            <div class="lead-box">
              <h3 style="margin-top: 0;">Lead Details</h3>
              <div class="label">Name</div>
              <div class="value">${safeName}</div>
              <div class="label">Email</div>
              <div class="value"><a href="mailto:${safeEmail}">${safeEmail}</a></div>
              <div class="label">Phone</div>
              <div class="value"><a href="tel:${safePhone}">${safePhone}</a></div>
              ${safeMessage ? `
              <div class="label">Message</div>
              <div class="value">${safeMessage}</div>
              ` : ''}
            </div>
          </div>
          <div class="footer">
            <p>This inquiry was submitted via Dubai Wealth Hub</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email to recipient (admin or agent)
    await sendEmail(recipientEmail, emailSubject, emailHtml);
    logStep("Email sent", { to: recipientEmail });

    // Send confirmation to the inquirer
    const confirmationHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #CBB89E, #B8A88A); padding: 20px; text-align: center; }
          .header h1 { color: #0A0F1D; margin: 0; }
          .content { padding: 20px; background: #f9f9f9; }
          .property-box { background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #CBB89E; }
          .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Thank You, ${safeName}!</h1>
          </div>
          <div class="content">
            <p>We've received your ${inquiry.inquiryType === 'viewing' ? 'viewing request' : 'enquiry'} for:</p>
            <div class="property-box">
              <strong>${property.title}</strong><br>
              ${property.location_area}<br>
              <span style="color: #CBB89E; font-weight: bold;">${priceFormatted}</span>
            </div>
            <p style="margin-top: 20px;">
              ${routeToAgent 
                ? `${agent.full_name} will be in touch with you shortly.`
                : 'Our team will review your inquiry and connect you with the right agent shortly.'}
            </p>
            <p>If you have any urgent questions, feel free to reply to this email.</p>
          </div>
          <div class="footer">
            <p>Dubai Wealth Hub - Your Gateway to Dubai Real Estate</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail(inquiry.email, `Your ${inquiryTypeLabel} - ${property.title}`, confirmationHtml);
    logStep("Confirmation email sent to inquirer");

    return new Response(JSON.stringify({ 
      success: true,
      routed_to: routeToAgent ? 'agent' : 'admin',
      inquiry_id: savedInquiry?.id,
    }), {
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
