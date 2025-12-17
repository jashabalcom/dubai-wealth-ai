import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { escapeHtml } from "../_shared/html-escape.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  user_id: string;
  type: string;
  title: string;
  body?: string;
  link?: string;
  metadata?: Record<string, unknown>;
}

const getEmailTemplate = (type: string, title: string, body: string, link: string | null) => {
  const baseUrl = "https://dubaiwealthhub.com";
  const ctaUrl = link ? `${baseUrl}${link}` : baseUrl;
  
  // Escape user-provided content
  const safeTitle = escapeHtml(title);
  const safeBody = escapeHtml(body);
  
  const ctaTexts: Record<string, string> = {
    message: "View Message",
    connection_request: "View Request",
    connection_accepted: "View Profile",
    post_comment: "View Comment",
    event_new: "View Event",
    event_reminder: "View Event",
    announcement: "Learn More",
  };

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #0A0F1D 0%, #1a1f2e 100%); padding: 32px; text-align: center;">
                    <h1 style="margin: 0; color: #CBB89E; font-size: 24px; font-weight: 600;">Dubai Wealth Hub</h1>
                    <p style="margin: 8px 0 0 0; color: #CBB89E; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">by Balcom Privé</p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 32px;">
                    <h2 style="margin: 0 0 16px 0; color: #0A0F1D; font-size: 20px; font-weight: 600;">${safeTitle}</h2>
                    ${safeBody ? `<p style="margin: 0 0 24px 0; color: #666666; font-size: 16px; line-height: 1.6;">${safeBody}</p>` : ''}
                    
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background: linear-gradient(135deg, #CBB89E 0%, #a89776 100%); border-radius: 8px;">
                          <a href="${ctaUrl}" style="display: inline-block; padding: 14px 28px; color: #0A0F1D; text-decoration: none; font-weight: 600; font-size: 14px;">
                            ${ctaTexts[type] || "View Details"}
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f9f9f9; padding: 24px 32px; border-top: 1px solid #eeeeee;">
                    <p style="margin: 0; color: #999999; font-size: 12px; text-align: center;">
                      You received this email because you have notifications enabled.<br>
                      <a href="${baseUrl}/settings#notifications" style="color: #CBB89E;">Manage your notification preferences</a>
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

const getEmailSubject = (type: string, title: string): string => {
  const prefixes: Record<string, string> = {
    message: "💬 ",
    connection_request: "🤝 ",
    connection_accepted: "✅ ",
    post_comment: "💬 ",
    event_new: "📅 ",
    event_reminder: "⏰ ",
    announcement: "📢 ",
  };
  return `${prefixes[type] || ""}${title}`;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { user_id, type, title, body, link, metadata }: NotificationRequest = await req.json();

    console.log(`Creating notification for user ${user_id}: ${type} - ${title}`);

    // Get user's notification preferences
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select(`
        email,
        notify_email_messages,
        notify_email_connections,
        notify_email_comments,
        notify_email_events,
        notify_inapp_messages,
        notify_inapp_connections,
        notify_inapp_comments,
        notify_inapp_events
      `)
      .eq("id", user_id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      throw profileError;
    }

    // Determine if in-app notification should be created
    const inAppPrefs: Record<string, boolean> = {
      message: profile.notify_inapp_messages ?? true,
      connection_request: profile.notify_inapp_connections ?? true,
      connection_accepted: profile.notify_inapp_connections ?? true,
      post_comment: profile.notify_inapp_comments ?? true,
      event_new: profile.notify_inapp_events ?? true,
      event_reminder: profile.notify_inapp_events ?? true,
      announcement: profile.notify_inapp_events ?? true,
    };

    const shouldCreateInApp = inAppPrefs[type] ?? true;

    // Create in-app notification if enabled
    if (shouldCreateInApp) {
      const { error: insertError } = await supabaseClient
        .from("notifications")
        .insert({
          user_id,
          type,
          title,
          body: body || null,
          link: link || null,
          metadata: metadata || {},
        });

      if (insertError) {
        console.error("Error creating notification:", insertError);
        throw insertError;
      }
      console.log("In-app notification created");
    }

    // Determine if email should be sent
    const emailPrefs: Record<string, boolean> = {
      message: profile.notify_email_messages ?? true,
      connection_request: profile.notify_email_connections ?? true,
      connection_accepted: profile.notify_email_connections ?? true,
      post_comment: profile.notify_email_comments ?? true,
      event_new: profile.notify_email_events ?? true,
      event_reminder: profile.notify_email_events ?? true,
      announcement: profile.notify_email_events ?? true,
    };

    const shouldSendEmail = emailPrefs[type] ?? true;

    // Send email if enabled and user has email
    if (shouldSendEmail && profile.email) {
      const emailHtml = getEmailTemplate(type, title, body || "", link || null);
      const emailSubject = getEmailSubject(type, title);

      const { error: emailError } = await resend.emails.send({
        from: "Dubai Wealth Hub <hello@dubairealestateinvestor.com>",
        to: [profile.email],
        subject: emailSubject,
        html: emailHtml,
      });

      if (emailError) {
        console.error("Error sending email:", emailError);
        // Don't throw - email failure shouldn't fail the whole notification
      } else {
        console.log("Email notification sent");
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-notification:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
