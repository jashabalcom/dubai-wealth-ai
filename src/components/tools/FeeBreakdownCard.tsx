import { useState } from 'react';
import { ChevronDown, ChevronUp, Info, Receipt } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FEE_DESCRIPTIONS } from '@/lib/dubaiRealEstateFees';

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

  return (
    <div className="p-4 rounded-xl bg-card border border-border">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Receipt className={`w-4 h-4 text-${accentColor}`} />
          <span className="font-medium text-foreground">{title}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`font-heading text-lg text-${accentColor}`}>
            {formatValue(total)}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-border space-y-2">
              <TooltipProvider>
                {fees.filter(fee => fee.value > 0).map((fee) => (
                  <div
                    key={fee.key}
                    className="flex items-center justify-between py-1.5 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-muted-foreground ${fee.category ? categoryColors[fee.category] : ''}`}>
                        {fee.label}
                      </span>
                      {FEE_DESCRIPTIONS[fee.key] && (
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-3.5 h-3.5 text-muted-foreground/50 hover:text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="text-xs">{FEE_DESCRIPTIONS[fee.key]}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    <span className="font-medium text-foreground">
                      {formatValue(fee.value)}
                    </span>
                  </div>
                ))}
              </TooltipProvider>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
