import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// RSS Feed sources focused on Dubai real estate
const RSS_FEEDS = [
  {
    name: 'The National UAE',
    url: 'https://www.thenationalnews.com/rss/uae/',
    keywords: ['property', 'real estate', 'dubai', 'housing', 'rent', 'villa', 'apartment', 'developer', 'emaar', 'damac', 'nakheel'],
  },
  {
    name: 'Gulf News Property',
    url: 'https://gulfnews.com/rss/property-16.xml',
    keywords: ['dubai', 'property', 'real estate', 'investment'],
  },
  {
    name: 'Khaleej Times Property',
    url: 'https://www.khaleejtimes.com/rss/uae',
    keywords: ['property', 'real estate', 'dubai', 'apartment', 'villa', 'rent', 'golden visa'],
  },
];

// Parse RSS XML to extract articles
async function parseRSSFeed(feedUrl: string, sourceName: string, keywords: string[]): Promise<any[]> {
  try {
    const response = await fetch(feedUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DubaiWealthHub/1.0)' }
    });
    
    if (!response.ok) {
      console.log(`Failed to fetch ${sourceName}: ${response.status}`);
      return [];
    }

    const xml = await response.text();
    const articles: any[] = [];

    // Simple XML parsing for RSS items
    const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];
    
    for (const itemXml of itemMatches.slice(0, 20)) { // Limit to 20 per feed
      const title = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/)?.[1] || 
                    itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/)?.[2] || '';
      const link = itemXml.match(/<link>(.*?)<\/link>/)?.[1] || '';
      const description = itemXml.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/)?.[1] ||
                          itemXml.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/)?.[2] || '';
      const pubDate = itemXml.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';
      const imageMatch = itemXml.match(/<media:content[^>]*url="([^"]+)"/);
      const imageUrl = imageMatch?.[1] || itemXml.match(/<enclosure[^>]*url="([^"]+)"/)?.[1] || null;

      // Clean up title and description
      const cleanTitle = title.replace(/<[^>]*>/g, '').trim();
      const cleanDescription = description.replace(/<[^>]*>/g, '').trim().slice(0, 300);

      // Filter by keywords (case-insensitive)
      const content = `${cleanTitle} ${cleanDescription}`.toLowerCase();
      const isRelevant = keywords.some(kw => content.includes(kw.toLowerCase()));

      if (cleanTitle && link && isRelevant) {
        // Determine category based on content
        let category = 'market_trends';
        if (content.includes('golden visa') || content.includes('residency')) {
          category = 'golden_visa';
        } else if (content.includes('off-plan') || content.includes('off plan') || content.includes('launch')) {
          category = 'off_plan';
        } else if (content.includes('emaar') || content.includes('damac') || content.includes('nakheel') || content.includes('developer')) {
          category = 'developer_news';
        } else if (content.includes('law') || content.includes('regulation') || content.includes('rera')) {
          category = 'regulations';
        }

        articles.push({
          title: cleanTitle,
          excerpt: cleanDescription,
          source_name: sourceName,
          source_url: link,
          source_hash: btoa(link).slice(0, 50), // Simple hash for deduplication
          image_url: imageUrl,
          category,
          published_at: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        });
      }
    }

    return articles;
  } catch (error) {
    console.error(`Error parsing ${sourceName}:`, error);
    return [];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting RSS sync...');
    
    let totalSynced = 0;
    let totalSkipped = 0;
    const errors: string[] = [];

    for (const feed of RSS_FEEDS) {
      console.log(`Fetching ${feed.name}...`);
      const articles = await parseRSSFeed(feed.url, feed.name, feed.keywords);
      console.log(`Found ${articles.length} relevant articles from ${feed.name}`);

      for (const article of articles) {
        // Check if article already exists (by source_hash)
        const { data: existing } = await supabase
          .from('news_articles')
          .select('id')
          .eq('source_hash', article.source_hash)
          .single();

        if (!existing) {
          const { error } = await supabase
            .from('news_articles')
            .insert({
              ...article,
              article_type: 'headline',
              status: 'published', // Headlines auto-publish
            });

          if (error) {
            console.error(`Error inserting article: ${error.message}`);
            errors.push(error.message);
          } else {
            totalSynced++;
          }
        } else {
          totalSkipped++;
        }
      }
    }

    console.log(`Sync complete: ${totalSynced} new, ${totalSkipped} skipped`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        synced: totalSynced, 
        skipped: totalSkipped,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('RSS sync error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});