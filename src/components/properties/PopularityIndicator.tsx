import { Flame, Eye, Users, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PopularityIndicatorProps {
  viewsCount?: number | null;
  inquiriesCount?: number | null;
  variant?: 'badge' | 'inline' | 'detailed';
  className?: string;
}

type PopularityLevel = 'hot' | 'trending' | 'popular' | 'normal';

interface PopularityData {
  level: PopularityLevel;
  label: string;
  icon: typeof Flame;
  colorClasses: string;
}

function getPopularityData(viewsCount: number, inquiriesCount: number): PopularityData {
  const totalEngagement = viewsCount + (inquiriesCount * 10); // Inquiries weighted higher
  
  if (totalEngagement >= 100 || inquiriesCount >= 10) {
    return {
      level: 'hot',
      label: 'Hot Property',
      icon: Flame,
      colorClasses: 'bg-orange-500 text-white',
    };
  }
  
  if (totalEngagement >= 50 || inquiriesCount >= 5) {
    return {
      level: 'trending',
      label: 'Trending',
      icon: TrendingUp,
      colorClasses: 'bg-rose-500 text-white',
    };
  }
  
  if (totalEngagement >= 20 || inquiriesCount >= 2) {
    return {
      level: 'popular',
      label: 'Popular',
      icon: Users,
      colorClasses: 'bg-purple-500 text-white',
    };
  }
  
  return {
    level: 'normal',
    label: '',
    icon: Eye,
    colorClasses: '',
  };
}

export function PopularityIndicator({ 
  viewsCount = 0, 
  inquiriesCount = 0,
  variant = 'badge',
  className 
}: PopularityIndicatorProps) {
  const views = viewsCount || 0;
  const inquiries = inquiriesCount || 0;
  
  // Don't show anything if no engagement
  if (views === 0 && inquiries === 0) return null;
  
  const popularity = getPopularityData(views, inquiries);
  
  // Only show badge for popular+ properties
  if (variant === 'badge' && popularity.level === 'normal') return null;
  
  const Icon = popularity.icon;
  
  if (variant === 'badge') {
    return (
      <div className={cn(
        "px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 backdrop-blur-sm animate-pulse",
        popularity.colorClasses,
        className
      )}>
        <Icon className="w-3 h-3" />
        {popularity.label}
      </div>
    );
  }
  
  if (variant === 'inline') {
    return (
      <div className={cn("flex items-center gap-3 text-xs text-muted-foreground", className)}>
        {views > 0 && (
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            {views} {views === 1 ? 'view' : 'views'}
          </span>
        )}
        {inquiries > 0 && (
          <span className="flex items-center gap-1 text-gold">
            <Users className="w-3.5 h-3.5" />
            {inquiries} {inquiries === 1 ? 'inquiry' : 'inquiries'}
          </span>
        )}
      </div>
    );
  }
  
  // Detailed variant
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {popularity.level !== 'normal' && (
        <div className={cn(
          "px-3 py-1.5 text-sm font-medium rounded-lg flex items-center gap-2 w-fit",
          popularity.colorClasses
        )}>
          <Icon className="w-4 h-4" />
          {popularity.label}
        </div>
      )}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        {views > 0 && (
          <span className="flex items-center gap-1.5">
            <Eye className="w-4 h-4" />
            <span>{views.toLocaleString()} views this week</span>
          </span>
        )}
        {inquiries > 0 && (
          <span className="flex items-center gap-1.5 text-gold">
            <Users className="w-4 h-4" />
            <span>{inquiries} people interested</span>
          </span>
        )}
      </div>
    </div>
  );
}

export { getPopularityData };
export type { PopularityLevel };
