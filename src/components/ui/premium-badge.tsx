import * as React from "react";
import { cn } from "@/lib/utils";
import { Crown, Star, Shield, Sparkles, Gem, Award } from "lucide-react";
import { motion } from "framer-motion";

type BadgeVariant = "gold" | "elite" | "private" | "verified" | "featured" | "new";
type BadgeSize = "sm" | "md" | "lg";

interface PremiumBadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  animated?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const iconMap: Record<BadgeVariant, React.ComponentType<{ className?: string }>> = {
  gold: Crown,
  elite: Gem,
  private: Shield,
  verified: Shield,
  featured: Star,
  new: Sparkles,
};

const variantStyles: Record<BadgeVariant, string> = {
  gold: "bg-gradient-to-r from-primary via-gold-light to-primary text-secondary border-primary/30",
  elite: "bg-gradient-to-r from-violet-500 via-purple-500 to-violet-500 text-white border-violet-400/30",
  private: "bg-gradient-to-r from-secondary via-navy-light to-secondary text-secondary-foreground border-primary/30",
  verified: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  featured: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
  new: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "text-xs px-2 py-0.5 gap-1",
  md: "text-sm px-3 py-1 gap-1.5",
  lg: "text-base px-4 py-1.5 gap-2",
};

const iconSizes: Record<BadgeSize, string> = {
  sm: "w-3 h-3",
  md: "w-4 h-4",
  lg: "w-5 h-5",
};

export function PremiumBadge({
  variant = "gold",
  size = "md",
  animated = true,
  className,
  children,
}: PremiumBadgeProps) {
  const Icon = iconMap[variant];
  
  const content = (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border",
        "uppercase tracking-wider font-sans",
        variantStyles[variant],
        sizeStyles[size],
        animated && (variant === "gold" || variant === "elite") && "shimmer-badge",
        className
      )}
    >
      <Icon className={iconSizes[size]} />
      {children}
    </span>
  );

  if (animated && (variant === "gold" || variant === "elite")) {
    return (
      <motion.span
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {content}
      </motion.span>
    );
  }

  return content;
}

// Tier-specific badges
export function InvestorBadge({ size = "md", className }: { size?: BadgeSize; className?: string }) {
  return (
    <PremiumBadge variant="gold" size={size} className={className}>
      Investor
    </PremiumBadge>
  );
}

export function EliteBadge({ size = "md", className }: { size?: BadgeSize; className?: string }) {
  return (
    <PremiumBadge variant="elite" size={size} className={className}>
      Elite
    </PremiumBadge>
  );
}

export function PrivateBadge({ size = "md", className }: { size?: BadgeSize; className?: string }) {
  return (
    <PremiumBadge variant="private" size={size} className={className}>
      Private
    </PremiumBadge>
  );
}

export function VerifiedBadge({ size = "md", className }: { size?: BadgeSize; className?: string }) {
  return (
    <PremiumBadge variant="verified" size={size} className={className}>
      Verified
    </PremiumBadge>
  );
}

export function FeaturedBadge({ size = "md", className }: { size?: BadgeSize; className?: string }) {
  return (
    <PremiumBadge variant="featured" size={size} className={className}>
      Featured
    </PremiumBadge>
  );
}

export function NewBadge({ size = "md", className }: { size?: BadgeSize; className?: string }) {
  return (
    <PremiumBadge variant="new" size={size} className={className}>
      New
    </PremiumBadge>
  );
}
