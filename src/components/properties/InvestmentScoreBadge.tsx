import { motion } from 'framer-motion';
import { TrendingUp, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { 
  calculateInvestmentScore, 
  getScoreColor as getScoreColorClass, 
  getScoreLabel,
} from '@/lib/investmentScore';
import type { AccessLevel } from '@/hooks/usePropertyViewLimit';

interface InvestmentScoreProps {
  price: number;
  sizeSqft: number;
  rentalYield: number;
  area: string;
  isOffPlan?: boolean;
  developerName?: string;
  variant?: 'badge' | 'card' | 'compact';
  className?: string;
  accessLevel?: AccessLevel;
}

function getScoreColors(score: number): { bg: string; text: string; border: string } {
  if (score >= 80) return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' };
  if (score >= 65) return { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' };
  if (score >= 50) return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' };
  if (score >= 35) return { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' };
  return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' };
}

export function InvestmentScoreBadge({ 
  variant = 'badge',
  className,
  price,
  sizeSqft,
  rentalYield,
  area,
  isOffPlan,
  developerName,
  accessLevel = 'full',
}: InvestmentScoreProps) {
  const { score, breakdown } = calculateInvestmentScore({
    priceAed: price,
    sizeSqft,
    rentalYield,
    area,
    isOffPlan,
    developerName,
  });
  
  const colors = getScoreColors(score);
  const label = getScoreLabel(score);

  // Create breakdown items for display
  const breakdownItems = [
    { label: 'Price Value', score: Math.round(breakdown.priceValue), max: 35 },
    { label: 'Rental Yield', score: Math.round(breakdown.yieldScore), max: 35 },
    { label: 'Developer', score: breakdown.developerScore, max: 20 },
    { label: isOffPlan ? 'Off-Plan Advantage' : 'Ready Property', score: breakdown.offPlanBonus, max: 10 },
  ];

  // Locked tooltip content for partial access
  const LockedTooltipContent = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-semibold">Investment Score</span>
        <span className={cn('font-bold', colors.text)}>{score}/100</span>
      </div>
      <div className="relative">
        <div className="space-y-1.5 blur-sm select-none pointer-events-none">
          {breakdownItems.map((item) => (
            <div key={item.label} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="text-foreground w-10 text-right">??/{item.max}</span>
            </div>
          ))}
        </div>
        <Link 
          to="/auth" 
          className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[1px] rounded"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="flex items-center gap-1.5 text-xs text-gold hover:text-gold/80 transition-colors">
            <Lock className="w-3 h-3" />
            Sign up to see breakdown
          </span>
        </Link>
      </div>
    </div>
  );

  // Full tooltip content
  const FullTooltipContent = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-semibold">Investment Score</span>
        <span className={cn('font-bold', colors.text)}>{score}/100 ({label})</span>
      </div>
      <div className="space-y-1.5">
        {breakdownItems.map((item) => (
          <div key={item.label} className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{item.label}</span>
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gold rounded-full transition-all"
                  style={{ width: `${(item.score / item.max) * 100}%` }}
                />
              </div>
              <span className="text-foreground w-10 text-right">{item.score}/{item.max}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Blocked state - show locked badge
  if (accessLevel === 'blocked') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              to="/auth"
              className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium cursor-pointer',
                'bg-muted/50 text-muted-foreground border border-border',
                className
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <Lock className="w-3 h-3" />
              <span>??</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs p-3">
            <p className="text-sm">Sign up free to see Investment Scores</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Compact variant for property cards
  if (variant === 'compact') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium cursor-help',
                colors.bg,
                colors.text,
                className
              )}
            >
              <TrendingUp className="w-3 h-3" />
              <span>{score}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs p-3">
            {accessLevel === 'partial' ? <LockedTooltipContent /> : <FullTooltipContent />}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === 'badge') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm cursor-help border',
                colors.bg,
                colors.text,
                colors.border,
                className
              )}
            >
              <TrendingUp className="w-3 h-3" />
              <span>{score}</span>
              <span className="hidden sm:inline">/ 100</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs p-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Investment Score</span>
                <span className={cn('font-bold', colors.text)}>{score}/100 ({label})</span>
              </div>
              <div className="space-y-1.5">
                {breakdownItems.map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gold rounded-full transition-all"
                          style={{ width: `${(item.score / item.max) * 100}%` }}
                        />
                      </div>
                      <span className="text-foreground w-10 text-right">{item.score}/{item.max}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Card variant for property detail page
  if (accessLevel === 'partial') {
    return (
      <div className={cn('p-4 rounded-xl bg-card border border-border', className)}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gold" />
            <h3 className="font-heading text-lg">Investment Score</h3>
          </div>
          <div className={cn('px-3 py-1 rounded-full font-bold', colors.bg, colors.text)}>
            {score}/100
          </div>
        </div>
        
        <div className="mb-4">
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={cn('h-full rounded-full', score >= 65 ? 'bg-emerald-500' : score >= 50 ? 'bg-yellow-500' : 'bg-orange-500')}
            />
          </div>
          <p className={cn('text-sm mt-1', colors.text)}>{label} Investment Opportunity</p>
        </div>

        <div className="relative">
          <div className="space-y-3 blur-sm select-none">
            {breakdownItems.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-muted rounded-full" />
                  <span className="text-sm font-medium w-12 text-right">??/{item.max}</span>
                </div>
              </div>
            ))}
          </div>
          <Link 
            to="/auth" 
            className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-[2px] rounded-lg"
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/30 rounded-full hover:bg-gold/20 transition-colors">
              <Lock className="w-4 h-4 text-gold" />
              <span className="text-sm font-medium text-gold">Sign up to see breakdown</span>
            </div>
          </Link>
        </div>
      </div>
    );
  }

  // Full card variant
  return (
    <div className={cn('p-4 rounded-xl bg-card border border-border', className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-gold" />
          <h3 className="font-heading text-lg">Investment Score</h3>
        </div>
        <div className={cn('px-3 py-1 rounded-full font-bold', colors.bg, colors.text)}>
          {score}/100
        </div>
      </div>
      
      <div className="mb-4">
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={cn('h-full rounded-full', score >= 65 ? 'bg-emerald-500' : score >= 50 ? 'bg-yellow-500' : 'bg-orange-500')}
          />
        </div>
        <p className={cn('text-sm mt-1', colors.text)}>{label} Investment Opportunity</p>
      </div>

      <div className="space-y-3">
        {breakdownItems.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{item.label}</span>
            <div className="flex items-center gap-2">
              <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gold rounded-full transition-all"
                  style={{ width: `${(item.score / item.max) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium w-12 text-right">{item.score}/{item.max}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
