import { ReactNode } from 'react';
import { Lock, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface NeighborhoodTierGateProps {
  children: ReactNode;
  requiredTier: 'investor' | 'elite';
  feature: string;
  previewCount?: number;
  currentCount?: number;
}

export function NeighborhoodTierGate({ 
  children, 
  requiredTier, 
  feature,
  previewCount,
  currentCount 
}: NeighborhoodTierGateProps) {
  const { profile, user } = useAuth();
  
  const tierOrder = { free: 0, investor: 1, elite: 2, private: 3 };
  const userTier = profile?.membership_tier || 'free';
  const userTierLevel = tierOrder[userTier as keyof typeof tierOrder] || 0;
  const requiredTierLevel = tierOrder[requiredTier] || 0;
  
  const hasAccess = userTierLevel >= requiredTierLevel;
  
  // If no preview limit or user has access, show full content
  if (hasAccess) {
    return <>{children}</>;
  }
  
  // If within preview limit, show content
  if (previewCount !== undefined && currentCount !== undefined && currentCount < previewCount) {
    return <>{children}</>;
  }
  
  // Show locked state
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background z-10 flex items-end justify-center pb-8">
        <div className="text-center p-6 rounded-xl bg-card/95 border border-primary/20 backdrop-blur-sm max-w-md">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            {requiredTier === 'elite' ? (
              <Crown className="h-6 w-6 text-primary" />
            ) : (
              <Lock className="h-6 w-6 text-primary" />
            )}
          </div>
          <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
            {requiredTier === 'elite' ? 'Elite Members Only' : 'Premium Content'}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Upgrade to {requiredTier === 'elite' ? 'Elite' : 'Investor'} to access {feature}
          </p>
          <Button asChild variant="hero" size="sm">
            <Link to={user ? "/upgrade" : "/pricing"}>
              Upgrade Now
            </Link>
          </Button>
        </div>
      </div>
      <div className="opacity-30 pointer-events-none">
        {children}
      </div>
    </div>
  );
}
