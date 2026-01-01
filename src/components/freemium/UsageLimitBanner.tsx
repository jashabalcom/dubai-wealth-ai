import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface UsageLimitBannerProps {
  remaining: number;
  total: number;
  type: 'tool' | 'ai';
  toolName?: string;
}

export function UsageLimitBanner({ remaining, total, type, toolName }: UsageLimitBannerProps) {
  const percentage = ((total - remaining) / total) * 100;
  const isLow = remaining <= 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg border p-3 sm:p-4 mb-6 ${
        isLow 
          ? 'bg-destructive/10 border-destructive/30' 
          : 'bg-muted/50 border-border'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className={`h-4 w-4 flex-shrink-0 ${isLow ? 'text-destructive' : 'text-gold'}`} />
            <span className="text-xs sm:text-sm font-medium">
              {remaining === 0 
                ? `You've used all your free ${type === 'tool' ? 'calculations' : 'AI queries'}`
                : `${remaining} free ${type === 'tool' ? 'calculation' : 'AI quer'}${remaining === 1 ? (type === 'ai' ? 'y' : '') : (type === 'ai' ? 'ies' : 's')} remaining`
              }
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={`h-full ${isLow ? 'bg-destructive' : 'bg-gold'}`}
            />
          </div>
        </div>
        <Button asChild size="sm" className="w-full sm:w-auto shrink-0">
          <Link to="/pricing">
            Upgrade
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}
