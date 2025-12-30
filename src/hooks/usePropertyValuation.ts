import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ValuationData {
  estimatedValue: number;
  confidenceScore: number;
  source: 'live' | 'estimated' | 'stale' | 'user';
  lastUpdated: Date;
}

export function usePropertyValuation(
  locationArea: string, 
  propertyType: string, 
  sizeSqft?: number
): ValuationData | null {
  const { data } = useQuery({
    queryKey: ['property-valuation', locationArea, propertyType, sizeSqft],
    queryFn: async () => {
      // Try to get market data for the area
      const { data: marketData } = await supabase
        .from('area_market_stats')
        .select('avg_price_sqm, median_price_sqm, updated_at')
        .eq('area_name', locationArea)
        .order('period_end', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (marketData && sizeSqft) {
        const sqmToSqft = 10.764;
        const avgPricePerSqft = (marketData.avg_price_sqm || 0) / sqmToSqft;
        const estimatedValue = avgPricePerSqft * sizeSqft;
        
        const updatedAt = new Date(marketData.updated_at);
        const daysSinceUpdate = (Date.now() - updatedAt.getTime()) / (1000 * 60 * 60 * 24);
        
        let source: ValuationData['source'] = 'live';
        let confidenceScore = 85;
        
        if (daysSinceUpdate > 30) {
          source = 'stale';
          confidenceScore = 50;
        } else if (daysSinceUpdate > 7) {
          source = 'estimated';
          confidenceScore = 70;
        }

        return {
          estimatedValue,
          confidenceScore,
          source,
          lastUpdated: updatedAt,
        };
      }

      return null;
    },
    enabled: !!locationArea && !!propertyType,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  return data || null;
}
