import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Dubai market benchmarks for context
const MARKET_BENCHMARKS = {
  avgGrossYield: 6.5,
  avgNetYield: 5.0,
  avgAppreciation: 5,
  avgServiceCharges: { low: 12, mid: 18, high: 30 },
  goldenVisaThreshold: 2000000,
  mortgageRateRange: { min: 3.5, max: 5.5 },
  areaYields: {
    'Dubai Marina': { yield: 6.2, appreciation: 4.5 },
    'Downtown Dubai': { yield: 5.5, appreciation: 5.5 },
    'JVC': { yield: 8.0, appreciation: 6.0 },
    'Palm Jumeirah': { yield: 4.5, appreciation: 4.0 },
    'Business Bay': { yield: 6.8, appreciation: 5.0 },
  }
};

interface CalculatorData {
  calculatorType: 'roi' | 'mortgage' | 'total-cost';
  inputs: Record<string, any>;
  results: Record<string, any>;
  area?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { calculatorType, inputs, results, area } = await req.json() as CalculatorData;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context based on calculator type
    let analysisContext = '';
    let specificPrompt = '';

    if (calculatorType === 'roi') {
      analysisContext = `
## ROI Calculator Results
- Purchase Price: AED ${inputs.purchasePrice?.toLocaleString()}
- Property Size: ${inputs.propertySizeSqft} sqft in ${area || 'Dubai'}
- Down Payment: ${inputs.downPayment}%
- Annual Rent: AED ${inputs.annualRent?.toLocaleString()}
- Holding Period: ${inputs.holdingPeriod} years
- Expected Appreciation: ${inputs.annualAppreciation}%

### Calculated Returns
- Gross Yield: ${results.grossYield?.toFixed(2)}%
- Net Yield: ${results.netYield?.toFixed(2)}%
- Cash-on-Cash Return: ${results.cashOnCash?.toFixed(2)}%
- Total ROI over ${inputs.holdingPeriod} years: ${results.totalROI?.toFixed(1)}%
- Annualized ROI: ${results.annualizedROI?.toFixed(1)}%
- Total Initial Investment: AED ${results.totalInitialInvestment?.toLocaleString()}
- Net Annual Income: AED ${results.netRentalIncome?.toLocaleString()}
`;
      specificPrompt = `Analyze this ROI calculation and provide insights on:
1. How the yield compares to Dubai market averages (avg gross yield is ${MARKET_BENCHMARKS.avgGrossYield}%)
2. Whether the expected appreciation is realistic for this area
3. Key risks to consider with these projections
4. Whether this property meets Golden Visa requirements (AED 2M+ threshold)
5. One actionable recommendation to improve returns`;

    } else if (calculatorType === 'mortgage') {
      analysisContext = `
## Mortgage Calculator Results
- Property Price: AED ${inputs.propertyPrice?.toLocaleString()}
- Down Payment: ${inputs.downPayment}% (AED ${results.downPaymentAmount?.toLocaleString()})
- Loan Amount: AED ${results.loanAmount?.toLocaleString()}
- Interest Rate: ${inputs.interestRate}%
- Loan Term: ${inputs.loanTerm} years

### Payment Breakdown
- Monthly Payment: AED ${results.monthlyPayment?.toLocaleString()}
- Total Interest Over Term: AED ${results.totalInterest?.toLocaleString()}
- Total Upfront Cash Required: AED ${results.totalUpfront?.toLocaleString()}
- Total Cost of Ownership: AED ${results.totalCostOfOwnership?.toLocaleString()}
`;
      specificPrompt = `Analyze this mortgage calculation and provide insights on:
1. How the interest rate compares to current Dubai market rates (typical range: ${MARKET_BENCHMARKS.mortgageRateRange.min}%-${MARKET_BENCHMARKS.mortgageRateRange.max}%)
2. The total interest as a percentage of the property price and whether that's competitive
3. Whether the down payment level is optimal (UAE regulations require min 20% for expats)
4. Cash flow considerations - monthly payment vs potential rental income
5. One recommendation for optimizing this mortgage structure`;

    } else if (calculatorType === 'total-cost') {
      analysisContext = `
## Total Cost of Ownership Calculator Results
- Purchase Price: AED ${inputs.purchasePrice?.toLocaleString()}
- Property Size: ${inputs.propertySize} sqft in ${area || 'Dubai'}
- Financing: ${inputs.useMortgage ? `Mortgage (${inputs.downPayment}% down, ${inputs.interestRate}% rate)` : 'Cash Purchase'}
- Investment Strategy: ${inputs.usageType === 'long-term' ? 'Long-term Rental' : inputs.usageType === 'short-term' ? 'Short-term/Airbnb' : 'Personal Use'}
- Holding Period: ${inputs.holdingPeriod} years
- Expected Appreciation: ${inputs.appreciationRate}%

### Cost Summary
- Acquisition Costs: AED ${results.acquisitionTotal?.toLocaleString()}
- Annual Ongoing Costs: AED ${results.annualOngoing?.toLocaleString()}
- Total Financing Costs: AED ${results.totalFinancingCosts?.toLocaleString()}
- Exit Costs: AED ${results.exitTotal?.toLocaleString()}
- Total Cost of Ownership: AED ${results.totalCostOfOwnership?.toLocaleString()}

### Returns
- Net Profit: AED ${results.netProfit?.toLocaleString()}
- Total ROI: ${results.roi?.toFixed(1)}%
- Annualized ROI: ${results.annualizedRoi?.toFixed(1)}%
- Break-even Year: ${results.breakEvenYear > 0 ? `Year ${results.breakEvenYear}` : 'N/A'}
- Expected Exit Value: AED ${results.exitPropertyValue?.toLocaleString()}
`;
      specificPrompt = `Analyze this total cost of ownership calculation and provide insights on:
1. Whether the overall ROI is attractive compared to other investment options
2. How the break-even timeline compares to typical Dubai investments
3. Key cost factors that could be optimized
4. Risks specific to this investment strategy and holding period
5. Whether the appreciation assumptions are realistic for this area and timeframe`;
    }

    const systemPrompt = `You are a Dubai real estate investment analyst. Provide clear, specific analysis in plain English.

## Market Context
- Average gross rental yield in Dubai: ${MARKET_BENCHMARKS.avgGrossYield}%
- Average net yield: ${MARKET_BENCHMARKS.avgNetYield}%
- Average annual appreciation: ${MARKET_BENCHMARKS.avgAppreciation}%
- Golden Visa property threshold: AED 2,000,000
- Current mortgage rates: ${MARKET_BENCHMARKS.mortgageRateRange.min}%-${MARKET_BENCHMARKS.mortgageRateRange.max}%

## Response Guidelines
- Use specific numbers and percentages in your analysis
- Compare to Dubai market benchmarks
- Be direct about risks and opportunities
- Keep response concise (300-400 words max)
- Use clear headings for each insight
- End with ONE specific actionable recommendation`;

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
          { role: "user", content: `${analysisContext}\n\n${specificPrompt}` }
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    console.error("Calculator analysis error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
