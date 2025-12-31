import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface InvestorMetrics {
  // Revenue Metrics
  mrr: number;
  arr: number;
  totalRevenue: number;
  b2cRevenue: number;
  b2bRevenue: number;
  revenueByTier: {
    investor: { count: number; revenue: number };
    elite: { count: number; revenue: number };
    agentBasic: { count: number; revenue: number };
    agentPreferred: { count: number; revenue: number };
    agentPremium: { count: number; revenue: number };
  };
  
  // Unit Economics
  arpu: number;
  ltv: number;
  cac: number;
  ltvCacRatio: number;
  paybackMonths: number;
  
  // Churn & Retention
  churnRate: number;
  churnCount: number;
  retentionRate: number;
  
  // Growth Metrics
  mrrGrowthMoM: number;
  userGrowthMoM: number;
  revenueGrowthMoM: number;
  
  // Subscriber Breakdown
  totalSubscribers: number;
  investorCount: number;
  eliteCount: number;
  agentBasicCount: number;
  agentPreferredCount: number;
  agentPremiumCount: number;
  
  // Product Metrics
  totalUsers: number;
  wau: number;
  mau: number;
  totalProperties: number;
  totalNeighborhoods: number;
  totalLessons: number;
  lessonsCompleted: number;
  totalPosts: number;
  aiQueriesCount: number;
  
  // Cohort Data
  cohorts: Record<string, { signups: number; conversions: number; retained: number }>;
  
  // Runway
  monthlyBurn: number;
  netMRR: number;
  
  // Timestamp
  generatedAt: string;
}

export function useInvestorMetrics(enabled: boolean = true) {
  return useQuery<InvestorMetrics>({
    queryKey: ['investor-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('investor-metrics');
      
      if (error) {
        console.error('Error fetching investor metrics:', error);
        throw error;
      }
      
      return data;
    },
    enabled,
    refetchInterval: enabled ? 300000 : false, // 5 minutes
    staleTime: 60000, // 1 minute
  });
}
