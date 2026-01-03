import { Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RemainingViewsBadgeProps {
  remainingViews: number;
  userTier?: 'anonymous' | 'free' | 'investor' | 'elite' | 'private';
  className?: string;
}

export function RemainingViewsBadge({ 
  remainingViews, 
  userTier = 'anonymous',
  className 
}: RemainingViewsBadgeProps) {
  // Don't show for paid members or when views are plenty
  if (remainingViews <= 0 || remainingViews > 5) return null;
  if (['investor', 'elite', 'private'].includes(userTier)) return null;

  const message = userTier === 'anonymous'
    ? `${remainingViews} free ${remainingViews === 1 ? 'view' : 'views'} left - Sign up for more`
    : `${remainingViews} ${remainingViews === 1 ? 'view' : 'views'} left - Upgrade for unlimited`;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full',
        'bg-amber-500/20 text-amber-400 border border-amber-500/30',
        'text-xs font-medium backdrop-blur-sm',
        'animate-in fade-in slide-in-from-top-1 duration-300',
        className
      )}
    >
      <Eye className="w-3 h-3" />
      <span>{message}</span>
    </div>
  );
}
