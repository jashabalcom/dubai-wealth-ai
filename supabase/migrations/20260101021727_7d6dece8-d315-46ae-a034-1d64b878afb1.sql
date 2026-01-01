-- Disable broken sources
UPDATE news_sources SET is_active = false WHERE name IN (
  'Gulf News Property', 'Khaleej Times Property', 
  'Reuters Middle East', 'Zawya UAE', 'Construction Week ME'
);

-- Fix Arabian Business URL
UPDATE news_sources 
SET url = 'https://www.arabianbusiness.com/gcc/uae/feed' 
WHERE name = 'Arabian Business Property';

-- Add new verified sources
INSERT INTO news_sources (name, url, feed_type, tier, keywords, is_active) VALUES
('Emirates 24/7', 'https://www.emirates247.com/cmlink/rss-feed-1.4268', 'rss', 1, ARRAY['dubai', 'uae', 'real estate', 'property', 'business'], true),
('Arabian Post', 'https://thearabianpost.com/feed/', 'rss', 2, ARRAY['dubai', 'uae', 'real estate', 'property'], true),
('UAE 24x7', 'https://uae24x7.com/feed/', 'rss', 2, ARRAY['dubai', 'uae', 'property', 'development'], true),
('WAM News', 'https://www.wam.ae/en/rss/all', 'rss', 1, ARRAY['uae', 'dubai', 'abu dhabi', 'economy', 'real estate'], true)
ON CONFLICT DO NOTHING;

-- Add error tracking column
ALTER TABLE news_sources ADD COLUMN IF NOT EXISTS last_error TEXT;