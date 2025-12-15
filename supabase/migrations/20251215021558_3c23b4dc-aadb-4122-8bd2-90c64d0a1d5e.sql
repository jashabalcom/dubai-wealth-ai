-- Add is_published column to properties table for admin approval workflow
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT true;

-- Create function to get agent id for current user (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.get_agent_id_for_user()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.agents WHERE user_id = auth.uid() LIMIT 1
$$;

-- RLS policy: Agents can insert their own properties (unpublished by default)
CREATE POLICY "Agents can insert their own properties"
ON public.properties FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND agent_id = public.get_agent_id_for_user()
);

-- RLS policy: Agents can update their own properties
CREATE POLICY "Agents can update their own properties"
ON public.properties FOR UPDATE
USING (agent_id = public.get_agent_id_for_user());

-- RLS policy: Agents can delete their own properties
CREATE POLICY "Agents can delete their own properties"
ON public.properties FOR DELETE
USING (agent_id = public.get_agent_id_for_user());

-- RLS policy: Agents can view their own properties (including unpublished)
CREATE POLICY "Agents can view their own properties"
ON public.properties FOR SELECT
USING (agent_id = public.get_agent_id_for_user());

-- Update existing public view policy to only show published properties
DROP POLICY IF EXISTS "Anyone can view properties" ON public.properties;
CREATE POLICY "Anyone can view published properties"
ON public.properties FOR SELECT
USING (is_published = true);