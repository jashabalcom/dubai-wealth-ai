import { cn } from '@/lib/utils';

interface OnlineIndicatorProps {
  isOnline: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showOffline?: boolean;
}

const sizeClasses = {
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5',
  lg: 'h-3 w-3',
};

export function OnlineIndicator({
  isOnline,
  size = 'md',
  className,
  showOffline = false,
}: OnlineIndicatorProps) {
  if (!isOnline && !showOffline) return null;

  return (
    <span
      className={cn(
        'rounded-full border-2 border-background',
        sizeClasses[size],
        isOnline
          ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]'
          : 'bg-muted-foreground/40',
        className
      )}
      title={isOnline ? 'Online' : 'Offline'}
    />
  );
}
