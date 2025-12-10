import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';

interface TrialBannerProps {
  trialEnd: string | null;
  tier: string;
}

export function TrialBanner({ trialEnd, tier }: TrialBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<{
    days: number;
    hours: number;
    minutes: number;
  } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!trialEnd) return;

    const calculateTimeRemaining = () => {
      const now = new Date();
      const end = new Date(trialEnd);
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining(null);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeRemaining({ days, hours, minutes });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [trialEnd]);

  if (dismissed || !timeRemaining || !trialEnd) return null;

  const tierName = tier === 'elite' ? 'Dubai Elite Investor' : 'Dubai Investor';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed top-16 left-0 right-0 z-40 px-4 py-2"
      >
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-primary/90 to-primary rounded-lg shadow-lg border border-primary-foreground/20 px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-foreground/10 rounded-full">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span className="text-sm font-medium text-primary-foreground">
                  {tierName} Trial
                </span>
                <div className="flex items-center gap-1.5 text-primary-foreground/90">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="text-sm font-mono">
                    {timeRemaining.days}d {timeRemaining.hours}h {timeRemaining.minutes}m remaining
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => navigate('/settings')}
                className="text-xs h-7"
              >
                Manage Subscription
              </Button>
              <button
                onClick={() => setDismissed(true)}
                className="p-1 hover:bg-primary-foreground/10 rounded text-primary-foreground/70 hover:text-primary-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
