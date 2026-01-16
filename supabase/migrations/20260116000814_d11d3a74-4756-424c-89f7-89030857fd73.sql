-- Performance indexes for high-traffic queries

-- AI response cache - faster lookups
CREATE INDEX IF NOT EXISTS idx_ai_response_cache_cache_key 
ON public.ai_response_cache(cache_key);

CREATE INDEX IF NOT EXISTS idx_ai_response_cache_function_expires 
ON public.ai_response_cache(function_name, expires_at);

-- AI usage tracking - for analytics queries
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_query_type 
ON public.ai_usage(user_id, query_type);

CREATE INDEX IF NOT EXISTS idx_ai_usage_used_at 
ON public.ai_usage(used_at DESC);

-- Properties - common search patterns  
CREATE INDEX IF NOT EXISTS idx_properties_location_status 
ON public.properties(location_area, status);

CREATE INDEX IF NOT EXISTS idx_properties_price_published 
ON public.properties(price_aed, is_published) 
WHERE is_published = true;

CREATE INDEX IF NOT EXISTS idx_properties_developer_status 
ON public.properties(developer_id, status);

CREATE INDEX IF NOT EXISTS idx_properties_listing_type 
ON public.properties(listing_type, is_published) 
WHERE is_published = true;

-- Developer projects - common lookups
CREATE INDEX IF NOT EXISTS idx_developer_projects_developer_status 
ON public.developer_projects(developer_id, status);

CREATE INDEX IF NOT EXISTS idx_developer_projects_location_area 
ON public.developer_projects(location_area);

-- Area market data - for benchmark queries
CREATE INDEX IF NOT EXISTS idx_area_market_data_area_slug 
ON public.area_market_data(area_slug);

CREATE INDEX IF NOT EXISTS idx_area_market_data_updated 
ON public.area_market_data(updated_at DESC);

-- News articles - for feed queries
CREATE INDEX IF NOT EXISTS idx_news_articles_published 
ON public.news_articles(published_at DESC) 
WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_news_articles_category 
ON public.news_articles(category, published_at DESC);

-- User profiles - for directory/lookup (uses id as user reference)
CREATE INDEX IF NOT EXISTS idx_profiles_visible_directory 
ON public.profiles(is_visible_in_directory, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_profiles_membership_tier 
ON public.profiles(membership_tier);

-- Community posts - for feed queries
CREATE INDEX IF NOT EXISTS idx_community_posts_channel_created 
ON public.community_posts(channel_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_community_posts_user_created 
ON public.community_posts(user_id, created_at DESC);

-- API usage logs - for monitoring
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_api_key_created 
ON public.api_usage_logs(api_key_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_api_usage_logs_created 
ON public.api_usage_logs(created_at DESC);

-- ANALYZE to update statistics for query planner
ANALYZE public.ai_response_cache;
ANALYZE public.ai_usage;
ANALYZE public.properties;
ANALYZE public.developer_projects;
ANALYZE public.news_articles;
ANALYZE public.profiles;
ANALYZE public.community_posts;