import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScrollProgressIndicatorProps {
  currentStart: number;
  currentEnd: number;
  total: number;
}

export function ScrollProgressIndicator({ 
  currentStart, 
  currentEnd, 
  total 
}: ScrollProgressIndicatorProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hideTimeout, setHideTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(true);
      
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
      
      const timeout = setTimeout(() => {
        setIsVisible(false);
      }, 1500);
      
      setHideTimeout(timeout);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
    };
  }, [hideTimeout]);

  if (total === 0) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40"
        >
          <div className="px-4 py-2 bg-card/95 backdrop-blur-sm border border-border rounded-full shadow-lg">
            <span className="text-sm font-medium text-foreground">
              {currentStart}-{currentEnd} <span className="text-muted-foreground">of</span> {total}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
