import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MemberProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  membership_tier: string | null;
  country: string | null;
  investment_goal: string | null;
  budget_range: string | null;
  timeline: string | null;
  looking_for: string | null;
  linkedin_url: string | null;
  created_at: string | null;
  is_demo_member: boolean;
}

export function useMemberProfile(memberId: string | undefined) {
  return useQuery({
    queryKey: ['member-profile', memberId],
    queryFn: async (): Promise<MemberProfile | null> => {
      if (!memberId) return null;

      const { data, error } = await supabase
        .rpc('get_member_profile', { member_id: memberId });

      if (error) {
        console.error('Error fetching member profile:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        return null;
      }

      return data[0] as MemberProfile;
    },
    enabled: !!memberId,
  });
}
