-- Create function to get member profile from both profiles and demo_members tables
CREATE OR REPLACE FUNCTION public.get_member_profile(member_id uuid)
RETURNS TABLE(
  id uuid,
  full_name text,
  avatar_url text,
  bio text,
  membership_tier text,
  country text,
  investment_goal text,
  budget_range text,
  timeline text,
  looking_for text,
  linkedin_url text,
  created_at timestamp with time zone,
  is_demo_member boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- First try to find in profiles table
  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    p.avatar_url,
    p.bio,
    p.membership_tier::TEXT,
    p.country,
    p.investment_goal,
    p.budget_range,
    p.timeline,
    p.looking_for,
    p.linkedin_url,
    p.created_at,
    false AS is_demo_member
  FROM public.profiles p
  WHERE p.id = member_id
    AND p.is_visible_in_directory = true;
  
  -- If no rows returned, check demo_members
  IF NOT FOUND THEN
    RETURN QUERY
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
      NULL::TEXT AS linkedin_url,
      d.created_at,
      true AS is_demo_member
    FROM public.demo_members d
    WHERE d.id = member_id;
  END IF;
END;
$$;