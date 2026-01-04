import { motion } from 'framer-motion';
import { Flame, AlertTriangle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useStreak } from '@/hooks/useStreak';

interface StreakIndicatorProps {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function StreakIndicator({ 
  className, 
  showLabel = true,
  size = 'md' 
}: StreakIndicatorProps) {
  const { currentStreak, isStreakActive, isStreakAtRisk, longestStreak } = useStreak();

  if (currentStreak === 0 && !isStreakActive) return null;

  const sizeClasses = {
    sm: { icon: 'h-3.5 w-3.5', text: 'text-xs', padding: 'px-1.5 py-0.5' },
    md: { icon: 'h-4 w-4', text: 'text-sm', padding: 'px-2 py-1' },
    lg: { icon: 'h-5 w-5', text: 'text-base', padding: 'px-2.5 py-1.5' },
  };

  const sizes = sizeClasses[size];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            animate={isStreakActive ? { 
              scale: [1, 1.05, 1],
            } : {}}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              repeatType: "loop" 
            }}
            className={cn(
              "inline-flex items-center gap-1 rounded-full font-medium",
              sizes.padding,
              sizes.text,
              isStreakActive 
                ? "bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-500 border border-orange-500/30"
                : isStreakAtRisk
                ? "bg-yellow-500/10 text-yellow-600 border border-yellow-500/30"
                : "bg-muted/50 text-muted-foreground",
              className
            )}
          >
            {isStreakAtRisk ? (
              <AlertTriangle className={cn(sizes.icon, "animate-pulse")} />
            ) : (
              <motion.div
                animate={isStreakActive ? {
                  rotate: [-5, 5, -5],
                  scale: [1, 1.1, 1],
                } : {}}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <Flame className={sizes.icon} />
              </motion.div>
            )}
            <span className="font-bold">{currentStreak}</span>
            {showLabel && <span className="hidden sm:inline">day streak</span>}
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-center">
          <div className="space-y-1">
            <p className="font-medium">
              {isStreakAtRisk 
                ? "⚠️ Streak at risk!" 
                : isStreakActive 
                ? "🔥 Streak active!" 
                : "Streak paused"}
            </p>
            <p className="text-xs text-muted-foreground">
              Current: {currentStreak} days
            </p>
            <p className="text-xs text-muted-foreground">
              Best: {longestStreak} days
            </p>
            {isStreakAtRisk && (
              <p className="text-xs text-yellow-600">
                Be active today to keep your streak!
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
