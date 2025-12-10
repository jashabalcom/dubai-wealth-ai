import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Check, Circle, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnboardingChecklistProps {
  profileComplete: boolean;
  actionsCompleted: {
    savedProperty: boolean;
    triedCalculator: boolean;
    exploredAcademy: boolean;
    joinedCommunity: boolean;
  };
  onOpenWizard: () => void;
  onDismiss: () => void;
}

export function OnboardingChecklist({
  profileComplete,
  actionsCompleted,
  onOpenWizard,
  onDismiss,
}: OnboardingChecklistProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const checklistItems = [
    { key: 'profile', label: 'Complete your profile', completed: profileComplete },
    { key: 'savedProperty', label: 'Save your first property', completed: actionsCompleted.savedProperty },
    { key: 'triedCalculator', label: 'Try an investment calculator', completed: actionsCompleted.triedCalculator },
    { key: 'exploredAcademy', label: 'Explore the Academy', completed: actionsCompleted.exploredAcademy },
    { key: 'joinedCommunity', label: 'Join the Community', completed: actionsCompleted.joinedCommunity },
  ];

  const completedCount = checklistItems.filter(item => item.completed).length;
  const totalCount = checklistItems.length;
  const progress = (completedCount / totalCount) * 100;

  // Hide if all items completed
  if (completedCount === totalCount) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed bottom-4 right-4 z-50 w-80"
    >
      <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div 
          className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-gold" />
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">Getting Started</div>
              <div className="text-xs text-muted-foreground">{completedCount} of {totalCount} complete</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                onDismiss();
              }}
            >
              <X className="w-4 h-4" />
            </Button>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-4">
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gold rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Checklist items */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-4 space-y-3">
                {checklistItems.map((item) => (
                  <div 
                    key={item.key}
                    className={`flex items-center gap-3 ${
                      item.key === 'profile' && !item.completed ? 'cursor-pointer' : ''
                    }`}
                    onClick={() => {
                      if (item.key === 'profile' && !item.completed) {
                        onOpenWizard();
                      }
                    }}
                  >
                    {item.completed ? (
                      <div className="w-5 h-5 rounded-full bg-gold flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-primary-dark" />
                      </div>
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    )}
                    <span className={`text-sm ${
                      item.completed ? 'text-muted-foreground line-through' : 'text-foreground'
                    }`}>
                      {item.label}
                    </span>
                  </div>
                ))}

                {!profileComplete && (
                  <Button 
                    variant="gold" 
                    size="sm" 
                    className="w-full mt-2"
                    onClick={onOpenWizard}
                  >
                    Complete Profile
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
