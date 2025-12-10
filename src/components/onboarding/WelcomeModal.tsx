import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Building2, TrendingUp, Users, Sparkles, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface WelcomeModalProps {
  isOpen: boolean;
  userName?: string;
  onStartWizard: () => void;
  onExplore: () => void;
}

const features = [
  {
    icon: GraduationCap,
    title: 'Academy',
    description: 'Master Dubai real estate with expert-led courses',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    icon: Building2,
    title: 'Properties',
    description: 'Browse exclusive investment opportunities',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
  },
  {
    icon: TrendingUp,
    title: 'Investment Tools',
    description: 'Calculate ROI, mortgage & more',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    icon: Users,
    title: 'Community',
    description: 'Connect with global investors',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
];

export function WelcomeModal({ isOpen, userName, onStartWizard, onExplore }: WelcomeModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-lg p-0 overflow-hidden bg-card border-border"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Header with gradient */}
              <div className="relative px-6 pt-8 pb-6 bg-gradient-to-br from-gold/20 via-gold/10 to-transparent">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="w-16 h-16 rounded-2xl bg-gold flex items-center justify-center mx-auto mb-4"
                >
                  <Sparkles className="w-8 h-8 text-primary-dark" />
                </motion.div>
                
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="font-heading text-2xl text-center text-foreground"
                >
                  Welcome{userName ? `, ${userName}` : ''}!
                </motion.h2>
                
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-muted-foreground text-center mt-2"
                >
                  Your journey to Dubai real estate success starts here
                </motion.p>
              </div>

              {/* Features grid */}
              <div className="px-6 py-6">
                <div className="grid grid-cols-2 gap-3">
                  {features.map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="p-4 rounded-xl bg-muted/50 border border-border hover:border-gold/30 transition-colors"
                    >
                      <div className={`w-10 h-10 rounded-lg ${feature.bgColor} flex items-center justify-center mb-3`}>
                        <feature.icon className={`w-5 h-5 ${feature.color}`} />
                      </div>
                      <h3 className="font-medium text-foreground text-sm">{feature.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="px-6 pb-6 space-y-3"
              >
                <Button 
                  variant="gold" 
                  className="w-full" 
                  size="lg"
                  onClick={onStartWizard}
                >
                  Complete Your Profile
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full text-muted-foreground hover:text-foreground" 
                  onClick={onExplore}
                >
                  Skip for now, explore platform
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
