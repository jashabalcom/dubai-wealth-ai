-- Drop existing function to allow signature change
DROP FUNCTION IF EXISTS public.get_member_profile(uuid);

-- Recreate with authentication and tiered visibility
CREATE OR REPLACE FUNCTION public.get_member_profile(member_id UUID)
RETURNS TABLE(
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
  linkedin_url TEXT,
  created_at TIMESTAMPTZ,
  is_demo_member BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_connected BOOLEAN := false;
  v_is_own_profile BOOLEAN := false;
BEGIN
  -- Require authentication to view member profiles
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required to view member profiles';
  END IF;

  -- Check if viewing own profile
  v_is_own_profile := (auth.uid() = member_id);

  -- Check if viewer is connected to this member
  IF NOT v_is_own_profile THEN
    SELECT EXISTS(
      SELECT 1 FROM connections c
      WHERE c.status = 'accepted'
        AND ((c.requester_id = auth.uid() AND c.recipient_id = member_id)
          OR (c.recipient_id = auth.uid() AND c.requester_id = member_id))
    ) INTO v_is_connected;
  END IF;

  -- Return profile with tiered visibility
  RETURN QUERY
  -- Try real profile first
  SELECT 
    p.id,
    p.full_name,
    p.avatar_url,
    p.bio,
    p.membership_tier::TEXT,
    p.country,
    p.investment_goal,
    -- Show budget if: own profile, connected, or user opted in
    CASE WHEN v_is_own_profile OR v_is_connected OR p.show_budget_public = true 
         THEN p.budget_range ELSE NULL END as budget_range,
    p.timeline,
    p.looking_for,
    -- Show linkedin if: own profile, connected, or user opted in
    CASE WHEN v_is_own_profile OR v_is_connected OR p.show_linkedin_public = true 
         THEN p.linkedin_url ELSE NULL END as linkedin_url,
    p.created_at,
    false as is_demo_member
  FROM profiles p
  WHERE p.id = member_id
    AND p.is_visible_in_directory = true
  
  UNION ALL
  
  -- Fallback to demo member
  SELECT 
    d.id,
    d.full_name,
    d.avatar_url,
    d.bio,
    d.membership_tier::TEXT,
    d.country,
    d.investment_goal,
    d.budget_range,
    d.timeline,
    d.looking_for,
    NULL::TEXT as linkedin_url,
    d.created_at,
    true as is_demo_member
  FROM demo_members d
  WHERE d.id = member_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_member_profile TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_member_profile FROM anon;