import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const INVESTOR_BRIEFING_PROMPT = `You are a senior real estate analyst writing for Dubai Wealth Hub, an exclusive investment education platform for sophisticated Dubai real estate investors. Your output should resemble a Bloomberg terminal briefing or Financial Times premium analysis.

Your writing style is:
- ANALYTICAL and data-driven with specific metrics
- INSTITUTIONAL-GRADE with structured sections
- ACTIONABLE with clear investor recommendations
- Similar to Bloomberg Intelligence or Goldman Sachs research notes

Structure your article EXACTLY as follows:

# [Compelling Investment-Focused Title]

**Investment Rating: [1-5 stars based on opportunity significance]** | **Urgency: [🔴 High / 🟡 Medium / 🟢 Low]**

---

## Executive Summary
[2-3 powerful sentences summarizing the investment opportunity and its implications]

---

## The Situation
[3-4 paragraphs explaining what happened, with specific data points, developer names, area locations, and price figures when available]

---

## Market Impact Analysis

| Factor | Current State | Projected Impact | Timeline |
|--------|---------------|------------------|----------|
| Price Trend | [current] | [expected change] | [when] |
| Rental Yield | [current %] | [expected] | [when] |
| Supply/Demand | [status] | [outlook] | [when] |

[2-3 paragraphs of deeper analysis on market dynamics]

---

## Investor Playbook

### ✅ Recommended Actions
- **[Action 1]**: [Specific recommendation with rationale]
- **[Action 2]**: [Specific recommendation with rationale]

### ⏰ Timing Considerations
- [When to act and why]

### 🎯 Target Properties
- [Specific property types, areas, or price ranges to consider]

### ⚠️ Risk Factors
- [Key risks to monitor]

---

## Related Context
[Brief mention of related market trends or news that provides context]

---

Important guidelines:
- Focus on INVESTMENT implications, not just facts
- Reference specific Dubai areas, developers, and price points
- Include specific numbers and percentages where available
- Avoid generic advice - be specific to Dubai market
- Write 800-1200 words total
- Do NOT include promotional language about Dubai Wealth Hub
- Do NOT make up statistics - only reference what's in source material
- If exact figures aren't available, use qualitative assessments

Output format: Return ONLY the article content in markdown format exactly as structured above.`;

// Keywords that indicate high-value investment news
const TRENDING_KEYWORDS = [
  'emaar', 'damac', 'nakheel', 'sobha', 'meraas', 'developer',
  'off-plan', 'offplan', 'launch', 'golden visa', 'freehold',
  'price', 'yield', 'roi', 'investment', 'billion', 'million',
  'downtown', 'marina', 'palm', 'creek', 'business bay',
  'record', 'surge', 'growth', 'sales', 'transactions',
  'mortgage', 'rent', 'regulation', 'rera', 'dld'
];

function scoreHeadline(title: string): number {
  const lowerTitle = title.toLowerCase();
  let score = 0;
  for (const keyword of TRENDING_KEYWORDS) {
    if (lowerTitle.includes(keyword)) {
      score += 1;
    }
  }
  return score;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let { source_url, article_id, auto_select } = await req.json().catch(() => ({}));

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

    // Auto-select trending headline if no URL provided
    if (!source_url || auto_select) {
      console.log('Auto-selecting trending headline...');
      
      // Get headlines from the last 48 hours that haven't been converted to featured
      const cutoffDate = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
      const { data: headlines, error: headlinesError } = await supabase
        .from('news_articles')
        .select('id, title, source_url')
        .eq('article_type', 'headline')
        .eq('status', 'published')
        .gte('created_at', cutoffDate)
        .order('created_at', { ascending: false })
        .limit(50);

      if (headlinesError || !headlines?.length) {
        return new Response(
          JSON.stringify({ success: false, error: 'No headlines available for auto-selection' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Score and sort headlines by relevance
      const scoredHeadlines = headlines.map(h => ({
        ...h,
        score: scoreHeadline(h.title)
      })).sort((a, b) => b.score - a.score);

      // Pick the top-scoring headline
      const selectedHeadline = scoredHeadlines[0];
      source_url = selectedHeadline.source_url;
      article_id = selectedHeadline.id;
      
      console.log(`Auto-selected: "${selectedHeadline.title}" (score: ${selectedHeadline.score})`);
    }

    if (!source_url) {
      return new Response(
        JSON.stringify({ success: false, error: 'source_url is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
          { role: 'system', content: INVESTOR_BRIEFING_PROMPT },
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