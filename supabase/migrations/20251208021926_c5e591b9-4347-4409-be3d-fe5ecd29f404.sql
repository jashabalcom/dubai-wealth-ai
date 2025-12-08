-- Fix function search_path for can_access_channel
CREATE OR REPLACE FUNCTION public.can_access_channel(channel_visibility channel_visibility, user_tier membership_tier)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT CASE 
    WHEN channel_visibility = 'all_members' THEN true
    WHEN channel_visibility = 'elite_only' AND user_tier = 'elite' THEN true
    ELSE false
  END
$$;