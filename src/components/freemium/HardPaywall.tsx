import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Lock, Crown, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

interface HardPaywallProps {
  requiredTier?: 'investor' | 'elite' | 'private';
  feature: string;
  children: ReactNode;
  isLocked: boolean;
  showTeaser?: boolean;
  teaserMessage?: string;
}

const tierLabels = {
  investor: 'Investor',
  elite: 'Elite',
  private: 'Private',
};

const tierColors = {
  investor: 'from-blue-500/20 to-blue-500/5 border-blue-500/30',
  elite: 'from-primary/20 to-primary/5 border-primary/30',
  private: 'from-amber-500/20 to-amber-500/5 border-amber-500/30',
};

export function HardPaywall({
  requiredTier = 'investor',
  feature,
  children,
  isLocked,
  showTeaser = true,
  teaserMessage,
}: HardPaywallProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleUpgradeClick = () => {
    if (!user) {
      localStorage.setItem('pending_checkout_tier', requiredTier);
      navigate('/auth');
    } else {
      navigate('/upgrade');
    }
  };

  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {/* Blurred/obscured content teaser */}
      {showTeaser && (
        <div className="absolute inset-0 overflow-hidden rounded-xl">
          <div className="blur-md opacity-30 pointer-events-none">
            {children}
          </div>
        </div>
      )}

      {/* Paywall overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`relative z-10 p-6 rounded-xl bg-gradient-to-br ${tierColors[requiredTier]} border backdrop-blur-sm`}
      >
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-14 h-14 rounded-full bg-card/80 border border-border flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-muted-foreground" />
          </div>
          
          <h3 className="font-heading text-xl text-foreground mb-2">
            {feature}
          </h3>
          
          <p className="text-muted-foreground text-sm mb-4 max-w-md">
            {teaserMessage || `Unlock ${feature.toLowerCase()} and get unlimited access to all investment tools.`}
          </p>

          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              Available to {tierLabels[requiredTier]}+ members
            </span>
          </div>

          <Button variant="gold" onClick={handleUpgradeClick} className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Upgrade to {tierLabels[requiredTier]}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
