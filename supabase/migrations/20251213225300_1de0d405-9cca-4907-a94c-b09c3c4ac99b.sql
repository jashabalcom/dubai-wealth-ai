-- Member points & levels gamification system
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;

-- Pinned posts support
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS pinned_at TIMESTAMP WITH TIME ZONE;

-- Category/type for posts
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS post_type TEXT DEFAULT 'discussion';

-- Member following system
CREATE TABLE IF NOT EXISTS member_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- Enable RLS on member_follows
ALTER TABLE member_follows ENABLE ROW LEVEL SECURITY;

-- RLS policies for member_follows
CREATE POLICY "Users can view all follows" ON member_follows
  FOR SELECT USING (true);

CREATE POLICY "Users can follow others" ON member_follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id AND follower_id != following_id);

CREATE POLICY "Users can unfollow" ON member_follows
  FOR DELETE USING (auth.uid() = follower_id);

-- Community polls table
CREATE TABLE IF NOT EXISTS community_polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Poll votes table
CREATE TABLE IF NOT EXISTS poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES community_polls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  option_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(poll_id, user_id)
);

-- Enable RLS on polls
ALTER TABLE community_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;

-- RLS policies for polls
CREATE POLICY "Users can view polls in accessible posts" ON community_polls
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM community_posts p
    JOIN community_channels c ON c.id = p.channel_id
    WHERE p.id = community_polls.post_id
    AND (c.visibility = 'all_members' OR 
         (c.visibility = 'elite_only' AND EXISTS (
           SELECT 1 FROM profiles WHERE id = auth.uid() AND membership_tier = 'elite'
         )))
  ));

CREATE POLICY "Users can view votes" ON poll_votes
  FOR SELECT USING (true);

CREATE POLICY "Users can vote in polls" ON poll_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can change their vote" ON poll_votes
  FOR DELETE USING (auth.uid() = user_id);

-- Community stats view for sidebar
CREATE OR REPLACE VIEW community_stats AS
SELECT
  (SELECT COUNT(*) FROM profiles WHERE is_visible_in_directory = true) as total_members,
  (SELECT COUNT(*) FROM profiles WHERE membership_tier = 'elite' AND is_visible_in_directory = true) as elite_members,
  (SELECT COUNT(*) FROM community_posts WHERE created_at > now() - interval '7 days') as posts_this_week;

-- Function to award points for actions
CREATE OR REPLACE FUNCTION award_points(user_uuid UUID, action_type TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  points_to_add INTEGER;
BEGIN
  -- Define point values for different actions
  CASE action_type
    WHEN 'create_post' THEN points_to_add := 10;
    WHEN 'comment' THEN points_to_add := 5;
    WHEN 'receive_like' THEN points_to_add := 2;
    WHEN 'receive_comment' THEN points_to_add := 3;
    WHEN 'complete_lesson' THEN points_to_add := 15;
    WHEN 'daily_login' THEN points_to_add := 1;
    ELSE points_to_add := 0;
  END CASE;

  -- Update user's points
  UPDATE profiles 
  SET points = COALESCE(points, 0) + points_to_add,
      level = CASE 
        WHEN COALESCE(points, 0) + points_to_add >= 1000 THEN 9
        WHEN COALESCE(points, 0) + points_to_add >= 500 THEN 8
        WHEN COALESCE(points, 0) + points_to_add >= 300 THEN 7
        WHEN COALESCE(points, 0) + points_to_add >= 200 THEN 6
        WHEN COALESCE(points, 0) + points_to_add >= 100 THEN 5
        WHEN COALESCE(points, 0) + points_to_add >= 50 THEN 4
        WHEN COALESCE(points, 0) + points_to_add >= 25 THEN 3
        WHEN COALESCE(points, 0) + points_to_add >= 10 THEN 2
        ELSE 1
      END
  WHERE id = user_uuid;
END;
$$;