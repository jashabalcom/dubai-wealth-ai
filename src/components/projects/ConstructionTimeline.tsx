import { motion } from 'framer-motion';
import { Check, Clock, Calendar, Hammer, Building2, Wrench, Paintbrush, Key } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO, differenceInMonths, addMonths } from 'date-fns';

interface ConstructionTimelineProps {
  status: string;
  launchDate?: string | null;
  handoverDate?: string | null;
  progressPercent?: number | null;
  brandColor?: string;
}

interface Milestone {
  id: string;
  label: string;
  icon: React.ElementType;
  progressRange: [number, number];
}

const MILESTONES: Milestone[] = [
  { id: 'launch', label: 'Project Launch', icon: Calendar, progressRange: [0, 5] },
  { id: 'foundation', label: 'Foundation', icon: Hammer, progressRange: [5, 20] },
  { id: 'structure', label: 'Structure', icon: Building2, progressRange: [20, 50] },
  { id: 'mep', label: 'MEP Works', icon: Wrench, progressRange: [50, 70] },
  { id: 'finishing', label: 'Finishing', icon: Paintbrush, progressRange: [70, 95] },
  { id: 'handover', label: 'Handover', icon: Key, progressRange: [95, 100] },
];

export function ConstructionTimeline({
  status,
  launchDate,
  handoverDate,
  progressPercent = 0,
  brandColor
}: ConstructionTimelineProps) {
  const progress = progressPercent ?? 0;
  
  // Calculate estimated dates for milestones
  const getEstimatedDate = (milestone: Milestone): string | null => {
    if (!launchDate || !handoverDate) return null;
    
    try {
      const start = parseISO(launchDate);
      const end = parseISO(handoverDate);
      const totalMonths = differenceInMonths(end, start);
      
      const midPoint = (milestone.progressRange[0] + milestone.progressRange[1]) / 2;
      const monthsFromStart = Math.round((midPoint / 100) * totalMonths);
      
      return format(addMonths(start, monthsFromStart), 'MMM yyyy');
    } catch {
      return null;
    }
  };

  const getMilestoneStatus = (milestone: Milestone): 'completed' | 'current' | 'upcoming' => {
    if (progress >= milestone.progressRange[1]) return 'completed';
    if (progress >= milestone.progressRange[0]) return 'current';
    return 'upcoming';
  };

  // For ready/completed projects, show simple completed state
  if (status === 'ready' || status === 'completed' || progress >= 100) {
    return (
      <div className="bg-muted/50 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: brandColor || 'hsl(var(--primary))' }}
          >
            <Key className="h-6 w-6 text-white" />
          </div>
          <div>
            <h4 className="font-semibold">Project Complete</h4>
            <p className="text-sm text-muted-foreground">
              {handoverDate ? `Completed ${format(parseISO(handoverDate), 'MMMM yyyy')}` : 'Ready for handover'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Construction Progress</h3>
      
      {/* Progress Bar */}
      <div className="relative h-3 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ backgroundColor: brandColor || 'hsl(var(--primary))' }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">
          {launchDate && format(parseISO(launchDate), 'MMM yyyy')}
        </span>
        <span className="font-semibold" style={{ color: brandColor }}>
          {progress}% Complete
        </span>
        <span className="text-muted-foreground">
          {handoverDate && format(parseISO(handoverDate), 'MMM yyyy')}
        </span>
      </div>

      {/* Timeline Milestones - Desktop Horizontal */}
      <div className="hidden md:block pt-6">
        <div className="relative">
          {/* Connection Line */}
          <div className="absolute top-6 left-0 right-0 h-0.5 bg-muted" />
          <div 
            className="absolute top-6 left-0 h-0.5 transition-all duration-1000"
            style={{ 
              width: `${progress}%`,
              backgroundColor: brandColor || 'hsl(var(--primary))'
            }}
          />

          {/* Milestone Points */}
          <div className="relative flex justify-between">
            {MILESTONES.map((milestone, index) => {
              const milestoneStatus = getMilestoneStatus(milestone);
              const Icon = milestone.icon;
              const estimatedDate = getEstimatedDate(milestone);

              return (
                <motion.div
                  key={milestone.id}
                  className="flex flex-col items-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {/* Icon Circle */}
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center border-2 bg-background z-10 transition-all",
                      milestoneStatus === 'completed' && "border-transparent",
                      milestoneStatus === 'current' && "border-transparent ring-4 ring-primary/30",
                      milestoneStatus === 'upcoming' && "border-muted-foreground/30"
                    )}
                    style={{
                      backgroundColor: milestoneStatus !== 'upcoming' 
                        ? (brandColor || 'hsl(var(--primary))') 
                        : undefined
                    }}
                  >
                    {milestoneStatus === 'completed' ? (
                      <Check className="h-5 w-5 text-white" />
                    ) : (
                      <Icon 
                        className={cn(
                          "h-5 w-5",
                          milestoneStatus === 'current' && "text-white",
                          milestoneStatus === 'upcoming' && "text-muted-foreground/50"
                        )}
                      />
                    )}
                  </div>

                  {/* Label */}
                  <span 
                    className={cn(
                      "mt-3 text-sm font-medium text-center max-w-[80px]",
                      milestoneStatus === 'upcoming' && "text-muted-foreground/60"
                    )}
                  >
                    {milestone.label}
                  </span>

                  {/* Date */}
                  {estimatedDate && (
                    <span className="text-xs text-muted-foreground mt-1">
                      {estimatedDate}
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Timeline Milestones - Mobile Vertical */}
      <div className="md:hidden space-y-4 pt-4">
        {MILESTONES.map((milestone, index) => {
          const milestoneStatus = getMilestoneStatus(milestone);
          const Icon = milestone.icon;
          const estimatedDate = getEstimatedDate(milestone);

          return (
            <motion.div
              key={milestone.id}
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Icon */}
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                  milestoneStatus === 'upcoming' && "bg-muted"
                )}
                style={{
                  backgroundColor: milestoneStatus !== 'upcoming' 
                    ? (brandColor || 'hsl(var(--primary))') 
                    : undefined
                }}
              >
                {milestoneStatus === 'completed' ? (
                  <Check className="h-4 w-4 text-white" />
                ) : (
                  <Icon 
                    className={cn(
                      "h-4 w-4",
                      milestoneStatus !== 'upcoming' && "text-white",
                      milestoneStatus === 'upcoming' && "text-muted-foreground/50"
                    )}
                  />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span 
                    className={cn(
                      "font-medium",
                      milestoneStatus === 'upcoming' && "text-muted-foreground/60"
                    )}
                  >
                    {milestone.label}
                  </span>
                  {milestoneStatus === 'current' && (
                    <span 
                      className="text-xs px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: brandColor || 'hsl(var(--primary))' }}
                    >
                      In Progress
                    </span>
                  )}
                </div>
                {estimatedDate && (
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {estimatedDate}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
