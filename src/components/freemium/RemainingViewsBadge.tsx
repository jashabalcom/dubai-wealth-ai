import { Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RemainingViewsBadgeProps {
  remainingViews: number;
  className?: string;
}

export function RemainingViewsBadge({ remainingViews, className }: RemainingViewsBadgeProps) {
  if (remainingViews <= 0 || remainingViews > 3) return null;

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
      <span>{remainingViews} free {remainingViews === 1 ? 'analysis' : 'analyses'} left</span>
    </div>
  );
}
