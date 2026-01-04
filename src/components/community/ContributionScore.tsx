import { motion } from 'framer-motion';
import { TrendingUp, ThumbsUp, MessageSquare, ShieldCheck } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useContributionScore } from '@/hooks/useContributionScore';

interface ContributionScoreProps {
  userId?: string;
  showBreakdown?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ContributionScore({ 
  userId, 
  showBreakdown = false,
  size = 'md',
  className 
}: ContributionScoreProps) {
  const { 
    totalScore, 
    breakdown, 
    level, 
    levelName, 
    isLoading,
    karma,
    isVerifiedInvestor,
    isVerifiedAgent,
  } = useContributionScore(userId);

  if (isLoading) {
    return <div className="h-6 w-16 bg-muted animate-pulse rounded-full" />;
  }

  const sizeClasses = {
    sm: { container: 'text-xs px-2 py-0.5', icon: 'h-3 w-3' },
    md: { container: 'text-sm px-2.5 py-1', icon: 'h-4 w-4' },
    lg: { container: 'text-base px-3 py-1.5', icon: 'h-5 w-5' },
  };

  const sizes = sizeClasses[size];

  // Get level color
  const getLevelColor = (level: number) => {
    if (level >= 8) return 'from-gold to-amber-500';
    if (level >= 6) return 'from-purple-500 to-pink-500';
    if (level >= 4) return 'from-blue-500 to-cyan-500';
    return 'from-slate-400 to-slate-500';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full font-medium",
              "bg-gradient-to-r",
              getLevelColor(level),
              "text-white shadow-sm",
              sizes.container,
              className
            )}
          >
            <TrendingUp className={sizes.icon} />
            <span>{totalScore}</span>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="w-64 p-4">
          <div className="space-y-3">
            <div className="text-center border-b border-border pb-2">
              <p className="font-semibold text-lg">{totalScore} pts</p>
              <p className="text-xs text-muted-foreground">
                Level {level}: {levelName}
              </p>
            </div>
            
            {showBreakdown && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5">
                    <ThumbsUp className="h-3 w-3 text-amber-500" />
                    Helpfulness
                  </span>
                  <span className="font-medium">{breakdown.helpfulness} pts</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="h-3 w-3 text-blue-500" />
                    Activity
                  </span>
                  <span className="font-medium">{breakdown.activity} pts</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3 w-3 text-emerald-500" />
                    Expertise
                  </span>
                  <span className="font-medium">{breakdown.expertise} pts</span>
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-border text-xs text-muted-foreground">
              <p>Karma: {karma} upvotes received</p>
              {(isVerifiedInvestor || isVerifiedAgent) && (
                <p className="text-emerald-500 mt-1">
                  ✓ Verified {isVerifiedInvestor ? 'Investor' : 'Agent'}
                </p>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Compact karma display for post/comment authors
interface KarmaDisplayProps {
  karma: number;
  size?: 'sm' | 'md';
  className?: string;
}

export function KarmaDisplay({ karma, size = 'sm', className }: KarmaDisplayProps) {
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-0.5',
  };

  if (karma === 0) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn(
            "inline-flex items-center gap-1 rounded-full bg-muted/50 text-muted-foreground",
            sizeClasses[size],
            className
          )}>
            <TrendingUp className="h-3 w-3" />
            {karma}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{karma} upvotes received</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
