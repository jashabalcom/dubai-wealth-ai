import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cache configuration
const CACHE_TTL_DAYS = 7;
const FUNCTION_NAME = "ai-calculator-analysis";

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

// Normalize inputs for caching (round to reduce cache fragmentation)
function normalizeInputs(inputs: Record<string, any>): Record<string, any> {
  const normalized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(inputs)) {
    if (typeof value === 'number') {
      // Round prices to nearest 50K
      if (key.toLowerCase().includes('price') || key.toLowerCase().includes('value')) {
        normalized[key] = Math.round(value / 50000) * 50000;
      }
      // Round percentages to nearest 0.5
      else if (key.toLowerCase().includes('rate') || key.toLowerCase().includes('percent') || key.toLowerCase().includes('yield') || key.toLowerCase().includes('appreciation')) {
        normalized[key] = Math.round(value * 2) / 2;
      }
      // Round other numbers to nearest 100
      else {
        normalized[key] = Math.round(value / 100) * 100;
      }
    } else {
      normalized[key] = value;
    }
  }
  
  return normalized;
}

// Generate cache key
function generateCacheKey(calculatorType: string, inputs: Record<string, any>, area?: string): string {
  const normalized = normalizeInputs(inputs);
  const data = JSON.stringify({ calculatorType, inputs: normalized, area: area || '' });
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `calc_${calculatorType}_${Math.abs(hash).toString(16)}`;
}

// Check cache
async function checkCache(supabase: any, cacheKey: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("ai_response_cache")
      .select("response, id, hit_count")
      .eq("cache_key", cacheKey)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (error || !data) return null;

    // Increment hit count
    supabase.from("ai_response_cache")
      .update({ hit_count: (data.hit_count || 0) + 1 })
      .eq("id", data.id)
      .then(() => {});

    console.log(`Cache HIT for key: ${cacheKey}`);
    return data.response;
  } catch (e) {
    console.log("Cache check error:", e);
    return null;
  }
}

// Store in cache
async function storeCache(supabase: any, cacheKey: string, response: string, inputHash: string): Promise<void> {
  try {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + CACHE_TTL_DAYS);

    await supabase.from("ai_response_cache").upsert({
      cache_key: cacheKey,
      function_name: FUNCTION_NAME,
      response,
      input_hash: inputHash,
      expires_at: expiresAt.toISOString(),
      hit_count: 0,
    }, { onConflict: "cache_key" });

    console.log(`Cache STORE for key: ${cacheKey}`);
  } catch (e) {
    console.log("Cache store error:", e);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { calculatorType, inputs, results, area } = await req.json() as CalculatorData;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Initialize Supabase client for caching
    let supabase: any = null;
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    }

    // Generate cache key
    const cacheKey = generateCacheKey(calculatorType, inputs, area);
    
    // Check cache first
    if (supabase) {
      const cachedResponse = await checkCache(supabase, cacheKey);
      if (cachedResponse) {
        const sseData = `data: ${JSON.stringify({ choices: [{ delta: { content: cachedResponse } }] })}\n\ndata: [DONE]\n\n`;
        return new Response(sseData, {
          headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
        });
      }
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

    // Collect and cache the response
    if (supabase && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";
      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        chunks.push(value);
        const text = decoder.decode(value, { stream: true });
        
        const lines = text.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ") && line !== "data: [DONE]") {
            try {
              const json = JSON.parse(line.slice(6));
              const content = json.choices?.[0]?.delta?.content;
              if (content) fullResponse += content;
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }

      // Store in cache
      if (fullResponse.length > 0) {
        storeCache(supabase, cacheKey, fullResponse, cacheKey);
      }

      // Return collected response
      const concatenated = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
      let offset = 0;
      for (const chunk of chunks) {
        concatenated.set(chunk, offset);
        offset += chunk.length;
      }

      return new Response(concatenated, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
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