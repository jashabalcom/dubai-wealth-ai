import { motion } from 'framer-motion';
import { TrendingUp, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface InvestmentScoreProps {
  price: number;
  sizeSqft: number;
  rentalYield: number;
  area: string;
  isOffPlan?: boolean;
  developerName?: string;
  variant?: 'badge' | 'card';
  className?: string;
}

// Area average benchmarks (AED per sqft)
const AREA_BENCHMARKS: Record<string, { avgPriceSqft: number; avgYield: number }> = {
  'Dubai Marina': { avgPriceSqft: 1800, avgYield: 6.5 },
  'Downtown Dubai': { avgPriceSqft: 2200, avgYield: 5.5 },
  'Palm Jumeirah': { avgPriceSqft: 2800, avgYield: 5.0 },
  'JBR': { avgPriceSqft: 2000, avgYield: 6.0 },
  'DIFC': { avgPriceSqft: 2500, avgYield: 5.5 },
  'Business Bay': { avgPriceSqft: 1500, avgYield: 7.0 },
  'Dubai Hills': { avgPriceSqft: 1600, avgYield: 6.0 },
  'JVC': { avgPriceSqft: 900, avgYield: 8.5 },
  'Jumeirah Village Circle': { avgPriceSqft: 900, avgYield: 8.5 },
  'Sports City': { avgPriceSqft: 750, avgYield: 9.0 },
  'Silicon Oasis': { avgPriceSqft: 800, avgYield: 8.0 },
  'Town Square': { avgPriceSqft: 850, avgYield: 7.5 },
  'MBR City': { avgPriceSqft: 1400, avgYield: 6.5 },
  'Dubai Creek Harbour': { avgPriceSqft: 1800, avgYield: 5.5 },
  'Al Furjan': { avgPriceSqft: 950, avgYield: 7.5 },
  'Arabian Ranches': { avgPriceSqft: 1100, avgYield: 5.5 },
};

const DEFAULT_BENCHMARK = { avgPriceSqft: 1200, avgYield: 7.0 };

// Top developers for reputation scoring
const TOP_DEVELOPERS = [
  'Emaar', 'DAMAC', 'Nakheel', 'Meraas', 'Dubai Properties',
  'Sobha', 'Ellington', 'Omniyat', 'Azizi', 'MAG'
];

function calculateInvestmentScore(props: InvestmentScoreProps): {
  score: number;
  breakdown: { label: string; score: number; max: number }[];
} {
  const { price, sizeSqft, rentalYield, area, isOffPlan, developerName } = props;
  const benchmark = AREA_BENCHMARKS[area] || DEFAULT_BENCHMARK;
  const priceSqft = sizeSqft > 0 ? price / sizeSqft : 0;

  const breakdown: { label: string; score: number; max: number }[] = [];

  // 1. Price vs Area Average (0-30 points)
  // Lower than avg = better score
  const priceRatio = priceSqft / benchmark.avgPriceSqft;
  let priceScore = 0;
  if (priceRatio <= 0.8) priceScore = 30;
  else if (priceRatio <= 0.9) priceScore = 25;
  else if (priceRatio <= 1.0) priceScore = 20;
  else if (priceRatio <= 1.1) priceScore = 15;
  else if (priceRatio <= 1.2) priceScore = 10;
  else priceScore = 5;
  breakdown.push({ label: 'Price Value', score: priceScore, max: 30 });

  // 2. Rental Yield (0-30 points)
  let yieldScore = 0;
  if (rentalYield >= 10) yieldScore = 30;
  else if (rentalYield >= 8) yieldScore = 25;
  else if (rentalYield >= 7) yieldScore = 20;
  else if (rentalYield >= 6) yieldScore = 15;
  else if (rentalYield >= 5) yieldScore = 10;
  else yieldScore = 5;
  breakdown.push({ label: 'Rental Yield', score: yieldScore, max: 30 });

  // 3. Developer Reputation (0-20 points)
  let devScore = 10; // Default
  if (developerName) {
    const isTopDeveloper = TOP_DEVELOPERS.some(dev => 
      developerName.toLowerCase().includes(dev.toLowerCase())
    );
    devScore = isTopDeveloper ? 20 : 12;
  }
  breakdown.push({ label: 'Developer', score: devScore, max: 20 });

  // 4. Off-Plan Discount Potential (0-20 points)
  // Off-plan typically offers 10-20% below market on completion
  const offPlanScore = isOffPlan ? 18 : 12;
  breakdown.push({ label: isOffPlan ? 'Off-Plan Advantage' : 'Ready Property', score: offPlanScore, max: 20 });

  const totalScore = breakdown.reduce((sum, item) => sum + item.score, 0);

  return { score: totalScore, breakdown };
}

function getScoreColor(score: number): { bg: string; text: string; border: string } {
  if (score >= 80) return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' };
  if (score >= 65) return { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' };
  if (score >= 50) return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' };
  if (score >= 35) return { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' };
  return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' };
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 65) return 'Good';
  if (score >= 50) return 'Fair';
  if (score >= 35) return 'Below Avg';
  return 'Poor';
}

export function InvestmentScoreBadge({ 
  variant = 'badge',
  className,
  ...props 
}: InvestmentScoreProps) {
  const { score, breakdown } = calculateInvestmentScore(props);
  const colors = getScoreColor(score);
  const label = getScoreLabel(score);

  if (variant === 'badge') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
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
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs p-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Investment Score</span>
                <span className={cn('font-bold', colors.text)}>{score}/100 ({label})</span>
              </div>
              <div className="space-y-1.5">
                {breakdown.map((item) => (
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
        {breakdown.map((item) => (
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
