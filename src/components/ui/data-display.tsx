import * as React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

// ============ MARKET STAT ============
interface MarketStatProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  size?: "sm" | "default" | "lg";
  className?: string;
}

export function MarketStat({ 
  label, 
  value, 
  change, 
  changeLabel,
  size = "default",
  className 
}: MarketStatProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;
  
  const sizeClasses = {
    sm: { value: "text-lg font-semibold", label: "text-[10px]", change: "text-[10px]" },
    default: { value: "text-2xl sm:text-3xl font-semibold", label: "text-xs", change: "text-xs" },
    lg: { value: "text-3xl sm:text-4xl md:text-5xl font-bold", label: "text-sm", change: "text-sm" },
  };
  
  return (
    <div className={cn("space-y-1", className)}>
      <p className={cn(
        "uppercase tracking-[0.15em] text-muted-foreground font-sans",
        sizeClasses[size].label
      )}>
        {label}
      </p>
      <p className={cn(
        "font-serif text-foreground tabular-nums",
        sizeClasses[size].value
      )}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      {change !== undefined && (
        <div className={cn(
          "flex items-center gap-1 font-sans",
          sizeClasses[size].change,
          isPositive && "text-emerald-500",
          isNegative && "text-rose-500",
          !isPositive && !isNegative && "text-muted-foreground"
        )}>
          {isPositive && <TrendingUp className="w-3 h-3" />}
          {isNegative && <TrendingDown className="w-3 h-3" />}
          {!isPositive && !isNegative && <Minus className="w-3 h-3" />}
          <span>{isPositive ? "+" : ""}{change.toFixed(1)}%</span>
          {changeLabel && <span className="text-muted-foreground ml-1">{changeLabel}</span>}
        </div>
      )}
    </div>
  );
}

// ============ LIVE TICKER ============
interface TickerItem {
  label: string;
  value: string | number;
  change?: number;
}

interface LiveTickerProps {
  items: TickerItem[];
  className?: string;
}

export function LiveTicker({ items, className }: LiveTickerProps) {
  const renderTickerItems = () => (
    <>
      {items.map((item, i) => (
        <React.Fragment key={item.label}>
          {i > 0 && <div className="w-px h-5 bg-border flex-shrink-0" />}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <span className="text-sm text-muted-foreground whitespace-nowrap">{item.label}</span>
            <span className="text-base font-semibold text-foreground tabular-nums whitespace-nowrap">
              {typeof item.value === "number" ? item.value.toLocaleString() : item.value}
            </span>
            {item.change !== undefined && (
              <span className={cn(
                "text-sm font-medium tabular-nums flex items-center gap-0.5",
                item.change > 0 ? "text-emerald-500" : item.change < 0 ? "text-rose-500" : "text-muted-foreground"
              )}>
                {item.change > 0 ? <ArrowUpRight className="w-4 h-4" /> : item.change < 0 ? <ArrowDownRight className="w-4 h-4" /> : null}
                {item.change > 0 ? "+" : ""}{item.change.toFixed(1)}%
              </span>
            )}
          </div>
        </React.Fragment>
      ))}
      {/* Separator between loops */}
      <div className="w-px h-5 bg-primary/30 flex-shrink-0" />
    </>
  );

  return (
    <div className={cn(
      "relative flex items-center overflow-hidden py-4",
      "bg-secondary/50 backdrop-blur-sm border-y border-border/30",
      className
    )}>
      {/* Fade gradients for visual polish */}
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-secondary/90 to-transparent pointer-events-none z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-secondary/90 to-transparent pointer-events-none z-10" />
      
      {/* Live indicator - fixed position */}
      <div className="flex items-center gap-2 flex-shrink-0 pl-4 pr-4 z-20 bg-secondary/80 backdrop-blur-sm">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
        </span>
        <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Live</span>
      </div>
      
      {/* Animated ticker - duplicated for seamless loop */}
      <div 
        className="flex items-center gap-8 animate-ticker-scroll hover:[animation-play-state:paused]"
        style={{ willChange: 'transform' }}
      >
        {renderTickerItems()}
        {renderTickerItems()}
      </div>
    </div>
  );
}

// ============ DATA BADGE ============
const dataBadgeVariants = cva(
  "inline-flex items-center gap-1.5 font-sans text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-muted text-muted-foreground px-2.5 py-1 rounded-full",
        outline: "border border-border text-foreground px-2.5 py-1 rounded-full",
        success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full",
        warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-full",
        error: "bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2.5 py-1 rounded-full",
        gold: "bg-primary/10 text-primary px-2.5 py-1 rounded-full border border-primary/20",
        live: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full animate-pulse-soft",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface DataBadgeProps extends VariantProps<typeof dataBadgeVariants> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function DataBadge({ children, icon, variant, className }: DataBadgeProps) {
  return (
    <span className={cn(dataBadgeVariants({ variant }), className)}>
      {variant === "live" && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
        </span>
      )}
      {icon}
      {children}
    </span>
  );
}

// ============ PRICE DISPLAY ============
interface PriceDisplayProps {
  amount: number;
  currency?: string;
  locale?: string;
  size?: "sm" | "default" | "lg" | "xl";
  showCurrency?: boolean;
  className?: string;
}

export function PriceDisplay({
  amount,
  currency = "AED",
  locale = "en-AE",
  size = "default",
  showCurrency = true,
  className,
}: PriceDisplayProps) {
  const formatted = new Intl.NumberFormat(locale, {
    style: showCurrency ? "currency" : "decimal",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  const sizeClasses = {
    sm: "text-sm",
    default: "text-lg",
    lg: "text-2xl",
    xl: "text-3xl sm:text-4xl",
  };

  return (
    <span className={cn(
      "font-semibold tabular-nums tracking-tight",
      sizeClasses[size],
      className
    )}>
      {formatted}
    </span>
  );
}

// ============ PERCENTAGE CHANGE ============
interface PercentageChangeProps {
  value: number;
  showIcon?: boolean;
  size?: "sm" | "default" | "lg";
  className?: string;
}

export function PercentageChange({
  value,
  showIcon = true,
  size = "default",
  className,
}: PercentageChangeProps) {
  const isPositive = value > 0;
  const isNegative = value < 0;

  const sizeClasses = {
    sm: "text-xs",
    default: "text-sm",
    lg: "text-base",
  };

  const iconSize = {
    sm: "w-3 h-3",
    default: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <span className={cn(
      "inline-flex items-center gap-0.5 font-medium tabular-nums",
      sizeClasses[size],
      isPositive && "text-emerald-600 dark:text-emerald-400",
      isNegative && "text-rose-600 dark:text-rose-400",
      !isPositive && !isNegative && "text-muted-foreground",
      className
    )}>
      {showIcon && isPositive && <ArrowUpRight className={iconSize[size]} />}
      {showIcon && isNegative && <ArrowDownRight className={iconSize[size]} />}
      {isPositive ? "+" : ""}{value.toFixed(1)}%
    </span>
  );
}

// ============ STAT GRID ============
interface StatGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function StatGrid({ children, columns = 4, className }: StatGridProps) {
  const colClasses = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-4",
  };

  return (
    <div className={cn(
      "grid gap-4 md:gap-6",
      colClasses[columns],
      className
    )}>
      {children}
    </div>
  );
}

// ============ STAT CARD ============
interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({ label, value, change, changeLabel, icon, className }: StatCardProps) {
  return (
    <div className={cn(
      "p-4 sm:p-5 rounded-xl bg-card border border-border/50 min-h-[120px] sm:min-h-[140px]",
      "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300",
      className
    )}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs sm:text-sm uppercase tracking-[0.1em] text-muted-foreground font-medium leading-tight">
          {label}
        </p>
        {icon && (
          <div className="text-primary/60 flex-shrink-0">
            {icon}
          </div>
        )}
      </div>
      <p className="text-xl sm:text-2xl md:text-3xl font-serif font-semibold text-foreground tabular-nums leading-none">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      {change !== undefined && (
        <div className="flex items-center gap-2 mt-3">
          <PercentageChange value={change} size="sm" />
          {changeLabel && (
            <span className="text-xs text-muted-foreground">{changeLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}
