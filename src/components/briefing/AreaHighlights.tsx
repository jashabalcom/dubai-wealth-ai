import { MapPin, TrendingUp, TrendingDown, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { PercentageChange } from "@/components/ui/data-display";
import { Link } from "react-router-dom";

interface AreaHighlight {
  area: string;
  change?: number;
  avgPrice?: number;
  metric?: string;
}

interface AreaHighlightsProps {
  areaHighlights?: AreaHighlight[];
  className?: string;
}

const rankBadgeStyles = [
  "bg-gradient-to-br from-amber-400 to-amber-600 text-amber-950", // 1st - Gold
  "bg-gradient-to-br from-slate-300 to-slate-500 text-slate-900", // 2nd - Silver
  "bg-gradient-to-br from-orange-400 to-orange-600 text-orange-950", // 3rd - Bronze
  "bg-muted text-muted-foreground", // 4th
  "bg-muted text-muted-foreground", // 5th
];

export function AreaHighlights({ 
  areaHighlights = [],
  className 
}: AreaHighlightsProps) {
  // Default area data if not provided
  const defaultAreas: AreaHighlight[] = [
    { area: "Dubai Marina", change: 15.2, avgPrice: 1850 },
    { area: "Downtown Dubai", change: 12.8, avgPrice: 2400 },
    { area: "Palm Jumeirah", change: 10.5, avgPrice: 3200 },
    { area: "Business Bay", change: 8.3, avgPrice: 1650 },
    { area: "JVC", change: 18.7, avgPrice: 950 },
  ];

  const areas = areaHighlights.length > 0 ? areaHighlights : defaultAreas;

  return (
    <section className={cn("space-y-4", className)}>
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5" />
          Top Performing Areas
        </h3>
        <Link 
          to="/areas" 
          className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
        >
          View All
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {/* Area Cards */}
      <div className="grid gap-3">
        {areas.slice(0, 5).map((area, index) => (
          <Link
            key={area.area}
            to={`/areas/${area.area.toLowerCase().replace(/\s+/g, '-')}`}
            className="group flex items-center gap-4 p-4 rounded-lg border border-border/50 bg-card/50 hover:bg-muted/30 hover:border-border transition-all duration-200"
          >
            {/* Rank Badge */}
            <div className={cn(
              "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
              rankBadgeStyles[index] || rankBadgeStyles[4]
            )}>
              {index + 1}
            </div>

            {/* Area Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                {area.area}
              </h4>
              {area.avgPrice && (
                <p className="text-xs text-muted-foreground font-mono">
                  Avg: AED {area.avgPrice.toLocaleString()}/sqft
                </p>
              )}
            </div>

            {/* Performance Bar & Change */}
            <div className="flex items-center gap-4">
              {/* Mini Bar Visualization */}
              <div className="hidden sm:block w-24">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      (area.change || 0) >= 0 ? "bg-emerald-500" : "bg-rose-500"
                    )}
                    style={{ 
                      width: `${Math.min(Math.abs(area.change || 0) * 5, 100)}%` 
                    }}
                  />
                </div>
              </div>

              {/* Change Percentage */}
              <PercentageChange 
                value={area.change || 0} 
                showIcon 
                size="default"
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
