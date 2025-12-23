-- Fix profiles table PII exposure
-- Drop overlapping SELECT policies that expose sensitive data
DROP POLICY IF EXISTS "Users can view visible member profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own or directory profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own full profile" ON public.profiles;

-- Create a single secure SELECT policy:
-- Users can view their own full profile OR only safe fields of directory profiles via the view
CREATE POLICY "Users can view own profile only" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- The member_directory_view (with security_invoker) handles public directory access
-- and only exposes safe fields (no email, no linkedin_url)

-- Fix agents table sensitive data exposure  
-- Drop the current SELECT policy that exposes all fields
DROP POLICY IF EXISTS "Agents can view their own full profile" ON public.agents;

-- Create policy: agents can see their own full profile
CREATE POLICY "Agents can view own full profile" 
ON public.agents 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create a secure function for public agent listing (hides sensitive fields)
CREATE OR REPLACE FUNCTION public.get_public_agents()
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
  WHERE a.is_active = true
  ORDER BY a.priority_ranking DESC, a.total_listings DESC;
$$;

-- Create function for agent contact info (only for preferred/premium tiers with show_direct_contact enabled)
CREATE OR REPLACE FUNCTION public.get_agent_contact(agent_uuid uuid)
RETURNS TABLE (
  email text,
  phone text,
  whatsapp text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    a.email,
    a.phone,
    a.whatsapp
  FROM agents a
  WHERE a.id = agent_uuid
    AND a.is_active = true
    AND a.show_direct_contact = true
    AND a.subscription_tier IN ('preferred', 'premium');
$$;