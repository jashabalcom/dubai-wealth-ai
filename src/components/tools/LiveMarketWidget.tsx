import { TrendingUp, TrendingDown, BarChart3, Building2, Calendar, ExternalLink, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLiveMarketData, LiveMarketDataWithTransactions } from '@/hooks/useLiveMarketData';
import { DLDAttribution } from '@/components/ui/data-attribution';
import { formatDistanceToNow } from 'date-fns';

interface LiveMarketWidgetProps {
  areaName: string;
  currentPriceSqft?: number;
  currentYield?: number;
  className?: string;
  showComparison?: boolean;
}

function formatAED(amount: number): string {
  if (amount >= 1000000) {
    return `AED ${(amount / 1000000).toFixed(2)}M`;
  }
  return `AED ${amount.toLocaleString()}`;
}

export function LiveMarketWidget({ 
  areaName, 
  currentPriceSqft,
  currentYield,
  className = '',
  showComparison = true
}: LiveMarketWidgetProps) {
  const { data: liveData, isLoading, error } = useLiveMarketData(areaName);

  if (isLoading) {
    return (
      <div className={`p-4 rounded-xl bg-card border border-border ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }

  if (error || !liveData) {
    return null; // Silently fail if no data
  }

  const hasPriceComparison = showComparison && currentPriceSqft && liveData.avgPriceSqft;
  const hasYieldComparison = showComparison && currentYield && liveData.avgYield;
  
  const priceDiff = hasPriceComparison 
    ? ((currentPriceSqft - liveData.avgPriceSqft!) / liveData.avgPriceSqft!) * 100 
    : null;
  const yieldDiff = hasYieldComparison 
    ? currentYield - liveData.avgYield! 
    : null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-xl bg-gradient-to-br from-primary/5 via-primary/2 to-transparent border border-primary/20 ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            Live Market: {liveData.areaName}
          </span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-3 h-3 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  Real-time market data from DLD transactions
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Badge variant="outline" className="text-xs gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Average Price/sqft */}
        {liveData.avgPriceSqft && (
          <div className="p-3 rounded-lg bg-card/50">
            <p className="text-xs text-muted-foreground mb-1">Avg Price/sqft</p>
            <p className="text-lg font-semibold text-foreground">
              AED {liveData.avgPriceSqft.toLocaleString()}
            </p>
            {priceDiff !== null && (
              <div className={`flex items-center gap-1 text-xs ${priceDiff > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                {priceDiff > 0 ? (
                  <>
                    <TrendingUp className="w-3 h-3" />
                    <span>Your price {Math.abs(priceDiff).toFixed(1)}% above market</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-3 h-3" />
                    <span>Your price {Math.abs(priceDiff).toFixed(1)}% below market</span>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Average Yield */}
        {liveData.avgYield && (
          <div className="p-3 rounded-lg bg-card/50">
            <p className="text-xs text-muted-foreground mb-1">Avg Rental Yield</p>
            <p className="text-lg font-semibold text-foreground">
              {liveData.avgYield.toFixed(1)}%
            </p>
            {yieldDiff !== null && (
              <div className={`flex items-center gap-1 text-xs ${yieldDiff > 0 ? 'text-emerald-500' : 'text-amber-500'}`}>
                {yieldDiff > 0 ? (
                  <>
                    <TrendingUp className="w-3 h-3" />
                    <span>+{yieldDiff.toFixed(1)}% above area avg</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-3 h-3" />
                    <span>{yieldDiff.toFixed(1)}% below area avg</span>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Price Trend & Transactions */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
        {liveData.priceTrend !== null && (
          <div className="flex items-center gap-1">
            {liveData.priceTrend >= 0 ? (
              <TrendingUp className="w-3 h-3 text-emerald-500" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-500" />
            )}
            <span>
              {liveData.priceTrend >= 0 ? '+' : ''}{liveData.priceTrend.toFixed(1)}% YoY
            </span>
          </div>
        )}
        {liveData.transactionsYtd && (
          <div className="flex items-center gap-1">
            <Building2 className="w-3 h-3" />
            <span>{liveData.transactionsYtd.toLocaleString()} sales YTD</span>
          </div>
        )}
        {liveData.serviceChargeSqft && (
          <div className="flex items-center gap-1">
            <span>Service: AED {liveData.serviceChargeSqft}/sqft</span>
          </div>
        )}
      </div>

      {/* Recent Transactions (if available) */}
      <AnimatePresence>
        {liveData.recentTransactions.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border/50 pt-3"
          >
            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Recent Comparable Sales
            </p>
            <div className="space-y-1.5">
              {liveData.recentTransactions.slice(0, 3).map((tx, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {tx.rooms} {tx.propertyType} • {tx.areaSqft.toLocaleString()} sqft
                  </span>
                  <span className="font-medium text-foreground">
                    {formatAED(tx.price)}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Data Attribution */}
      <div className="mt-3 pt-2 border-t border-border/30">
        <DLDAttribution 
          variant="compact" 
          dataAsOf={liveData.lastUpdated} 
        />
      </div>
    </motion.div>
  );
}
