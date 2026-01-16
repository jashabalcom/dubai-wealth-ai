import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LiveMarketData {
  areaName: string;
  avgPriceSqft: number | null;
  avgYield: number | null;
  priceTrend: number | null;
  transactionsYtd: number | null;
  serviceChargeSqft: number | null;
  lastUpdated: string;
}

export interface RecentTransaction {
  date: string;
  propertyType: string;
  rooms: string;
  areaSqft: number;
  price: number;
  priceSqft: number;
}

export interface LiveMarketDataWithTransactions extends LiveMarketData {
  recentTransactions: RecentTransaction[];
}

// Fetch live market data for a specific area
export function useLiveMarketData(areaName: string) {
  return useQuery({
    queryKey: ['live-market-data', areaName],
    queryFn: async (): Promise<LiveMarketDataWithTransactions | null> => {
      if (!areaName) return null;

      // Fetch from area_market_data first
      const { data: areaData, error: areaError } = await supabase
        .from('area_market_data')
        .select('*')
        .ilike('area_name', `%${areaName}%`)
        .limit(1)
        .maybeSingle();

      if (areaError) {
        console.log(`Error fetching area data for ${areaName}:`, areaError.message);
      }

      // Fallback to area_benchmarks if no area_market_data
      let benchmarkData = null;
      if (!areaData) {
        const { data: benchmark } = await supabase
          .from('area_benchmarks')
          .select('*')
          .ilike('area_name', `%${areaName}%`)
          .limit(1)
          .maybeSingle();
        benchmarkData = benchmark;
      }

      // Fetch recent transactions for this area (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: transactions, error: txError } = await supabase
        .from('market_transactions')
        .select('instance_date, property_type, rooms, procedure_area_sqft, actual_worth, sqft_sale_price')
        .ilike('area_name', `%${areaName}%`)
        .gte('instance_date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('instance_date', { ascending: false })
        .limit(10);

      if (txError) {
        console.log(`Error fetching transactions for ${areaName}:`, txError.message);
      }

      const sourceData = areaData || benchmarkData;

      if (!sourceData && (!transactions || transactions.length === 0)) {
        return null;
      }

      return {
        areaName: sourceData?.area_name || areaName,
        avgPriceSqft: sourceData?.avg_price_sqft || null,
        avgYield: sourceData?.avg_yield || null,
        priceTrend: areaData?.price_trend_percent || null,
        transactionsYtd: areaData?.total_transactions_ytd || null,
        serviceChargeSqft: areaData?.service_charge_sqft || null,
        lastUpdated: sourceData?.updated_at || new Date().toISOString(),
        recentTransactions: (transactions || []).map(tx => ({
          date: tx.instance_date,
          propertyType: tx.property_type || 'Unknown',
          rooms: tx.rooms || 'Unknown',
          areaSqft: tx.procedure_area_sqft || 0,
          price: tx.actual_worth || 0,
          priceSqft: tx.sqft_sale_price || 0,
        })),
      };
    },
    enabled: !!areaName,
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

// Fetch all area market data for comparison
export function useAllAreaMarketData() {
  return useQuery({
    queryKey: ['all-area-market-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('area_market_data')
        .select('area_name, avg_price_sqft, avg_yield, price_trend_percent, total_transactions_ytd, updated_at')
        .order('total_transactions_ytd', { ascending: false, nullsFirst: false });

      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 15,
  });
}
