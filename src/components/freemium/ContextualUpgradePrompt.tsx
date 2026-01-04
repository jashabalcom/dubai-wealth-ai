import { motion } from 'framer-motion';
import { Crown, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ContextualUpgradePromptProps {
  feature: string;
  description?: string;
  requiredTier?: 'investor' | 'elite' | 'private';
  variant?: 'inline' | 'card' | 'banner';
  className?: string;
}

export function ContextualUpgradePrompt({
  feature,
  description,
  requiredTier = 'investor',
  variant = 'card',
  className = '',
}: ContextualUpgradePromptProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const tierLabels = {
    investor: 'Investor',
    elite: 'Elite',
    private: 'Private',
  };

  const handleUpgradeClick = () => {
    if (!user) {
      sessionStorage.setItem('pending_checkout_tier', requiredTier);
      navigate('/auth');
    } else {
      navigate('/upgrade');
    }
  };

  if (variant === 'inline') {
    return (
      <span 
        className={`inline-flex items-center gap-1.5 text-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors ${className}`}
        onClick={handleUpgradeClick}
      >
        <Lock className="w-3.5 h-3.5" />
        Available to {tierLabels[requiredTier]} members
      </span>
    );
  }

  if (variant === 'banner') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 rounded-lg bg-primary/5 border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">{feature}</p>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        <Button variant="gold" size="sm" onClick={handleUpgradeClick} className="w-full sm:w-auto flex-shrink-0">
          Unlock Access
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </motion.div>
    );
  }

  // Card variant (default)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 ${className}`}
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Crown className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-heading text-lg text-foreground mb-1">
            {feature}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {description || `This feature is available to ${tierLabels[requiredTier]} members and above.`}
          </p>
          <Button variant="gold" onClick={handleUpgradeClick}>
            Unlock Access
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
