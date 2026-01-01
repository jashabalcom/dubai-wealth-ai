-- Create paginated version of get_directory_members
CREATE OR REPLACE FUNCTION public.get_directory_members_paginated(
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0,
  p_search TEXT DEFAULT NULL,
  p_country TEXT DEFAULT NULL,
  p_membership_tier TEXT DEFAULT NULL,
  p_investment_goal TEXT DEFAULT NULL,
  p_sort_by TEXT DEFAULT 'newest'
)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  membership_tier TEXT,
  country TEXT,
  investment_goal TEXT,
  budget_range TEXT,
  timeline TEXT,
  looking_for TEXT,
  created_at TIMESTAMPTZ,
  total_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_count BIGINT;
BEGIN
  -- First get total count with filters applied
  SELECT COUNT(*) INTO v_total_count
  FROM (
    SELECT p.id FROM public.profiles p
    WHERE p.is_visible_in_directory = true
      AND (p_search IS NULL OR p_search = '' OR 
           p.full_name ILIKE '%' || p_search || '%' OR
           p.bio ILIKE '%' || p_search || '%' OR
           p.looking_for ILIKE '%' || p_search || '%')
      AND (p_country IS NULL OR p.country = p_country)
      AND (p_membership_tier IS NULL OR p.membership_tier::TEXT = p_membership_tier)
      AND (p_investment_goal IS NULL OR p.investment_goal = p_investment_goal)
    UNION ALL
    SELECT d.id FROM public.demo_members d
    WHERE (p_search IS NULL OR p_search = '' OR 
           d.full_name ILIKE '%' || p_search || '%' OR
           d.bio ILIKE '%' || p_search || '%' OR
           d.looking_for ILIKE '%' || p_search || '%')
      AND (p_country IS NULL OR d.country = p_country)
      AND (p_membership_tier IS NULL OR d.membership_tier::TEXT = p_membership_tier)
      AND (p_investment_goal IS NULL OR d.investment_goal = p_investment_goal)
  ) AS combined;

  -- Return paginated results
  RETURN QUERY
  SELECT 
    combined.id,
    combined.full_name,
    combined.avatar_url,
    combined.bio,
    combined.membership_tier,
    combined.country,
    combined.investment_goal,
    combined.budget_range,
    combined.timeline,
    combined.looking_for,
    combined.created_at,
    v_total_count AS total_count
  FROM (
    -- Real profiles
    SELECT 
      p.id,
      p.full_name,
      p.avatar_url,
      p.bio,
      p.membership_tier::TEXT AS membership_tier,
      p.country,
      p.investment_goal,
      p.budget_range,
      p.timeline,
      p.looking_for,
      p.created_at
    FROM public.profiles p
    WHERE p.is_visible_in_directory = true
      AND (p_search IS NULL OR p_search = '' OR 
           p.full_name ILIKE '%' || p_search || '%' OR
           p.bio ILIKE '%' || p_search || '%' OR
           p.looking_for ILIKE '%' || p_search || '%')
      AND (p_country IS NULL OR p.country = p_country)
      AND (p_membership_tier IS NULL OR p.membership_tier::TEXT = p_membership_tier)
      AND (p_investment_goal IS NULL OR p.investment_goal = p_investment_goal)
    
    UNION ALL
    
    -- Demo members
    SELECT 
      d.id,
      d.full_name,
      d.avatar_url,
      d.bio,
      d.membership_tier::TEXT AS membership_tier,
      d.country,
      d.investment_goal,
      d.budget_range,
      d.timeline,
      d.looking_for,
      d.created_at
    FROM public.demo_members d
    WHERE (p_search IS NULL OR p_search = '' OR 
           d.full_name ILIKE '%' || p_search || '%' OR
           d.bio ILIKE '%' || p_search || '%' OR
           d.looking_for ILIKE '%' || p_search || '%')
      AND (p_country IS NULL OR d.country = p_country)
      AND (p_membership_tier IS NULL OR d.membership_tier::TEXT = p_membership_tier)
      AND (p_investment_goal IS NULL OR d.investment_goal = p_investment_goal)
  ) AS combined
  ORDER BY 
    CASE WHEN p_sort_by = 'alphabetical' THEN combined.full_name END ASC,
    CASE WHEN p_sort_by = 'newest' OR p_sort_by IS NULL THEN combined.created_at END DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Create function to get filter options (cached separately)
CREATE OR REPLACE FUNCTION public.get_directory_filter_options()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN json_build_object(
    'countries', (
      SELECT COALESCE(json_agg(DISTINCT country ORDER BY country), '[]'::json)
      FROM (
        SELECT country FROM public.profiles WHERE is_visible_in_directory = true AND country IS NOT NULL
        UNION
        SELECT country FROM public.demo_members WHERE country IS NOT NULL
      ) c
    ),
    'investmentGoals', (
      SELECT COALESCE(json_agg(DISTINCT investment_goal ORDER BY investment_goal), '[]'::json)
      FROM (
        SELECT investment_goal FROM public.profiles WHERE is_visible_in_directory = true AND investment_goal IS NOT NULL
        UNION
        SELECT investment_goal FROM public.demo_members WHERE investment_goal IS NOT NULL
      ) g
    ),
    'budgetRanges', (
      SELECT COALESCE(json_agg(DISTINCT budget_range ORDER BY budget_range), '[]'::json)
      FROM (
        SELECT budget_range FROM public.profiles WHERE is_visible_in_directory = true AND budget_range IS NOT NULL
        UNION
        SELECT budget_range FROM public.demo_members WHERE budget_range IS NOT NULL
      ) b
    ),
    'timelines', (
      SELECT COALESCE(json_agg(DISTINCT timeline ORDER BY timeline), '[]'::json)
      FROM (
        SELECT timeline FROM public.profiles WHERE is_visible_in_directory = true AND timeline IS NOT NULL
        UNION
        SELECT timeline FROM public.demo_members WHERE timeline IS NOT NULL
      ) t
    )
  );
END;
$$;