-- Drop and recreate member_directory_view with security_invoker
DROP VIEW IF EXISTS public.member_directory_view;

CREATE VIEW public.member_directory_view
WITH (security_invoker = true)
AS
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

GRANT SELECT ON public.member_directory_view TO authenticated;