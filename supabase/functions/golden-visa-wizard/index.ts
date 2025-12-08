import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const input: GoldenVisaInput = await req.json();
    console.log('Processing Golden Visa analysis for:', input.fullName);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
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
