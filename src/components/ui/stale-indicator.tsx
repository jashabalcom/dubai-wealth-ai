import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, RefreshCw } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface StaleIndicatorProps {
  lastUpdated: Date | null;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  className?: string;
  showRefreshButton?: boolean;
}

export function StaleIndicator({
  lastUpdated,
  onRefresh,
  isRefreshing = false,
  className,
  showRefreshButton = true,
}: StaleIndicatorProps) {
  const [isHovered, setIsHovered] = useState(false);

  if (!lastUpdated) return null;

  const timeAgo = formatDistanceToNow(lastUpdated, { addSuffix: true });

  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'inline-flex items-center gap-1.5 text-xs text-muted-foreground',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Clock className="w-3 h-3" />
      <span>Updated {timeAgo}</span>
      
      <AnimatePresence>
        {showRefreshButton && isHovered && onRefresh && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              variant="ghost"
              size="sm"
              className="h-5 px-1.5 text-xs"
              onClick={onRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn('w-3 h-3', isRefreshing && 'animate-spin')} />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
