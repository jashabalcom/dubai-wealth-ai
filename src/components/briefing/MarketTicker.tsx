import { LiveTicker } from "@/components/ui/data-display";
import { cn } from "@/lib/utils";

interface MarketTickerProps {
  transactionVolume?: number;
  avgPriceSqft?: number;
  sentiment?: string;
  className?: string;
}

export function MarketTicker({ 
  transactionVolume,
  avgPriceSqft,
  sentiment,
  className 
}: MarketTickerProps) {
  // Default market data - in production this would come from real-time data
  const tickerItems = [
    { 
      label: "DXB Property Index", 
      value: "2,847.32", 
      change: 1.24 
    },
    { 
      label: "Avg Price/sqft", 
      value: avgPriceSqft ? `AED ${avgPriceSqft.toLocaleString()}` : "AED 1,450", 
      change: 2.3 
    },
    { 
      label: "24h Volume", 
      value: transactionVolume ? transactionVolume.toLocaleString() : "847", 
      change: 5.7 
    },
    { 
      label: "Golden Visa Threshold", 
      value: "AED 2M", 
      change: 0 
    },
    { 
      label: "Avg Rental Yield", 
      value: "6.8%", 
      change: 0.4 
    },
    { 
      label: "Sentiment Score", 
      value: sentiment === 'bullish' ? "78/100" : 
             sentiment === 'bearish' ? "35/100" : 
             sentiment === 'mixed' ? "52/100" : "65/100", 
      change: sentiment === 'bullish' ? 8 : 
              sentiment === 'bearish' ? -12 : 
              sentiment === 'mixed' ? -2 : 3
    },
    { 
      label: "Off-Plan Launches", 
      value: "23 This Week", 
      change: 15 
    },
    { 
      label: "Mortgage Rate", 
      value: "4.99%", 
      change: -0.25 
    },
  ];

  return (
    <div className={cn("w-full", className)}>
      <LiveTicker items={tickerItems} />
    </div>
  );
}
