import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Decode HTML entities (numeric and named)
function decodeHtmlEntities(text: string): string {
  if (!text) return '';
  return text
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)))
    .replace(/&#x([0-9a-fA-F]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&hellip;/g, '...')
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"')
    .trim();
}

const INVESTOR_ANGLE_PROMPT = `You are a senior Dubai real estate investment analyst writing for high-net-worth investors.

TASK: Transform this news article into a 400-500 word investment analysis that explains why this matters to someone investing in Dubai real estate.

IMPORTANT: Even if the article is about general business, tourism, infrastructure, or the economy - find and explain the real estate investor angle. Every major development in Dubai affects property values, rental yields, or investment opportunities.

OUTPUT FORMAT (use this exact markdown structure):
## Key Takeaway
[One powerful sentence summarizing the investment implication]

## What's Happening
[2-3 paragraphs explaining the news with context]

## Investment Implications
[2-3 paragraphs on how this affects Dubai property investors - be specific about areas, property types, or strategies affected]

## Investor Action Items
- [Specific actionable insight 1]
- [Specific actionable insight 2]
- [Specific actionable insight 3]

TONE: Authoritative, analytical, actionable. No fluff. Write like you're advising a client with AED 5M+ to invest.`;

async function scrapeArticle(url: string, firecrawlKey: string) {
  console.log('Scraping article:', url);
  
  try {
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        formats: ['markdown', 'screenshot'],
        onlyMainContent: true,
      }),
    });

    if (!response.ok) {
      console.error('Firecrawl error:', response.status);
      return null;
    }

    const data = await response.json();
    return {
      markdown: data.data?.markdown || '',
      screenshot: data.data?.screenshot || null,
      ogImage: data.data?.metadata?.ogImage || null,
    };
  } catch (error) {
    console.error('Scrape error:', error);
    return null;
  }
}

async function generateInvestorAnalysis(title: string, content: string, lovableKey: string) {
  console.log('Generating AI analysis for:', title);
  
  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: INVESTOR_ANGLE_PROMPT },
          { role: 'user', content: `ARTICLE TITLE: ${title}\n\nARTICLE CONTENT:\n${content.substring(0, 8000)}` }
        ],
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      console.error('AI error:', response.status);
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error('AI generation error:', error);
    return null;
  }
}

function extractImageFromMarkdown(markdown: string): string | null {
  const imgMatch = markdown.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/);
  if (imgMatch) return imgMatch[1];
  
  const htmlImgMatch = markdown.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (htmlImgMatch) return htmlImgMatch[1];
  
  return null;
}

function getCategoryPlaceholder(category: string): string {
  const placeholders: Record<string, string> = {
    market_trends: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=400&fit=crop',
    developer_news: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=400&fit=crop',
    golden_visa: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=400&fit=crop',
    off_plan: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=400&fit=crop',
    regulations: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=400&fit=crop',
    lifestyle: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&h=400&fit=crop',
  };
  return placeholders[category] || placeholders.market_trends;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
    const lovableKey = Deno.env.get('LOVABLE_API_KEY');

    if (!firecrawlKey || !lovableKey) {
      throw new Error('Missing required API keys');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get articles that need content regeneration
    const { data: articles, error: fetchError } = await supabase
      .from('news_articles')
      .select('*')
      .or('content.is.null,content.eq.')
      .order('created_at', { ascending: false });

    if (fetchError) throw fetchError;

    console.log(`Found ${articles?.length || 0} articles to backfill`);

    let processed = 0;
    let failed = 0;
    const failedArticles: string[] = [];

    for (const article of articles || []) {
      console.log(`Processing: ${article.title}`);
      
      try {
        // Scrape the article
        const scraped = await scrapeArticle(article.source_url, firecrawlKey);
        
        if (!scraped || !scraped.markdown) {
          console.log('Failed to scrape:', article.title);
          failed++;
          failedArticles.push(article.title);
          continue;
        }

        // Generate AI content
        const aiContent = await generateInvestorAnalysis(article.title, scraped.markdown, lovableKey);
        
        if (!aiContent) {
          console.log('Failed to generate AI content:', article.title);
          failed++;
          failedArticles.push(article.title);
          continue;
        }

        // Determine best image
        let imageUrl = article.image_url;
        if (!imageUrl || imageUrl.includes('placeholder')) {
          imageUrl = scraped.ogImage || 
                     extractImageFromMarkdown(scraped.markdown) ||
                     (scraped.screenshot ? `data:image/png;base64,${scraped.screenshot}` : null) ||
                     getCategoryPlaceholder(article.category);
        }

        // Calculate reading time
        const wordCount = aiContent.split(/\s+/).length;
        const readingTime = Math.ceil(wordCount / 200);

        // Update article with decoded title
        const cleanTitle = decodeHtmlEntities(article.title);
        const { error: updateError } = await supabase
          .from('news_articles')
          .update({
            title: cleanTitle,
            content: aiContent,
            image_url: imageUrl,
            reading_time_minutes: readingTime,
            article_type: 'featured',
            updated_at: new Date().toISOString(),
          })
          .eq('id', article.id);

        if (updateError) {
          console.error('Update error:', updateError);
          failed++;
          failedArticles.push(article.title);
          continue;
        }

        processed++;
        console.log(`Successfully processed: ${article.title}`);

        // Rate limit to avoid API throttling
        await new Promise(resolve => setTimeout(resolve, 600));
      } catch (err) {
        console.error(`Error processing ${article.title}:`, err);
        failed++;
        failedArticles.push(article.title);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        total: articles?.length || 0,
        processed,
        failed,
        failedArticles,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Backfill error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
