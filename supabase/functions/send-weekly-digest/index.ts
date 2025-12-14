import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function escapeHtml(text: string | undefined | null): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

interface EliteMember {
  id: string;
  email: string;
  full_name: string;
  investment_goal: string | null;
  budget_range: string | null;
  timeline: string | null;
  preferred_areas: string[] | null;
}

interface MarketInsight {
  type: 'opportunity' | 'trend' | 'alert';
  title: string;
  description: string;
}

async function generateAIInsights(
  member: EliteMember,
  savedPropertiesCount: number,
  portfolioValue: number,
  topAreas: { area: string; avgYield: number }[]
): Promise<string[]> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  
  if (!LOVABLE_API_KEY) {
    console.error("LOVABLE_API_KEY not configured");
    return getDefaultInsights(topAreas);
  }

  const systemPrompt = `You are a Dubai real estate investment advisor providing weekly personalized insights for Elite members of Dubai Wealth Hub. 
Be specific, data-driven, and actionable. Reference Dubai areas and current market conditions.`;

  const userPrompt = `Generate 3-4 personalized investment insights for this Elite member:

Member Profile:
- Name: ${member.full_name || 'Investor'}
- Investment Goal: ${member.investment_goal || 'Not specified'}
- Budget Range: ${member.budget_range || 'Not specified'}
- Timeline: ${member.timeline || 'Not specified'}
- Preferred Areas: ${member.preferred_areas?.join(', ') || 'Not specified'}
- Saved Properties: ${savedPropertiesCount}
- Portfolio Value: ${portfolioValue > 0 ? `AED ${portfolioValue.toLocaleString()}` : 'No portfolio yet'}

Top Performing Areas This Week:
${topAreas.map(a => `- ${a.area}: ${a.avgYield.toFixed(1)}% avg yield`).join('\n')}

Return exactly 3-4 bullet points (one line each) with specific, actionable insights. Focus on:
1. Opportunities matching their goals/budget
2. Market trends relevant to their timeline
3. Actions they should take this week
4. Portfolio optimization suggestions (if they have properties)

Keep each insight under 100 characters. Be direct and specific.`;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      console.error("AI API error:", response.status);
      return getDefaultInsights(topAreas);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Parse bullet points from response
    const insights = content
      .split('\n')
      .filter((line: string) => line.trim().startsWith('-') || line.trim().startsWith('•') || line.trim().match(/^\d+\./))
      .map((line: string) => line.replace(/^[-•\d.]+\s*/, '').trim())
      .filter((line: string) => line.length > 10 && line.length < 150)
      .slice(0, 4);

    return insights.length >= 3 ? insights : getDefaultInsights(topAreas);
  } catch (error) {
    console.error("Error generating AI insights:", error);
    return getDefaultInsights(topAreas);
  }
}

function getDefaultInsights(topAreas: { area: string; avgYield: number }[]): string[] {
  const topArea = topAreas[0];
  return [
    `${topArea?.area || 'Dubai Marina'} showing strong rental yields this week at ${topArea?.avgYield?.toFixed(1) || '7.2'}%`,
    "New off-plan launches expected in Q1 2025 - review your investment timeline",
    "Golden Visa threshold remains at AED 2M - check eligible properties in your saved list",
    "Schedule a portfolio review call with our investment team this week",
  ];
}

function generateDigestEmail(
  member: EliteMember,
  insights: string[],
  topProperties: { title: string; area: string; yield: number }[],
  upcomingEvents: { title: string; date: string }[],
  portfolioSummary: { count: number; value: number; avgYield: number } | null
): string {
  const safeName = escapeHtml(member.full_name || 'Investor');
  const baseUrl = "https://dubaiwealthhub.com";

  const insightsHtml = insights
    .map(insight => `<li style="margin-bottom: 12px; color: #333333; line-height: 1.5;">${escapeHtml(insight)}</li>`)
    .join('');

  const propertiesHtml = topProperties.length > 0
    ? topProperties.map(p => `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee;">
            <strong style="color: #0A0F1D;">${escapeHtml(p.title)}</strong><br>
            <span style="color: #666666; font-size: 14px;">${escapeHtml(p.area)} • ${p.yield.toFixed(1)}% yield</span>
          </td>
        </tr>
      `).join('')
    : '<tr><td style="padding: 12px 0; color: #666666;">No new opportunities this week matching your criteria.</td></tr>';

  const eventsHtml = upcomingEvents.length > 0
    ? upcomingEvents.map(e => `
        <li style="margin-bottom: 8px; color: #333333;">
          <strong>${escapeHtml(e.title)}</strong> - ${escapeHtml(e.date)}
        </li>
      `).join('')
    : '<li style="color: #666666;">No upcoming events this week.</li>';

  const portfolioSection = portfolioSummary && portfolioSummary.count > 0
    ? `
      <tr>
        <td style="padding: 24px 32px; background-color: #f9fafb; border-radius: 8px; margin: 16px 0;">
          <h3 style="margin: 0 0 16px 0; color: #0A0F1D; font-size: 16px;">📊 Your Portfolio Snapshot</h3>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="text-align: center; padding: 8px;">
                <div style="font-size: 24px; font-weight: 700; color: #CBB89E;">${portfolioSummary.count}</div>
                <div style="font-size: 12px; color: #666666;">Properties</div>
              </td>
              <td style="text-align: center; padding: 8px;">
                <div style="font-size: 24px; font-weight: 700; color: #CBB89E;">AED ${(portfolioSummary.value / 1000000).toFixed(1)}M</div>
                <div style="font-size: 12px; color: #666666;">Total Value</div>
              </td>
              <td style="text-align: center; padding: 8px;">
                <div style="font-size: 24px; font-weight: 700; color: #CBB89E;">${portfolioSummary.avgYield.toFixed(1)}%</div>
                <div style="font-size: 12px; color: #666666;">Avg Yield</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `
    : '';

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
                    <p style="margin: 8px 0 0 0; color: #CBB89E; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Weekly Market Digest</p>
                  </td>
                </tr>
                
                <!-- Greeting -->
                <tr>
                  <td style="padding: 32px 32px 16px 32px;">
                    <h2 style="margin: 0; color: #0A0F1D; font-size: 20px; font-weight: 600;">Good morning, ${safeName} 👋</h2>
                    <p style="margin: 8px 0 0 0; color: #666666; font-size: 16px;">Here's your personalized investment digest for this week.</p>
                  </td>
                </tr>

                ${portfolioSection}

                <!-- AI Insights -->
                <tr>
                  <td style="padding: 24px 32px;">
                    <h3 style="margin: 0 0 16px 0; color: #0A0F1D; font-size: 16px; display: flex; align-items: center;">
                      🎯 Your Personalized Insights
                    </h3>
                    <ul style="margin: 0; padding-left: 20px;">
                      ${insightsHtml}
                    </ul>
                  </td>
                </tr>

                <!-- Hot Properties -->
                <tr>
                  <td style="padding: 24px 32px;">
                    <h3 style="margin: 0 0 16px 0; color: #0A0F1D; font-size: 16px;">🔥 Top Opportunities This Week</h3>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      ${propertiesHtml}
                    </table>
                    <a href="${baseUrl}/properties" style="display: inline-block; margin-top: 16px; color: #CBB89E; text-decoration: none; font-weight: 500;">
                      View all properties →
                    </a>
                  </td>
                </tr>

                <!-- Events -->
                <tr>
                  <td style="padding: 24px 32px;">
                    <h3 style="margin: 0 0 16px 0; color: #0A0F1D; font-size: 16px;">📅 Upcoming Elite Events</h3>
                    <ul style="margin: 0; padding-left: 20px;">
                      ${eventsHtml}
                    </ul>
                    <a href="${baseUrl}/community/events" style="display: inline-block; margin-top: 12px; color: #CBB89E; text-decoration: none; font-weight: 500;">
                      View all events →
                    </a>
                  </td>
                </tr>

                <!-- CTA -->
                <tr>
                  <td style="padding: 24px 32px; text-align: center;">
                    <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                      <tr>
                        <td style="background: linear-gradient(135deg, #CBB89E 0%, #a89776 100%); border-radius: 8px;">
                          <a href="${baseUrl}/dashboard" style="display: inline-block; padding: 14px 32px; color: #0A0F1D; text-decoration: none; font-weight: 600; font-size: 14px;">
                            Go to Dashboard
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
                      You're receiving this as an Elite member of Dubai Wealth Hub.<br>
                      <a href="${baseUrl}/settings#notifications" style="color: #CBB89E;">Manage your email preferences</a>
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
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  console.log("Starting weekly digest job...");

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get Elite members with digest enabled
    const { data: eliteMembers, error: membersError } = await supabase
      .from("profiles")
      .select("id, email, full_name, investment_goal, budget_range, timeline, preferred_areas")
      .eq("membership_tier", "elite")
      .eq("notify_email_digest", true)
      .not("email", "is", null);

    if (membersError) {
      console.error("Error fetching elite members:", membersError);
      throw membersError;
    }

    console.log(`Found ${eliteMembers?.length || 0} Elite members to send digest to`);

    if (!eliteMembers || eliteMembers.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No eligible members found", sent: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Fetch market data for insights
    const { data: properties } = await supabase
      .from("properties")
      .select("location_area, rental_yield")
      .not("rental_yield", "is", null)
      .order("created_at", { ascending: false })
      .limit(100);

    // Calculate top areas by yield
    const areaYields: Record<string, number[]> = {};
    properties?.forEach(p => {
      if (p.location_area && p.rental_yield) {
        if (!areaYields[p.location_area]) areaYields[p.location_area] = [];
        areaYields[p.location_area].push(p.rental_yield);
      }
    });

    const topAreas = Object.entries(areaYields)
      .map(([area, yields]) => ({
        area,
        avgYield: yields.reduce((a, b) => a + b, 0) / yields.length,
      }))
      .sort((a, b) => b.avgYield - a.avgYield)
      .slice(0, 5);

    // Fetch upcoming events
    const { data: events } = await supabase
      .from("community_events")
      .select("title, event_date")
      .eq("is_published", true)
      .gte("event_date", new Date().toISOString())
      .order("event_date", { ascending: true })
      .limit(3);

    const upcomingEvents = events?.map(e => ({
      title: e.title,
      date: new Date(e.event_date).toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      }),
    })) || [];

    // Fetch top properties
    const { data: topProps } = await supabase
      .from("properties")
      .select("title, location_area, rental_yield")
      .not("rental_yield", "is", null)
      .order("rental_yield", { ascending: false })
      .limit(3);

    const topProperties = topProps?.map(p => ({
      title: p.title,
      area: p.location_area || 'Dubai',
      yield: p.rental_yield || 0,
    })) || [];

    let sentCount = 0;
    let errorCount = 0;

    // Process members in batches of 10
    const batchSize = 10;
    for (let i = 0; i < eliteMembers.length; i += batchSize) {
      const batch = eliteMembers.slice(i, i + batchSize);

      await Promise.all(batch.map(async (member) => {
        try {
          // Get member's saved properties count
          const { count: savedCount } = await supabase
            .from("saved_properties")
            .select("*", { count: "exact", head: true })
            .eq("user_id", member.id);

          // Get portfolio summary
          const { data: portfolio } = await supabase
            .from("portfolio_properties")
            .select("current_value, monthly_rental_income")
            .eq("portfolio_id", member.id);

          let portfolioSummary = null;
          if (portfolio && portfolio.length > 0) {
            const totalValue = portfolio.reduce((sum, p) => sum + (p.current_value || 0), 0);
            const totalIncome = portfolio.reduce((sum, p) => sum + ((p.monthly_rental_income || 0) * 12), 0);
            portfolioSummary = {
              count: portfolio.length,
              value: totalValue,
              avgYield: totalValue > 0 ? (totalIncome / totalValue) * 100 : 0,
            };
          }

          // Generate AI insights
          const insights = await generateAIInsights(
            member as EliteMember,
            savedCount || 0,
            portfolioSummary?.value || 0,
            topAreas
          );

          // Generate email
          const emailHtml = generateDigestEmail(
            member as EliteMember,
            insights,
            topProperties,
            upcomingEvents,
            portfolioSummary
          );

          // Send email
          const { error: emailError } = await resend.emails.send({
            from: "Dubai Wealth Hub <onboarding@resend.dev>",
            to: [member.email],
            subject: "📊 Your Weekly Dubai Investment Digest",
            html: emailHtml,
          });

          if (emailError) {
            console.error(`Error sending to ${member.email}:`, emailError);
            errorCount++;
          } else {
            console.log(`Sent digest to ${member.email}`);
            sentCount++;

            // Update last_digest_sent_at
            await supabase
              .from("profiles")
              .update({ last_digest_sent_at: new Date().toISOString() })
              .eq("id", member.id);
          }
        } catch (error) {
          console.error(`Error processing ${member.email}:`, error);
          errorCount++;
        }
      }));

      // Rate limit between batches
      if (i + batchSize < eliteMembers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const duration = Date.now() - startTime;
    console.log(`Weekly digest completed in ${duration}ms. Sent: ${sentCount}, Errors: ${errorCount}`);

    return new Response(
      JSON.stringify({
        success: true,
        sent: sentCount,
        errors: errorCount,
        duration: `${duration}ms`,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-weekly-digest:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
