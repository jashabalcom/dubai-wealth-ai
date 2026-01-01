-- Add new columns to news_articles for Bloomberg-style briefings
ALTER TABLE public.news_articles 
ADD COLUMN IF NOT EXISTS briefing_type TEXT DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS urgency_level TEXT DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS investment_rating INTEGER,
ADD COLUMN IF NOT EXISTS affected_areas TEXT[],
ADD COLUMN IF NOT EXISTS affected_sectors TEXT[],
ADD COLUMN IF NOT EXISTS key_metrics JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified',
ADD COLUMN IF NOT EXISTS verification_notes TEXT,
ADD COLUMN IF NOT EXISTS ai_confidence_score DECIMAL(3,2),
ADD COLUMN IF NOT EXISTS related_articles UUID[],
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS is_featured_digest BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS digest_date DATE;

-- Create daily_market_digests table
CREATE TABLE IF NOT EXISTS public.daily_market_digests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  digest_date DATE UNIQUE NOT NULL,
  headline TEXT NOT NULL,
  executive_summary TEXT NOT NULL,
  market_sentiment TEXT DEFAULT 'neutral',
  key_metrics JSONB DEFAULT '{}',
  top_article_ids UUID[],
  sector_highlights JSONB DEFAULT '{}',
  area_highlights JSONB DEFAULT '{}',
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on daily_market_digests
ALTER TABLE public.daily_market_digests ENABLE ROW LEVEL SECURITY;

-- RLS policies for daily_market_digests
CREATE POLICY "Admins can manage digests"
ON public.daily_market_digests
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view published digests"
ON public.daily_market_digests
FOR SELECT
USING (is_published = true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_news_articles_briefing_type ON public.news_articles(briefing_type);
CREATE INDEX IF NOT EXISTS idx_news_articles_urgency_level ON public.news_articles(urgency_level);
CREATE INDEX IF NOT EXISTS idx_news_articles_investment_rating ON public.news_articles(investment_rating);
CREATE INDEX IF NOT EXISTS idx_news_articles_verification_status ON public.news_articles(verification_status);
CREATE INDEX IF NOT EXISTS idx_news_articles_digest_date ON public.news_articles(digest_date);
CREATE INDEX IF NOT EXISTS idx_daily_digests_date ON public.daily_market_digests(digest_date);

-- Add trigger for updated_at on daily_market_digests
CREATE TRIGGER update_daily_market_digests_updated_at
BEFORE UPDATE ON public.daily_market_digests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();