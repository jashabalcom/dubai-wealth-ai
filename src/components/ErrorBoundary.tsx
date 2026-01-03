import * as Sentry from '@sentry/react';
import { Component, ReactNode } from 'react';
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
          <Button variant="outline" onClick={resetError} className="min-h-[44px]">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button variant="gold" onClick={() => window.location.href = '/'} className="min-h-[44px]">
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </div>
        
        <button
          onClick={() => Sentry.showReportDialog()}
          className="mt-6 text-sm text-muted-foreground hover:text-gold transition-colors underline min-h-[44px]"
        >
          Report this issue
        </button>
      </div>
    </div>
  );
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

// Lightweight error boundary for component-level errors
interface SimpleBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class SimpleErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode; onError?: (error: Error) => void },
  SimpleBoundaryState
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode; onError?: (error: Error) => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): SimpleBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[SimpleErrorBoundary] Error:', error, errorInfo);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-center">
          <AlertTriangle className="w-6 h-6 text-destructive mx-auto mb-2" />
          <p className="text-sm text-destructive">Something went wrong</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="mt-2 min-h-[44px]"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Retry
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  return (
    <Sentry.ErrorBoundary fallback={ErrorFallback} showDialog>
      {children}
    </Sentry.ErrorBoundary>
  );
}
