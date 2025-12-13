-- Add gif_url to posts
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS gif_url TEXT;

-- Mentions tracking table
CREATE TABLE IF NOT EXISTS post_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,
  mentioned_user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT post_or_comment CHECK (post_id IS NOT NULL OR comment_id IS NOT NULL)
);

-- Enable RLS on post_mentions
ALTER TABLE post_mentions ENABLE ROW LEVEL SECURITY;

-- Anyone can view mentions
CREATE POLICY "Anyone can view mentions" ON post_mentions FOR SELECT USING (true);

-- Authenticated users can create mentions
CREATE POLICY "Authenticated users can create mentions" ON post_mentions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Post reactions table (multi-emoji beyond likes)
CREATE TABLE IF NOT EXISTS post_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, user_id, emoji)
);

-- Enable RLS on post_reactions
ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;

-- Anyone can view reactions
CREATE POLICY "Anyone can view post reactions" ON post_reactions FOR SELECT USING (true);

-- Users can add their own reactions
CREATE POLICY "Users can add reactions" ON post_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can remove their own reactions
CREATE POLICY "Users can remove own reactions" ON post_reactions FOR DELETE USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_post_mentions_post_id ON post_mentions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_mentions_mentioned_user ON post_mentions(mentioned_user_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_post_id ON post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_user_id ON post_reactions(user_id);