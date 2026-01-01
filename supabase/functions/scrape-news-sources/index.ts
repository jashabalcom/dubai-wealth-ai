import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Dubai areas for extraction
const DUBAI_AREAS = [
  'Downtown Dubai', 'Dubai Marina', 'Palm Jumeirah', 'JVC', 'Jumeirah Village Circle',
  'Business Bay', 'DIFC', 'Meydan', 'Dubai Hills', 'Dubai Hills Estate',
  'Arabian Ranches', 'Bluewaters', 'Creek Harbour', 'Dubai Creek Harbour', 'JBR',
  'Jumeirah Beach Residence', 'JLT', 'Jumeirah Lake Towers', 'Al Barsha',
];

// Extract affected areas from content
function extractAffectedAreas(content: string): string[] {
  const contentLower = content.toLowerCase();
  return DUBAI_AREAS.filter(area => contentLower.includes(area.toLowerCase()));
}

// Generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

// Enhanced AI prompt for investor analysis
const INVESTOR_ANGLE_PROMPT = `You are a senior Dubai real estate investment analyst.
Analyze this content and write an investment-focused summary.

Write with this structure:
## Key Takeaway
One sentence on the most important investment implication.

## What's Happening
2 paragraphs explaining the news clearly.

## Investment Implications
2 paragraphs on how this affects Dubai real estate investors.

## Investor Action Items
- 3-4 specific, actionable bullet points

Write 300-400 words. Professional tone. Be specific to Dubai market.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
    const lovableKey = Deno.env.get('LOVABLE_API_KEY');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (!firecrawlKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Starting scrape-based news sync...');

    // Get active scrape sources from database
    const { data: scrapeSources, error: sourcesError } = await supabase
      .from('news_sources')
      .select('*')
      .eq('feed_type', 'scrape')
      .eq('is_active', true);

    if (sourcesError) {
      throw new Error(`Failed to fetch scrape sources: ${sourcesError.message}`);
    }

    console.log(`Found ${scrapeSources?.length || 0} scrape sources`);

    let totalScraped = 0;
    let totalSaved = 0;
    const errors: string[] = [];

    for (const source of scrapeSources || []) {
      try {
        console.log(`[${source.name}] Scraping ${source.url}...`);

        // Use Firecrawl map to discover URLs
        const mapResponse = await fetch('https://api.firecrawl.dev/v1/map', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${firecrawlKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: source.url,
            limit: 20,
          }),
        });

        if (!mapResponse.ok) {
          const errorText = await mapResponse.text();
          console.error(`[${source.name}] Map failed: ${mapResponse.status} - ${errorText}`);
          errors.push(`${source.name}: Map failed`);
          
          // Update error count
          await supabase
            .from('news_sources')
            .update({ 
              error_count: source.error_count + 1,
              last_error: `Map failed: ${mapResponse.status}`,
            })
            .eq('id', source.id);
          continue;
        }

        const mapData = await mapResponse.json();
        const urls = mapData.links || [];
        console.log(`[${source.name}] Found ${urls.length} URLs`);

        // Filter to news/article URLs
        const articleUrls = urls.filter((url: string) => 
          url.includes('/news') || 
          url.includes('/article') || 
          url.includes('/press') ||
          url.includes('/announcement')
        ).slice(0, 10);

        console.log(`[${source.name}] Filtered to ${articleUrls.length} article URLs`);

        for (const articleUrl of articleUrls) {
          try {
            // Check if already exists
            const urlHash = btoa(articleUrl).slice(0, 50);
            const { data: existing } = await supabase
              .from('news_articles')
              .select('id')
              .eq('source_hash', urlHash)
              .single();

            if (existing) {
              console.log(`[${source.name}] Skipping existing: ${articleUrl}`);
              continue;
            }

            // Scrape the article
            const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${firecrawlKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                url: articleUrl,
                formats: ['markdown'],
                onlyMainContent: true,
              }),
            });

            if (!scrapeResponse.ok) {
              console.error(`[${source.name}] Scrape failed for ${articleUrl}`);
              continue;
            }

            const scrapeData = await scrapeResponse.json();
            const markdown = scrapeData.data?.markdown || scrapeData.markdown || '';
            const metadata = scrapeData.data?.metadata || scrapeData.metadata || {};

            if (markdown.length < 200) {
              console.log(`[${source.name}] Content too short, skipping`);
              continue;
            }

            totalScraped++;

            // Extract title
            const title = metadata.title || markdown.match(/^#\s+(.+)/m)?.[1] || 'Untitled';
            const description = metadata.description || markdown.slice(0, 300);
            const imageUrl = metadata.ogImage || null;

            // Generate AI analysis if available
            let enrichedContent = null;
            if (lovableKey && markdown.length > 300) {
              try {
                const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${lovableKey}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    model: 'google/gemini-2.5-flash',
                    messages: [
                      { role: 'system', content: INVESTOR_ANGLE_PROMPT },
                      { role: 'user', content: `Title: ${title}\n\nContent:\n${markdown.slice(0, 5000)}` }
                    ],
                  }),
                });

                if (aiResponse.ok) {
                  const aiData = await aiResponse.json();
                  enrichedContent = aiData.choices?.[0]?.message?.content || null;
                }
              } catch (aiError) {
                console.error(`[${source.name}] AI analysis failed:`, aiError);
              }
            }

            // Determine category
            let category = 'market_trends';
            const contentLower = `${title} ${markdown}`.toLowerCase();
            if (contentLower.includes('regulation') || contentLower.includes('law') || contentLower.includes('rera')) {
              category = 'regulations';
            } else if (contentLower.includes('launch') || contentLower.includes('announce')) {
              category = 'developer_news';
            }

            // Extract areas
            const affectedAreas = extractAffectedAreas(`${title} ${markdown}`);

            // Insert article
            const { error: insertError } = await supabase
              .from('news_articles')
              .insert({
                title: title.slice(0, 500),
                excerpt: description.slice(0, 400),
                content: enrichedContent || markdown.slice(0, 10000),
                source_name: source.name,
                source_url: articleUrl,
                source_hash: urlHash,
                image_url: imageUrl,
                category,
                article_type: 'headline',
                status: 'published',
                published_at: new Date().toISOString(),
                affected_areas: affectedAreas.length > 0 ? affectedAreas : null,
                urgency_level: 'normal',
                investment_rating: 3,
                briefing_type: 'standard',
                verification_status: 'unverified',
                ai_confidence_score: enrichedContent ? 0.8 : null,
              });

            if (insertError) {
              console.error(`[${source.name}] Insert failed:`, insertError.message);
              errors.push(`${source.name}: Insert failed - ${insertError.message}`);
            } else {
              totalSaved++;
              console.log(`[${source.name}] Saved: ${title.slice(0, 50)}...`);
            }

            // Rate limit
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (articleError) {
            console.error(`[${source.name}] Article error:`, articleError);
          }
        }

        // Update source stats
        await supabase
          .from('news_sources')
          .update({
            last_synced_at: new Date().toISOString(),
            articles_synced: source.articles_synced + totalSaved,
            error_count: 0,
            last_error: null,
          })
          .eq('id', source.id);

      } catch (sourceError) {
        console.error(`[${source.name}] Source error:`, sourceError);
        errors.push(`${source.name}: ${sourceError instanceof Error ? sourceError.message : 'Unknown error'}`);
      }
    }

    console.log('=== SCRAPE SYNC COMPLETE ===');
    console.log(`Scraped: ${totalScraped}, Saved: ${totalSaved}`);

    return new Response(
      JSON.stringify({
        success: true,
        scraped: totalScraped,
        saved: totalSaved,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Scrape sync error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
