import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DIGEST_PROMPT = `You are a senior Dubai real estate analyst creating a daily market briefing for sophisticated investors.

Analyze today's news articles and create a comprehensive daily digest with:

1. **Headline**: A powerful, Bloomberg-style headline summarizing the day's most important market development (max 15 words)

2. **Executive Summary**: 2-3 paragraphs synthesizing the day's key developments, market movements, and investment implications. Write in an authoritative, analytical tone.

3. **Market Sentiment**: Classify as one of: "bullish", "bearish", "neutral", or "mixed" based on the overall news

4. **Sector Highlights**: For each relevant sector (off-plan, ready, rental, commercial), provide a 1-sentence insight

5. **Area Highlights**: For each mentioned Dubai area, provide a 1-sentence market insight

6. **Key Metrics**: Extract any specific numbers mentioned (transaction values, price changes, yield figures)

Format your response as JSON with this exact structure:
{
  "headline": "...",
  "executive_summary": "...",
  "market_sentiment": "bullish|bearish|neutral|mixed",
  "sector_highlights": {"off_plan": "...", "ready": "...", ...},
  "area_highlights": {"Downtown Dubai": "...", "Palm Jumeirah": "...", ...},
  "key_metrics": {"total_transactions": "...", "avg_price_change": "...", ...}
}`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Lovable AI not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get today's date in Dubai timezone (UTC+4)
    const now = new Date();
    const dubaiOffset = 4 * 60 * 60 * 1000;
    const dubaiNow = new Date(now.getTime() + dubaiOffset);
    const today = dubaiNow.toISOString().split('T')[0];
    
    console.log(`Generating daily digest for ${today}...`);

    // Check if digest already exists
    const { data: existingDigest } = await supabase
      .from('daily_market_digests')
      .select('id')
      .eq('digest_date', today)
      .single();

    if (existingDigest) {
      console.log('Digest already exists for today');
      return new Response(
        JSON.stringify({ success: true, message: 'Digest already exists', date: today }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch articles from the last 24 hours
    const yesterday = new Date(dubaiNow.getTime() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data: articles, error: articlesError } = await supabase
      .from('news_articles')
      .select('id, title, excerpt, content, category, investment_rating, affected_areas, key_metrics')
      .eq('status', 'published')
      .gte('published_at', yesterday)
      .order('investment_rating', { ascending: false, nullsFirst: false })
      .order('published_at', { ascending: false })
      .limit(15);

    if (articlesError) throw articlesError;

    if (!articles || articles.length === 0) {
      console.log('No articles found for today');
      return new Response(
        JSON.stringify({ success: false, message: 'No articles available for digest' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${articles.length} articles for digest`);

    // Prepare articles summary for AI
    const articlesSummary = articles.map((a, i) => 
      `${i + 1}. [${a.category}] ${a.title}\n   ${a.excerpt || ''}\n   Rating: ${a.investment_rating || 'N/A'}`
    ).join('\n\n');

    // Generate digest with AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: DIGEST_PROMPT },
          { 
            role: 'user', 
            content: `Create a daily market digest from these ${articles.length} articles published in the last 24 hours:\n\n${articlesSummary}` 
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI error:', errorText);
      throw new Error('AI generation failed');
    }

    const aiData = await aiResponse.json();
    let digestContent = aiData.choices?.[0]?.message?.content || '';
    
    // Parse JSON response
    let digest;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = digestContent.match(/```json?\s*([\s\S]*?)```/) || 
                       digestContent.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : digestContent;
      digest = JSON.parse(jsonStr.trim());
    } catch (e) {
      console.error('Failed to parse AI response as JSON:', e);
      digest = {
        headline: 'Dubai Real Estate Market Update',
        executive_summary: digestContent,
        market_sentiment: 'neutral',
        sector_highlights: {},
        area_highlights: {},
        key_metrics: {}
      };
    }

    // Get top article IDs
    const topArticleIds = articles.slice(0, 7).map(a => a.id);

    // Save digest
    const { error: insertError } = await supabase
      .from('daily_market_digests')
      .insert({
        digest_date: today,
        headline: digest.headline,
        executive_summary: digest.executive_summary,
        market_sentiment: digest.market_sentiment,
        sector_highlights: digest.sector_highlights || {},
        area_highlights: digest.area_highlights || {},
        key_metrics: digest.key_metrics || {},
        top_article_ids: topArticleIds,
        is_published: false, // Admin needs to review
      });

    if (insertError) throw insertError;

    // Mark articles as part of this digest
    await supabase
      .from('news_articles')
      .update({ digest_date: today, is_featured_digest: true })
      .in('id', topArticleIds);

    console.log(`Daily digest created for ${today}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        date: today,
        headline: digest.headline,
        articlesIncluded: topArticleIds.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Generate daily digest error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
