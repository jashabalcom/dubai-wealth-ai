
-- Create post_votes table (upvotes only)
CREATE TABLE public.post_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(post_id, user_id)
);

-- Create comment_votes table (upvotes only)
CREATE TABLE public.comment_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID REFERENCES public.community_comments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(comment_id, user_id)
);

-- Create user_badges table
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  badge_type TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  metadata JSONB DEFAULT '{}',
  UNIQUE(user_id, badge_type)
);

-- Create user_streaks table
CREATE TABLE public.user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add upvote_count to community_posts
ALTER TABLE public.community_posts ADD COLUMN IF NOT EXISTS upvote_count INTEGER DEFAULT 0;

-- Add upvote_count to community_comments
ALTER TABLE public.community_comments ADD COLUMN IF NOT EXISTS upvote_count INTEGER DEFAULT 0;

-- Add reputation columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS karma INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS contribution_score INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verified_investor BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verified_agent BOOLEAN DEFAULT false;

-- Enable RLS on new tables
ALTER TABLE public.post_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

-- RLS for post_votes
CREATE POLICY "Users can view all post votes" ON public.post_votes FOR SELECT USING (true);
CREATE POLICY "Users can insert own post votes" ON public.post_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own post votes" ON public.post_votes FOR DELETE USING (auth.uid() = user_id);

-- RLS for comment_votes
CREATE POLICY "Users can view all comment votes" ON public.comment_votes FOR SELECT USING (true);
CREATE POLICY "Users can insert own comment votes" ON public.comment_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comment votes" ON public.comment_votes FOR DELETE USING (auth.uid() = user_id);

-- RLS for user_badges
CREATE POLICY "Anyone can view badges" ON public.user_badges FOR SELECT USING (true);
CREATE POLICY "System can insert badges" ON public.user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS for user_streaks
CREATE POLICY "Anyone can view streaks" ON public.user_streaks FOR SELECT USING (true);
CREATE POLICY "Users can manage own streak" ON public.user_streaks FOR ALL USING (auth.uid() = user_id);

-- Function to update post upvote count
CREATE OR REPLACE FUNCTION public.update_post_upvote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts SET upvote_count = upvote_count + 1 WHERE id = NEW.post_id;
    -- Update author karma
    UPDATE public.profiles SET karma = karma + 1 
    WHERE id = (SELECT user_id FROM public.community_posts WHERE id = NEW.post_id);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts SET upvote_count = upvote_count - 1 WHERE id = OLD.post_id;
    -- Update author karma
    UPDATE public.profiles SET karma = karma - 1 
    WHERE id = (SELECT user_id FROM public.community_posts WHERE id = OLD.post_id);
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update comment upvote count
CREATE OR REPLACE FUNCTION public.update_comment_upvote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_comments SET upvote_count = upvote_count + 1 WHERE id = NEW.comment_id;
    -- Update author karma
    UPDATE public.profiles SET karma = karma + 1 
    WHERE id = (SELECT user_id FROM public.community_comments WHERE id = NEW.comment_id);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_comments SET upvote_count = upvote_count - 1 WHERE id = OLD.comment_id;
    -- Update author karma
    UPDATE public.profiles SET karma = karma - 1 
    WHERE id = (SELECT user_id FROM public.community_comments WHERE id = OLD.comment_id);
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER post_vote_count_trigger
AFTER INSERT OR DELETE ON public.post_votes
FOR EACH ROW EXECUTE FUNCTION public.update_post_upvote_count();

CREATE TRIGGER comment_vote_count_trigger
AFTER INSERT OR DELETE ON public.comment_votes
FOR EACH ROW EXECUTE FUNCTION public.update_comment_upvote_count();

-- Enable realtime for votes
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_votes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comment_votes;
