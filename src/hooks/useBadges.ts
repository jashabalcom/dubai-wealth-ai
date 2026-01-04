import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Badge {
  id: string;
  user_id: string;
  badge_type: string;
  earned_at: string;
  metadata: Record<string, any>;
}

export interface BadgeDefinition {
  type: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: 'achievement' | 'expertise' | 'streak';
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // Achievement Badges
  { type: 'first_post', name: 'First Post', description: 'Created your first community post', icon: 'MessageSquare', color: 'text-blue-500', category: 'achievement' },
  { type: 'conversation_starter', name: 'Conversation Starter', description: 'Created 10 community posts', icon: 'MessageCircle', color: 'text-green-500', category: 'achievement' },
  { type: 'helpful_member', name: 'Helpful Member', description: 'Received 25 upvotes', icon: 'ThumbsUp', color: 'text-amber-500', category: 'achievement' },
  { type: 'top_contributor', name: 'Top Contributor', description: 'Received 100 upvotes', icon: 'Trophy', color: 'text-gold', category: 'achievement' },
  { type: 'dubai_expert', name: 'Dubai Expert', description: '50 posts with upvotes', icon: 'Crown', color: 'text-gold', category: 'achievement' },
  { type: 'community_helper', name: 'Community Helper', description: 'Made 50 comments', icon: 'Heart', color: 'text-pink-500', category: 'achievement' },
  { type: 'founding_member', name: 'Founding Member', description: 'Early community member', icon: 'Star', color: 'text-purple-500', category: 'achievement' },
  { type: 'elite_member', name: 'Elite Member', description: 'Elite membership tier', icon: 'Gem', color: 'text-gold', category: 'achievement' },
  
  // Expertise Badges (Admin verified)
  { type: 'verified_investor', name: 'Verified Investor', description: 'Verified property investor', icon: 'ShieldCheck', color: 'text-emerald-500', category: 'expertise' },
  { type: 'verified_agent', name: 'Licensed Agent', description: 'Verified RERA license', icon: 'BadgeCheck', color: 'text-blue-500', category: 'expertise' },
  { type: 'verified_developer', name: 'Certified Developer', description: 'Verified developer', icon: 'Building2', color: 'text-slate-500', category: 'expertise' },
  
  // Streak Badges
  { type: 'streak_7', name: '7-Day Streak', description: '7 consecutive active days', icon: 'Flame', color: 'text-orange-500', category: 'streak' },
  { type: 'streak_30', name: '30-Day Streak', description: '30 consecutive active days', icon: 'Zap', color: 'text-yellow-500', category: 'streak' },
  { type: 'streak_100', name: '100-Day Streak', description: '100 consecutive active days', icon: 'Award', color: 'text-gold', category: 'streak' },
];

export function useBadges(userId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const targetUserId = userId || user?.id;

  const { data: badges = [], isLoading } = useQuery({
    queryKey: ['user-badges', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return [];
      const { data, error } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', targetUserId)
        .order('earned_at', { ascending: false });
      
      if (error) throw error;
      return data as Badge[];
    },
    enabled: !!targetUserId,
  });

  // Award badge mutation
  const awardBadgeMutation = useMutation({
    mutationFn: async ({ badgeType, metadata = {} }: { badgeType: string; metadata?: Record<string, any> }) => {
      if (!user) throw new Error('Must be logged in');
      
      const { error } = await supabase
        .from('user_badges')
        .insert({
          user_id: user.id,
          badge_type: badgeType,
          metadata,
        });
      
      if (error) {
        // Badge already exists (unique constraint)
        if (error.code === '23505') return null;
        throw error;
      }
      
      return badgeType;
    },
    onSuccess: (badgeType) => {
      if (badgeType) {
        const badge = BADGE_DEFINITIONS.find(b => b.type === badgeType);
        if (badge) {
          toast.success(`🎉 Badge Earned: ${badge.name}!`, {
            description: badge.description,
          });
        }
        queryClient.invalidateQueries({ queryKey: ['user-badges', user?.id] });
      }
    },
  });

  // Check if user has a specific badge
  const hasBadge = (badgeType: string) => {
    return badges.some(b => b.badge_type === badgeType);
  };

  // Get badge definition
  const getBadgeDefinition = (badgeType: string) => {
    return BADGE_DEFINITIONS.find(b => b.type === badgeType);
  };

  // Get user's badges with definitions
  const badgesWithDefinitions = badges.map(badge => ({
    ...badge,
    definition: getBadgeDefinition(badge.badge_type),
  })).filter(b => b.definition);

  return {
    badges,
    badgesWithDefinitions,
    isLoading,
    hasBadge,
    getBadgeDefinition,
    awardBadge: awardBadgeMutation.mutate,
    isAwarding: awardBadgeMutation.isPending,
  };
}
