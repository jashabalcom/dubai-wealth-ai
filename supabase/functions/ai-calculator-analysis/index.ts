import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cache configuration
const CACHE_TTL_DAYS = 7;
const FUNCTION_NAME = "ai-calculator-analysis";

// Default Dubai market benchmarks (used as fallback when live data unavailable)
const DEFAULT_BENCHMARKS = {
  avgGrossYield: 6.5,
  avgNetYield: 5.0,
  avgAppreciation: 5,
  avgServiceCharges: { low: 12, mid: 18, high: 30 },
  goldenVisaThreshold: 2000000,
  mortgageRateRange: { min: 3.5, max: 5.5 },
};

// Live market data interface
interface LiveMarketData {
  areaName: string;
  avgPriceSqft: number | null;
  avgYield: number | null;
  priceTrend: number | null;
  transactionsYtd: number | null;
  serviceChargeSqft: number | null;
  recentTransactions: RecentTransaction[];
  lastUpdated: string;
}

interface RecentTransaction {
  date: string;
  propertyType: string;
  rooms: string;
  areaSqft: number;
  price: number;
  priceSqft: number;
}

interface CalculatorData {
  calculatorType: 'roi' | 'mortgage' | 'total-cost' | 'cap-rate' | 'dscr' | 'free-zone';
  inputs: Record<string, any>;
  results: Record<string, any>;
  area?: string;
}

// Fetch live market data from database
async function fetchLiveMarketData(
  supabase: SupabaseClient, 
  areaName: string
): Promise<LiveMarketData | null> {
  try {
    // Fetch area market data
    const { data: areaData, error: areaError } = await supabase
      .from('area_market_data')
      .select('*')
      .ilike('area_name', `%${areaName}%`)
      .limit(1)
      .maybeSingle();

    if (areaError) {
      console.log(`Error fetching area data for ${areaName}:`, areaError.message);
    }

    // Fetch recent transactions for this area (last 30 days, limit 10)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: transactions, error: txError } = await supabase
      .from('market_transactions')
      .select('instance_date, property_type, rooms, procedure_area_sqft, actual_worth, sqft_sale_price')
      .ilike('area_name', `%${areaName}%`)
      .gte('instance_date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('instance_date', { ascending: false })
      .limit(10);

    if (txError) {
      console.log(`Error fetching transactions for ${areaName}:`, txError.message);
    }

    // Also try area_benchmarks as fallback
    let benchmarkData = null;
    if (!areaData) {
      const { data: benchmark } = await supabase
        .from('area_benchmarks')
        .select('*')
        .ilike('area_name', `%${areaName}%`)
        .limit(1)
        .maybeSingle();
      benchmarkData = benchmark;
    }

    const sourceData = areaData || benchmarkData;
    
    if (!sourceData && (!transactions || transactions.length === 0)) {
      return null;
    }

    return {
      areaName: sourceData?.area_name || areaName,
      avgPriceSqft: sourceData?.avg_price_sqft || null,
      avgYield: sourceData?.avg_yield || null,
      priceTrend: sourceData?.price_trend_percent || null,
      transactionsYtd: sourceData?.total_transactions_ytd || null,
      serviceChargeSqft: sourceData?.service_charge_sqft || null,
      recentTransactions: (transactions || []).map(tx => ({
        date: tx.instance_date,
        propertyType: tx.property_type || 'Unknown',
        rooms: tx.rooms || 'Unknown',
        areaSqft: tx.procedure_area_sqft || 0,
        price: tx.actual_worth || 0,
        priceSqft: tx.sqft_sale_price || 0,
      })),
      lastUpdated: sourceData?.updated_at || new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching live market data:', error);
    return null;
  }
}

// Build live market context string for AI prompt
function buildLiveMarketContext(liveData: LiveMarketData | null, area: string): string {
  if (!liveData) {
    return `\n## Market Data for ${area}\nNo live market data available. Using general Dubai benchmarks.`;
  }

  const parts: string[] = [];
  parts.push(`\n## LIVE MARKET DATA: ${liveData.areaName}`);
  parts.push(`(Last updated: ${new Date(liveData.lastUpdated).toLocaleDateString()})`);
  
  if (liveData.avgPriceSqft) {
    parts.push(`- Average Price/sqft: AED ${liveData.avgPriceSqft.toLocaleString()}`);
  }
  if (liveData.avgYield) {
    parts.push(`- Average Rental Yield: ${liveData.avgYield}%`);
  }
  if (liveData.priceTrend !== null && liveData.priceTrend !== undefined) {
    const trendSymbol = liveData.priceTrend >= 0 ? '↑' : '↓';
    parts.push(`- Price Trend: ${trendSymbol}${Math.abs(liveData.priceTrend).toFixed(1)}% (YoY)`);
  }
  if (liveData.transactionsYtd) {
    parts.push(`- Transactions YTD: ${liveData.transactionsYtd.toLocaleString()}`);
  }
  if (liveData.serviceChargeSqft) {
    parts.push(`- Avg Service Charge: AED ${liveData.serviceChargeSqft}/sqft/year`);
  }

  // Add recent transactions if available
  if (liveData.recentTransactions.length > 0) {
    parts.push(`\n### Recent Comparable Sales (Last 30 Days)`);
    liveData.recentTransactions.slice(0, 5).forEach((tx, i) => {
      parts.push(`${i + 1}. ${tx.rooms} ${tx.propertyType} - ${tx.areaSqft.toLocaleString()} sqft @ AED ${tx.priceSqft.toLocaleString()}/sqft (Total: AED ${tx.price.toLocaleString()})`);
    });
  }

  return parts.join('\n');
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

    // Initialize Supabase client for caching and live data
    let supabase: SupabaseClient | null = null;
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

    // Fetch live market data for the area
    let liveMarketData: LiveMarketData | null = null;
    if (supabase && area) {
      liveMarketData = await fetchLiveMarketData(supabase, area);
      console.log(`Live market data for ${area}:`, liveMarketData ? 'Found' : 'Not found');
    }

    // Build live market context for prompts
    const liveMarketContext = buildLiveMarketContext(liveMarketData, area || 'Dubai');
    
    // Use live data or fall back to defaults
    const marketYield = liveMarketData?.avgYield || DEFAULT_BENCHMARKS.avgGrossYield;
    const marketPriceSqft = liveMarketData?.avgPriceSqft || null;

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
1. How the yield compares to Dubai market averages (avg gross yield is ${marketYield}%)
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
1. How the interest rate compares to current Dubai market rates (typical range: ${DEFAULT_BENCHMARKS.mortgageRateRange.min}%-${DEFAULT_BENCHMARKS.mortgageRateRange.max}%)
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

    } else if (calculatorType === 'cap-rate') {
      analysisContext = `
## Cap Rate & NOI Calculator Results
- Property Price: AED ${inputs.propertyPrice?.toLocaleString()}
- Property Size: ${inputs.propertySizeSqft?.toLocaleString()} sqft
- Gross Annual Income: AED ${inputs.grossIncome?.toLocaleString()}
- Total Operating Expenses: AED ${results.totalExpenses?.toLocaleString()}
  - Property Management: AED ${inputs.managementFee?.toLocaleString()}
  - Insurance: AED ${inputs.insurance?.toLocaleString()}
  - Maintenance: AED ${inputs.maintenance?.toLocaleString()}
  - Service Charges: AED ${inputs.serviceCharges?.toLocaleString()}
  - Vacancy Allowance: AED ${inputs.vacancyAllowance?.toLocaleString()}
  - Other Expenses: AED ${inputs.otherExpenses?.toLocaleString()}

### Calculated Metrics
- Net Operating Income (NOI): AED ${results.noi?.toLocaleString()}
- Cap Rate: ${results.capRate?.toFixed(2)}%
- Expense Ratio: ${results.expenseRatio?.toFixed(1)}%
- Price per Sqft: AED ${results.pricePerSqft?.toLocaleString()}
- GRM (Gross Rent Multiplier): ${results.grm?.toFixed(1)}x
`;
      specificPrompt = `Analyze this commercial property cap rate calculation and provide insights on:
1. How the cap rate compares to Dubai commercial property benchmarks (office 6-8%, retail 7-9%, industrial 8-10%)
2. Whether the expense ratio is reasonable (typical range 25-40%)
3. How the NOI could be improved through expense optimization
4. Risk assessment based on vacancy allowance and market conditions
5. One specific recommendation for improving investment returns`;

    } else if (calculatorType === 'dscr') {
      analysisContext = `
## DSCR Calculator Results
- Property Price: AED ${inputs.propertyPrice?.toLocaleString()}
- Net Operating Income: AED ${inputs.noi?.toLocaleString()}
- Loan Amount: AED ${inputs.loanAmount?.toLocaleString()}
- Interest Rate: ${inputs.interestRate}%
- Loan Term: ${inputs.loanTerm} years
- Amortization: ${inputs.amortization} years

### Calculated Metrics
- Monthly Debt Service: AED ${results.monthlyDebtService?.toLocaleString()}
- Annual Debt Service: AED ${results.annualDebtService?.toLocaleString()}
- DSCR: ${results.dscr?.toFixed(2)}
- LTV Ratio: ${results.ltvRatio?.toFixed(1)}%
- Debt Yield: ${results.debtYield?.toFixed(2)}%
- Breakeven Occupancy: ${results.breakevenOccupancy?.toFixed(1)}%
`;
      specificPrompt = `Analyze this DSCR calculation and provide insights on:
1. How the DSCR compares to UAE bank requirements (typically 1.25x-1.40x minimum)
2. Whether the LTV ratio is within acceptable ranges (usually 60-75% for commercial)
3. Risk assessment based on breakeven occupancy level
4. How the debt yield compares to market expectations (typically 8-10%+)
5. One recommendation for improving the financing structure or debt coverage`;

    } else if (calculatorType === 'free-zone') {
      const selectedZones = inputs.selectedZones || [];
      const zonesInfo = selectedZones.map((z: any) => `
- ${z.name}: License AED ${z.licenseCostFrom?.toLocaleString()}-${z.licenseCostTo?.toLocaleString()}, Visas: ${z.visaAllocationMin}-${z.visaAllocationMax}, Setup: ${z.setupTimeWeeks} weeks, Sectors: ${z.sectors?.join(', ')}`).join('\n');
      
      analysisContext = `
## Free Zone Comparison Analysis
### Business Requirements
- Business Description: ${inputs.businessDescription || 'Not specified'}
- Team Size: ${inputs.teamSize || 'Not specified'} employees
- Budget: AED ${inputs.budget?.toLocaleString() || 'Not specified'}
- Sector Focus: ${inputs.sectorFocus || 'General'}
- Visa Requirements: ${inputs.visaRequirements || 'Not specified'}
- Office Space Need: ${inputs.officeSpaceNeed || 'Not specified'}

### Selected Free Zones for Comparison
${zonesInfo || 'No zones selected'}

### Cost Comparison Summary
${results.costComparison ? JSON.stringify(results.costComparison, null, 2) : 'No cost breakdown available'}
`;
      specificPrompt = `Provide personalized free zone recommendations for this business:
1. **Best Fit Zone**: Which of the selected zones is the best match and why
2. **Cost Efficiency**: Rank zones by total first-year cost considering all requirements
3. **Sector Alignment**: How well each zone's sector focus matches the business needs
4. **Scaling Potential**: Which zone offers best growth flexibility (visa expansion, office upgrade)
5. **Hidden Considerations**: Any important factors not immediately obvious (renewal costs, restrictions)
6. **Final Recommendation**: One clear recommendation with specific reasoning

Be specific about why certain zones are better fits based on the stated requirements.`;
    }

    const systemPrompt = `You are a Dubai real estate investment analyst. Provide clear, specific analysis in plain English.

## General Market Context
- Average gross rental yield in Dubai: ${DEFAULT_BENCHMARKS.avgGrossYield}%
- Average net yield: ${DEFAULT_BENCHMARKS.avgNetYield}%
- Average annual appreciation: ${DEFAULT_BENCHMARKS.avgAppreciation}%
- Golden Visa property threshold: AED 2,000,000
- Current mortgage rates: ${DEFAULT_BENCHMARKS.mortgageRateRange.min}%-${DEFAULT_BENCHMARKS.mortgageRateRange.max}%
${liveMarketContext}

## Response Guidelines
- Use specific numbers and percentages in your analysis
- Compare to Dubai market benchmarks AND the area-specific live data when available
- Reference recent comparable sales if provided
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