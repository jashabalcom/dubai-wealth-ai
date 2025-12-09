import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Fetch saved properties with details
    const { data: savedProperties } = await supabase
      .from('saved_properties')
      .select(`
        created_at,
        property:properties(
          title, price_aed, location_area, bedrooms, size_sqft, 
          rental_yield_estimate, is_off_plan, property_type
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    // Fetch portfolio data for Elite users
    let portfolioData = null;
    if (profile?.membership_tier === 'elite') {
      const { data: portfolio } = await supabase
        .from('portfolios')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (portfolio) {
        const { data: properties } = await supabase
          .from('portfolio_properties')
          .select('*')
          .eq('portfolio_id', portfolio.id);

        if (properties && properties.length > 0) {
          const totalValue = properties.reduce((sum, p) => sum + Number(p.current_value), 0);
          const totalPurchase = properties.reduce((sum, p) => sum + Number(p.purchase_price), 0);
          const totalRental = properties.reduce((sum, p) => sum + (Number(p.monthly_rental_income) || 0) * 12, 0);
          const totalMortgage = properties.reduce((sum, p) => sum + (Number(p.mortgage_balance) || 0), 0);
          
          portfolioData = {
            propertyCount: properties.length,
            totalValue,
            totalPurchase,
            totalAppreciation: totalValue - totalPurchase,
            appreciationPercent: ((totalValue - totalPurchase) / totalPurchase * 100).toFixed(1),
            annualRentalIncome: totalRental,
            portfolioYield: totalValue > 0 ? (totalRental / totalValue * 100).toFixed(1) : 0,
            equity: totalValue - totalMortgage,
            properties: properties.map(p => ({
              name: p.property_name,
              area: p.location_area,
              value: p.current_value,
              rental: p.monthly_rental_income,
            })),
          };
        }
      }
    }

    // Fetch market stats (avg prices by area)
    const { data: allProperties } = await supabase
      .from('properties')
      .select('location_area, price_aed, size_sqft, rental_yield_estimate')
      .limit(100);

    // Calculate area averages
    const areaStats: Record<string, { avgPricePerSqft: number; avgYield: number; count: number }> = {};
    if (allProperties) {
      for (const prop of allProperties) {
        if (!areaStats[prop.location_area]) {
          areaStats[prop.location_area] = { avgPricePerSqft: 0, avgYield: 0, count: 0 };
        }
        areaStats[prop.location_area].count++;
        areaStats[prop.location_area].avgPricePerSqft += prop.price_aed / prop.size_sqft;
        areaStats[prop.location_area].avgYield += prop.rental_yield_estimate || 0;
      }
      for (const area of Object.keys(areaStats)) {
        areaStats[area].avgPricePerSqft /= areaStats[area].count;
        areaStats[area].avgYield /= areaStats[area].count;
      }
    }

    // Build context for AI
    const savedPropsContext = savedProperties?.map(sp => {
      const p = sp.property as any;
      if (!p) return null;
      return `- ${p.title}: AED ${p.price_aed?.toLocaleString()} in ${p.location_area}, ${p.bedrooms}BR, ${p.size_sqft} sqft, ${p.rental_yield_estimate || 'N/A'}% yield${p.is_off_plan ? ' (Off-Plan)' : ''}`;
    }).filter(Boolean).join('\n') || 'No saved properties';

    const portfolioContext = portfolioData ? `
## User's Portfolio (Elite Member)
- ${portfolioData.propertyCount} properties worth AED ${portfolioData.totalValue.toLocaleString()}
- Total appreciation: AED ${portfolioData.totalAppreciation.toLocaleString()} (${portfolioData.appreciationPercent}%)
- Annual rental income: AED ${portfolioData.annualRentalIncome.toLocaleString()}
- Portfolio yield: ${portfolioData.portfolioYield}%
- Equity: AED ${portfolioData.equity.toLocaleString()}
Properties: ${portfolioData.properties.map(p => `${p.name} in ${p.area}`).join(', ')}
` : '';

    const profileContext = `
## User Profile
- Investment Goal: ${profile?.investment_goal || 'Not specified'}
- Budget Range: ${profile?.budget_range || 'Not specified'}
- Timeline: ${profile?.timeline || 'Not specified'}
- Membership: ${profile?.membership_tier || 'free'}
`;

    const marketContext = Object.entries(areaStats)
      .slice(0, 5)
      .map(([area, stats]) => `- ${area}: AED ${Math.round(stats.avgPricePerSqft).toLocaleString()}/sqft, ${stats.avgYield.toFixed(1)}% avg yield`)
      .join('\n');

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a Dubai real estate investment advisor providing personalized weekly insights.

${profileContext}

## Saved Properties
${savedPropsContext}

${portfolioContext}

## Current Market Overview
${marketContext}

## Response Guidelines
- Provide 3-4 actionable insights personalized to this user
- Reference their specific saved properties or portfolio when relevant
- Include specific numbers and percentages
- Highlight opportunities and potential concerns
- Keep each insight concise (2-3 sentences max)
- Format as a bulleted list with bold headers
- End with ONE specific action recommendation

Do NOT use generic advice. Every insight must reference their specific data.`;

    const userPrompt = profile?.membership_tier === 'elite' && portfolioData
      ? "Generate personalized weekly investment insights based on my portfolio performance and saved properties. Focus on portfolio optimization, market timing, and growth opportunities."
      : savedProperties && savedProperties.length > 0
        ? "Generate personalized weekly investment insights based on my saved properties. Help me understand which properties might be the best fit and what I should consider."
        : "Generate general Dubai real estate investment insights for someone just starting their investment journey. Include current market trends and beginner recommendations.";

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
          { role: "user", content: userPrompt }
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    console.error("Dashboard insights error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
