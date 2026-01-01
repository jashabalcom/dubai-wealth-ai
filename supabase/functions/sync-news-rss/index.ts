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

// Default RSS feeds (fallback if database is empty)
const DEFAULT_RSS_FEEDS = [
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

// Expanded keywords - now includes broader business/economic news that AI will give investor angle
const DUBAI_KEYWORDS = [
  // Neighborhoods
  'palm jumeirah', 'downtown dubai', 'dubai marina', 'jvc', 'jumeirah village', 'business bay', 
  'difc', 'meydan', 'dubai hills', 'arabian ranches', 'bluewaters', 'creek harbour', 'jbr',
  // Developers
  'emaar', 'damac', 'nakheel', 'sobha', 'azizi', 'binghatti', 'ellington', 'meraas', 'omniyat',
  // Investment terms
  'yield', 'roi', 'off-plan', 'off plan', 'handover', 'golden visa', 'rera', 'dld', 'rental',
  // General real estate
  'dubai', 'uae', 'property', 'real estate', 'villa', 'apartment', 'townhouse', 'penthouse',
  'developer', 'launch', 'project', 'investment', 'buyer', 'investor',
  // Economic indicators (NEW - will get investor angle)
  'gdp', 'economy', 'growth', 'inflation', 'interest rate', 'central bank',
  // Tourism & hospitality (NEW - affects rental yields)
  'tourism', 'hotel', 'visitor', 'expo', 'event', 'hospitality',
  // Infrastructure (NEW - affects property values)
  'metro', 'airport', 'road', 'infrastructure', 'development', 'transport',
  // Business (NEW - economic health indicators)
  'business', 'company', 'startup', 'expansion', 'headquarters'
];

// Enhanced AI prompt for structured investor-angle content with metadata extraction
const INVESTOR_ANGLE_PROMPT = `You are a senior Dubai real estate investment analyst writing for sophisticated property investors.

Your task: Analyze this news article and write a comprehensive investment-focused analysis.

**IMPORTANT**: Even if the article is NOT directly about real estate, find and explain:
- How this news could affect Dubai property values or rental yields
- Which Dubai neighborhoods or property types might be impacted
- Investment timing implications or opportunities
- Indirect effects (tourism news = rental demand, infrastructure = property appreciation, etc.)

Write your analysis with this EXACT structure using markdown:

## Key Takeaway

One powerful sentence summarizing the most important investment implication.

## What's Happening

2-3 paragraphs explaining the news clearly and concisely. Include any specific numbers, dates, or facts mentioned.

## Investment Implications

2-3 paragraphs analyzing how this affects Dubai real estate investors:
- For direct real estate news: analyze market impact, pricing trends, demand shifts
- For indirect news (tourism, economy, infrastructure): connect the dots to property values and rental yields
- Mention specific Dubai areas that could be affected (Downtown, Marina, JVC, Palm, etc.)

## Investor Action Items

- 3-4 specific, actionable bullet points
- Be concrete: mention property types, neighborhoods, or strategies
- Include timing considerations if relevant

Write 400-500 words total. Use professional, analytical tone. Be specific to Dubai market dynamics.`;

// Dubai areas for extraction
const DUBAI_AREAS = [
  'Downtown Dubai', 'Dubai Marina', 'Palm Jumeirah', 'JVC', 'Jumeirah Village Circle',
  'Business Bay', 'DIFC', 'Meydan', 'Dubai Hills', 'Dubai Hills Estate',
  'Arabian Ranches', 'Bluewaters', 'Creek Harbour', 'Dubai Creek Harbour', 'JBR',
  'Jumeirah Beach Residence', 'JLT', 'Jumeirah Lake Towers', 'Al Barsha',
  'Sports City', 'Motor City', 'Silicon Oasis', 'Jumeirah', 'City Walk',
  'MBR City', 'Mohammed Bin Rashid City', 'Town Square', 'Damac Hills',
  'Emaar Beachfront', 'Dubai South', 'Dubai Investment Park'
];

// Sectors for extraction
const SECTORS = ['off-plan', 'ready', 'rental', 'commercial', 'luxury', 'affordable', 'mid-market'];

// Extract affected areas from content
function extractAffectedAreas(content: string): string[] {
  const contentLower = content.toLowerCase();
  return DUBAI_AREAS.filter(area => contentLower.includes(area.toLowerCase()));
}

// Extract affected sectors from content
function extractAffectedSectors(content: string): string[] {
  const contentLower = content.toLowerCase();
  const found: string[] = [];
  
  if (contentLower.includes('off-plan') || contentLower.includes('off plan') || contentLower.includes('launch')) {
    found.push('off-plan');
  }
  if (contentLower.includes('ready') || contentLower.includes('handover') || contentLower.includes('completed')) {
    found.push('ready');
  }
  if (contentLower.includes('rent') || contentLower.includes('lease') || contentLower.includes('tenant')) {
    found.push('rental');
  }
  if (contentLower.includes('commercial') || contentLower.includes('office') || contentLower.includes('retail')) {
    found.push('commercial');
  }
  if (contentLower.includes('luxury') || contentLower.includes('premium') || contentLower.includes('ultra')) {
    found.push('luxury');
  }
  
  return found;
}

// Calculate investment rating based on content
function calculateInvestmentRating(title: string, content: string): number {
  const text = `${title} ${content}`.toLowerCase();
  let score = 2; // Base score
  
  // High-value keywords
  const highValueKeywords = ['billion', 'million', 'record', 'surge', 'launch', 'golden visa', 'roi', 'yield'];
  const mediumValueKeywords = ['investment', 'price', 'growth', 'developer', 'project', 'expansion'];
  
  for (const kw of highValueKeywords) {
    if (text.includes(kw)) score += 0.5;
  }
  for (const kw of mediumValueKeywords) {
    if (text.includes(kw)) score += 0.25;
  }
  
  // Cap at 5
  return Math.min(5, Math.round(score));
}

// Determine urgency level
function determineUrgencyLevel(title: string, content: string): string {
  const text = `${title} ${content}`.toLowerCase();
  
  if (text.includes('breaking') || text.includes('just announced') || text.includes('today')) {
    return 'high';
  }
  if (text.includes('guide') || text.includes('how to') || text.includes('tips')) {
    return 'evergreen';
  }
  return 'normal';
}

// Scrape article content using Firecrawl with screenshot fallback
async function scrapeArticle(url: string, firecrawlKey: string): Promise<{ content: string; imageUrl: string | null; screenshot: string | null } | null> {
  try {
    console.log(`[Firecrawl] Scraping: ${url}`);
    
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
        screenshot: true,
      }),
    });

    if (!response.ok) {
      console.error(`[Firecrawl] Failed: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const markdown = data.data?.markdown || data.markdown || '';
    const ogImage = data.data?.metadata?.ogImage || data.metadata?.ogImage || null;
    const screenshot = data.data?.screenshot || data.screenshot || null;
    
    console.log(`[Firecrawl] Got ${markdown.length} chars, OG image: ${ogImage ? 'yes' : 'no'}, screenshot: ${screenshot ? 'yes' : 'no'}`);
    
    return { content: markdown, imageUrl: ogImage, screenshot };
  } catch (error) {
    console.error(`[Firecrawl] Error:`, error);
    return null;
  }
}

// Extract first image URL from markdown content
function extractImageFromMarkdown(markdown: string): string | null {
  // Try markdown image syntax: ![alt](url)
  const mdMatch = markdown.match(/!\[.*?\]\((https?:\/\/[^)]+)\)/);
  if (mdMatch) return mdMatch[1];
  
  // Try HTML img tag
  const imgMatch = markdown.match(/<img[^>]*src="(https?:\/\/[^"]+)"/);
  if (imgMatch) return imgMatch[1];
  
  return null;
}

// Category-specific placeholder images
function getCategoryPlaceholder(category: string): string {
  const placeholders: Record<string, string> = {
    market_trends: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=450&fit=crop', // Dubai skyline
    developer_news: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&h=450&fit=crop', // Construction
    golden_visa: 'https://images.unsplash.com/photo-1526495124232-a04e1849168c?w=800&h=450&fit=crop', // Passport/travel
    regulations: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=450&fit=crop', // Legal documents
    off_plan: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=450&fit=crop', // Modern building
  };
  return placeholders[category] || placeholders.market_trends;
}

// Generate enhanced AI analysis using Lovable AI
async function generateInvestorAnalysis(title: string, content: string, lovableKey: string): Promise<string | null> {
  try {
    console.log(`[AI] Generating investor analysis for: ${title.slice(0, 50)}...`);
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: INVESTOR_ANGLE_PROMPT
          },
          {
            role: 'user',
            content: `Article Title: ${title}\n\nArticle Content:\n${content.slice(0, 6000)}`
          }
        ],
      }),
    });

    if (!response.ok) {
      console.error(`[AI] Failed: ${response.status}`);
      const errorText = await response.text();
      console.error(`[AI] Error response: ${errorText}`);
      return null;
    }

    const data = await response.json();
    let analysis = data.choices?.[0]?.message?.content || '';
    
    // Clean up any markdown code blocks if present
    analysis = analysis.replace(/```markdown\n?/g, '').replace(/```\n?/g, '').trim();
    
    const wordCount = analysis.split(/\s+/).length;
    console.log(`[AI] Generated ${wordCount} words analysis`);
    
    return analysis;
  } catch (error) {
    console.error(`[AI] Error:`, error);
    return null;
  }
}

// Parse RSS XML to extract articles (supports RSS 2.0 and Atom)
async function parseRSSFeed(feedUrl: string, sourceName: string, feedKeywords: string[]): Promise<{ articles: any[]; error: string | null }> {
  try {
    console.log(`[${sourceName}] Fetching from ${feedUrl}`);
    const startTime = Date.now();
    
    const response = await fetch(feedUrl, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*'
      }
    });
    
    const responseTime = Date.now() - startTime;
    console.log(`[${sourceName}] Response: ${response.status} in ${responseTime}ms`);
    
    if (!response.ok) {
      const errorMsg = `HTTP ${response.status} ${response.statusText}`;
      console.error(`[${sourceName}] FAILED: ${errorMsg}`);
      return { articles: [], error: errorMsg };
    }

    const xml = await response.text();
    console.log(`[${sourceName}] XML length: ${xml.length} chars`);
    
    if (xml.length < 100) {
      return { articles: [], error: 'Empty or invalid feed response' };
    }
    
    const articles: any[] = [];

    // Detect feed type and parse accordingly
    const isAtom = xml.includes('<feed') && xml.includes('xmlns="http://www.w3.org/2005/Atom"');
    
    let itemMatches: string[] = [];
    
    if (isAtom) {
      // Atom feed: <entry> tags
      console.log(`[${sourceName}] Detected Atom feed format`);
      itemMatches = xml.match(/<entry>([\s\S]*?)<\/entry>/g) || [];
    } else {
      // RSS 2.0: <item> tags
      console.log(`[${sourceName}] Detected RSS 2.0 feed format`);
      itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];
    }
    
    console.log(`[${sourceName}] Found ${itemMatches.length} items in feed`);
    
    if (itemMatches.length === 0) {
      return { articles: [], error: 'No items found in feed' };
    }
    
    for (const itemXml of itemMatches.slice(0, 20)) { // Limit to 20 per feed
      let title = '';
      let link = '';
      let description = '';
      let fullContent = '';
      let pubDate = '';
      let imageUrl = null;
      
      if (isAtom) {
        // Atom parsing
        const titleMatch = itemXml.match(/<title[^>]*>([\s\S]*?)<\/title>/);
        title = titleMatch?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/s, '$1') || '';
        
        // Link can be href attribute
        const linkMatch = itemXml.match(/<link[^>]*href="([^"]+)"/) || 
                          itemXml.match(/<link[^>]*>([^<]+)<\/link>/);
        link = linkMatch?.[1]?.trim() || '';
        
        const summaryMatch = itemXml.match(/<summary[^>]*>([\s\S]*?)<\/summary>/) ||
                             itemXml.match(/<content[^>]*>([\s\S]*?)<\/content>/);
        description = summaryMatch?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/s, '$1') || '';
        
        const dateMatch = itemXml.match(/<updated>(.*?)<\/updated>/) ||
                          itemXml.match(/<published>(.*?)<\/published>/);
        pubDate = dateMatch?.[1] || '';
      } else {
        // RSS 2.0 parsing
        const titleMatch = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/s) || 
                           itemXml.match(/<title>(.*?)<\/title>/s);
        title = titleMatch?.[1] || '';
        
        link = itemXml.match(/<link>(.*?)<\/link>/)?.[1]?.trim() || '';
        
        const descMatch = itemXml.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) ||
                          itemXml.match(/<description>([\s\S]*?)<\/description>/);
        description = descMatch?.[1] || '';
        
        const contentMatch = itemXml.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/);
        fullContent = contentMatch?.[1] || description;
        
        pubDate = itemXml.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';
      }
      
      // Extract images from multiple sources
      const mediaMatch = itemXml.match(/<media:content[^>]*url="([^"]+)"/);
      if (mediaMatch) imageUrl = mediaMatch[1];
      
      if (!imageUrl) {
        const enclosureMatch = itemXml.match(/<enclosure[^>]*url="([^"]+)"[^>]*type="image/);
        if (enclosureMatch) imageUrl = enclosureMatch[1];
      }
      if (!imageUrl) {
        const thumbMatch = itemXml.match(/<media:thumbnail[^>]*url="([^"]+)"/);
        if (thumbMatch) imageUrl = thumbMatch[1];
      }
      if (!imageUrl) {
        const imgMatch = (fullContent || description).match(/<img[^>]*src="([^"]+)"/);
        if (imgMatch) imageUrl = imgMatch[1];
      }

      // Clean up title and description
      const cleanTitle = decodeHtmlEntities(title.replace(/<[^>]*>/g, ''));
      const cleanDescription = decodeHtmlEntities(description.replace(/<[^>]*>/g, '')).slice(0, 400);

      if (!cleanTitle || !link) {
        continue;
      }

      // Filter by keywords
      const content = `${cleanTitle} ${cleanDescription}`.toLowerCase();
      const allKeywords = [...new Set([...feedKeywords, ...DUBAI_KEYWORDS])];
      const matchedKeywords = allKeywords.filter(kw => content.includes(kw.toLowerCase()));
      const isRelevant = matchedKeywords.length >= 1;

      if (isRelevant) {
        console.log(`[${sourceName}] Matched: "${cleanTitle.slice(0, 50)}..." (${matchedKeywords.length} keywords)`);
        
        // Determine category
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
    return { articles, error: null };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[${sourceName}] Error parsing feed:`, errorMsg);
    return { articles: [], error: errorMsg };
  }
}

// Delay helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

    // Parse request body for optional sourceId filter
    let sourceIdFilter: string | null = null;
    try {
      const body = await req.json();
      sourceIdFilter = body?.sourceId || null;
    } catch {
      // No body or invalid JSON - that's fine
    }

    console.log('Starting enhanced RSS sync with Firecrawl + AI investor analysis...');
    console.log(`Firecrawl key: ${firecrawlKey ? 'configured' : 'missing'}`);
    console.log(`Lovable AI key: ${lovableKey ? 'configured' : 'missing'}`);
    console.log(`Source filter: ${sourceIdFilter || 'all'}`);
    
    // Fetch RSS sources from database
    let query = supabase
      .from('news_sources')
      .select('*')
      .eq('feed_type', 'rss')
      .eq('is_active', true)
      .order('tier', { ascending: true });

    if (sourceIdFilter) {
      query = query.eq('id', sourceIdFilter);
    }

    const { data: dbSources, error: sourcesError } = await query;

    if (sourcesError) {
      console.error('Failed to fetch sources from database:', sourcesError);
    }

    // Use database sources if available, otherwise fallback to defaults
    const RSS_FEEDS = dbSources && dbSources.length > 0 
      ? dbSources.map(s => ({ 
          id: s.id,
          name: s.name, 
          url: s.url, 
          keywords: s.keywords || [] 
        }))
      : DEFAULT_RSS_FEEDS.map(s => ({ ...s, id: null }));

    console.log(`Using ${RSS_FEEDS.length} RSS sources`);

    let totalSynced = 0;
    let totalSkipped = 0;
    let totalEnriched = 0;
    let totalImages = 0;
    const errors: string[] = [];

    for (const feed of RSS_FEEDS) {
      let feedSynced = 0;
      let feedError: string | null = null;
      
      console.log(`Fetching ${feed.name}...`);
      const { articles, error: parseError } = await parseRSSFeed(feed.url, feed.name, feed.keywords);
      
      if (parseError) {
        feedError = parseError;
        errors.push(`${feed.name}: ${parseError}`);
        console.error(`[${feed.name}] Parse error: ${parseError}`);
        
        // Update source with error in database
        if (feed.id) {
          const { data: currentSource } = await supabase
            .from('news_sources')
            .select('error_count')
            .eq('id', feed.id)
            .single();
          
          const newErrorCount = (currentSource?.error_count || 0) + 1;
          
          await supabase
            .from('news_sources')
            .update({
              last_synced_at: new Date().toISOString(),
              error_count: newErrorCount,
              last_error: parseError,
              // Auto-disable after 5 consecutive failures
              is_active: newErrorCount < 5,
            })
            .eq('id', feed.id);
            
          if (newErrorCount >= 5) {
            console.warn(`[${feed.name}] Auto-disabled after ${newErrorCount} consecutive failures`);
          }
        }
        continue;
      }
      
      console.log(`Found ${articles.length} relevant articles from ${feed.name}`);

      for (const article of articles) {
        // Check if article already exists (by source_hash)
        const { data: existing } = await supabase
          .from('news_articles')
          .select('id')
          .eq('source_hash', article.source_hash)
          .single();

        if (!existing) {
          let enrichedContent = null;
          let finalImageUrl = article.image_url;

          // Try to scrape and generate analysis if keys are available
          if (firecrawlKey && lovableKey) {
            // Rate limit: 600ms between scrapes
            await delay(600);
            
            const scraped = await scrapeArticle(article.source_url, firecrawlKey);
            
            if (scraped) {
              if (!finalImageUrl && scraped.imageUrl) {
                finalImageUrl = scraped.imageUrl;
                console.log(`[Image] Using OG image from scrape`);
              }
              
              if (!finalImageUrl && scraped.content) {
                const mdImage = extractImageFromMarkdown(scraped.content);
                if (mdImage) {
                  finalImageUrl = mdImage;
                  console.log(`[Image] Using image extracted from markdown`);
                }
              }
              
              // Generate enhanced AI investor analysis
              if (scraped.content && scraped.content.length > 100) {
                await delay(300);
                enrichedContent = await generateInvestorAnalysis(article.title, scraped.content, lovableKey);
                if (enrichedContent) {
                  totalEnriched++;
                  console.log(`[AI] ✓ Generated investor analysis for: ${article.title.slice(0, 40)}...`);
                }
              }
            }
          }

          // Final fallback: category placeholder
          if (!finalImageUrl) {
            finalImageUrl = getCategoryPlaceholder(article.category);
            console.log(`[Image] Using category placeholder for ${article.category}`);
          } else {
            totalImages++;
          }

          const wordCount = enrichedContent ? enrichedContent.split(/\s+/).length : 0;
          const readingTime = Math.max(2, Math.ceil(wordCount / 200));

          // Extract enhanced metadata
          const fullContent = `${article.title} ${article.excerpt} ${enrichedContent || ''}`;
          const affectedAreas = extractAffectedAreas(fullContent);
          const affectedSectors = extractAffectedSectors(fullContent);
          const investmentRating = calculateInvestmentRating(article.title, fullContent);
          const urgencyLevel = determineUrgencyLevel(article.title, fullContent);

          const { error } = await supabase
            .from('news_articles')
            .insert({
              ...article,
              image_url: finalImageUrl,
              content: enrichedContent,
              article_type: 'headline',
              status: 'published',
              reading_time_minutes: readingTime,
              investment_rating: investmentRating,
              urgency_level: urgencyLevel,
              affected_areas: affectedAreas.length > 0 ? affectedAreas : null,
              affected_sectors: affectedSectors.length > 0 ? affectedSectors : null,
              briefing_type: 'standard',
              verification_status: 'unverified',
              ai_confidence_score: enrichedContent ? 0.85 : null,
            });

          if (error) {
            console.error(`Error inserting article: ${error.message}`);
            errors.push(error.message);
          } else {
            totalSynced++;
            feedSynced++;
            console.log(`[Saved] ${article.title.slice(0, 50)}... (${wordCount} words)`);
          }
        } else {
          totalSkipped++;
        }
      }

      // Update source stats on success
      if (feed.id && !feedError) {
        // Get current count and add to it
        const { data: currentSource } = await supabase
          .from('news_sources')
          .select('articles_synced')
          .eq('id', feed.id)
          .single();
          
        await supabase
          .from('news_sources')
          .update({
            last_synced_at: new Date().toISOString(),
            articles_synced: (currentSource?.articles_synced || 0) + feedSynced,
            error_count: 0,
            last_error: null,
          })
          .eq('id', feed.id);
      }
    }

    console.log('=== SYNC COMPLETE ===');
    console.log(`New articles: ${totalSynced}`);
    console.log(`With AI analysis: ${totalEnriched}`);
    console.log(`With real images: ${totalImages}`);
    console.log(`Skipped (existing): ${totalSkipped}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        synced: totalSynced, 
        enriched: totalEnriched,
        withImages: totalImages,
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
