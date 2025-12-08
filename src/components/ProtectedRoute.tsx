import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredTier?: 'free' | 'investor' | 'elite';
}

export function ProtectedRoute({ children, requiredTier }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check membership tier if required
  if (requiredTier && profile) {
    const tierOrder = { free: 0, investor: 1, elite: 2 };
    const userTierLevel = tierOrder[profile.membership_tier] || 0;
    const requiredTierLevel = tierOrder[requiredTier] || 0;

    if (userTierLevel < requiredTierLevel) {
      return <Navigate to="/upgrade" replace />;
    }
  }

  return <>{children}</>;
}
