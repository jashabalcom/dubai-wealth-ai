import { useState, useRef, useCallback, ReactNode } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowDown } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  threshold?: number;
  disabled?: boolean;
}

export function PullToRefresh({
  onRefresh,
  children,
  threshold = 80,
  disabled = false,
}: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  
  const pullDistance = useMotionValue(0);
  const pullProgress = useTransform(pullDistance, [0, threshold], [0, 1]);
  const iconRotation = useTransform(pullDistance, [0, threshold], [0, 180]);
  const indicatorOpacity = useTransform(pullDistance, [0, 20], [0, 1]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || isRefreshing) return;
    
    const container = containerRef.current;
    if (!container) return;
    
    // Only activate if scrolled to top
    if (container.scrollTop <= 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, [disabled, isRefreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling || disabled || isRefreshing) return;
    
    const container = containerRef.current;
    if (!container || container.scrollTop > 0) {
      setIsPulling(false);
      pullDistance.set(0);
      return;
    }

    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;
    
    if (diff > 0) {
      // Apply resistance for overscroll effect
      const resistance = 0.5;
      const distance = Math.min(diff * resistance, threshold * 1.5);
      pullDistance.set(distance);
      
      // Prevent default scroll when pulling
      if (distance > 10) {
        e.preventDefault();
      }
    }
  }, [isPulling, disabled, isRefreshing, pullDistance, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling || disabled) return;
    
    setIsPulling(false);
    const distance = pullDistance.get();
    
    if (distance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      pullDistance.set(threshold * 0.6);
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        pullDistance.set(0);
      }
    } else {
      pullDistance.set(0);
    }
  }, [isPulling, disabled, isRefreshing, pullDistance, threshold, onRefresh]);

  return (
    <div className="relative h-full overflow-hidden">
      {/* Pull indicator */}
      <AnimatePresence>
        {(isPulling || isRefreshing) && (
          <motion.div
            className="absolute left-0 right-0 top-0 z-50 flex justify-center pointer-events-none"
            style={{ y: pullDistance }}
          >
            <motion.div
              className="flex items-center justify-center w-10 h-10 -mt-12 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20"
              style={{ opacity: indicatorOpacity }}
            >
              {isRefreshing ? (
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              ) : (
                <motion.div style={{ rotate: iconRotation }}>
                  <ArrowDown className="w-5 h-5 text-primary" />
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content container */}
      <motion.div
        ref={containerRef}
        className="h-full overflow-y-auto overscroll-y-contain"
        style={{ y: isRefreshing ? threshold * 0.4 : isPulling ? pullDistance : 0 }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </motion.div>
    </div>
  );
}
