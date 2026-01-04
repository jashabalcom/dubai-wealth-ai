
-- Fix search_path for update_post_upvote_count function
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix search_path for update_comment_upvote_count function
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
