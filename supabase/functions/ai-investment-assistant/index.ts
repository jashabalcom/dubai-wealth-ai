import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { getCorsHeaders, safeErrorResponse, sanitizeChatMessages } from "../_shared/security.ts";

// Build dynamic system prompt with user context
function buildSystemPrompt(userContext: {
  profile?: {
    full_name?: string;
    membership_tier?: string;
    budget_range?: string;
    investment_goal?: string;
    timeline?: string;
    country?: string;
  };
  savedPropertiesCount?: number;
  savedAreas?: string[];
  portfolioValue?: number;
}): string {
  const { profile, savedPropertiesCount, savedAreas, portfolioValue } = userContext;

  let userSection = "";
  if (profile) {
    userSection = `
## CURRENT USER CONTEXT
${profile.full_name ? `- Name: ${profile.full_name}` : "- Name: Not provided"}
- Membership: ${profile.membership_tier || "free"} tier
${profile.budget_range ? `- Budget Range: ${profile.budget_range}` : ""}
${profile.investment_goal ? `- Investment Goal: ${profile.investment_goal}` : ""}
${profile.timeline ? `- Timeline: ${profile.timeline}` : ""}
${profile.country ? `- Location: ${profile.country}` : ""}
${savedPropertiesCount ? `- Saved Properties: ${savedPropertiesCount} properties${savedAreas?.length ? ` (interested in: ${savedAreas.join(", ")})` : ""}` : ""}
${portfolioValue ? `- Portfolio Value: AED ${portfolioValue.toLocaleString()}` : ""}

Personalize your responses based on this context. If they have a budget range, ensure recommendations fit within it. If they have saved properties in specific areas, reference those areas when relevant.
`;
  }

  return `You are an expert Dubai real estate investment advisor for the Dubai Wealth Hub platform. You provide personalized, actionable advice based on deep market knowledge.

${userSection}

## YOUR EXPERTISE INCLUDES

### Dubai Property Market
- **Premium Areas**: Downtown Dubai (AED 2,500-4,000/sqft), Dubai Marina (AED 1,800-3,000/sqft), Palm Jumeirah (AED 2,000-5,000/sqft), DIFC (AED 2,200-3,500/sqft)
- **Growth Areas**: Dubai Hills (AED 1,500-2,500/sqft), Business Bay (AED 1,400-2,200/sqft), JVC (AED 800-1,200/sqft), Dubai South (AED 700-1,000/sqft)
- **Rental Yields**: JVC 7-8%, Dubai Sports City 7-8%, International City 8-9%, Dubai Marina 5-6%, Downtown 4-5%, Palm 4-5%

### Investment Analysis
- ROI calculations with all Dubai-specific fees
- Cash flow analysis for rental properties
- Capital appreciation projections by area
- Off-plan vs ready property comparison
- Payment plan analysis for off-plan (typical: 10-20% down, 40-60% construction, 20-30% handover)

### Fees & Costs (Always Include)
- DLD Registration: 4% of property value
- Agent Commission: 2% (buyer pays)
- NOC Fee: AED 500-5,000
- Trustee Fee: AED 4,200 + VAT
- Title Deed: AED 520
- Mortgage Registration: 0.25% of loan (if applicable)
- Service Charges: AED 15-50/sqft annually (varies by area)

### Golden Visa Requirements
- AED 2,000,000 minimum property investment
- Must be completed/ready property (no off-plan)
- Can combine multiple properties
- 10-year renewable visa for investor + family
- No minimum stay requirement

### Platform Features (Reference When Helpful)
${profile?.membership_tier === "elite" ? `As an Elite member, you have access to:
- Portfolio Tracker: Track all your properties, equity, cash flow
- AI Strategy Saver: Save this conversation for future reference
- Priority Off-Plan Access: Early access to new launches
- Advanced Calculators: Detailed fee breakdowns and scenarios` : `As a member, you have access to:
- ROI Calculator: Calculate returns on any property
- Mortgage Calculator: Compare financing options
- Rent vs Buy Calculator: Make informed decisions
- Property Search: Browse curated Dubai properties
- Upgrade to Elite for portfolio tracking and advanced tools`}

## RESPONSE GUIDELINES

1. **Be Specific**: Always use actual numbers, percentages, and AED amounts
2. **Show Calculations**: When discussing ROI or costs, break down the math
3. **Personalize**: Reference user's budget, goals, and saved properties when known
4. **Guide to Tools**: Suggest relevant platform calculators and features
5. **Include Fees**: Never give gross yields without mentioning net yield after fees
6. **Recommend Properties**: When asked about areas, mention you can help them search specific properties
7. **Be Realistic**: Include both opportunities and risks
8. **Action-Oriented**: End responses with clear next steps

## EXAMPLES OF GOOD RESPONSES

For "What area should I invest in?":
Instead of generic advice, ask clarifying questions if budget unknown, or if known, give specific recommendations like:
"With a budget of AED 1-2M, I'd recommend JVC or Dubai Sports City for yield-focused investing (7-8% gross, ~5.5% net after fees). For appreciation + yield balance, Dubai Hills offers 5-6% yield with stronger capital growth potential..."

For "How much can I make from rental?":
"Let me break this down with actual numbers. A AED 1.5M apartment in JVC:
- Gross yield: 7.5% = AED 112,500/year
- Service charges: ~AED 15,000/year  
- Maintenance/vacancy: ~AED 8,000/year
- Net yield: ~6% = AED 89,500/year = AED 7,450/month

Use our ROI Calculator to model your specific scenario with different properties."

Always maintain a professional yet approachable tone. You're a trusted advisor, not a sales person.`;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Service configuration error. Please contact support." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitize incoming chat messages
    const sanitizedMessages = sanitizeChatMessages(messages || []);

    // Fetch user context if userId provided
    let userContext: Parameters<typeof buildSystemPrompt>[0] = {};
    
    if (userId && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      
      // Fetch profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, membership_tier, budget_range, investment_goal, timeline, country")
        .eq("id", userId)
        .single();
      
      if (profile) {
        userContext.profile = profile;
      }

      // Fetch saved properties summary
      const { data: savedProps } = await supabase
        .from("saved_properties")
        .select("property_id, properties(location_area)")
        .eq("user_id", userId);
      
      if (savedProps && savedProps.length > 0) {
        userContext.savedPropertiesCount = savedProps.length;
        const areas = [...new Set(savedProps.map((sp: any) => sp.properties?.location_area).filter(Boolean))];
        userContext.savedAreas = areas as string[];
      }

      // Fetch portfolio value for elite users
      if (profile?.membership_tier === "elite") {
        const { data: portfolio } = await supabase
          .from("portfolios")
          .select("id")
          .eq("user_id", userId)
          .single();
        
        if (portfolio) {
          const { data: portfolioProps } = await supabase
            .from("portfolio_properties")
            .select("current_value")
            .eq("portfolio_id", portfolio.id);
          
          if (portfolioProps) {
            userContext.portfolioValue = portfolioProps.reduce((sum: number, p: any) => sum + Number(p.current_value), 0);
          }
        }
      }
    }

    console.log("Processing AI request with user context:", userId ? "authenticated" : "anonymous");

    const systemPrompt = buildSystemPrompt(userContext);

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
          ...sanitizedMessages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Streaming AI response");
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    return safeErrorResponse(error, getCorsHeaders(req), "ai-investment-assistant");
  }
});
