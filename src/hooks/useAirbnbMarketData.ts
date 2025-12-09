import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AirbnbMarketData {
  id: string;
  area_name: string;
  property_type: string;
  bedrooms: number;
  avg_daily_rate: number | null;
  peak_daily_rate: number | null;
  low_daily_rate: number | null;
  avg_occupancy: number | null;
  peak_occupancy: number | null;
  low_occupancy: number | null;
  avg_annual_revenue: number | null;
  revenue_percentile_25: number | null;
  revenue_percentile_75: number | null;
  active_listings_count: number | null;
  data_date: string;
}

interface UseAirbnbMarketDataParams {
  areaName?: string;
  bedrooms?: number;
  propertyType?: string;
}

export function useAirbnbMarketData(params: UseAirbnbMarketDataParams = {}) {
  const { areaName, bedrooms, propertyType = 'apartment' } = params;

  return useQuery({
    queryKey: ['airbnb-market-data', areaName, bedrooms, propertyType],
    queryFn: async (): Promise<AirbnbMarketData | null> => {
      let query = supabase
        .from('airbnb_market_data')
        .select('*')
        .order('data_date', { ascending: false })
        .limit(1);

      if (areaName) {
        query = query.eq('area_name', areaName);
      }
      if (bedrooms !== undefined) {
        query = query.eq('bedrooms', bedrooms);
      }
      if (propertyType) {
        query = query.eq('property_type', propertyType);
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        console.error('Error fetching Airbnb market data:', error);
        return null;
      }

      return data;
    },
    staleTime: 1000 * 60 * 60, // 1 hour cache
    enabled: !!areaName, // Only fetch if area is specified
  });
}

export function useAirbnbMarketDataList(areaName?: string) {
  return useQuery({
    queryKey: ['airbnb-market-data-list', areaName],
    queryFn: async (): Promise<AirbnbMarketData[]> => {
      let query = supabase
        .from('airbnb_market_data')
        .select('*')
        .order('data_date', { ascending: false });

      if (areaName) {
        query = query.eq('area_name', areaName);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching Airbnb market data list:', error);
        return [];
      }

      return data || [];
    },
    staleTime: 1000 * 60 * 60, // 1 hour cache
  });
}

export function useHasAirbnbMarketData() {
  return useQuery({
    queryKey: ['airbnb-market-data-exists'],
    queryFn: async (): Promise<boolean> => {
      const { count, error } = await supabase
        .from('airbnb_market_data')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('Error checking Airbnb market data:', error);
        return false;
      }

      return (count || 0) > 0;
    },
    staleTime: 1000 * 60 * 5, // 5 minute cache
  });
}
