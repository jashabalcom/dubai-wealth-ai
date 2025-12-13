import { motion } from 'framer-motion';
import { Lock, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface FeatureLockedOverlayProps {
  feature: string;
  description?: string;
}

export function FeatureLockedOverlay({ feature, description }: FeatureLockedOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-10 flex items-center justify-center bg-background/90 backdrop-blur-sm rounded-lg"
    >
      <div className="text-center p-6 max-w-sm">
        <div className="mx-auto w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center mb-4">
          <Lock className="h-6 w-6 text-gold" />
        </div>
        <h3 className="text-lg font-serif font-bold mb-2">{feature}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {description || 'Upgrade your membership to unlock this feature.'}
        </p>
        <Button asChild size="sm">
          <Link to="/pricing">
            <Sparkles className="h-4 w-4 mr-2" />
            Upgrade Now
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}
