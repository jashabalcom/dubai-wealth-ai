import { useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Loader2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InfiniteScrollTriggerProps {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  totalCount: number;
  loadedCount: number;
}

export function InfiniteScrollTrigger({
  onLoadMore,
  hasMore,
  isLoading,
  totalCount,
  loadedCount,
}: InfiniteScrollTriggerProps) {
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !isLoading) {
        onLoadMore();
      }
    },
    [hasMore, isLoading, onLoadMore]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersect, {
      root: null,
      rootMargin: '200px', // Start loading before reaching the trigger
      threshold: 0,
    });

    if (triggerRef.current) {
      observer.observe(triggerRef.current);
    }

    return () => observer.disconnect();
  }, [handleIntersect]);

  // Don't render if no properties loaded yet
  if (loadedCount === 0) return null;

  return (
    <div ref={triggerRef} className="w-full py-8 flex flex-col items-center gap-4">
      {isLoading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 text-muted-foreground"
        >
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading more properties...</span>
        </motion.div>
      ) : hasMore ? (
        <Button
          variant="outline"
          onClick={onLoadMore}
          className="gap-2"
        >
          <ChevronDown className="w-4 h-4" />
          Load More Properties
        </Button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-muted-foreground text-sm">
            You've seen all {totalCount.toLocaleString()} properties
          </p>
        </motion.div>
      )}

      {/* Progress indicator */}
      {totalCount > 0 && (
        <div className="text-sm text-muted-foreground">
          Showing {loadedCount.toLocaleString()} of {totalCount.toLocaleString()} properties
        </div>
      )}
    </div>
  );
}

// Loading skeleton for infinite scroll
export function PropertyLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="rounded-2xl bg-card border border-border overflow-hidden animate-pulse"
        >
          <div className="aspect-[4/3] bg-muted" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
            <div className="flex justify-between">
              <div className="h-5 bg-muted rounded w-1/3" />
              <div className="h-5 bg-muted rounded w-1/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
