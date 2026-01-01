import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, useInView, useSpring, useTransform } from "framer-motion";

interface StatCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
  valueClassName?: string;
  labelClassName?: string;
  label?: string;
  size?: "sm" | "md" | "lg" | "xl";
  glow?: boolean;
}

const sizeStyles = {
  sm: "text-lg",
  md: "text-2xl sm:text-3xl",
  lg: "text-3xl sm:text-4xl md:text-5xl",
  xl: "text-4xl sm:text-5xl md:text-6xl",
};

const labelSizes = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
  xl: "text-lg",
};

export function StatCounter({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 2,
  className,
  valueClassName,
  labelClassName,
  label,
  size = "lg",
  glow = false,
}: StatCounterProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  const spring = useSpring(0, {
    stiffness: 50,
    damping: 30,
    duration: duration * 1000,
  });

  const display = useTransform(spring, (current) => {
    return `${prefix}${current.toFixed(decimals)}${suffix}`;
  });

  React.useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [isInView, spring, value]);

  return (
    <div ref={ref} className={cn("flex flex-col", className)}>
      <motion.span
        className={cn(
          "font-serif font-bold tracking-tight text-foreground",
          sizeStyles[size],
          glow && "stat-glow",
          valueClassName
        )}
      >
        {display}
      </motion.span>
      {label && (
        <span
          className={cn(
            "text-muted-foreground font-sans uppercase tracking-wider mt-1",
            labelSizes[size],
            labelClassName
          )}
        >
          {label}
        </span>
      )}
    </div>
  );
}

// Compact stat for cards
interface CompactStatProps {
  value: string | number;
  label: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
}

export function CompactStat({ value, label, trend, trendValue, className }: CompactStatProps) {
  const trendColors = {
    up: "text-emerald-500",
    down: "text-red-500",
    neutral: "text-muted-foreground",
  };

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-serif font-bold text-foreground">{value}</span>
        {trend && trendValue && (
          <span className={cn("text-sm font-medium", trendColors[trend])}>
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trendValue}
          </span>
        )}
      </div>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}

// Stats grid component
interface StatsGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function StatsGrid({ children, columns = 4, className }: StatsGridProps) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-6", gridCols[columns], className)}>
      {children}
    </div>
  );
}
