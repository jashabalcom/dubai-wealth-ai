-- Phase 2: Database Optimization - Fix RLS Recursion & Add Indexes

-- ============================================
-- FIX 1: Create security definer function for workspace membership check
-- ============================================

CREATE OR REPLACE FUNCTION public.is_workspace_member(ws_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_members
    WHERE workspace_id = ws_id
      AND user_id = auth.uid()
  )
$$;

-- Drop ALL existing policies on workspace_members first
DROP POLICY IF EXISTS "Members can view workspace members" ON public.workspace_members;
DROP POLICY IF EXISTS "Admins can insert workspace members" ON public.workspace_members;
DROP POLICY IF EXISTS "Admins can update workspace members" ON public.workspace_members;
DROP POLICY IF EXISTS "Admins can delete workspace members" ON public.workspace_members;
DROP POLICY IF EXISTS "Admins can manage workspace members" ON public.workspace_members;
DROP POLICY IF EXISTS "Members can view their workspace" ON public.workspace_members;

-- Create fixed policies using security definer function
CREATE POLICY "Members can view workspace members"
ON public.workspace_members FOR SELECT
USING (
  user_id = auth.uid() 
  OR public.is_workspace_member(workspace_id)
);

CREATE POLICY "Admins can manage workspace members"
ON public.workspace_members FOR ALL
USING (
  public.has_role(auth.uid(), 'admin')
  OR (
    user_id = auth.uid() 
    AND role = 'owner'
  )
);

-- ============================================
-- FIX 2: Add performance indexes
-- ============================================

-- Agents table indexes (29,156 seq scans, 0 idx scans)
CREATE INDEX IF NOT EXISTS idx_agents_is_active ON public.agents(is_active);
CREATE INDEX IF NOT EXISTS idx_agents_user_id ON public.agents(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_agents_active_ranking ON public.agents(is_active, priority_ranking DESC NULLS LAST) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_agents_subscription_tier ON public.agents(subscription_tier) WHERE is_active = true;

-- Profiles table indexes (35,550 seq scans, 703 idx scans)
CREATE INDEX IF NOT EXISTS idx_profiles_visible_directory ON public.profiles(is_visible_in_directory) WHERE is_visible_in_directory = true;
CREATE INDEX IF NOT EXISTS idx_profiles_membership_tier ON public.profiles(membership_tier);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Properties table composite indexes
CREATE INDEX IF NOT EXISTS idx_properties_listing_status ON public.properties(listing_type, status, is_published);
CREATE INDEX IF NOT EXISTS idx_properties_area_type ON public.properties(location_area, property_type);
CREATE INDEX IF NOT EXISTS idx_properties_price_range ON public.properties(price_aed) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_properties_developer ON public.properties(developer_name) WHERE developer_name IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_properties_bedrooms ON public.properties(bedrooms) WHERE is_published = true;

-- Courses table
CREATE INDEX IF NOT EXISTS idx_courses_published ON public.courses(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_courses_category ON public.courses(category);

-- Communities table
CREATE INDEX IF NOT EXISTS idx_communities_area ON public.communities(area_id) WHERE area_id IS NOT NULL;

-- News articles (use published_at for ordering, no is_published column)
CREATE INDEX IF NOT EXISTS idx_news_published_date ON public.news_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_category ON public.news_articles(category);

-- Developer projects
CREATE INDEX IF NOT EXISTS idx_dev_projects_developer ON public.developer_projects(developer_id);
CREATE INDEX IF NOT EXISTS idx_dev_projects_status ON public.developer_projects(status);
CREATE INDEX IF NOT EXISTS idx_dev_projects_area ON public.developer_projects(location_area);

-- Calendar events
CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON public.calendar_events(event_date) WHERE is_published = true;

-- ============================================
-- FIX 3: Create optimized function for properties with counts
-- ============================================

CREATE OR REPLACE FUNCTION public.get_properties_with_counts(
  p_listing_type text DEFAULT NULL,
  p_status text DEFAULT 'available',
  p_area text DEFAULT NULL,
  p_property_type text DEFAULT NULL,
  p_min_price numeric DEFAULT NULL,
  p_max_price numeric DEFAULT NULL,
  p_bedrooms integer DEFAULT NULL,
  p_developer text DEFAULT NULL,
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0,
  p_sort_by text DEFAULT 'newest'
)
RETURNS TABLE(
  properties jsonb,
  total_count bigint,
  area_counts jsonb,
  developer_counts jsonb,
  ready_count bigint,
  offplan_count bigint,
  buy_count bigint,
  rent_count bigint
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_properties jsonb;
  v_total_count bigint;
  v_area_counts jsonb;
  v_developer_counts jsonb;
  v_ready_count bigint;
  v_offplan_count bigint;
  v_buy_count bigint;
  v_rent_count bigint;
BEGIN
  -- Get filtered properties with pagination
  WITH filtered AS (
    SELECT p.*
    FROM properties p
    WHERE p.is_published = true
      AND (p_listing_type IS NULL OR p.listing_type = p_listing_type)
      AND (p_status IS NULL OR p.status = p_status)
      AND (p_area IS NULL OR p.location_area = p_area)
      AND (p_property_type IS NULL OR p.property_type = p_property_type)
      AND (p_min_price IS NULL OR p.price_aed >= p_min_price)
      AND (p_max_price IS NULL OR p.price_aed <= p_max_price)
      AND (p_bedrooms IS NULL OR p.bedrooms = p_bedrooms)
      AND (p_developer IS NULL OR p.developer_name = p_developer)
  ),
  paginated AS (
    SELECT f.*
    FROM filtered f
    ORDER BY 
      CASE WHEN p_sort_by = 'price_asc' THEN f.price_aed END ASC,
      CASE WHEN p_sort_by = 'price_desc' THEN f.price_aed END DESC,
      CASE WHEN p_sort_by = 'newest' OR p_sort_by IS NULL THEN f.created_at END DESC
    LIMIT p_limit
    OFFSET p_offset
  )
  SELECT 
    jsonb_agg(row_to_json(paginated.*)),
    (SELECT COUNT(*) FROM filtered)
  INTO v_properties, v_total_count
  FROM paginated;
  
  -- Get area counts
  SELECT jsonb_object_agg(location_area, cnt)
  INTO v_area_counts
  FROM (
    SELECT location_area, COUNT(*)::integer as cnt
    FROM properties
    WHERE is_published = true
      AND status = 'available'
      AND (p_listing_type IS NULL OR listing_type = p_listing_type)
      AND location_area IS NOT NULL
    GROUP BY location_area
  ) area_data;
  
  -- Get developer counts
  SELECT jsonb_object_agg(developer_name, cnt)
  INTO v_developer_counts
  FROM (
    SELECT developer_name, COUNT(*)::integer as cnt
    FROM properties
    WHERE is_published = true
      AND status = 'available'
      AND (p_listing_type IS NULL OR listing_type = p_listing_type)
      AND developer_name IS NOT NULL
    GROUP BY developer_name
  ) dev_data;
  
  -- Get status counts
  SELECT 
    COUNT(*) FILTER (WHERE property_status = 'ready'),
    COUNT(*) FILTER (WHERE property_status = 'off_plan')
  INTO v_ready_count, v_offplan_count
  FROM properties
  WHERE is_published = true
    AND status = 'available'
    AND (p_listing_type IS NULL OR listing_type = p_listing_type);
  
  -- Get listing type counts
  SELECT 
    COUNT(*) FILTER (WHERE listing_type = 'buy'),
    COUNT(*) FILTER (WHERE listing_type = 'rent')
  INTO v_buy_count, v_rent_count
  FROM properties
  WHERE is_published = true
    AND status = 'available';
  
  RETURN QUERY SELECT 
    COALESCE(v_properties, '[]'::jsonb),
    COALESCE(v_total_count, 0),
    COALESCE(v_area_counts, '{}'::jsonb),
    COALESCE(v_developer_counts, '{}'::jsonb),
    COALESCE(v_ready_count, 0),
    COALESCE(v_offplan_count, 0),
    COALESCE(v_buy_count, 0),
    COALESCE(v_rent_count, 0);
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_workspace_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_properties_with_counts TO authenticated, anon;