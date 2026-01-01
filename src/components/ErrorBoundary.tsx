import * as Sentry from '@sentry/react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface FallbackProps {
  error: Error;
  componentStack: string | null;
  eventId: string | null;
  resetError: () => void;
}

function ErrorFallback({ error, componentStack, resetError }: FallbackProps) {
  const currentRoute = typeof window !== 'undefined' ? window.location.pathname : 'unknown';
  
  // Log structured error for debugging
  console.error('[ErrorBoundary] Crash:', {
    route: currentRoute,
    message: error.message,
    stack: error.stack,
    componentStack,
  });

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>
        
        <h1 className="font-heading text-2xl text-foreground mb-4">
          Something went wrong
        </h1>
        
        <p className="text-muted-foreground mb-4">
          We encountered an unexpected error. Our team has been notified and is working on a fix.
        </p>
        
        <p className="text-xs text-muted-foreground mb-4">
          Route: <code className="bg-muted px-1 rounded">{currentRoute}</code>
        </p>
        
        <details className="bg-muted/30 rounded-lg p-4 mb-6 text-left">
          <summary className="text-xs text-muted-foreground cursor-pointer mb-2">Error details</summary>
          <p className="text-xs text-destructive font-mono break-all mb-2">
            {error.message}
          </p>
          {componentStack && (
            <pre className="text-[10px] text-muted-foreground font-mono whitespace-pre-wrap overflow-auto max-h-32">
              {componentStack}
            </pre>
          )}
        </details>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" onClick={resetError}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button variant="gold" onClick={() => window.location.href = '/'}>
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </div>
        
        <button
          onClick={() => Sentry.showReportDialog()}
          className="mt-6 text-sm text-muted-foreground hover:text-gold transition-colors underline"
        >
          Report this issue
        </button>
      </div>
    </div>
  );
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  return (
    <Sentry.ErrorBoundary fallback={ErrorFallback} showDialog>
      {children}
    </Sentry.ErrorBoundary>
  );
}
