-- =====================================================
-- PERFORMANCE OPTIMIZATION INDEXES
-- Critical indexes for scaling to 1M+ users
-- =====================================================

-- Properties table indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_properties_listing_type ON public.properties(listing_type) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_properties_location_area ON public.properties(location_area) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON public.properties(property_type) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_properties_price_aed ON public.properties(price_aed) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_properties_developer ON public.properties(developer_name) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON public.properties(created_at DESC) WHERE is_published = true;

-- Composite index for common filter combinations
CREATE INDEX IF NOT EXISTS idx_properties_listing_status_area ON public.properties(listing_type, status, location_area) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_properties_type_price ON public.properties(property_type, price_aed) WHERE is_published = true;

-- News articles indexes
CREATE INDEX IF NOT EXISTS idx_news_published_at ON public.news_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_category ON public.news_articles(category);

-- Community posts indexes for high-traffic queries
CREATE INDEX IF NOT EXISTS idx_community_posts_channel ON public.community_posts(channel_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_user ON public.community_posts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_comments_post ON public.community_comments(post_id, created_at DESC);

-- Profiles indexes for directory and lookups
CREATE INDEX IF NOT EXISTS idx_profiles_directory ON public.profiles(is_visible_in_directory, created_at DESC) WHERE is_visible_in_directory = true;
CREATE INDEX IF NOT EXISTS idx_profiles_membership ON public.profiles(membership_tier) WHERE is_visible_in_directory = true;

-- Course and lesson indexes for Academy
CREATE INDEX IF NOT EXISTS idx_courses_published ON public.courses(is_published, order_index);
CREATE INDEX IF NOT EXISTS idx_lessons_course ON public.lessons(course_id, order_index);

-- Developer projects indexes
CREATE INDEX IF NOT EXISTS idx_dev_projects_developer ON public.developer_projects(developer_id);
CREATE INDEX IF NOT EXISTS idx_dev_projects_status ON public.developer_projects(status);
CREATE INDEX IF NOT EXISTS idx_dev_projects_area ON public.developer_projects(location_area);

-- Agents indexes
CREATE INDEX IF NOT EXISTS idx_agents_active ON public.agents(is_active, priority_ranking DESC) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_agents_brokerage ON public.agents(brokerage_id) WHERE is_active = true;

-- Referrals and affiliate performance indexes
CREATE INDEX IF NOT EXISTS idx_referrals_affiliate ON public.referrals(affiliate_id, status);
CREATE INDEX IF NOT EXISTS idx_commissions_affiliate ON public.commissions(affiliate_id, status);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_affiliate ON public.affiliate_clicks(affiliate_id, created_at DESC);

-- Search optimization - GIN index for full-text search on properties
CREATE INDEX IF NOT EXISTS idx_properties_search ON public.properties USING gin(to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(location_area, '') || ' ' || COALESCE(developer_name, '')));