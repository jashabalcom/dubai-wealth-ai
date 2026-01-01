import { StatCard, StatGrid } from "@/components/ui/data-display";
import { 
  TrendingUp, 
  Building2, 
  Home, 
  Wallet, 
  MapPin, 
  Percent,
  Users,
  BarChart3,
  LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface KeyMetric {
  label: string;
  value: string;
  change?: string;
}

interface MetricsDashboardProps {
  keyMetrics?: KeyMetric[];
  transactionVolume?: number;
  avgPriceSqft?: number;
  className?: string;
}

interface DisplayMetric {
  label: string;
  value: string;
  change?: string | number;
  icon: LucideIcon;
}

export function MetricsDashboard({ 
  keyMetrics = [],
  transactionVolume,
  avgPriceSqft,
  className 
}: MetricsDashboardProps) {
  // Default metrics if not provided
  const defaultMetrics: DisplayMetric[] = [
    {
      label: "Transaction Volume",
      value: transactionVolume?.toLocaleString() || "847",
      change: 12.5,
      icon: BarChart3
    },
    {
      label: "Avg Price/sqft",
      value: avgPriceSqft ? `AED ${avgPriceSqft.toLocaleString()}` : "AED 1,450",
      change: 2.3,
      icon: TrendingUp
    },
    {
      label: "Off-Plan Sales",
      value: "62%",
      change: 8.4,
      icon: Building2
    },
    {
      label: "Ready Properties",
      value: "38%",
      change: -3.2,
      icon: Home
    },
    {
      label: "Top Area",
      value: "Dubai Marina",
      change: 15.2,
      icon: MapPin
    },
    {
      label: "Avg Rental Yield",
      value: "6.8%",
      change: 0.4,
      icon: Percent
    },
    {
      label: "Golden Visa Eligible",
      value: "34%",
      change: 5.1,
      icon: Users
    },
    {
      label: "Developer Index",
      value: "82/100",
      change: 3.7,
      icon: Wallet
    }
  ];

  // Use provided metrics or defaults
  const displayMetrics: DisplayMetric[] = keyMetrics.length > 0 
    ? keyMetrics.map((metric, idx) => ({
        ...metric,
        icon: defaultMetrics[idx]?.icon || BarChart3
      }))
    : defaultMetrics;

  return (
    <section className={cn("space-y-4", className)}>
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-2">
          <BarChart3 className="w-3.5 h-3.5" />
          Market Metrics
        </h3>
        <span className="text-[10px] text-muted-foreground font-mono">
          Updated today
        </span>
      </div>

      {/* Metrics Grid */}
      <StatGrid columns={4}>
        {displayMetrics.slice(0, 8).map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <StatCard
              key={index}
              label={metric.label}
              value={metric.value}
              change={metric.change}
              icon={<IconComponent className="w-4 h-4" />}
            />
          );
        })}
      </StatGrid>
    </section>
  );
}
