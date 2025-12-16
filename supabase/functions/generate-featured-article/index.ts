import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ANALYTICAL_WRITING_PROMPT = `You are a senior real estate analyst writing for Dubai Wealth Hub, an exclusive investment education platform for sophisticated Dubai real estate investors.

Your writing style is:
- ANALYTICAL and data-driven, not promotional
- EDUCATIONAL, explaining implications for investors
- AUTHORITATIVE but accessible
- Similar to The Economist or Financial Times property coverage

Structure your article with these sections:
1. **Key Takeaway** (1-2 sentences summarizing the investment implication)
2. **What Happened** (2-3 paragraphs explaining the news)
3. **Market Analysis** (2-3 paragraphs analyzing implications)
4. **Investor Action Items** (2-4 bullet points of specific, actionable advice)

Important guidelines:
- Focus on INVESTMENT implications, not just facts
- Reference specific Dubai areas, developers, or price points when relevant
- Avoid generic advice - be specific to Dubai market
- Write 600-800 words total
- Do NOT include any promotional language about Dubai Wealth Hub
- Do NOT make up statistics - only reference what's in the source material

Output format: Return ONLY the article content in markdown format, starting with the title as an H1.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { source_url, article_id } = await req.json();

    if (!source_url) {
      return new Response(
        JSON.stringify({ success: false, error: 'source_url is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!firecrawlApiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!lovableApiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Lovable AI not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`Scraping article: ${source_url}`);

    // Step 1: Scrape article with Firecrawl
    const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: source_url,
        formats: ['markdown'],
        onlyMainContent: true,
      }),
    });

    if (!scrapeResponse.ok) {
      const errorText = await scrapeResponse.text();
      console.error('Firecrawl error:', errorText);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to scrape article' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const scrapeData = await scrapeResponse.json();
    const sourceContent = scrapeData.data?.markdown || scrapeData.markdown || '';
    const sourceTitle = scrapeData.data?.metadata?.title || scrapeData.metadata?.title || '';
    const sourceImage = scrapeData.data?.metadata?.ogImage || scrapeData.metadata?.ogImage || null;

    if (!sourceContent) {
      return new Response(
        JSON.stringify({ success: false, error: 'No content scraped from article' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Scraped ${sourceContent.length} characters. Generating AI analysis...`);

    // Step 2: Generate AI-rewritten article
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: ANALYTICAL_WRITING_PROMPT },
          { 
            role: 'user', 
            content: `Rewrite this news article as an analytical investment piece for Dubai real estate investors:

SOURCE ARTICLE TITLE: ${sourceTitle}

SOURCE CONTENT:
${sourceContent.slice(0, 8000)}

Remember to focus on investment implications and provide actionable advice specific to the Dubai market.` 
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Lovable AI error:', errorText);
      return new Response(
        JSON.stringify({ success: false, error: 'AI generation failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const generatedContent = aiData.choices?.[0]?.message?.content || '';

    if (!generatedContent) {
      return new Response(
        JSON.stringify({ success: false, error: 'No content generated by AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract title from generated content (first H1)
    const titleMatch = generatedContent.match(/^#\s+(.+)$/m);
    const generatedTitle = titleMatch ? titleMatch[1].trim() : sourceTitle;
    
    // Create excerpt from Key Takeaway or first paragraph
    const keyTakeawayMatch = generatedContent.match(/\*\*Key Takeaway\*\*[:\s]*([^\n]+)/i);
    const excerpt = keyTakeawayMatch 
      ? keyTakeawayMatch[1].trim().slice(0, 250)
      : generatedContent.replace(/^#.+\n/, '').trim().slice(0, 250);

    // Calculate reading time (~200 words per minute)
    const wordCount = generatedContent.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);

    console.log(`Generated ${wordCount} words. Saving to database...`);

    // Step 3: Save to database
    if (article_id) {
      // Update existing article
      const { error } = await supabase
        .from('news_articles')
        .update({
          title: generatedTitle,
          excerpt,
          content: generatedContent,
          article_type: 'featured',
          status: 'draft',
          image_url: sourceImage,
          reading_time_minutes: readingTime,
          updated_at: new Date().toISOString(),
        })
        .eq('id', article_id);

      if (error) throw error;
    } else {
      // Create new featured article
      const sourceName = new URL(source_url).hostname.replace('www.', '');
      const { error } = await supabase
        .from('news_articles')
        .insert({
          title: generatedTitle,
          excerpt,
          content: generatedContent,
          article_type: 'featured',
          status: 'draft',
          source_name: sourceName,
          source_url: source_url,
          source_hash: btoa(source_url + Date.now()).slice(0, 50),
          image_url: sourceImage,
          reading_time_minutes: readingTime,
          category: 'market_trends',
        });

      if (error) throw error;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        title: generatedTitle,
        excerpt,
        wordCount,
        readingTime,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Generate featured article error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});