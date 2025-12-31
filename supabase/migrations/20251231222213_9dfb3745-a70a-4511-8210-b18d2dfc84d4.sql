-- Fix RLS policies to include private tier users for elite-level access

-- Drop and recreate portfolio policies to include private tier
DROP POLICY IF EXISTS "Users can view portfolios for elite members" ON public.portfolios;
CREATE POLICY "Users can view portfolios for elite or private members"
ON public.portfolios
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.membership_tier IN ('elite', 'private')
  )
);

DROP POLICY IF EXISTS "Users can create portfolios if elite member" ON public.portfolios;
CREATE POLICY "Users can create portfolios if elite or private member"
ON public.portfolios
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.membership_tier IN ('elite', 'private')
  )
);

DROP POLICY IF EXISTS "Users can update their own portfolios" ON public.portfolios;
CREATE POLICY "Users can update their own portfolios"
ON public.portfolios
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own portfolios" ON public.portfolios;
CREATE POLICY "Users can delete their own portfolios"
ON public.portfolios
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Fix community_channels policies for elite_only visibility to include private tier
DROP POLICY IF EXISTS "Users can view channels based on visibility" ON public.community_channels;
CREATE POLICY "Users can view channels based on visibility"
ON public.community_channels
FOR SELECT
TO authenticated
USING (
  visibility = 'all_members'
  OR (
    visibility = 'elite_only' 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.membership_tier IN ('elite', 'private')
    )
  )
);

-- Fix community_events policies
DROP POLICY IF EXISTS "Users can view events based on visibility" ON public.community_events;
CREATE POLICY "Users can view events based on visibility"
ON public.community_events
FOR SELECT
TO authenticated
USING (
  is_published = true
  AND (
    visibility = 'all_members'
    OR (
      visibility = 'elite_only' 
      AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.membership_tier IN ('elite', 'private')
      )
    )
  )
);

-- Fix community_posts policies for elite channels
DROP POLICY IF EXISTS "Users can create posts in accessible channels" ON public.community_posts;
CREATE POLICY "Users can create posts in accessible channels"
ON public.community_posts
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM community_channels cc
    WHERE cc.id = channel_id
    AND (
      cc.visibility = 'all_members'
      OR (
        cc.visibility = 'elite_only' 
        AND EXISTS (
          SELECT 1 FROM profiles 
          WHERE profiles.id = auth.uid() 
          AND profiles.membership_tier IN ('elite', 'private')
        )
      )
    )
  )
);

-- Update can_access_channel function to support private tier
CREATE OR REPLACE FUNCTION public.can_access_channel(channel_visibility channel_visibility, user_tier membership_tier)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $$
  SELECT CASE 
    WHEN channel_visibility = 'all_members' THEN true
    WHEN channel_visibility = 'elite_only' AND user_tier IN ('elite', 'private') THEN true
    ELSE false
  END
$$;