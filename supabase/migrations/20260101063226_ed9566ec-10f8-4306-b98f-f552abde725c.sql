-- Add new columns to daily_market_digests for Bloomberg-style briefing
ALTER TABLE daily_market_digests 
ADD COLUMN IF NOT EXISTS investment_action TEXT DEFAULT 'watch',
ADD COLUMN IF NOT EXISTS confidence_score INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS data_sources TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS key_takeaways TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS top_areas JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS transaction_volume INTEGER,
ADD COLUMN IF NOT EXISTS avg_price_sqft DECIMAL,
ADD COLUMN IF NOT EXISTS generated_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS analyst_notes TEXT;

-- Add check constraint for investment_action
ALTER TABLE daily_market_digests 
ADD CONSTRAINT valid_investment_action 
CHECK (investment_action IN ('buy', 'hold', 'watch', 'caution'));

-- Add check constraint for confidence_score
ALTER TABLE daily_market_digests 
ADD CONSTRAINT valid_confidence_score 
CHECK (confidence_score >= 1 AND confidence_score <= 5);