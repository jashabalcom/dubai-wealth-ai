import { useQuery } from '@tanstack/react-query';
import { TrendingUp, TrendingDown, Minus, MapPin, Building2, BarChart3, Home } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AREA_BENCHMARKS, DEFAULT_BENCHMARK } from '@/lib/investmentScore';
import { cn } from '@/lib/utils';

interface NeighborhoodWidgetProps {
  areaName: string;
  propertyPricePerSqft: number;
  propertyYield?: number;
  propertyType?: string;
}

interface AreaMarketStats {
  area_name: string;
  avg_price_sqft: number | null;
  avg_price_sqm: number | null;
  total_transactions: number | null;
  yoy_price_change: number | null;
  qoq_price_change: number | null;
  mom_price_change: number | null;
  apartment_count: number | null;
  villa_count: number | null;
  townhouse_count: number | null;
}

interface CommunityStats {
  name: string;
  avg_price_per_sqft: number | null;
  avg_rental_yield: number | null;
  total_properties: number | null;
}

export function NeighborhoodWidget({ 
  areaName, 
  propertyPricePerSqft, 
  propertyYield,
  propertyType 
}: NeighborhoodWidgetProps) {
  // Fetch area market stats
  const { data: marketStats } = useQuery({
    queryKey: ['area-market-stats', areaName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('area_market_stats')
        .select('*')
        .ilike('area_name', `%${areaName}%`)
        .order('period_end', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error || !data) return null;
      return data as AreaMarketStats;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  // Fetch community stats
  const { data: communityStats } = useQuery({
    queryKey: ['community-stats', areaName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('communities')
        .select('name, avg_price_per_sqft, avg_rental_yield, total_properties')
        .ilike('name', `%${areaName}%`)
        .limit(1)
        .maybeSingle();
      
      if (error || !data) return null;
      return data as CommunityStats;
    },
    staleTime: 1000 * 60 * 30,
  });

  // Count properties in same area
  const { data: areaPropertyCount } = useQuery({
    queryKey: ['area-property-count', areaName],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .ilike('location_area', `%${areaName}%`)
        .eq('status', 'available');
      
      if (error) return 0;
      return count || 0;
    },
    staleTime: 1000 * 60 * 15,
  });

  // Get benchmark data (fallback to hardcoded if no DB data)
  const benchmark = AREA_BENCHMARKS[areaName] || DEFAULT_BENCHMARK;
  const areaAvgPriceSqft = marketStats?.avg_price_sqft || communityStats?.avg_price_per_sqft || benchmark.avgPriceSqft;
  const areaAvgYield = communityStats?.avg_rental_yield || benchmark.avgYield;

  // Calculate comparisons
  const priceDiff = ((propertyPricePerSqft - areaAvgPriceSqft) / areaAvgPriceSqft) * 100;
  const yieldDiff = propertyYield ? ((propertyYield - areaAvgYield) / areaAvgYield) * 100 : null;
  
  const priceChange = marketStats?.yoy_price_change || marketStats?.qoq_price_change || 0;

  const getTrendIcon = (value: number) => {
    if (value > 1) return <TrendingUp className="w-4 h-4" />;
    if (value < -1) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = (value: number, inverse: boolean = false) => {
    const isPositive = inverse ? value < 0 : value > 0;
    if (Math.abs(value) < 1) return 'text-muted-foreground';
    return isPositive ? 'text-emerald-500' : 'text-red-500';
  };

  return (
    <div className="p-6 rounded-xl bg-card border border-border">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-gold/10">
          <MapPin className="w-5 h-5 text-gold" />
        </div>
        <div>
          <h3 className="font-heading text-lg text-foreground">Neighborhood Insights</h3>
          <p className="text-sm text-muted-foreground">{areaName} Market Context</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Price Comparison */}
        <div className="p-4 rounded-lg bg-muted/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Price vs. Area Average</span>
            <span className={cn(
              "flex items-center gap-1 text-sm font-medium",
              getTrendColor(priceDiff, true)
            )}>
              {getTrendIcon(priceDiff)}
              {Math.abs(priceDiff).toFixed(1)}% {priceDiff > 0 ? 'above' : 'below'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <div>
              <p className="text-muted-foreground">This Property</p>
              <p className="font-medium text-foreground">AED {propertyPricePerSqft.toLocaleString()}/sqft</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground">Area Average</p>
              <p className="font-medium text-foreground">AED {Math.round(areaAvgPriceSqft).toLocaleString()}/sqft</p>
            </div>
          </div>
        </div>

        {/* Yield Comparison */}
        {propertyYield && yieldDiff !== null && (
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Yield vs. Area Average</span>
              <span className={cn(
                "flex items-center gap-1 text-sm font-medium",
                getTrendColor(yieldDiff)
              )}>
                {getTrendIcon(yieldDiff)}
                {Math.abs(yieldDiff).toFixed(1)}% {yieldDiff > 0 ? 'higher' : 'lower'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <div>
                <p className="text-muted-foreground">This Property</p>
                <p className="font-medium text-foreground">{propertyYield.toFixed(1)}% yield</p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground">Area Average</p>
                <p className="font-medium text-foreground">{areaAvgYield.toFixed(1)}% yield</p>
              </div>
            </div>
          </div>
        )}

        {/* Market Trend */}
        {priceChange !== 0 && (
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Price Trend (YoY)</span>
            </div>
            <span className={cn(
              "flex items-center gap-1 text-sm font-medium",
              getTrendColor(priceChange)
            )}>
              {getTrendIcon(priceChange)}
              {priceChange > 0 ? '+' : ''}{priceChange.toFixed(1)}%
            </span>
          </div>
        )}

        {/* Area Stats Grid */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-3 rounded-lg bg-muted/30 text-center">
            <Home className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-lg font-medium text-foreground">{areaPropertyCount || 0}</p>
            <p className="text-xs text-muted-foreground">Available Listings</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30 text-center">
            <Building2 className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-lg font-medium text-foreground">
              {marketStats?.total_transactions || communityStats?.total_properties || '—'}
            </p>
            <p className="text-xs text-muted-foreground">
              {marketStats?.total_transactions ? 'Recent Sales' : 'Total Properties'}
            </p>
          </div>
        </div>

        {/* Value Indicator */}
        <div className={cn(
          "p-3 rounded-lg text-center text-sm font-medium",
          priceDiff < -5 
            ? "bg-emerald-500/10 text-emerald-500" 
            : priceDiff > 10 
              ? "bg-amber-500/10 text-amber-500"
              : "bg-muted text-muted-foreground"
        )}>
          {priceDiff < -5 
            ? "✓ Priced below area average — potential value buy"
            : priceDiff > 10
              ? "⚠ Premium pricing above area average"
              : "→ Priced in line with market"
          }
        </div>
      </div>
    </div>
  );
}
