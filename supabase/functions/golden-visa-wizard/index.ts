import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cache configuration
const CACHE_TTL_DAYS = 7;
const FUNCTION_NAME = "golden-visa-wizard";

interface GoldenVisaInput {
  fullName: string;
  nationality: string;
  currentResidence: string;
  investmentBudget: string;
  investmentType: string;
  timeline: string;
  familySize: number;
  additionalNotes?: string;
}

// Normalize budget to range for better cache hits
function normalizeBudget(budget: string): string {
  const budgetLower = budget.toLowerCase();
  if (budgetLower.includes('2') && budgetLower.includes('3')) return '2-3m';
  if (budgetLower.includes('3') && budgetLower.includes('5')) return '3-5m';
  if (budgetLower.includes('5') && budgetLower.includes('10')) return '5-10m';
  if (budgetLower.includes('10')) return '10m+';
  return budget.substring(0, 10).toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Generate cache key based on normalized inputs
function generateCacheKey(input: GoldenVisaInput): string {
  const normalized = {
    budget: normalizeBudget(input.investmentBudget),
    type: input.investmentType.toLowerCase().replace(/[^a-z]/g, ''),
    timeline: input.timeline.toLowerCase().replace(/[^a-z0-9]/g, ''),
    familySize: input.familySize > 4 ? '5+' : String(input.familySize),
  };
  
  const data = JSON.stringify(normalized);
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `visa_${normalized.budget}_${normalized.type}_${Math.abs(hash).toString(16)}`;
}

// Check cache
async function checkCache(supabase: any, cacheKey: string): Promise<any | null> {
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
    
    try {
      return JSON.parse(data.response);
    } catch {
      return null;
    }
  } catch (e) {
    console.log("Cache check error:", e);
    return null;
  }
}

// Store in cache
async function storeCache(supabase: any, cacheKey: string, response: any, inputHash: string): Promise<void> {
  try {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + CACHE_TTL_DAYS);

    await supabase.from("ai_response_cache").upsert({
      cache_key: cacheKey,
      function_name: FUNCTION_NAME,
      response: JSON.stringify(response),
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
    const input: GoldenVisaInput = await req.json();
    console.log('Processing Golden Visa analysis for:', input.fullName);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Initialize Supabase client for caching
    let supabase: any = null;
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    }

    // Generate cache key (based on normalized inputs, not personal data)
    const cacheKey = generateCacheKey(input);
    
    // Check cache first
    if (supabase) {
      const cachedResponse = await checkCache(supabase, cacheKey);
      if (cachedResponse) {
        console.log('Returning cached Golden Visa analysis');
        return new Response(JSON.stringify(cachedResponse), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const systemPrompt = `You are an expert Dubai Golden Visa consultant with deep knowledge of UAE immigration and investment requirements. Provide personalized, actionable advice based on the user's profile.

Golden Visa Requirements (2024):
- Real Estate Investment: Minimum AED 2 million property value
- Business Investment: AED 2 million minimum capital
- Entrepreneurs: Approved project worth AED 500,000+
- Specialized Talents: Scientists, doctors, artists, inventors
- Outstanding Students: Top performers in UAE universities

Your response must be a valid JSON object with this exact structure:
{
  "eligibilityScore": number (0-100),
  "summary": "2-3 paragraph personalized summary",
  "recommendedPath": "The best visa pathway for this applicant",
  "investmentRecommendations": [
    {
      "type": "Investment type",
      "description": "Detailed description",
      "minimumInvestment": "AED amount",
      "timeline": "Expected processing time",
      "benefits": ["benefit1", "benefit2"]
    }
  ],
  "nextSteps": ["step1", "step2", "step3"],
  "considerations": ["important consideration 1", "important consideration 2"]
}`;

    const userPrompt = `Analyze this Golden Visa applicant profile and provide personalized recommendations:

**Applicant Profile:**
- Name: ${input.fullName}
- Nationality: ${input.nationality}
- Current Residence: ${input.currentResidence}
- Investment Budget: ${input.investmentBudget}
- Preferred Investment Type: ${input.investmentType}
- Timeline: ${input.timeline}
- Family Size: ${input.familySize} ${input.familySize > 1 ? 'people (including dependents)' : 'person'}
${input.additionalNotes ? `- Additional Notes: ${input.additionalNotes}` : ''}

Provide a comprehensive analysis with specific property recommendations if applicable, considering their budget and family needs.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Service temporarily unavailable. Please try again later.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error('Failed to get AI response');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content in AI response');
    }

    // Parse the JSON from the response
    let analysis;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonString = jsonMatch ? jsonMatch[1].trim() : content.trim();
      analysis = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      // Return a structured fallback
      analysis = {
        eligibilityScore: 75,
        summary: content,
        recommendedPath: "Real Estate Investment",
        investmentRecommendations: [],
        nextSteps: ["Contact a Golden Visa specialist", "Review property options", "Prepare documentation"],
        considerations: ["Processing times may vary", "Consult with immigration experts"]
      };
    }

    // Store in cache (only if we have supabase client)
    if (supabase) {
      storeCache(supabase, cacheKey, analysis, cacheKey);
    }

    console.log('Successfully generated Golden Visa analysis');
    
    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in golden-visa-wizard:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to process request';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});