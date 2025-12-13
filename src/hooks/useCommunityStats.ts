import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CommunityStats {
  total_members: number;
  elite_members: number;
  posts_this_week: number;
}

export function useCommunityStats() {
  return useQuery({
    queryKey: ['community-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_community_stats');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        return data[0] as CommunityStats;
      }
      
      return {
        total_members: 0,
        elite_members: 0,
        posts_this_week: 0
      };
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}
