import { Wifi, WifiOff, Clock, User, Shield, CheckCircle2, Building2, TrendingUp } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export type DataSource = 'live' | 'estimated' | 'stale' | 'user' | 'official' | 'verified' | 'industry';

interface DataConfidenceBadgeProps {
  source: DataSource;
  lastUpdated?: Date;
  sourceName?: string;
  sourceUrl?: string;
  className?: string;
}

const sourceConfig = {
  official: {
    icon: Shield,
    label: 'Official',
    description: 'Verified from government or regulatory sources',
    color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
  },
  verified: {
    icon: CheckCircle2,
    label: 'Verified',
    description: 'Cross-referenced from multiple reliable sources',
    color: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
  },
  industry: {
    icon: Building2,
    label: 'Industry',
    description: 'Based on industry standards and practices',
    color: 'bg-violet-500/10 text-violet-500 border-violet-500/30',
  },
  live: {
    icon: Wifi,
    label: 'Live',
    description: 'Data synced from market sources',
    color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
  },
  estimated: {
    icon: TrendingUp,
    label: 'Estimated',
    description: 'Values estimated from market trends',
    color: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
  },
  stale: {
    icon: WifiOff,
    label: 'Stale',
    description: 'Data may be outdated - verification needed',
    color: 'bg-red-500/10 text-red-500 border-red-500/30',
  },
  user: {
    icon: User,
    label: 'Manual',
    description: 'User-provided values',
    color: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
  },
};

export function DataConfidenceBadge({ 
  source, 
  lastUpdated, 
  sourceName,
  sourceUrl,
  className = '' 
}: DataConfidenceBadgeProps) {
  const config = sourceConfig[source];
  const Icon = config.icon;

  const formatLastUpdated = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border cursor-help",
            config.color,
            className
          )}>
            <Icon className="h-3 w-3" />
            <span>{config.label}</span>
            {lastUpdated && (
              <span className="opacity-70">• {formatLastUpdated(lastUpdated)}</span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-1">
            <p className="font-medium">{config.label} Data</p>
            <p className="text-xs text-muted-foreground">{config.description}</p>
            {sourceName && (
              <p className="text-xs">Source: {sourceName}</p>
            )}
            {sourceUrl && (
              <a 
                href={sourceUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline"
              >
                View official source →
              </a>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
