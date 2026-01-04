import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useBadges } from '@/hooks/useBadges';
import { format, differenceInDays, isToday, isYesterday } from 'date-fns';

interface UserStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  updated_at: string;
}

export function useStreak() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { awardBadge, hasBadge } = useBadges();

  const { data: streak, isLoading } = useQuery({
    queryKey: ['user-streak', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as UserStreak | null;
    },
    enabled: !!user,
  });

  // Record activity and update streak
  const recordActivityMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Must be logged in');
      
      const today = format(new Date(), 'yyyy-MM-dd');
      
      // Check if we have an existing streak
      const { data: existing } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (!existing) {
        // Create new streak
        const { error } = await supabase
          .from('user_streaks')
          .insert({
            user_id: user.id,
            current_streak: 1,
            longest_streak: 1,
            last_activity_date: today,
          });
        if (error) throw error;
        return { newStreak: 1, isNew: true };
      }
      
      // Already active today
      if (existing.last_activity_date === today) {
        return { newStreak: existing.current_streak, isNew: false };
      }
      
      const lastDate = existing.last_activity_date ? new Date(existing.last_activity_date) : null;
      let newStreak = 1;
      
      if (lastDate && isYesterday(lastDate)) {
        // Continue streak
        newStreak = existing.current_streak + 1;
      }
      
      const newLongest = Math.max(newStreak, existing.longest_streak);
      
      const { error } = await supabase
        .from('user_streaks')
        .update({
          current_streak: newStreak,
          longest_streak: newLongest,
          last_activity_date: today,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      return { newStreak, isNew: newStreak > existing.current_streak };
    },
    onSuccess: ({ newStreak, isNew }) => {
      queryClient.invalidateQueries({ queryKey: ['user-streak', user?.id] });
      
      // Award streak badges
      if (isNew) {
        if (newStreak === 7 && !hasBadge('streak_7')) {
          awardBadge({ badgeType: 'streak_7' });
        } else if (newStreak === 30 && !hasBadge('streak_30')) {
          awardBadge({ badgeType: 'streak_30' });
        } else if (newStreak === 100 && !hasBadge('streak_100')) {
          awardBadge({ badgeType: 'streak_100' });
        }
      }
    },
  });

  // Check if streak is active (activity today or yesterday)
  const isStreakActive = () => {
    if (!streak?.last_activity_date) return false;
    const lastDate = new Date(streak.last_activity_date);
    return isToday(lastDate) || isYesterday(lastDate);
  };

  // Check if streak is about to break (last activity was yesterday)
  const isStreakAtRisk = () => {
    if (!streak?.last_activity_date) return false;
    const lastDate = new Date(streak.last_activity_date);
    return isYesterday(lastDate);
  };

  return {
    streak,
    isLoading,
    currentStreak: streak?.current_streak || 0,
    longestStreak: streak?.longest_streak || 0,
    isStreakActive: isStreakActive(),
    isStreakAtRisk: isStreakAtRisk(),
    recordActivity: recordActivityMutation.mutate,
    isRecording: recordActivityMutation.isPending,
  };
}
