import { useState } from 'react';
import { ChevronDown, ChevronUp, Info, Receipt } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FEE_DESCRIPTIONS } from '@/lib/dubaiRealEstateFees';
import { cn } from '@/lib/utils';

interface FeeItem {
  label: string;
  value: number;
  key: string;
  isPercentage?: boolean;
  category?: 'acquisition' | 'mortgage' | 'ongoing' | 'exit';
}

interface FeeBreakdownCardProps {
  title: string;
  fees: FeeItem[];
  total: number;
  formatValue: (value: number) => string;
  defaultExpanded?: boolean;
  accentColor?: string;
}

const categoryColors = {
  acquisition: 'text-blue-400',
  mortgage: 'text-purple-400',
  ongoing: 'text-amber-400',
  exit: 'text-rose-400',
};

export function FeeBreakdownCard({
  title,
  fees,
  total,
  formatValue,
  defaultExpanded = false,
  accentColor = 'gold',
}: FeeBreakdownCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const visibleFees = fees.filter(fee => fee.value > 0);

  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl",
      "bg-card/50 backdrop-blur-sm",
      "border border-border/50",
      "transition-all duration-300",
      isExpanded && "border-gold/20 shadow-lg shadow-gold/5"
    )}>
      {/* Accent line */}
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gold/60 via-gold/30 to-transparent" />
      
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-muted/20 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-gold/10">
            <Receipt className="w-4 h-4 text-gold" />
          </div>
          <span className="font-medium text-foreground">{title}</span>
          <span className="text-xs text-muted-foreground">
            ({visibleFees.length} items)
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-heading text-lg text-gold">
            {formatValue(total)}
          </span>
          <div className={cn(
            "p-1 rounded-full transition-colors",
            isExpanded ? "bg-gold/10" : "bg-muted/30"
          )}>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-gold" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-1">
              <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-3" />
              <TooltipProvider>
                {visibleFees.map((fee, index) => (
                  <motion.div
                    key={fee.key}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={cn(
                      "flex items-center justify-between py-2 px-2 rounded-lg text-sm",
                      "hover:bg-muted/20 transition-colors -mx-2"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-muted-foreground",
                        fee.category && categoryColors[fee.category]
                      )}>
                        {fee.label}
                      </span>
                      {FEE_DESCRIPTIONS[fee.key] && (
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-3.5 h-3.5 text-muted-foreground/40 hover:text-muted-foreground transition-colors cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs bg-popover/95 backdrop-blur-sm">
                            <p className="text-xs">{FEE_DESCRIPTIONS[fee.key]}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    <span className="font-medium text-foreground tabular-nums">
                      {formatValue(fee.value)}
                    </span>
                  </motion.div>
                ))}
              </TooltipProvider>
              
              {/* Total row */}
              <div className="mt-2 pt-3 border-t border-border/50 flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Total</span>
                <span className="font-heading text-gold text-lg">{formatValue(total)}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
