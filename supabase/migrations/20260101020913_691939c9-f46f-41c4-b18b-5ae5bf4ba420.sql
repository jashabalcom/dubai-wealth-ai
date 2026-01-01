-- Create news_sources table for dynamic source management
CREATE TABLE public.news_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  feed_type TEXT NOT NULL DEFAULT 'rss', -- 'rss', 'scrape', 'api'
  keywords TEXT[] DEFAULT '{}',
  tier INTEGER NOT NULL DEFAULT 2, -- 1=premium, 2=standard, 3=supplementary
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_synced_at TIMESTAMPTZ,
  articles_synced INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  sync_frequency TEXT DEFAULT 'hourly', -- 'hourly', 'daily', 'weekly'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.news_sources ENABLE ROW LEVEL SECURITY;

-- Admins can manage news sources
CREATE POLICY "Admins can manage news sources"
ON public.news_sources
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can view active news sources (for transparency)
CREATE POLICY "Anyone can view active news sources"
ON public.news_sources
FOR SELECT
USING (is_active = true);

-- Add updated_at trigger
CREATE TRIGGER update_news_sources_updated_at
  BEFORE UPDATE ON public.news_sources
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed with initial sources (4 existing + 8 new)
INSERT INTO public.news_sources (name, url, feed_type, keywords, tier, sync_frequency) VALUES
-- Tier 1: Premium Dubai Real Estate
('Arabian Business Property', 'https://www.arabianbusiness.com/rss/real-estate', 'rss', ARRAY['dubai', 'property', 'real estate', 'uae', 'investment'], 1, 'hourly'),
('Gulf News Property', 'https://gulfnews.com/rss/business/property.xml', 'rss', ARRAY['dubai', 'property', 'real estate', 'housing'], 1, 'hourly'),
('Khaleej Times Property', 'https://www.khaleejtimes.com/rss/property', 'rss', ARRAY['dubai', 'property', 'real estate', 'villa', 'apartment'], 1, 'hourly'),
('The National Business', 'https://www.thenationalnews.com/rss/business.xml', 'rss', ARRAY['uae', 'dubai', 'economy', 'real estate', 'property'], 1, 'hourly'),

-- Tier 2: Business & Economy
('Zawya UAE', 'https://www.zawya.com/en/rss/uae.xml', 'rss', ARRAY['uae', 'dubai', 'business', 'investment', 'property'], 2, 'daily'),
('Reuters Middle East', 'https://www.reuters.com/rss/middleeast', 'rss', ARRAY['middle east', 'uae', 'economy', 'investment'], 2, 'daily'),
('Trade Arabia Property', 'https://www.tradearabia.com/rss/property.xml', 'rss', ARRAY['property', 'real estate', 'gcc', 'dubai'], 2, 'daily'),
('MENA Herald', 'https://menaherald.com/feed/', 'rss', ARRAY['mena', 'dubai', 'real estate', 'business'], 2, 'daily'),

-- Tier 3: Industry & Construction
('Construction Week ME', 'https://www.constructionweekonline.com/rss', 'rss', ARRAY['construction', 'dubai', 'development', 'infrastructure'], 3, 'daily'),
('Property Finder Blog', 'https://www.propertyfinder.ae/blog/feed/', 'rss', ARRAY['dubai', 'property', 'market', 'trends'], 3, 'daily'),
('Bayut Blog', 'https://www.bayut.com/mybayut/feed/', 'rss', ARRAY['dubai', 'property', 'market', 'analysis'], 3, 'daily'),
('Dubai Chronicle', 'https://dubaichronicle.com/feed/', 'rss', ARRAY['dubai', 'news', 'property', 'lifestyle'], 3, 'daily'),

-- Scrape sources (Firecrawl)
('Dubai Land Department', 'https://dubailand.gov.ae/en/news', 'scrape', ARRAY['dld', 'official', 'regulations', 'transactions'], 1, 'daily'),
('RERA Announcements', 'https://www.rera.gov.ae/en/news', 'scrape', ARRAY['rera', 'regulations', 'official', 'compliance'], 1, 'weekly');