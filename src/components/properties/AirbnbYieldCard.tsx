import { Link } from 'react-router-dom';
import { Home, TrendingUp, Calendar, Users, Trophy, ArrowRight } from 'lucide-react';
import { useAirbnbMarketData } from '@/hooks/useAirbnbMarketData';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface AirbnbYieldCardProps {
  propertyPrice: number;
  areaName: string;
  bedrooms: number;
  propertyType: string;
  ltrYield: number;
}

export function AirbnbYieldCard({
  propertyPrice,
  areaName,
  bedrooms,
  propertyType,
  ltrYield,
}: AirbnbYieldCardProps) {
  const { data: marketData, isLoading } = useAirbnbMarketData({
    areaName,
    bedrooms,
    propertyType: propertyType.toLowerCase(),
  });

  if (isLoading) {
    return (
      <div className="p-6 rounded-xl bg-card border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="w-5 h-5 rounded" />
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  // Calculate STR metrics from market data
  const avgDailyRate = marketData?.avg_daily_rate || 0;
  const avgOccupancy = marketData?.avg_occupancy || 0;
  const estimatedMonthlySTR = Math.round(avgDailyRate * (avgOccupancy / 100) * 30);
  const estimatedAnnualSTR = marketData?.avg_annual_revenue || estimatedMonthlySTR * 12;
  const strYield = propertyPrice > 0 ? (estimatedAnnualSTR / propertyPrice) * 100 : 0;
  const activeListings = marketData?.active_listings_count || 0;

  // Determine winner
  const strWins = strYield > ltrYield;
  const yieldDifference = Math.abs(strYield - ltrYield).toFixed(1);

  // Build pre-filled calculator URL
  const calculatorUrl = `/tools/str-vs-ltr?price=${propertyPrice}&bedrooms=${bedrooms}&area=${encodeURIComponent(areaName)}`;

  // If no market data available, show coming soon state
  if (!marketData) {
    return (
      <div className="p-6 rounded-xl bg-card border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Home className="w-5 h-5 text-violet-400" />
          <h3 className="font-heading text-lg text-foreground">Short-Term Rental Potential</h3>
        </div>
        <div className="p-4 rounded-lg bg-violet-500/10 border border-violet-500/20 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            STR market data for {areaName} coming soon
          </p>
          <Link 
            to={calculatorUrl}
            className="inline-flex items-center gap-1 text-sm text-violet-400 hover:text-violet-300 transition-colors"
          >
            Compare STR vs LTR manually
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-xl bg-card border border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Home className="w-5 h-5 text-violet-400" />
          <h3 className="font-heading text-lg text-foreground">Short-Term Rental Potential</h3>
        </div>
      </div>

      <div className="space-y-3">
        {/* STR Yield - Primary metric with winner indication */}
        <div className={cn(
          "p-4 rounded-lg border",
          strWins 
            ? "bg-violet-500/10 border-violet-500/20" 
            : "bg-muted/50 border-border"
        )}>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-4 h-4" /> Potential STR Yield
            </span>
            <div className="flex items-center gap-2">
              <span className={cn(
                "font-heading text-xl",
                strWins ? "text-violet-400" : "text-foreground"
              )}>
                {strYield.toFixed(1)}%
              </span>
              {strWins && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-violet-500/20 text-violet-300 text-xs rounded-full">
                  <Trophy className="w-3 h-3" /> +{yieldDifference}%
                </span>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            vs LTR: {ltrYield.toFixed(1)}%
            {!strWins && ` (LTR +${yieldDifference}% higher)`}
          </p>
        </div>

        {/* Nightly Rate */}
        <div className="p-4 rounded-lg bg-muted/50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Avg Nightly Rate</span>
            <span className="font-heading text-lg text-foreground">
              AED {avgDailyRate.toLocaleString()}
            </span>
          </div>
          {marketData.peak_daily_rate && marketData.low_daily_rate && (
            <p className="text-xs text-muted-foreground mt-1">
              Range: AED {marketData.low_daily_rate.toLocaleString()} - {marketData.peak_daily_rate.toLocaleString()}
            </p>
          )}
        </div>

        {/* Occupancy */}
        <div className="p-4 rounded-lg bg-muted/50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="w-4 h-4" /> Est. Occupancy
            </span>
            <span className="font-heading text-lg text-foreground">
              {avgOccupancy.toFixed(0)}%
            </span>
          </div>
          {marketData.peak_occupancy && marketData.low_occupancy && (
            <p className="text-xs text-muted-foreground mt-1">
              Peak: {marketData.peak_occupancy}% | Low: {marketData.low_occupancy}%
            </p>
          )}
        </div>

        {/* Monthly Income */}
        <div className="p-4 rounded-lg bg-muted/50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Est. Monthly Income</span>
            <span className="font-heading text-lg text-foreground">
              AED {estimatedMonthlySTR.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Annual Revenue */}
        <div className="p-4 rounded-lg bg-muted/50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Est. Annual Revenue</span>
            <span className="font-heading text-lg text-foreground">
              AED {estimatedAnnualSTR.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Active Listings */}
        {activeListings > 0 && (
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Users className="w-4 h-4" /> Active Listings
              </span>
              <span className="font-heading text-lg text-foreground">
                {activeListings} in area
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Compare Link */}
      <Link 
        to={calculatorUrl}
        className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-violet-500/30 text-violet-400 hover:bg-violet-500/10 transition-colors text-sm"
      >
        Compare STR vs LTR in Detail
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
