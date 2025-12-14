import { motion } from 'framer-motion';
import { Award, CheckCircle2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GoldenVisaBadgeProps {
  priceAed: number;
  variant?: 'badge' | 'card';
  className?: string;
  showLink?: boolean;
}

const GOLDEN_VISA_THRESHOLD = 2000000; // AED 2 million

export function GoldenVisaBadge({ 
  priceAed, 
  variant = 'badge',
  className,
  showLink = true
}: GoldenVisaBadgeProps) {
  const isEligible = priceAed >= GOLDEN_VISA_THRESHOLD;
  const difference = GOLDEN_VISA_THRESHOLD - priceAed;
  const percentToThreshold = (priceAed / GOLDEN_VISA_THRESHOLD) * 100;

  if (variant === 'badge') {
    if (!isEligible) return null;
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
                'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-400 border border-amber-500/30',
                'backdrop-blur-sm cursor-help',
                className
              )}
            >
              <Award className="w-3 h-3" />
              <span>Golden Visa</span>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs p-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span className="font-semibold">Golden Visa Eligible</span>
              </div>
              <p className="text-xs text-muted-foreground">
                This property qualifies for the UAE Golden Visa program (≥AED 2M investment).
                Get a 10-year residency visa through property investment.
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Card variant for property detail page
  return (
    <div className={cn(
      'p-4 rounded-xl border',
      isEligible 
        ? 'bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border-amber-500/30'
        : 'bg-card border-border',
      className
    )}>
      <div className="flex items-center gap-2 mb-3">
        <Award className={cn('w-5 h-5', isEligible ? 'text-amber-400' : 'text-muted-foreground')} />
        <h3 className="font-heading text-lg">Golden Visa Eligibility</h3>
      </div>

      {isEligible ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-semibold">Eligible for Golden Visa</span>
          </div>
          <p className="text-sm text-muted-foreground">
            This property meets the AED 2M threshold for the UAE 10-year Golden Visa through property investment.
          </p>
          {showLink && (
            <Link to="/golden-visa">
              <Button variant="outline" size="sm" className="w-full border-amber-500/30 text-amber-400 hover:bg-amber-500/10">
                <ExternalLink className="w-4 h-4 mr-2" />
                Learn About Golden Visa
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            This property is below the AED 2M threshold for Golden Visa eligibility.
          </p>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress to threshold</span>
              <span>{percentToThreshold.toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-500/50 rounded-full"
                style={{ width: `${Math.min(percentToThreshold, 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              AED {difference.toLocaleString()} more needed
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
