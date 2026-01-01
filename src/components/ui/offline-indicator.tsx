import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from './button';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { cn } from '@/lib/utils';

interface OfflineIndicatorProps {
  className?: string;
  variant?: 'banner' | 'inline' | 'toast';
}

export function OfflineIndicator({ className, variant = 'banner' }: OfflineIndicatorProps) {
  const { isOnline, isReconnecting } = useOnlineStatus();

  if (isOnline && !isReconnecting) return null;

  if (variant === 'inline') {
    return (
      <div className={cn(
        'flex items-center gap-2 text-sm text-muted-foreground',
        className
      )}>
        <WifiOff className="w-4 h-4" />
        <span>{isReconnecting ? 'Reconnecting...' : 'Offline'}</span>
      </div>
    );
  }

  if (variant === 'toast') {
    return (
      <div className={cn(
        'fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg bg-destructive/90 px-4 py-3 text-destructive-foreground shadow-lg backdrop-blur',
        className
      )}>
        {isReconnecting ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : (
          <WifiOff className="w-4 h-4" />
        )}
        <span className="text-sm font-medium">
          {isReconnecting ? 'Reconnecting...' : 'You are offline'}
        </span>
      </div>
    );
  }

  // Banner variant
  return (
    <div className={cn(
      'w-full bg-destructive/90 text-destructive-foreground py-2 px-4',
      className
    )}>
      <div className="container mx-auto flex items-center justify-center gap-3 text-sm">
        {isReconnecting ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Reconnecting to the internet...</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span>You're offline. Some features may not be available.</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-destructive-foreground hover:bg-destructive-foreground/20"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Retry
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
