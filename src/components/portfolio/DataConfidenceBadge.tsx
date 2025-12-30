import { Wifi, WifiOff, Clock, User } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export type DataSource = 'live' | 'estimated' | 'stale' | 'user';

interface DataConfidenceBadgeProps {
  source: DataSource;
  lastUpdated?: Date;
  className?: string;
}

const sourceConfig = {
  live: {
    icon: Wifi,
    label: 'Live',
    description: 'Data synced from market sources',
    color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
  },
  estimated: {
    icon: Clock,
    label: 'Estimated',
    description: 'Values estimated from market trends',
    color: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
  },
  stale: {
    icon: WifiOff,
    label: 'Stale',
    description: 'Data may be outdated',
    color: 'bg-red-500/10 text-red-500 border-red-500/30',
  },
  user: {
    icon: User,
    label: 'Manual',
    description: 'User-provided values',
    color: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
  },
};

export function DataConfidenceBadge({ source, lastUpdated, className = '' }: DataConfidenceBadgeProps) {
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
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color} ${className}`}>
            <Icon className="h-3 w-3" />
            <span>{config.label}</span>
            {lastUpdated && (
              <span className="opacity-70">• {formatLastUpdated(lastUpdated)}</span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
