import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { neighborhoodName, lifestyleType, isFreehold, hasMetro, hasBeach } = await req.json();

    if (!neighborhoodName) {
      throw new Error("neighborhoodName is required");
    }

    console.log(`[AI-NEIGHBORHOOD-CONTENT] Generating content for: ${neighborhoodName}`);

    const systemPrompt = `You are a Dubai real estate expert writer creating content for a luxury investment platform. 
Your content should be informative, professional, and appeal to international investors.
Always provide accurate, balanced information about Dubai neighborhoods.
Format responses as valid JSON only, no markdown.`;

    const userPrompt = `Generate comprehensive content for the Dubai neighborhood "${neighborhoodName}".

Context:
- Lifestyle type: ${lifestyleType || 'mixed'}
- Freehold area: ${isFreehold ? 'Yes' : 'No'}
- Metro access: ${hasMetro ? 'Yes' : 'No'}
- Beach access: ${hasBeach ? 'Yes' : 'No'}

Return a JSON object with these exact fields:
{
  "overview": "A 3-4 paragraph detailed overview of the neighborhood covering its history, character, key attractions, and what makes it unique for investors and residents. Include specific landmarks, lifestyle offerings, and development quality.",
  "pros": ["5-7 specific advantages of living/investing here"],
  "cons": ["3-5 honest considerations or challenges"],
  "best_for": ["4-6 types of investors or residents this area is ideal for, e.g., 'Families with children', 'Young professionals', 'Retirees seeking beachfront living'"]
}

Be specific to ${neighborhoodName}, not generic Dubai content. Include real landmarks, developments, and characteristics where possible.`;

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
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[AI-NEIGHBORHOOD-CONTENT] API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content returned from AI");
    }

    console.log("[AI-NEIGHBORHOOD-CONTENT] Raw response:", content);

    // Parse JSON from the response - handle potential markdown code blocks
    let parsed;
    try {
      // Try to extract JSON from markdown code block if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonString = jsonMatch ? jsonMatch[1].trim() : content.trim();
      parsed = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("[AI-NEIGHBORHOOD-CONTENT] JSON parse error:", parseError);
      throw new Error("Failed to parse AI response as JSON");
    }

    // Validate required fields
    if (!parsed.overview || !Array.isArray(parsed.pros) || !Array.isArray(parsed.cons) || !Array.isArray(parsed.best_for)) {
      throw new Error("Invalid response structure from AI");
    }

    console.log("[AI-NEIGHBORHOOD-CONTENT] Successfully generated content for:", neighborhoodName);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[AI-NEIGHBORHOOD-CONTENT] Error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
