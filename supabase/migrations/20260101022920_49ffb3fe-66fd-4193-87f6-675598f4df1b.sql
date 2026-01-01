-- Add enhanced Bloomberg-style fields to news_articles
ALTER TABLE news_articles 
ADD COLUMN IF NOT EXISTS quick_take TEXT,
ADD COLUMN IF NOT EXISTS opportunity_score INTEGER CHECK (opportunity_score >= 1 AND opportunity_score <= 10),
ADD COLUMN IF NOT EXISTS risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')),
ADD COLUMN IF NOT EXISTS time_sensitivity TEXT CHECK (time_sensitivity IN ('immediate', '2_weeks', '1_month', 'evergreen')),
ADD COLUMN IF NOT EXISTS contrarian_view TEXT,
ADD COLUMN IF NOT EXISTS historical_context TEXT;

-- Add index for filtering by opportunity score
CREATE INDEX IF NOT EXISTS idx_news_articles_opportunity_score ON news_articles(opportunity_score) WHERE opportunity_score IS NOT NULL;