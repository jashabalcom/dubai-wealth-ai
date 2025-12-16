import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// RSS Feed sources focused on Dubai real estate - VERIFIED WORKING as of Dec 2024
const RSS_FEEDS = [
  {
    name: 'Arabian Business Real Estate',
    url: 'https://www.arabianbusiness.com/industries/real-estate/feed',
    keywords: ['dubai', 'uae', 'property', 'villa', 'apartment', 'developer', 'emaar', 'damac', 'nakheel', 'sobha', 'azizi', 'binghatti', 'palm', 'marina', 'downtown', 'off-plan', 'real estate', 'investment', 'rental', 'yield', 'golden visa'],
  },
  {
    name: 'Dubai Chronicle',
    url: 'https://www.dubaichronicle.com/feed/',
    keywords: ['property', 'real estate', 'dubai', 'villa', 'apartment', 'developer', 'investment', 'rent', 'buy', 'market', 'launch', 'project'],
  },
  {
    name: 'Properties Market UAE',
    url: 'https://www.properties.market/ae/blog/feed/',
    keywords: ['dubai', 'property', 'real estate', 'investment', 'villa', 'apartment', 'developer', 'market', 'buy', 'rent', 'guide'],
  },
  {
    name: 'Key One Realty',
    url: 'https://keyone.com/blog/feed/',
    keywords: ['dubai', 'property', 'real estate', 'investment', 'airbnb', 'rental', 'villa', 'apartment', 'roi', 'yield'],
  },
];

// Expanded keywords for better Dubai real estate content matching
const DUBAI_KEYWORDS = [
  // Neighborhoods
  'palm jumeirah', 'downtown dubai', 'dubai marina', 'jvc', 'jumeirah village', 'business bay', 
  'difc', 'meydan', 'dubai hills', 'arabian ranches', 'bluewaters', 'creek harbour', 'jbr',
  // Developers
  'emaar', 'damac', 'nakheel', 'sobha', 'azizi', 'binghatti', 'ellington', 'meraas', 'omniyat',
  // Investment terms
  'yield', 'roi', 'off-plan', 'off plan', 'handover', 'golden visa', 'rera', 'dld', 'rental',
  // General
  'dubai', 'uae', 'property', 'real estate', 'villa', 'apartment', 'townhouse', 'penthouse',
  'developer', 'launch', 'project', 'investment', 'buyer', 'investor'
];

// Parse RSS XML to extract articles
async function parseRSSFeed(feedUrl: string, sourceName: string, feedKeywords: string[]): Promise<any[]> {
  try {
    console.log(`[${sourceName}] Fetching from ${feedUrl}`);
    const startTime = Date.now();
    
    const response = await fetch(feedUrl, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*'
      }
    });
    
    const responseTime = Date.now() - startTime;
    console.log(`[${sourceName}] Response: ${response.status} in ${responseTime}ms`);
    
    if (!response.ok) {
      console.error(`[${sourceName}] FAILED: HTTP ${response.status} ${response.statusText}`);
      return [];
    }

    const xml = await response.text();
    console.log(`[${sourceName}] XML length: ${xml.length} chars`);
    const articles: any[] = [];

    // Simple XML parsing for RSS items
    const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];
    console.log(`[${sourceName}] Found ${itemMatches.length} items in feed`);
    
    for (const itemXml of itemMatches.slice(0, 20)) { // Limit to 20 per feed
      // Extract title (handle CDATA)
      const titleMatch = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/s) || 
                         itemXml.match(/<title>(.*?)<\/title>/s);
      const title = titleMatch?.[1] || '';
      
      // Extract link
      const link = itemXml.match(/<link>(.*?)<\/link>/)?.[1]?.trim() || '';
      
      // Extract description (handle CDATA)
      const descMatch = itemXml.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) ||
                        itemXml.match(/<description>([\s\S]*?)<\/description>/);
      const description = descMatch?.[1] || '';
      
      // Extract content:encoded if available (often has more content)
      const contentMatch = itemXml.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/);
      const fullContent = contentMatch?.[1] || description;
      
      // Extract pubDate
      const pubDate = itemXml.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';
      
      // Extract image from multiple sources
      let imageUrl = null;
      // Try media:content
      const mediaMatch = itemXml.match(/<media:content[^>]*url="([^"]+)"/);
      if (mediaMatch) imageUrl = mediaMatch[1];
      // Try enclosure
      if (!imageUrl) {
        const enclosureMatch = itemXml.match(/<enclosure[^>]*url="([^"]+)"[^>]*type="image/);
        if (enclosureMatch) imageUrl = enclosureMatch[1];
      }
      // Try media:thumbnail
      if (!imageUrl) {
        const thumbMatch = itemXml.match(/<media:thumbnail[^>]*url="([^"]+)"/);
        if (thumbMatch) imageUrl = thumbMatch[1];
      }
      // Try to extract from description/content HTML
      if (!imageUrl) {
        const imgMatch = fullContent.match(/<img[^>]*src="([^"]+)"/);
        if (imgMatch) imageUrl = imgMatch[1];
      }
      // Try srcset pattern
      if (!imageUrl) {
        const srcsetMatch = fullContent.match(/srcset="([^"\s]+)/);
        if (srcsetMatch) imageUrl = srcsetMatch[1];
      }

      // Clean up title and description
      const cleanTitle = title.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').trim();
      const cleanDescription = description.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').trim().slice(0, 400);

      if (!cleanTitle || !link) {
        continue;
      }

      // Filter by keywords - combine feed keywords with global Dubai keywords
      const content = `${cleanTitle} ${cleanDescription}`.toLowerCase();
      const allKeywords = [...new Set([...feedKeywords, ...DUBAI_KEYWORDS])];
      const matchedKeywords = allKeywords.filter(kw => content.includes(kw.toLowerCase()));
      const isRelevant = matchedKeywords.length >= 1; // At least 1 keyword match

      if (isRelevant) {
        console.log(`[${sourceName}] Matched article: "${cleanTitle.slice(0, 50)}..." (${matchedKeywords.length} keywords: ${matchedKeywords.slice(0, 3).join(', ')})`);
        
        // Determine category based on content
        let category = 'market_trends';
        const contentLower = content.toLowerCase();
        if (contentLower.includes('golden visa') || contentLower.includes('residency') || contentLower.includes('visa')) {
          category = 'golden_visa';
        } else if (contentLower.includes('off-plan') || contentLower.includes('off plan') || contentLower.includes('launch') || contentLower.includes('handover')) {
          category = 'off_plan';
        } else if (contentLower.includes('emaar') || contentLower.includes('damac') || contentLower.includes('nakheel') || contentLower.includes('sobha') || contentLower.includes('developer')) {
          category = 'developer_news';
        } else if (contentLower.includes('law') || contentLower.includes('regulation') || contentLower.includes('rera') || contentLower.includes('dld')) {
          category = 'regulations';
        }

        articles.push({
          title: cleanTitle,
          excerpt: cleanDescription,
          source_name: sourceName,
          source_url: link,
          source_hash: btoa(link).slice(0, 50),
          image_url: imageUrl,
          category,
          published_at: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        });
      }
    }

    console.log(`[${sourceName}] Total relevant articles: ${articles.length}`);
    return articles;
  } catch (error) {
    console.error(`[${sourceName}] Error parsing feed:`, error);
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