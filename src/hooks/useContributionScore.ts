import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ContributionData {
  karma: number;
  contribution_score: number;
  verified_investor: boolean;
  verified_agent: boolean;
  posts_count?: number;
  comments_count?: number;
}

interface ContributionBreakdown {
  helpfulness: number; // From upvotes (karma)
  activity: number; // From posts + comments
  expertise: number; // From verified status
  total: number;
}

// Contribution score formula weights
const WEIGHTS = {
  KARMA: 2,
  POST: 5,
  COMMENT: 2,
  VERIFIED_INVESTOR: 100,
  VERIFIED_AGENT: 75,
};

export function useContributionScore(userId?: string) {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  const { data, isLoading } = useQuery({
    queryKey: ['contribution-score', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return null;

      // Get profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('karma, contribution_score, verified_investor, verified_agent')
        .eq('id', targetUserId)
        .single();

      if (profileError) throw profileError;

      // Get post count
      const { count: postsCount } = await supabase
        .from('community_posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', targetUserId);

      // Get comment count
      const { count: commentsCount } = await supabase
        .from('community_comments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', targetUserId);

      return {
        ...profile,
        posts_count: postsCount || 0,
        comments_count: commentsCount || 0,
      } as ContributionData;
    },
    enabled: !!targetUserId,
  });

  // Calculate breakdown
  const calculateBreakdown = (): ContributionBreakdown => {
    if (!data) {
      return { helpfulness: 0, activity: 0, expertise: 0, total: 0 };
    }

    const helpfulness = (data.karma || 0) * WEIGHTS.KARMA;
    const activity = 
      (data.posts_count || 0) * WEIGHTS.POST + 
      (data.comments_count || 0) * WEIGHTS.COMMENT;
    const expertise = 
      (data.verified_investor ? WEIGHTS.VERIFIED_INVESTOR : 0) +
      (data.verified_agent ? WEIGHTS.VERIFIED_AGENT : 0);

    return {
      helpfulness,
      activity,
      expertise,
      total: helpfulness + activity + expertise,
    };
  };

  const breakdown = calculateBreakdown();

  // Get level based on contribution score
  const getLevel = (score: number) => {
    if (score >= 1000) return { level: 9, name: 'Wealth Architect' };
    if (score >= 500) return { level: 8, name: 'Elite Investor' };
    if (score >= 300) return { level: 7, name: 'Dubai Insider' };
    if (score >= 200) return { level: 6, name: 'Market Expert' };
    if (score >= 100) return { level: 5, name: 'Portfolio Builder' };
    if (score >= 50) return { level: 4, name: 'Investor' };
    if (score >= 25) return { level: 3, name: 'Researcher' };
    if (score >= 10) return { level: 2, name: 'Explorer' };
    return { level: 1, name: 'Prospect' };
  };

  const levelInfo = getLevel(breakdown.total);

  return {
    data,
    isLoading,
    breakdown,
    totalScore: breakdown.total,
    karma: data?.karma || 0,
    isVerifiedInvestor: data?.verified_investor || false,
    isVerifiedAgent: data?.verified_agent || false,
    level: levelInfo.level,
    levelName: levelInfo.name,
  };
}
