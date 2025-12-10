-- First, drop the existing overly permissive SELECT policy on profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;

-- Create a new policy: users can only view their OWN full profile
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Create a security definer function to get safe directory member data
-- This exposes ONLY non-sensitive fields for the member directory
CREATE OR REPLACE FUNCTION public.get_directory_members()
RETURNS TABLE (
  id uuid,
  full_name text,
  avatar_url text,
  bio text,
  membership_tier membership_tier,
  country text,
  investment_goal text,
  budget_range text,
  timeline text,
  looking_for text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.full_name,
    p.avatar_url,
    p.bio,
    p.membership_tier,
    p.country,
    p.investment_goal,
    p.budget_range,
    p.timeline,
    p.looking_for,
    p.created_at
  FROM public.profiles p
  WHERE p.is_visible_in_directory = true
  ORDER BY p.created_at DESC
$$;

-- Create a function to get a single member's public profile (for profile pages)
CREATE OR REPLACE FUNCTION public.get_public_profile(profile_id uuid)
RETURNS TABLE (
  id uuid,
  full_name text,
  avatar_url text,
  bio text,
  membership_tier membership_tier,
  country text,
  investment_goal text,
  budget_range text,
  timeline text,
  looking_for text,
  linkedin_url text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.full_name,
    p.avatar_url,
    p.bio,
    p.membership_tier,
    p.country,
    p.investment_goal,
    p.budget_range,
    p.timeline,
    p.looking_for,
    p.linkedin_url,
    p.created_at
  FROM public.profiles p
  WHERE p.id = profile_id
    AND p.is_visible_in_directory = true
$$;