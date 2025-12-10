import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bug, ChevronUp, Crown, User, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDevMode, DevTier } from '@/hooks/useDevMode';
import { cn } from '@/lib/utils';

const tiers: { value: DevTier; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'free', label: 'Free', icon: <User className="h-3 w-3" />, color: 'text-muted-foreground' },
  { value: 'investor', label: 'Investor', icon: <UserCheck className="h-3 w-3" />, color: 'text-blue-400' },
  { value: 'elite', label: 'Elite', icon: <Crown className="h-3 w-3" />, color: 'text-gold' },
];

export function DevModeToggle() {
  const { isDevMode, devTier, setDevMode, setDevTier } = useDevMode();
  const [isExpanded, setIsExpanded] = useState(false);

  // Only show in development
  if (!import.meta.env.DEV) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[9999]">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-14 left-0 bg-card border border-border rounded-lg shadow-xl p-3 min-w-[200px]"
          >
            <div className="space-y-3">
              {/* Dev Mode Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Dev Mode</span>
                <button
                  onClick={() => setDevMode(!isDevMode)}
                  className={cn(
                    'relative w-10 h-5 rounded-full transition-colors',
                    isDevMode ? 'bg-green-500' : 'bg-muted'
                  )}
                >
                  <motion.div
                    animate={{ x: isDevMode ? 20 : 2 }}
                    className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow"
                  />
                </button>
              </div>

              {/* Tier Selection */}
              {isDevMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-2"
                >
                  <span className="text-xs text-muted-foreground">Test as:</span>
                  <div className="flex gap-1">
                    {tiers.map((tier) => (
                      <button
                        key={tier.value}
                        onClick={() => setDevTier(tier.value)}
                        className={cn(
                          'flex-1 flex flex-col items-center gap-1 px-2 py-1.5 rounded text-xs transition-colors',
                          devTier === tier.value
                            ? 'bg-primary/20 border border-primary/30'
                            : 'bg-muted/50 hover:bg-muted'
                        )}
                      >
                        <span className={tier.color}>{tier.icon}</span>
                        <span className="text-[10px]">{tier.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Status */}
              <div className="text-[10px] text-muted-foreground pt-2 border-t border-border">
                {isDevMode ? (
                  <span className="text-green-400">
                    ✓ Bypassing auth as {devTier} user
                  </span>
                ) : (
                  <span>Normal auth mode</span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <Button
        size="sm"
        variant={isDevMode ? 'default' : 'outline'}
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'h-10 w-10 rounded-full p-0 shadow-lg',
          isDevMode && 'bg-green-600 hover:bg-green-700 border-green-500'
        )}
      >
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <Bug className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
