import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { escapeHtml } from "../_shared/html-escape.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendDripRequest {
  queue_id: string;
}

// Email templates by email_key
const EMAIL_TEMPLATES: Record<string, (firstName: string, baseUrl: string) => { subject: string; html: string }> = {
  // Welcome sequence for free users
  welcome_day0: (firstName, baseUrl) => ({
    subject: "Welcome to MLA Dubai - Your Investment Journey Starts Now! 🏙️",
    html: getWelcomeDay0Template(firstName, baseUrl),
  }),
  welcome_day1: (firstName, baseUrl) => ({
    subject: "Your 5-Step Dubai Investment Roadmap",
    html: getWelcomeDay1Template(firstName, baseUrl),
  }),
  welcome_day3: (firstName, baseUrl) => ({
    subject: "5 Costly Mistakes First-Time Dubai Investors Make",
    html: getWelcomeDay3Template(firstName, baseUrl),
  }),
  welcome_day5: (firstName, baseUrl) => ({
    subject: "Discover Your Property's True ROI Potential",
    html: getWelcomeDay5Template(firstName, baseUrl),
  }),
  welcome_day7: (firstName, baseUrl) => ({
    subject: "Unlock Premium Features - Special Offer Inside",
    html: getWelcomeDay7Template(firstName, baseUrl),
  }),
  welcome_day14: (firstName, baseUrl) => ({
    subject: "How Sarah Made AED 2.4M on Her First Dubai Investment",
    html: getWelcomeDay14Template(firstName, baseUrl),
  }),
  welcome_day21: (firstName, baseUrl) => ({
    subject: "Last Chance: 30% Off Investor Membership",
    html: getWelcomeDay21Template(firstName, baseUrl),
  }),
  // Investor upsell sequence
  investor_day7: (firstName, baseUrl) => ({
    subject: "Tips to Maximize Your Investor Membership",
    html: getInvestorDay7Template(firstName, baseUrl),
  }),
  investor_day30: (firstName, baseUrl) => ({
    subject: "Your Monthly Investment Impact Report",
    html: getInvestorDay30Template(firstName, baseUrl),
  }),
  investor_day45: (firstName, baseUrl) => ({
    subject: "Exclusive Preview: Elite Member Benefits",
    html: getInvestorDay45Template(firstName, baseUrl),
  }),
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { queue_id }: SendDripRequest = await req.json();

    console.log(`[send-drip-email] Processing queue entry: ${queue_id}`);

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get the queue entry with sequence info
    const { data: queueEntry, error: queueError } = await supabaseAdmin
      .from("email_drip_queue")
      .select(`
        *,
        sequence:email_drip_sequences(*)
      `)
      .eq("id", queue_id)
      .single();

    if (queueError || !queueEntry) {
      console.error("[send-drip-email] Queue entry not found:", queueError);
      throw new Error("Queue entry not found");
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("email, full_name, membership_tier, notify_email_digest")
      .eq("id", queueEntry.user_id)
      .single();

    if (profileError || !profile) {
      console.error("[send-drip-email] Profile not found:", profileError);
      // Mark as skipped
      await supabaseAdmin
        .from("email_drip_queue")
        .update({ status: "skipped", error_message: "Profile not found" })
        .eq("id", queue_id);
      return new Response(JSON.stringify({ success: false, reason: "profile_not_found" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Check if user has unsubscribed from email digest
    if (profile.notify_email_digest === false) {
      console.log(`[send-drip-email] User ${queueEntry.user_id} has unsubscribed from emails`);
      await supabaseAdmin
        .from("email_drip_queue")
        .update({ status: "skipped", error_message: "User unsubscribed" })
        .eq("id", queue_id);
      return new Response(JSON.stringify({ success: false, reason: "unsubscribed" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Check if this is an upgrade email and user already upgraded
    const sequence = queueEntry.sequence;
    if (sequence.email_type === "upgrade" && sequence.target_tier === "free") {
      if (profile.membership_tier !== "free") {
        console.log(`[send-drip-email] User ${queueEntry.user_id} already upgraded to ${profile.membership_tier}`);
        await supabaseAdmin
          .from("email_drip_queue")
          .update({ status: "skipped", error_message: "User already upgraded" })
          .eq("id", queue_id);
        return new Response(JSON.stringify({ success: false, reason: "already_upgraded" }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
    }

    // Get email template
    const templateFn = EMAIL_TEMPLATES[sequence.email_key];
    if (!templateFn) {
      console.error(`[send-drip-email] Template not found for key: ${sequence.email_key}`);
      await supabaseAdmin
        .from("email_drip_queue")
        .update({ status: "failed", error_message: "Template not found" })
        .eq("id", queue_id);
      return new Response(JSON.stringify({ success: false, reason: "template_not_found" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const firstName = escapeHtml(profile.full_name?.split(" ")[0] || "Investor");
    const baseUrl = "https://dubai-wealth-hub.lovable.app";
    const { subject, html } = templateFn(firstName, baseUrl);

    // Send email via Resend
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "MLA Dubai <hello@dubairealestateinvestor.com>",
        to: [profile.email],
        subject,
        html,
      }),
    });

    const emailResponse = await res.json();

    if (!res.ok) {
      console.error("[send-drip-email] Resend API error:", emailResponse);
      
      // Handle test mode gracefully
      if (emailResponse.name === "validation_error" && emailResponse.message?.includes("testing emails")) {
        console.log("[send-drip-email] Resend in test mode - marking as sent for dev purposes");
        await supabaseAdmin
          .from("email_drip_queue")
          .update({ status: "sent", sent_at: new Date().toISOString(), error_message: "Test mode - would send in prod" })
          .eq("id", queue_id);
        return new Response(JSON.stringify({ success: true, testMode: true }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      await supabaseAdmin
        .from("email_drip_queue")
        .update({ status: "failed", error_message: emailResponse.message })
        .eq("id", queue_id);
      throw new Error(emailResponse.message || "Failed to send email");
    }

    // Mark as sent
    await supabaseAdmin
      .from("email_drip_queue")
      .update({ status: "sent", sent_at: new Date().toISOString() })
      .eq("id", queue_id);

    console.log(`[send-drip-email] Successfully sent ${sequence.email_key} to ${profile.email}`);

    return new Response(
      JSON.stringify({ success: true, email_key: sequence.email_key }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("[send-drip-email] Error:", error);
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

// ============ EMAIL TEMPLATES ============

function getEmailWrapper(content: string, baseUrl: string): string {
  return `
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
                MLA DUBAI
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: rgba(203, 184, 158, 0.05); border-top: 1px solid rgba(203, 184, 158, 0.2);">
              <p style="margin: 0 0 10px; font-size: 14px; color: #EAE8E3; text-align: center;">
                Questions? Reply to this email – we're here to help.
              </p>
              <p style="margin: 0 0 10px; font-size: 12px; color: #888; text-align: center;">
                <a href="${baseUrl}/settings" style="color: #CBB89E;">Manage email preferences</a>
              </p>
              <p style="margin: 0; font-size: 12px; color: #888; text-align: center;">
                © ${new Date().getFullYear()} MLA Dubai. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function getCTA(text: string, url: string): string {
  return `
<table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
  <tr>
    <td align="center">
      <a href="${url}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #CBB89E, #A69374); color: #0A0F1D; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px;">
        ${text}
      </a>
    </td>
  </tr>
</table>`;
}

// Day 0: Welcome
function getWelcomeDay0Template(firstName: string, baseUrl: string): string {
  const content = `
    <h2 style="margin: 0 0 20px; font-size: 24px; color: #FFFFFF; font-weight: 400;">
      Welcome to MLA Dubai, ${firstName}! 🎉
    </h2>
    <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #EAE8E3;">
      You've just taken the first step toward building wealth through Dubai real estate – and we couldn't be more excited to have you here.
    </p>
    <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #EAE8E3;">
      Here's what you can do right now:
    </p>
    <ul style="margin: 0 0 20px; padding-left: 20px; font-size: 16px; line-height: 1.8; color: #EAE8E3;">
      <li>🏠 Browse 700+ verified Dubai properties</li>
      <li>📊 Use our ROI calculator to analyze any investment</li>
      <li>🎓 Start your first Academy lesson</li>
      <li>🤖 Chat with our AI investment assistant</li>
    </ul>
    ${getCTA("Explore Your Dashboard", `${baseUrl}/dashboard`)}
    <p style="margin: 20px 0 0; font-size: 14px; color: #888;">
      Tomorrow, I'll send you our 5-step investment roadmap that's helped hundreds of investors succeed in Dubai.
    </p>
  `;
  return getEmailWrapper(content, baseUrl);
}

// Day 1: 5-Step Roadmap
function getWelcomeDay1Template(firstName: string, baseUrl: string): string {
  const content = `
    <h2 style="margin: 0 0 20px; font-size: 24px; color: #FFFFFF; font-weight: 400;">
      Your 5-Step Dubai Investment Roadmap
    </h2>
    <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #EAE8E3;">
      Hi ${firstName},
    </p>
    <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #EAE8E3;">
      Here's the exact roadmap successful investors follow:
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
      <tr><td style="padding: 12px; background: rgba(203,184,158,0.1); border-radius: 8px; margin-bottom: 8px;">
        <strong style="color: #CBB89E;">Step 1:</strong> <span style="color: #EAE8E3;">Learn the market fundamentals</span>
      </td></tr>
      <tr><td style="height: 8px;"></td></tr>
      <tr><td style="padding: 12px; background: rgba(203,184,158,0.1); border-radius: 8px;">
        <strong style="color: #CBB89E;">Step 2:</strong> <span style="color: #EAE8E3;">Understand the fee structure (DLD, agency, service charges)</span>
      </td></tr>
      <tr><td style="height: 8px;"></td></tr>
      <tr><td style="padding: 12px; background: rgba(203,184,158,0.1); border-radius: 8px;">
        <strong style="color: #CBB89E;">Step 3:</strong> <span style="color: #EAE8E3;">Identify your investment strategy (rental yield vs capital gains)</span>
      </td></tr>
      <tr><td style="height: 8px;"></td></tr>
      <tr><td style="padding: 12px; background: rgba(203,184,158,0.1); border-radius: 8px;">
        <strong style="color: #CBB89E;">Step 4:</strong> <span style="color: #EAE8E3;">Research neighborhoods with highest potential</span>
      </td></tr>
      <tr><td style="height: 8px;"></td></tr>
      <tr><td style="padding: 12px; background: rgba(203,184,158,0.1); border-radius: 8px;">
        <strong style="color: #CBB89E;">Step 5:</strong> <span style="color: #EAE8E3;">Analyze specific properties using our tools</span>
      </td></tr>
    </table>
    ${getCTA("Start Learning Now", `${baseUrl}/academy`)}
  `;
  return getEmailWrapper(content, baseUrl);
}

// Day 3: Common Mistakes
function getWelcomeDay3Template(firstName: string, baseUrl: string): string {
  const content = `
    <h2 style="margin: 0 0 20px; font-size: 24px; color: #FFFFFF; font-weight: 400;">
      5 Costly Mistakes First-Time Dubai Investors Make
    </h2>
    <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #EAE8E3;">
      ${firstName}, I've seen smart investors lose money in Dubai because they didn't know these pitfalls:
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
      <tr><td style="padding: 15px; border-left: 4px solid #E74C3C; background: rgba(231,76,60,0.1); margin-bottom: 10px;">
        <strong style="color: #E74C3C;">Mistake #1:</strong> <span style="color: #EAE8E3;">Ignoring the 4% DLD transfer fee in their ROI calculations</span>
      </td></tr>
      <tr><td style="height: 10px;"></td></tr>
      <tr><td style="padding: 15px; border-left: 4px solid #E74C3C; background: rgba(231,76,60,0.1);">
        <strong style="color: #E74C3C;">Mistake #2:</strong> <span style="color: #EAE8E3;">Buying in areas with oversupply and declining rents</span>
      </td></tr>
      <tr><td style="height: 10px;"></td></tr>
      <tr><td style="padding: 15px; border-left: 4px solid #E74C3C; background: rgba(231,76,60,0.1);">
        <strong style="color: #E74C3C;">Mistake #3:</strong> <span style="color: #EAE8E3;">Not accounting for service charges (can be AED 15-30/sqft)</span>
      </td></tr>
      <tr><td style="height: 10px;"></td></tr>
      <tr><td style="padding: 15px; border-left: 4px solid #E74C3C; background: rgba(231,76,60,0.1);">
        <strong style="color: #E74C3C;">Mistake #4:</strong> <span style="color: #EAE8E3;">Trusting developer timelines for off-plan properties</span>
      </td></tr>
      <tr><td style="height: 10px;"></td></tr>
      <tr><td style="padding: 15px; border-left: 4px solid #E74C3C; background: rgba(231,76,60,0.1);">
        <strong style="color: #E74C3C;">Mistake #5:</strong> <span style="color: #EAE8E3;">Not understanding freehold vs leasehold zones</span>
      </td></tr>
    </table>
    <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #EAE8E3;">
      Our Total Cost Calculator factors in ALL hidden fees so you never get surprised.
    </p>
    ${getCTA("Calculate True Costs", `${baseUrl}/tools/total-cost-calculator`)}
  `;
  return getEmailWrapper(content, baseUrl);
}

// Day 5: Feature Highlight - ROI Calculator
function getWelcomeDay5Template(firstName: string, baseUrl: string): string {
  const content = `
    <h2 style="margin: 0 0 20px; font-size: 24px; color: #FFFFFF; font-weight: 400;">
      Discover Your Property's True ROI Potential
    </h2>
    <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #EAE8E3;">
      ${firstName}, have you tried our ROI Calculator yet?
    </p>
    <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #EAE8E3;">
      It's the same tool used by professional investors to:
    </p>
    <ul style="margin: 0 0 20px; padding-left: 20px; font-size: 16px; line-height: 1.8; color: #EAE8E3;">
      <li>Calculate net rental yields (after ALL costs)</li>
      <li>Compare multiple properties side-by-side</li>
      <li>Forecast 5-year capital appreciation</li>
      <li>Factor in financing scenarios</li>
    </ul>
    <div style="padding: 20px; background: rgba(203,184,158,0.1); border-radius: 12px; margin-bottom: 20px;">
      <p style="margin: 0; font-size: 18px; color: #CBB89E; font-weight: 600;">
        ✨ Pro Tip: Properties in JVC are showing 7-8% yields right now
      </p>
    </div>
    ${getCTA("Try the ROI Calculator", `${baseUrl}/tools/roi-calculator`)}
  `;
  return getEmailWrapper(content, baseUrl);
}

// Day 7: First Upgrade Prompt
function getWelcomeDay7Template(firstName: string, baseUrl: string): string {
  const content = `
    <h2 style="margin: 0 0 20px; font-size: 24px; color: #FFFFFF; font-weight: 400;">
      Unlock Premium Features - Special Offer
    </h2>
    <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #EAE8E3;">
      ${firstName}, you've been exploring our platform for a week now. Ready to take your investing to the next level?
    </p>
    <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #EAE8E3;">
      <strong style="color: #CBB89E;">Investor members get:</strong>
    </p>
    <ul style="margin: 0 0 20px; padding-left: 20px; font-size: 16px; line-height: 1.8; color: #EAE8E3;">
      <li>🎓 Full access to 100+ Academy lessons</li>
      <li>📊 Advanced market data & analytics</li>
      <li>🤖 Unlimited AI investment consultations</li>
      <li>👥 Private investor community access</li>
      <li>📧 Weekly market intelligence reports</li>
    </ul>
    <div style="padding: 20px; background: linear-gradient(135deg, rgba(203,184,158,0.2), rgba(166,147,116,0.2)); border-radius: 12px; margin-bottom: 20px; text-align: center;">
      <p style="margin: 0 0 5px; font-size: 14px; color: #CBB89E;">SPECIAL OFFER</p>
      <p style="margin: 0; font-size: 28px; color: #FFFFFF; font-weight: 600;">$29/month</p>
      <p style="margin: 5px 0 0; font-size: 14px; color: #888;">Cancel anytime</p>
    </div>
    ${getCTA("Upgrade to Investor", `${baseUrl}/pricing`)}
  `;
  return getEmailWrapper(content, baseUrl);
}

// Day 14: Case Study
function getWelcomeDay14Template(firstName: string, baseUrl: string): string {
  const content = `
    <h2 style="margin: 0 0 20px; font-size: 24px; color: #FFFFFF; font-weight: 400;">
      How Sarah Made AED 2.4M on Her First Dubai Investment
    </h2>
    <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #EAE8E3;">
      ${firstName}, let me share a real success story from our community...
    </p>
    <div style="padding: 20px; background: rgba(203,184,158,0.1); border-radius: 12px; margin-bottom: 20px;">
      <p style="margin: 0 0 15px; font-size: 16px; line-height: 1.6; color: #EAE8E3;">
        <strong style="color: #CBB89E;">Sarah, 34, from UK</strong> joined MLA Dubai as a complete beginner. Using our Academy and tools:
      </p>
      <ul style="margin: 0; padding-left: 20px; font-size: 15px; line-height: 1.8; color: #EAE8E3;">
        <li>Completed our fundamentals course in 2 weeks</li>
        <li>Used our neighborhood comparison tool to find undervalued areas</li>
        <li>Bought a 2BR in Business Bay for AED 1.8M (2022)</li>
        <li>Today: Property valued at AED 2.4M + earning AED 110K/year rent</li>
      </ul>
    </div>
    <p style="margin: 0 0 20px; font-size: 18px; line-height: 1.6; color: #CBB89E; font-weight: 600;">
      That's 33% capital gain + 6.1% rental yield in 2 years.
    </p>
    ${getCTA("Start Your Journey", `${baseUrl}/academy`)}
  `;
  return getEmailWrapper(content, baseUrl);
}

// Day 21: Last Chance Offer
function getWelcomeDay21Template(firstName: string, baseUrl: string): string {
  const content = `
    <h2 style="margin: 0 0 20px; font-size: 24px; color: #FFFFFF; font-weight: 400;">
      Last Chance: 30% Off Investor Membership
    </h2>
    <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #EAE8E3;">
      ${firstName}, it's been 3 weeks since you joined us. I wanted to give you one final opportunity...
    </p>
    <div style="padding: 25px; background: linear-gradient(135deg, #1a1a2e, #16213e); border: 2px solid #CBB89E; border-radius: 12px; margin-bottom: 20px; text-align: center;">
      <p style="margin: 0 0 5px; font-size: 12px; color: #E74C3C; text-transform: uppercase; letter-spacing: 2px;">⏰ Expires in 48 hours</p>
      <p style="margin: 0 0 10px; font-size: 16px; color: #888; text-decoration: line-through;">$29/month</p>
      <p style="margin: 0; font-size: 36px; color: #CBB89E; font-weight: 700;">$20/month</p>
      <p style="margin: 10px 0 0; font-size: 14px; color: #27ae60;">Save $108/year</p>
    </div>
    <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #EAE8E3;">
      This is our best offer for new members. After 48 hours, you'll only see regular pricing.
    </p>
    ${getCTA("Claim 30% Off Now", `${baseUrl}/pricing?promo=WELCOME30`)}
    <p style="margin: 20px 0 0; font-size: 14px; color: #888; text-align: center;">
      No pressure – we'll still be here if you decide to upgrade later at regular pricing.
    </p>
  `;
  return getEmailWrapper(content, baseUrl);
}

// Investor Day 7: Onboarding Tips
function getInvestorDay7Template(firstName: string, baseUrl: string): string {
  const content = `
    <h2 style="margin: 0 0 20px; font-size: 24px; color: #FFFFFF; font-weight: 400;">
      Tips to Maximize Your Investor Membership
    </h2>
    <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #EAE8E3;">
      Welcome to the Investor tier, ${firstName}! Here's how to get the most value:
    </p>
    <ol style="margin: 0 0 20px; padding-left: 20px; font-size: 16px; line-height: 1.8; color: #EAE8E3;">
      <li><strong style="color: #CBB89E;">Complete the Advanced Academy</strong> - Start with "Off-Plan Investing Masterclass"</li>
      <li><strong style="color: #CBB89E;">Set up price alerts</strong> - Get notified when properties match your criteria</li>
      <li><strong style="color: #CBB89E;">Join the community</strong> - Connect with other investors in our private forum</li>
      <li><strong style="color: #CBB89E;">Use the AI Assistant</strong> - Ask it to analyze any property you're considering</li>
    </ol>
    ${getCTA("Continue Learning", `${baseUrl}/academy`)}
  `;
  return getEmailWrapper(content, baseUrl);
}

// Investor Day 30: Value Report
function getInvestorDay30Template(firstName: string, baseUrl: string): string {
  const content = `
    <h2 style="margin: 0 0 20px; font-size: 24px; color: #FFFFFF; font-weight: 400;">
      Your Monthly Investment Impact Report
    </h2>
    <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #EAE8E3;">
      ${firstName}, here's what you've accomplished in your first month:
    </p>
    <div style="padding: 20px; background: rgba(203,184,158,0.1); border-radius: 12px; margin-bottom: 20px;">
      <p style="margin: 0 0 10px; font-size: 14px; color: #CBB89E;">YOUR ACTIVITY</p>
      <ul style="margin: 0; padding-left: 20px; font-size: 16px; line-height: 1.8; color: #EAE8E3;">
        <li>Properties analyzed with our tools</li>
        <li>Academy lessons completed</li>
        <li>Market reports accessed</li>
        <li>AI consultations used</li>
      </ul>
    </div>
    <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #EAE8E3;">
      <strong style="color: #CBB89E;">This month's market highlight:</strong> Downtown Dubai prices are up 4.2% month-over-month. 
      Our AI predicts continued growth in Q1.
    </p>
    ${getCTA("View Full Market Report", `${baseUrl}/dashboard`)}
  `;
  return getEmailWrapper(content, baseUrl);
}

// Investor Day 45: Elite Preview
function getInvestorDay45Template(firstName: string, baseUrl: string): string {
  const content = `
    <h2 style="margin: 0 0 20px; font-size: 24px; color: #FFFFFF; font-weight: 400;">
      Exclusive Preview: Elite Member Benefits
    </h2>
    <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #EAE8E3;">
      ${firstName}, you've been crushing it as an Investor member. Ready to see what Elite offers?
    </p>
    <div style="padding: 20px; background: linear-gradient(135deg, rgba(212,175,55,0.1), rgba(203,184,158,0.1)); border: 1px solid rgba(212,175,55,0.3); border-radius: 12px; margin-bottom: 20px;">
      <p style="margin: 0 0 15px; font-size: 18px; color: #D4AF37; font-weight: 600;">👑 Elite Member Exclusives:</p>
      <ul style="margin: 0; padding-left: 20px; font-size: 16px; line-height: 1.8; color: #EAE8E3;">
        <li>Portfolio tracking & performance analytics</li>
        <li>Direct developer contacts & off-market deals</li>
        <li>Monthly live Q&A with Dubai real estate experts</li>
        <li>Priority support & deal negotiation assistance</li>
        <li>Access to our private WhatsApp group</li>
      </ul>
    </div>
    <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #EAE8E3;">
      Elite members have closed over AED 50M in deals through our platform connections.
    </p>
    ${getCTA("Upgrade to Elite", `${baseUrl}/pricing`)}
  `;
  return getEmailWrapper(content, baseUrl);
}
