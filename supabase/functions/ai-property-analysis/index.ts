import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Dubai area statistics (simplified - in production, this would come from real market data)
const AREA_STATS: Record<string, { avgPricePerSqft: number; avgYield: number; growth2024: number }> = {
  "Downtown Dubai": { avgPricePerSqft: 2800, avgYield: 4.5, growth2024: 12 },
  "Dubai Marina": { avgPricePerSqft: 2200, avgYield: 5.5, growth2024: 10 },
  "Palm Jumeirah": { avgPricePerSqft: 3500, avgYield: 4.2, growth2024: 15 },
  "Business Bay": { avgPricePerSqft: 1800, avgYield: 6.0, growth2024: 8 },
  "JVC": { avgPricePerSqft: 950, avgYield: 7.5, growth2024: 6 },
  "Dubai Hills": { avgPricePerSqft: 1900, avgYield: 5.5, growth2024: 11 },
  "Dubai South": { avgPricePerSqft: 800, avgYield: 7.0, growth2024: 5 },
  "JBR": { avgPricePerSqft: 2400, avgYield: 5.0, growth2024: 9 },
  "DIFC": { avgPricePerSqft: 2900, avgYield: 4.8, growth2024: 10 },
  "Dubai Creek Harbour": { avgPricePerSqft: 2100, avgYield: 5.2, growth2024: 14 },
};

// Fee calculations
function calculateAcquisitionCosts(priceAed: number, isMortgage: boolean = false, loanAmount: number = 0) {
  const dldFee = priceAed * 0.04;
  const agentCommission = priceAed * 0.02;
  const trusteeFee = 4200 * 1.05; // + VAT
  const titleDeed = 520;
  const nocFee = 1000;
  const mortgageRegistration = isMortgage ? loanAmount * 0.0025 : 0;
  
  return {
    dldFee,
    agentCommission,
    trusteeFee,
    titleDeed,
    nocFee,
    mortgageRegistration,
    total: dldFee + agentCommission + trusteeFee + titleDeed + nocFee + mortgageRegistration
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { propertyId, userId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Required environment variables not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch property data
    const { data: property, error: propError } = await supabase
      .from("properties")
      .select("*")
      .eq("id", propertyId)
      .single();

    if (propError || !property) {
      throw new Error("Property not found");
    }

    // Fetch area comparables
    const { data: areaProperties } = await supabase
      .from("properties")
      .select("price_aed, size_sqft, rental_yield_estimate")
      .eq("location_area", property.location_area)
      .neq("id", propertyId)
      .limit(20);

    // Calculate area averages
    let areaAvgPricePerSqft = AREA_STATS[property.location_area]?.avgPricePerSqft || 1500;
    let areaAvgYield = AREA_STATS[property.location_area]?.avgYield || 6.0;
    
    if (areaProperties && areaProperties.length > 0) {
      const totalPricePerSqft = areaProperties.reduce((sum, p) => sum + (Number(p.price_aed) / Number(p.size_sqft)), 0);
      const totalYield = areaProperties.reduce((sum, p) => sum + Number(p.rental_yield_estimate || 0), 0);
      areaAvgPricePerSqft = Math.round(totalPricePerSqft / areaProperties.length);
      areaAvgYield = Number((totalYield / areaProperties.length).toFixed(1)) || areaAvgYield;
    }

    // Fetch user context if provided
    let userContext = "";
    if (userId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("budget_range, investment_goal, timeline, membership_tier")
        .eq("id", userId)
        .single();

      if (profile) {
        userContext = `
## USER CONTEXT
- Budget Range: ${profile.budget_range || "Not specified"}
- Investment Goal: ${profile.investment_goal || "Not specified"}
- Timeline: ${profile.timeline || "Not specified"}
- Membership: ${profile.membership_tier}

Consider whether this property fits the user's stated goals and budget.
`;
      }
    }

    // Calculate key metrics
    const pricePerSqft = Math.round(Number(property.price_aed) / Number(property.size_sqft));
    const priceDiff = ((pricePerSqft - areaAvgPricePerSqft) / areaAvgPricePerSqft * 100).toFixed(1);
    const yieldDiff = (Number(property.rental_yield_estimate) - areaAvgYield).toFixed(1);
    const acquisitionCosts = calculateAcquisitionCosts(Number(property.price_aed));
    const totalInvestment = Number(property.price_aed) + acquisitionCosts.total;
    const annualRent = Number(property.price_aed) * (Number(property.rental_yield_estimate) / 100);
    const monthlyRent = Math.round(annualRent / 12);
    const netYield = ((annualRent - (Number(property.size_sqft) * 25)) / totalInvestment * 100).toFixed(1); // After service charges

    const systemPrompt = `You are analyzing a specific Dubai property for a potential investor. Provide a thorough but concise investment analysis.

${userContext}

## PROPERTY DATA
- **Title**: ${property.title}
- **Location**: ${property.location_area}
- **Type**: ${property.property_type}
- **Status**: ${property.is_off_plan ? "Off-Plan" : "Ready"} ${property.completion_date ? `(Completion: ${property.completion_date})` : ""}
- **Developer**: ${property.developer_name || "N/A"}
- **Price**: AED ${Number(property.price_aed).toLocaleString()}
- **Size**: ${Number(property.size_sqft).toLocaleString()} sqft
- **Bedrooms**: ${property.bedrooms === 0 ? "Studio" : property.bedrooms}
- **Price/sqft**: AED ${pricePerSqft.toLocaleString()}
- **Listed Yield**: ${property.rental_yield_estimate}%

## AREA COMPARISON (${property.location_area})
- Area Average Price/sqft: AED ${areaAvgPricePerSqft.toLocaleString()}
- This Property vs Area: ${Number(priceDiff) > 0 ? "+" : ""}${priceDiff}% ${Number(priceDiff) > 0 ? "(above average)" : "(below average)"}
- Area Average Yield: ${areaAvgYield}%
- This Property vs Area: ${Number(yieldDiff) > 0 ? "+" : ""}${yieldDiff}% yield difference
${AREA_STATS[property.location_area] ? `- 2024 Price Growth: +${AREA_STATS[property.location_area].growth2024}%` : ""}

## COST BREAKDOWN
- Property Price: AED ${Number(property.price_aed).toLocaleString()}
- DLD Fee (4%): AED ${Math.round(acquisitionCosts.dldFee).toLocaleString()}
- Agent Commission (2%): AED ${Math.round(acquisitionCosts.agentCommission).toLocaleString()}
- Other Fees: AED ${Math.round(acquisitionCosts.trusteeFee + acquisitionCosts.titleDeed + acquisitionCosts.nocFee).toLocaleString()}
- **Total Investment**: AED ${Math.round(totalInvestment).toLocaleString()}

## RENTAL PROJECTIONS
- Estimated Monthly Rent: AED ${monthlyRent.toLocaleString()}
- Gross Annual Yield: ${property.rental_yield_estimate}%
- Net Yield (after service charges): ~${netYield}%

${property.is_off_plan && property.payment_plan_json ? `
## PAYMENT PLAN
- Down Payment: ${(property.payment_plan_json as any).down_payment}%
- During Construction: ${(property.payment_plan_json as any).during_construction}%
- On Handover: ${(property.payment_plan_json as any).on_handover}%
${(property.payment_plan_json as any).post_handover > 0 ? `- Post-Handover: ${(property.payment_plan_json as any).post_handover}% over ${(property.payment_plan_json as any).post_handover_years} years` : ""}
` : ""}

## YOUR ANALYSIS SHOULD INCLUDE:

1. **Value Assessment**: Is this property priced competitively for the area? Good value or premium pricing?

2. **Yield Analysis**: How does the rental yield compare? Is it realistic for this area and property type?

3. **Investment Fit**: ${userId ? "Based on the user's goals and budget, is this a good match?" : "What type of investor is this best suited for?"}

4. **Key Risks**: What should the investor be aware of? (area-specific, off-plan risks if applicable, market factors)

5. **Golden Visa**: Does this qualify for Golden Visa? (Need AED 2M+ ready property)

6. **Verdict & Next Steps**: Clear recommendation and suggested actions

Keep the analysis practical and actionable. Use specific numbers from the data provided.`;

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
          { role: "user", content: `Please provide a comprehensive investment analysis for this property: ${property.title}` },
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
          JSON.stringify({ error: "AI credits exhausted. Please add funds to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Property analysis error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
