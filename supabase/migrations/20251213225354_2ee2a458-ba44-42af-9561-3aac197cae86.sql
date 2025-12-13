-- Drop the security definer view and replace with a function
DROP VIEW IF EXISTS community_stats;

-- Create a secure function instead
CREATE OR REPLACE FUNCTION get_community_stats()
RETURNS TABLE(total_members BIGINT, elite_members BIGINT, posts_this_week BIGINT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (SELECT COUNT(*) FROM profiles WHERE is_visible_in_directory = true),
    (SELECT COUNT(*) FROM profiles WHERE membership_tier = 'elite' AND is_visible_in_directory = true),
    (SELECT COUNT(*) FROM community_posts WHERE created_at > now() - interval '7 days');
$$;