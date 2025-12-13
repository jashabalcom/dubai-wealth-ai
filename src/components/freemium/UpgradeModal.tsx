import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Check, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: 'tools' | 'ai' | 'pdf' | 'community' | 'save-property';
  toolName?: string;
}

const featureContent = {
  tools: {
    title: "Unlock Unlimited Calculations",
    description: "You've used all your free calculations. Upgrade to get unlimited access to all investment tools.",
    benefits: [
      "Unlimited ROI calculations",
      "Full mortgage analysis",
      "Rent vs. Buy comparisons",
      "Airbnb yield projections",
      "PDF report exports"
    ]
  },
  ai: {
    title: "Unlock Unlimited AI Insights",
    description: "You've used all your free AI queries. Upgrade for unlimited personalized investment advice.",
    benefits: [
      "Unlimited AI consultations",
      "Property analysis on demand",
      "Market trend insights",
      "Personalized recommendations",
      "Save investment strategies (Elite)"
    ]
  },
  pdf: {
    title: "Export Professional Reports",
    description: "PDF export is a premium feature. Upgrade to download and share your investment analyses.",
    benefits: [
      "Professional PDF reports",
      "Share with partners",
      "Keep records offline",
      "Branded analysis documents"
    ]
  },
  community: {
    title: "Join the Conversation",
    description: "Upgrade to actively participate in our investor community.",
    benefits: [
      "Create posts and discussions",
      "Comment and engage",
      "Connect with members",
      "Direct messaging",
      "Event registration"
    ]
  },
  'save-property': {
    title: "Save Property to Calculator",
    description: "Upgrade to auto-populate calculators with property data for instant analysis.",
    benefits: [
      "One-click property analysis",
      "Auto-fill calculator fields",
      "Compare multiple properties",
      "Track investment potential"
    ]
  }
};

export function UpgradeModal({ isOpen, onClose, feature, toolName }: UpgradeModalProps) {
  const content = featureContent[feature];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
              {/* Header with gradient */}
              <div className="bg-gradient-to-br from-gold/20 via-gold/10 to-transparent p-6 relative">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-background/50 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-gold/20 rounded-full">
                    <Lock className="h-5 w-5 text-gold" />
                  </div>
                  <h2 className="text-xl font-serif font-bold">{content.title}</h2>
                </div>
                <p className="text-muted-foreground text-sm">{content.description}</p>
              </div>

              {/* Benefits */}
              <div className="p-6 space-y-3">
                {content.benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="p-1 bg-gold/20 rounded-full">
                      <Check className="h-3 w-3 text-gold" />
                    </div>
                    <span className="text-sm">{benefit}</span>
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <div className="p-6 pt-0 space-y-3">
                <Button asChild className="w-full" size="lg">
                  <Link to="/pricing" onClick={onClose}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    View Membership Plans
                  </Link>
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Start with a 14-day free trial. Cancel anytime.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
