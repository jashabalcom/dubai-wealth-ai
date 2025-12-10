import { motion } from 'framer-motion';
import { Building2, Calculator, GraduationCap, Users, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FirstActionPromptsProps {
  actionsCompleted: {
    savedProperty: boolean;
    triedCalculator: boolean;
    exploredAcademy: boolean;
    joinedCommunity: boolean;
  };
  onActionClick: (action: 'savedProperty' | 'triedCalculator' | 'exploredAcademy' | 'joinedCommunity') => void;
}

const actions = [
  {
    key: 'savedProperty' as const,
    icon: Building2,
    title: 'Save Your First Property',
    description: 'Browse and bookmark properties you like',
    href: '/properties',
    color: 'bg-emerald-500/10 text-emerald-500',
  },
  {
    key: 'triedCalculator' as const,
    icon: Calculator,
    title: 'Try the ROI Calculator',
    description: 'Analyze potential investment returns',
    href: '/tools/roi-calculator',
    color: 'bg-purple-500/10 text-purple-500',
  },
  {
    key: 'exploredAcademy' as const,
    icon: GraduationCap,
    title: 'Explore the Academy',
    description: 'Start learning about Dubai real estate',
    href: '/academy',
    color: 'bg-blue-500/10 text-blue-500',
  },
  {
    key: 'joinedCommunity' as const,
    icon: Users,
    title: 'Join the Community',
    description: 'Connect with other investors',
    href: '/community',
    color: 'bg-orange-500/10 text-orange-500',
  },
];

export function FirstActionPrompts({ actionsCompleted, onActionClick }: FirstActionPromptsProps) {
  const navigate = useNavigate();
  const completedCount = Object.values(actionsCompleted).filter(Boolean).length;
  
  // Hide if all actions completed
  if (completedCount >= 4) return null;

  const handleClick = (action: typeof actions[0]) => {
    onActionClick(action.key);
    navigate(action.href);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="mb-8"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-xl text-foreground">Get Started</h2>
        <span className="text-sm text-muted-foreground">
          {completedCount} of {actions.length} complete
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, index) => {
          const isCompleted = actionsCompleted[action.key];
          
          return (
            <motion.button
              key={action.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
              onClick={() => handleClick(action)}
              className={`relative p-5 rounded-xl text-left transition-all duration-300 ${
                isCompleted
                  ? 'bg-muted/30 border border-gold/20'
                  : 'bg-card border border-border hover:border-gold/30 hover:shadow-lg'
              }`}
            >
              {isCompleted && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-gold flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary-dark" />
                </div>
              )}
              
              <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center mb-4`}>
                <action.icon className="w-6 h-6" />
              </div>
              
              <h3 className={`font-medium mb-1 ${isCompleted ? 'text-muted-foreground' : 'text-foreground'}`}>
                {action.title}
              </h3>
              <p className="text-sm text-muted-foreground">{action.description}</p>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
