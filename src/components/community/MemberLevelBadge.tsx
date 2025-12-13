import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MemberLevelBadgeProps {
  level: number;
  points?: number;
  size?: 'sm' | 'md' | 'lg';
  showPoints?: boolean;
}

const LEVEL_NAMES = [
  'Prospect',
  'Explorer',
  'Researcher',
  'Investor',
  'Portfolio Builder',
  'Market Expert',
  'Dubai Insider',
  'Elite Investor',
  'Wealth Architect'
];

const LEVEL_COLORS = [
  'from-slate-400 to-slate-500',
  'from-green-400 to-green-500',
  'from-blue-400 to-blue-500',
  'from-purple-400 to-purple-500',
  'from-pink-400 to-pink-500',
  'from-orange-400 to-orange-500',
  'from-amber-400 to-amber-500',
  'from-gold to-amber-600',
  'from-gold via-amber-400 to-gold'
];

export function MemberLevelBadge({ 
  level, 
  points, 
  size = 'md', 
  showPoints = false 
}: MemberLevelBadgeProps) {
  const levelName = LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)];
  const levelColor = LEVEL_COLORS[Math.min(level - 1, LEVEL_COLORS.length - 1)];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        size === 'sm' && "px-2 py-0.5 text-xs",
        size === 'md' && "px-2.5 py-1 text-xs",
        size === 'lg' && "px-3 py-1.5 text-sm"
      )}
    >
      {/* Level Number Badge */}
      <span className={cn(
        "inline-flex items-center justify-center rounded-full bg-gradient-to-br text-white font-bold shadow-sm",
        levelColor,
        size === 'sm' && "h-4 w-4 text-[10px]",
        size === 'md' && "h-5 w-5 text-xs",
        size === 'lg' && "h-6 w-6 text-sm"
      )}>
        {level}
      </span>
      
      {/* Level Name */}
      <span className={cn(
        "text-muted-foreground",
        level >= 8 && "text-gold"
      )}>
        {levelName}
      </span>

      {/* Points (optional) */}
      {showPoints && points !== undefined && (
        <span className="text-muted-foreground/60">
          • {points} pts
        </span>
      )}
    </motion.div>
  );
}
