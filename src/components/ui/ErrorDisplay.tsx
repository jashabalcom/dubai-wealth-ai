import { AlertTriangle, RefreshCw, XCircle } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface ErrorDisplayProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  variant?: 'inline' | 'card' | 'page';
  className?: string;
}

/**
 * Consistent error display component with retry option
 */
export function ErrorDisplay({ 
  title = 'Something went wrong', 
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  variant = 'card',
  className 
}: ErrorDisplayProps) {
  if (variant === 'inline') {
    return (
      <div className={cn("flex items-center gap-2 text-destructive text-sm", className)}>
        <AlertTriangle className="w-4 h-4" />
        <span>{message}</span>
        {onRetry && (
          <button onClick={onRetry} className="underline hover:no-underline">
            Retry
          </button>
        )}
      </div>
    );
  }

  if (variant === 'page') {
    return (
      <div className={cn("min-h-[50vh] flex items-center justify-center px-4", className)}>
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold mb-2">{title}</h2>
          <p className="text-muted-foreground mb-6">{message}</p>
          {onRetry && (
            <Button onClick={onRetry} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Default: card variant
  return (
    <div className={cn(
      "p-6 rounded-lg border border-destructive/20 bg-destructive/5",
      className
    )}>
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-destructive" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-destructive mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground mb-4">{message}</p>
          {onRetry && (
            <Button onClick={onRetry} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
