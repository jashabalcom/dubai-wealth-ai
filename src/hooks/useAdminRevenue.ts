import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface RevenueStats {
  mrr: number;
  arr: number;
  totalRevenue: number;
  recentRevenue: number;
  arpu: number;
  ltv: number;
  churnRate: number;
  churnCount: number;
  investorCount: number;
  eliteCount: number;
  totalSubscribers: number;
  recentPayments: Array<{
    id: string;
    customer_email: string;
    amount: number;
    currency: string;
    created: number;
  }>;
}

export function useAdminRevenue() {
  return useQuery<RevenueStats>({
    queryKey: ['admin-revenue-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('admin-revenue-stats');
      
      if (error) {
        console.error('Error fetching revenue stats:', error);
        throw error;
      }
      
      return data;
    },
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000, // Consider data stale after 30 seconds
  });
}
