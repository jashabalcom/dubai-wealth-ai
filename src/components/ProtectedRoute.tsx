import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useDevMode, getDevModeProfile } from '@/hooks/useDevMode';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredTier?: 'free' | 'investor' | 'elite';
}

export function ProtectedRoute({ children, requiredTier }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const { isDevMode, devTier } = useDevMode();
  const location = useLocation();

  // Dev mode bypass
  if (isDevMode) {
    const devProfile = getDevModeProfile(devTier);
    
    // Check tier requirements even in dev mode
    if (requiredTier) {
      const tierOrder = { free: 0, investor: 1, elite: 2 };
      const userTierLevel = tierOrder[devProfile.membership_tier] || 0;
      const requiredTierLevel = tierOrder[requiredTier] || 0;

      if (userTierLevel < requiredTierLevel) {
        return <Navigate to="/upgrade" replace />;
      }
    }
    
    return <>{children}</>;
  }

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

  // Check if subscription expired - redirect to upgrade page
  if (profile?.membership_status === 'expired' && profile?.membership_tier !== 'free') {
    // Only redirect if trying to access gated features (not settings, profile, etc.)
    const ungatedPaths = ['/settings', '/profile', '/upgrade', '/checkout', '/pricing'];
    const isUngatedPath = ungatedPaths.some(path => location.pathname.startsWith(path));
    
    if (!isUngatedPath && requiredTier && requiredTier !== 'free') {
      return <Navigate to="/upgrade" replace />;
    }
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
