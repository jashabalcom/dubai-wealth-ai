import { 
  MessageSquare, MessageCircle, ThumbsUp, Trophy, Crown, Heart, Star, Gem,
  ShieldCheck, BadgeCheck, Building2, Flame, Zap, Award
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Badge as BadgeData, BadgeDefinition, BADGE_DEFINITIONS } from '@/hooks/useBadges';
import { formatDistanceToNow } from 'date-fns';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  MessageSquare,
  MessageCircle,
  ThumbsUp,
  Trophy,
  Crown,
  Heart,
  Star,
  Gem,
  ShieldCheck,
  BadgeCheck,
  Building2,
  Flame,
  Zap,
  Award,
};

interface BadgeDisplayProps {
  badges: Array<BadgeData & { definition?: BadgeDefinition }>;
  maxDisplay?: number;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
}

export function BadgeDisplay({ 
  badges, 
  maxDisplay = 5, 
  size = 'sm',
  showTooltip = true,
  className 
}: BadgeDisplayProps) {
  if (!badges.length) return null;

  const displayBadges = badges.slice(0, maxDisplay);
  const remainingCount = badges.length - maxDisplay;

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const containerSizeClasses = {
    sm: 'p-1',
    md: 'p-1.5',
    lg: 'p-2',
  };

  return (
    <TooltipProvider>
      <div className={cn("flex items-center gap-1", className)}>
        {displayBadges.map((badge) => {
          if (!badge.definition) return null;
          
          const IconComponent = ICON_MAP[badge.definition.icon];
          if (!IconComponent) return null;

          const BadgeIcon = (
            <div 
              className={cn(
                "rounded-full bg-muted/50 border border-border/50 transition-all hover:scale-110",
                containerSizeClasses[size]
              )}
            >
              <IconComponent className={cn(sizeClasses[size], badge.definition.color)} />
            </div>
          );

          if (!showTooltip) return <div key={badge.id}>{BadgeIcon}</div>;

          return (
            <Tooltip key={badge.id}>
              <TooltipTrigger asChild>
                {BadgeIcon}
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[200px]">
                <div className="text-center">
                  <p className="font-medium">{badge.definition.name}</p>
                  <p className="text-xs text-muted-foreground">{badge.definition.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Earned {formatDistanceToNow(new Date(badge.earned_at), { addSuffix: true })}
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
        
        {remainingCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={cn(
                "rounded-full bg-muted/50 border border-border/50 text-xs font-medium text-muted-foreground",
                containerSizeClasses[size],
                "px-1.5"
              )}>
                +{remainingCount}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{remainingCount} more badge{remainingCount > 1 ? 's' : ''}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}

// Single badge component for inline display
interface SingleBadgeProps {
  badgeType: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function SingleBadge({ badgeType, size = 'sm', showLabel = false }: SingleBadgeProps) {
  const definition = BADGE_DEFINITIONS.find(b => b.type === badgeType);
  if (!definition) return null;

  const IconComponent = ICON_MAP[definition.icon];
  if (!IconComponent) return null;

  const sizeClasses = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1">
            <IconComponent className={cn(sizeClasses[size], definition.color)} />
            {showLabel && (
              <span className="text-xs font-medium">{definition.name}</span>
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">{definition.name}</p>
          <p className="text-xs text-muted-foreground">{definition.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
