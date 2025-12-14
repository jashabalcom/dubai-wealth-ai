import { cn } from '@/lib/utils';
import { Building2, Crown, Sparkles, TrendingUp } from 'lucide-react';

interface TierBadgeProps {
  tier: string | null;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const tierConfig: Record<string, { label: string; icon: typeof Building2; className: string }> = {
  government: {
    label: 'Government-Linked',
    icon: Building2,
    className: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  premium: {
    label: 'Premium',
    icon: Crown,
    className: 'bg-gold/10 text-gold border-gold/20',
  },
  boutique: {
    label: 'Boutique',
    icon: Sparkles,
    className: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
  emerging: {
    label: 'Emerging',
    icon: TrendingUp,
    className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  standard: {
    label: 'Developer',
    icon: Building2,
    className: 'bg-muted text-muted-foreground border-border',
  },
};

export function TierBadge({ tier, size = 'md', showIcon = true }: TierBadgeProps) {
  const config = tierConfig[tier || 'standard'] || tierConfig.standard;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border uppercase tracking-wide',
        sizeClasses[size],
        config.className
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {config.label}
    </span>
  );
}
