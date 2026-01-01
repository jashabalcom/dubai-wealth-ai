import { motion } from 'framer-motion';
import { HardHat } from 'lucide-react';

interface ConstructionProgressBarProps {
  progress: number;
  brandColor?: string;
  showLabel?: boolean;
}

export function ConstructionProgressBar({ 
  progress, 
  brandColor,
  showLabel = true 
}: ConstructionProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  
  const getProgressLabel = () => {
    if (clampedProgress < 25) return 'Foundation';
    if (clampedProgress < 50) return 'Structure';
    if (clampedProgress < 75) return 'MEP & Interiors';
    if (clampedProgress < 95) return 'Finishing';
    return 'Near Completion';
  };

  return (
    <div className="space-y-2">
      {showLabel && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <HardHat className="h-4 w-4 text-amber-500" />
            <span className="text-muted-foreground">Construction Progress</span>
          </div>
          <span className="text-sm font-medium text-foreground">{clampedProgress}%</span>
        </div>
      )}
      
      <div className="relative h-3 bg-muted/50 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ 
            backgroundColor: brandColor || 'hsl(var(--primary))',
            boxShadow: `0 0 10px ${brandColor || 'hsl(var(--primary))'}`
          }}
        />
        
        {/* Progress markers */}
        <div className="absolute inset-0 flex justify-between px-0.5">
          {[25, 50, 75].map((marker) => (
            <div
              key={marker}
              className="w-px h-full bg-background/30"
              style={{ marginLeft: `${marker}%` }}
            />
          ))}
        </div>
      </div>
      
      {showLabel && (
        <p className="text-xs text-muted-foreground text-center">
          {getProgressLabel()}
        </p>
      )}
    </div>
  );
}
