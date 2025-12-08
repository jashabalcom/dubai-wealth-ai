-- Create enum for channel visibility
CREATE TYPE public.channel_visibility AS ENUM ('all_members', 'elite_only');

-- Create community_channels table
CREATE TABLE public.community_channels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  visibility channel_visibility NOT NULL DEFAULT 'all_members',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create community_posts table
CREATE TABLE public.community_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID NOT NULL REFERENCES public.community_channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create community_comments table
CREATE TABLE public.community_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create post_likes table for tracking likes
CREATE TABLE public.post_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Create indexes
CREATE INDEX idx_community_posts_channel ON public.community_posts(channel_id);
CREATE INDEX idx_community_posts_user ON public.community_posts(user_id);
CREATE INDEX idx_community_comments_post ON public.community_comments(post_id);
CREATE INDEX idx_post_likes_post ON public.post_likes(post_id);

-- Enable RLS
ALTER TABLE public.community_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- Function to check if user can access channel based on visibility
CREATE OR REPLACE FUNCTION public.can_access_channel(channel_visibility channel_visibility, user_tier membership_tier)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT CASE 
    WHEN channel_visibility = 'all_members' THEN true
    WHEN channel_visibility = 'elite_only' AND user_tier = 'elite' THEN true
    ELSE false
  END
$$;

-- Channels policies - anyone authenticated can view channels they have access to
CREATE POLICY "Users can view accessible channels"
ON public.community_channels
FOR SELECT
USING (
  visibility = 'all_members' 
  OR (
    visibility = 'elite_only' 
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND membership_tier = 'elite'
    )
  )
);

-- Posts policies
CREATE POLICY "Users can view posts in accessible channels"
ON public.community_posts
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.community_channels c
    WHERE c.id = channel_id
    AND (
      c.visibility = 'all_members'
      OR (c.visibility = 'elite_only' AND EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND membership_tier = 'elite'
      ))
    )
  )
);

CREATE POLICY "Users can create posts in accessible channels"
ON public.community_posts
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.community_channels c
    WHERE c.id = channel_id
    AND (
      c.visibility = 'all_members'
      OR (c.visibility = 'elite_only' AND EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND membership_tier = 'elite'
      ))
    )
  )
);

CREATE POLICY "Users can update their own posts"
ON public.community_posts
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
ON public.community_posts
FOR DELETE
USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Users can view comments on accessible posts"
ON public.community_comments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.community_posts p
    JOIN public.community_channels c ON c.id = p.channel_id
    WHERE p.id = post_id
    AND (
      c.visibility = 'all_members'
      OR (c.visibility = 'elite_only' AND EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND membership_tier = 'elite'
      ))
    )
  )
);

CREATE POLICY "Users can create comments on accessible posts"
ON public.community_comments
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.community_posts p
    JOIN public.community_channels c ON c.id = p.channel_id
    WHERE p.id = post_id
    AND (
      c.visibility = 'all_members'
      OR (c.visibility = 'elite_only' AND EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND membership_tier = 'elite'
      ))
    )
  )
);

CREATE POLICY "Users can update their own comments"
ON public.community_comments
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON public.community_comments
FOR DELETE
USING (auth.uid() = user_id);

-- Likes policies
CREATE POLICY "Users can view likes"
ON public.post_likes
FOR SELECT
USING (true);

CREATE POLICY "Users can like posts"
ON public.post_likes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike posts"
ON public.post_likes
FOR DELETE
USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_community_posts_updated_at
BEFORE UPDATE ON public.community_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_comments_updated_at
BEFORE UPDATE ON public.community_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default channels
INSERT INTO public.community_channels (name, slug, description, visibility, order_index) VALUES
  ('General Discussion', 'general', 'General discussions about Dubai real estate investing', 'all_members', 1),
  ('Market Updates', 'market-updates', 'Latest news and market trends in Dubai property', 'all_members', 2),
  ('Wins & Deals', 'wins-and-deals', 'Share your successful investments and deals', 'all_members', 3),
  ('Questions & Help', 'questions-help', 'Ask questions and get help from the community', 'all_members', 4),
  ('Elite Deal Room', 'elite-deal-room', 'Exclusive deals and opportunities for Elite members', 'elite_only', 5),
  ('Elite Networking', 'elite-networking', 'Connect with fellow Elite investors', 'elite_only', 6);