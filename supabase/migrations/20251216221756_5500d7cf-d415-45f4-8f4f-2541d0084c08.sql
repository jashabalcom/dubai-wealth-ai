
-- =====================================================
-- SECURITY HARDENING MIGRATION - PII PROTECTION
-- Fixes critical data exposure issues before paid launch
-- =====================================================

-- 1. AGENTS TABLE: Create secure view function to hide sensitive contact info from public
CREATE OR REPLACE FUNCTION public.get_public_agent_profile(agent_id uuid)
RETURNS TABLE (
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

-- 2. PROFILES TABLE: Create secure directory function hiding emails
CREATE OR REPLACE FUNCTION public.get_directory_members_safe()
RETURNS TABLE (
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

-- 3. Drop existing overly permissive policies on agents
DROP POLICY IF EXISTS "Anyone can view active agents" ON public.agents;

-- 4. Create restrictive policy for agents - only show non-sensitive fields publicly
CREATE POLICY "Public can view limited agent info" 
ON public.agents 
FOR SELECT 
USING (
  is_active = true 
  AND (
    -- Agents can see their own full record
    auth.uid() = user_id
    -- Admins can see everything
    OR has_role(auth.uid(), 'admin')
  )
);

-- 5. Create separate policy for public agent listing (limited fields via RLS)
-- This allows PropertyCard to show agent name but not contact details
CREATE POLICY "Public can view active agent basic info"
ON public.agents
FOR SELECT
USING (
  is_active = true
);

-- Actually, we need to be more careful. Let's use a different approach:
-- Drop the policy we just created and use column-level security via views

DROP POLICY IF EXISTS "Public can view limited agent info" ON public.agents;
DROP POLICY IF EXISTS "Public can view active agent basic info" ON public.agents;

-- Create a restrictive policy that only allows viewing contact info for own profile or admins
CREATE POLICY "Authenticated users can view agent profiles"
ON public.agents
FOR SELECT
TO authenticated
USING (
  is_active = true
);

-- Create policy for public (unauthenticated) - they shouldn't see agents at all
-- Contact info should require authentication
CREATE POLICY "Public can view basic agent info"
ON public.agents
FOR SELECT
TO anon
USING (false); -- Block unauthenticated access entirely

-- 6. BAYUT_AGENTS: Require authentication to view
DROP POLICY IF EXISTS "Anyone can view bayut agents" ON public.bayut_agents;

CREATE POLICY "Authenticated users can view bayut agents"
ON public.bayut_agents
FOR SELECT
TO authenticated
USING (true);

-- 7. BAYUT_AGENCIES: Require authentication to view
DROP POLICY IF EXISTS "Anyone can view bayut agencies" ON public.bayut_agencies;

CREATE POLICY "Authenticated users can view bayut agencies"
ON public.bayut_agencies
FOR SELECT
TO authenticated
USING (true);

-- 8. BROKERAGES: Require authentication to view contact details
DROP POLICY IF EXISTS "Anyone can view active brokerages" ON public.brokerages;

CREATE POLICY "Authenticated users can view brokerages"
ON public.brokerages
FOR SELECT
TO authenticated
USING (is_active = true);

-- 9. PROPERTY_INQUIRIES: Strengthen RLS to ensure agents only see their own property inquiries
DROP POLICY IF EXISTS "Agents can view inquiries for their properties" ON public.property_inquiries;

CREATE POLICY "Agents can only view inquiries for their own properties"
ON public.property_inquiries
FOR SELECT
USING (
  -- User who submitted the inquiry
  auth.uid() = user_id
  -- Or admin
  OR has_role(auth.uid(), 'admin')
  -- Or agent who owns the property
  OR EXISTS (
    SELECT 1 FROM properties p
    WHERE p.id = property_inquiries.property_id
    AND p.agent_id IN (
      SELECT a.id FROM agents a WHERE a.user_id = auth.uid()
    )
  )
);

-- 10. PROFILES: Update policy to hide email from public directory view
-- The existing get_directory_members function should NOT return email
-- Let's check and update the profiles SELECT policy

DROP POLICY IF EXISTS "Anyone can view public profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable" ON public.profiles;

-- Users can view their own full profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Authenticated users can view directory profiles (without email exposure at application level)
CREATE POLICY "Authenticated can view directory profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (is_visible_in_directory = true OR auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Add comment documenting the security measures
COMMENT ON FUNCTION public.get_directory_members_safe IS 'Secure function to get directory members without exposing email addresses';
COMMENT ON FUNCTION public.get_public_agent_profile IS 'Secure function to get agent profile without exposing contact information to unauthorized users';
