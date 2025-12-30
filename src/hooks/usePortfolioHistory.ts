import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface HistoricalValue {
  date: string;
  totalValue: number;
  totalEquity: number;
}

export function usePortfolioHistory(portfolioId?: string) {
  const { user } = useAuth();

  const { data: history = [], isLoading } = useQuery({
    queryKey: ['portfolio-history', portfolioId],
    queryFn: async () => {
      if (!portfolioId) return [];

      // Get all valuations for properties in this portfolio
      const { data: valuations, error } = await supabase
        .from('portfolio_property_valuations')
        .select(`
          valuation_date,
          estimated_value,
          property_id
        `)
        .order('valuation_date', { ascending: true });

      if (error || !valuations) return [];

      // Group by date and sum values
      const byDate = valuations.reduce((acc, v) => {
        const date = v.valuation_date;
        if (!acc[date]) {
          acc[date] = { value: 0, properties: new Set() };
        }
        acc[date].value += Number(v.estimated_value);
        acc[date].properties.add(v.property_id);
        return acc;
      }, {} as Record<string, { value: number; properties: Set<string> }>);

      return Object.entries(byDate)
        .map(([date, data]) => ({
          date,
          totalValue: data.value,
          totalEquity: data.value * 0.7, // Simplified - would need mortgage data
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    },
    enabled: !!portfolioId && !!user,
  });

  const { data: propertyValueHistory } = useQuery({
    queryKey: ['property-value-history', portfolioId],
    queryFn: async () => {
      if (!portfolioId) return {};

      const { data: valuations } = await supabase
        .from('portfolio_property_valuations')
        .select('property_id, estimated_value, valuation_date')
        .order('valuation_date', { ascending: true });

      if (!valuations) return {};

      // Group by property
      const byProperty: Record<string, number[]> = {};
      valuations.forEach(v => {
        if (!byProperty[v.property_id]) {
          byProperty[v.property_id] = [];
        }
        byProperty[v.property_id].push(Number(v.estimated_value));
      });

      return byProperty;
    },
    enabled: !!portfolioId && !!user,
  });

  return {
    history,
    propertyValueHistory: propertyValueHistory || {},
    isLoading,
  };
}
