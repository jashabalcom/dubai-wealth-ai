-- Phase 1 Critical Security Fixes Migration (Retry)

-- ============================================
-- 1. FIX PROFILES RLS - Hide PII from directory queries
-- ============================================

-- Drop ALL existing SELECT policies on profiles to start fresh
DROP POLICY IF EXISTS "Users can view profiles in directory" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view directory profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create a restrictive policy: users can only see their own full profile
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Update the get_directory_members_safe function to ensure it only returns safe columns
CREATE OR REPLACE FUNCTION public.get_directory_members_safe()
RETURNS TABLE(
  id uuid, 
  full_name text, 
  avatar_url text, 
  bio text, 
  country text, 
  membership_tier membership_tier, 
  investment_goal text, 
  budget_range text, 
  timeline text, 
  looking_for text
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
    p.country,
    p.membership_tier,
    p.investment_goal,
    p.budget_range,
    p.timeline,
    p.looking_for
  FROM profiles p
  WHERE p.is_visible_in_directory = true;
$$;

-- Update get_public_profile to ensure it only returns safe columns
CREATE OR REPLACE FUNCTION public.get_public_profile(profile_id uuid)
RETURNS TABLE(
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
  created_at timestamp with time zone
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

-- Function to get profile for community display (posts, comments, messages)
CREATE OR REPLACE FUNCTION public.get_community_profile(user_uuid uuid)
RETURNS TABLE(
  id uuid,
  full_name text,
  avatar_url text,
  membership_tier membership_tier,
  points integer,
  level integer
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
    p.membership_tier,
    p.points,
    p.level
  FROM public.profiles p
  WHERE p.id = user_uuid;
$$;

-- ============================================
-- 2. FIX AGENTS RLS - Hide Stripe data from public queries
-- ============================================

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can view agent profiles" ON public.agents;
DROP POLICY IF EXISTS "Public can view basic agent info" ON public.agents;
DROP POLICY IF EXISTS "Agents can view their own full profile" ON public.agents;

-- Create secure function to get public agent info (without Stripe data)
CREATE OR REPLACE FUNCTION public.get_public_agent_profile(agent_id uuid)
RETURNS TABLE(
  id uuid,
  full_name text,
  avatar_url text,
  bio text,
  years_experience integer,
  areas_covered text[],
  specializations text[],
  languages text[],
  is_verified boolean,
  brokerage_id uuid,
  total_listings integer,
  subscription_tier agent_tier
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    a.id,
    a.full_name,
    a.avatar_url,
    a.bio,
    a.years_experience,
    a.areas_covered,
    a.specializations,
    a.languages,
    a.is_verified,
    a.brokerage_id,
    a.total_listings,
    a.subscription_tier
  FROM agents a
  WHERE a.id = agent_id AND a.is_active = true;
$$;

-- Create function to list all active agents (public info only)
CREATE OR REPLACE FUNCTION public.get_active_agents()
RETURNS TABLE(
  id uuid,
  full_name text,
  avatar_url text,
  bio text,
  years_experience integer,
  areas_covered text[],
  specializations text[],
  languages text[],
  is_verified boolean,
  brokerage_id uuid,
  total_listings integer,
  subscription_tier agent_tier
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    a.id,
    a.full_name,
    a.avatar_url,
    a.bio,
    a.years_experience,
    a.areas_covered,
    a.specializations,
    a.languages,
    a.is_verified,
    a.brokerage_id,
    a.total_listings,
    a.subscription_tier
  FROM agents a
  WHERE a.is_active = true
  ORDER BY a.priority_ranking DESC, a.total_listings DESC;
$$;

-- Restrictive policy: agents can only view their own full record
CREATE POLICY "Agents can view their own full profile"
ON public.agents
FOR SELECT
USING (auth.uid() = user_id);

-- ============================================
-- 3. EXTENSIONS SCHEMA SETUP
-- ============================================

-- Create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Grant usage to relevant roles
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

-- ============================================
-- 4. VERIFY GROUP CHAT RLS FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION public.is_group_member(group_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_chat_members
    WHERE group_id = group_uuid
      AND user_id = auth.uid()
  )
$$;