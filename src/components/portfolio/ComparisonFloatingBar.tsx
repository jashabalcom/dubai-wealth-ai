import { motion, AnimatePresence } from 'framer-motion';
import { X, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ComparisonFloatingBarProps {
  selectedCount: number;
  maxSelectable?: number;
  onClear: () => void;
  onCompare: () => void;
}

export function ComparisonFloatingBar({ 
  selectedCount, 
  maxSelectable = 4,
  onClear, 
  onCompare 
}: ComparisonFloatingBarProps) {
  const canCompare = selectedCount >= 2 && selectedCount <= maxSelectable;

  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="bg-card border border-gold/30 shadow-2xl shadow-black/20 rounded-full px-4 py-2 flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
                <span className="text-sm font-bold text-gold">{selectedCount}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {selectedCount === 1 ? 'property' : 'properties'} selected
              </span>
            </div>

            <div className="h-6 w-px bg-border" />

            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>

            <Button
              size="sm"
              onClick={onCompare}
              disabled={!canCompare}
              className="bg-gold hover:bg-gold/90 text-background"
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              Compare {canCompare && `(${selectedCount})`}
            </Button>
          </div>

          {selectedCount > maxSelectable && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-xs text-destructive mt-2"
            >
              Maximum {maxSelectable} properties can be compared
            </motion.p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
