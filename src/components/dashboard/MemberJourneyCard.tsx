import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Compass, 
  Calculator, 
  Search, 
  FileCheck, 
  Building2, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMemberJourney, JourneyStageInfo } from '@/hooks/useMemberJourney';
import { cn } from '@/lib/utils';

const stageIcons = {
  compass: Compass,
  calculator: Calculator,
  search: Search,
  'file-check': FileCheck,
  building: Building2,
};

function StageNode({ 
  stage, 
  currentStage, 
  isLast 
}: { 
  stage: JourneyStageInfo; 
  currentStage: number;
  isLast: boolean;
}) {
  const Icon = stageIcons[stage.icon];
  const isCompleted = currentStage > stage.stage;
  const isCurrent = currentStage === stage.stage;
  const isLocked = currentStage < stage.stage;

  return (
    <div className="flex items-center">
      <div className="relative flex flex-col items-center">
        {/* Stage circle */}
        <motion.div
          initial={false}
          animate={{
            scale: isCurrent ? 1.1 : 1,
          }}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
            isCompleted && "bg-gold text-primary-dark",
            isCurrent && "bg-gold/20 border-2 border-gold text-gold ring-4 ring-gold/20",
            isLocked && "bg-muted/50 text-muted-foreground border border-border"
          )}
        >
          <Icon className="w-4 h-4" />
        </motion.div>
        
        {/* Stage label (shown on hover/current) */}
        <span className={cn(
          "absolute -bottom-6 text-[10px] font-medium whitespace-nowrap transition-opacity",
          isCurrent ? "opacity-100 text-gold" : "opacity-0 group-hover:opacity-70 text-muted-foreground"
        )}>
          {stage.name}
        </span>
      </div>

      {/* Connector line */}
      {!isLast && (
        <div className={cn(
          "w-8 sm:w-12 h-0.5 mx-1",
          isCompleted ? "bg-gold" : "bg-border"
        )} />
      )}
    </div>
  );
}

export function MemberJourneyCard() {
  const navigate = useNavigate();
  const { data: journey, isLoading } = useMemberJourney();

  if (isLoading) {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-5">
          <div className="h-24 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!journey) return null;

  const handleMilestoneClick = () => {
    if (journey.nextMilestoneAction) {
      navigate(journey.nextMilestoneAction);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-card via-card to-gold/5 border-border/50 overflow-hidden">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gold/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-gold" />
            </div>
            <div>
              <h3 className="font-heading text-sm font-medium text-foreground">
                Your Investor Journey
              </h3>
              <p className="text-[10px] text-muted-foreground">
                Stage {journey.currentStage} of 5
              </p>
            </div>
          </div>
          
          {/* Current stage badge */}
          <div className="px-3 py-1.5 rounded-full bg-gold/20 border border-gold/30">
            <span className="text-xs font-medium text-gold">
              {journey.stageName}
            </span>
          </div>
        </div>

        {/* Stage Progress Bar */}
        <div className="group flex items-center justify-center mb-8 pt-1">
          {journey.allStages.map((stage, index) => (
            <StageNode
              key={stage.stage}
              stage={stage}
              currentStage={journey.currentStage}
              isLast={index === journey.allStages.length - 1}
            />
          ))}
        </div>

        {/* Current Stage Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-0.5">
              {journey.stageDescription}
            </p>
            <p className="text-sm font-medium text-foreground">
              {journey.nextMilestone}
            </p>
          </div>
          
          {journey.nextMilestoneAction && journey.currentStage < 5 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMilestoneClick}
              className="text-gold hover:text-gold hover:bg-gold/10 shrink-0"
            >
              Take Action
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>

        {/* Progress indicator for current stage */}
        {journey.currentStage < 5 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1.5">
              <span>Progress to next stage</span>
              <span>{journey.progress}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${journey.progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-gold to-amber-400 rounded-full"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
