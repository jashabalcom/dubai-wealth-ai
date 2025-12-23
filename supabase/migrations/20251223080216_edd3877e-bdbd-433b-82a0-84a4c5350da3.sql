-- Create a secure view for member directory that excludes sensitive PII
CREATE OR REPLACE VIEW public.member_directory_view AS
SELECT 
  id,
  full_name,
  avatar_url,
  bio,
  country,
  investment_goal,
  budget_range,
  timeline,
  looking_for,
  membership_tier,
  created_at,
  is_visible_in_directory
FROM public.profiles
WHERE is_visible_in_directory = true;

-- Grant access to authenticated users
GRANT SELECT ON public.member_directory_view TO authenticated;

-- Drop duplicate/overlapping profile SELECT policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated can view directory profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles appropriately" ON public.profiles;

-- Create a single consolidated policy for profile viewing
CREATE POLICY "Users can view own or directory profiles" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = id  -- Own profile
  OR is_visible_in_directory = true  -- Directory profiles
);