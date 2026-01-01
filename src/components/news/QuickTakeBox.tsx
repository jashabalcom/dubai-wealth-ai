import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickTakeBoxProps {
  quickTake: string;
  className?: string;
}

export function QuickTakeBox({ quickTake, className }: QuickTakeBoxProps) {
  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-gold/20 via-gold/10 to-transparent border border-gold/30",
        className
      )}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            hsl(var(--gold)) 10px,
            hsl(var(--gold)) 11px
          )`
        }} />
      </div>
      
      <div className="relative flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
          <Zap className="h-6 w-6 text-gold" />
        </div>
        <div className="flex-1">
          <span className="text-xs font-bold uppercase tracking-wider text-gold mb-2 block">
            Quick-Take
          </span>
          <p className="text-lg md:text-xl font-semibold text-foreground leading-snug">
            {quickTake}
          </p>
        </div>
      </div>
    </div>
  );
}
