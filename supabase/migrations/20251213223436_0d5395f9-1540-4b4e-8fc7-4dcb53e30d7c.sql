
-- Create demo_members table for realistic directory demo data
-- This is separate from profiles table to avoid auth.users FK constraint

CREATE TABLE IF NOT EXISTS public.demo_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  membership_tier membership_tier DEFAULT 'free',
  country TEXT,
  investment_goal TEXT,
  budget_range TEXT,
  timeline TEXT,
  looking_for TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.demo_members ENABLE ROW LEVEL SECURITY;

-- Anyone can view demo members
CREATE POLICY "Anyone can view demo members"
  ON public.demo_members
  FOR SELECT
  USING (true);

-- Only admins can manage demo members
CREATE POLICY "Admins can manage demo members"
  ON public.demo_members
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Update get_directory_members function to include demo_members
CREATE OR REPLACE FUNCTION public.get_directory_members()
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
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  -- Real profiles
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
  
  UNION ALL
  
  -- Demo members
  SELECT 
    d.id,
    d.full_name,
    d.avatar_url,
    d.bio,
    d.membership_tier,
    d.country,
    d.investment_goal,
    d.budget_range,
    d.timeline,
    d.looking_for,
    d.created_at
  FROM public.demo_members d
  
  ORDER BY created_at DESC
$$;
