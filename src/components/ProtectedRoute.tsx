import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredTier?: 'free' | 'investor' | 'elite' | 'private';
}

// Tier hierarchy: higher number = higher access level
const TIER_ORDER = { free: 0, investor: 1, elite: 2, private: 3 } as const;

export function ProtectedRoute({ children, requiredTier }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

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
    const userTierLevel = TIER_ORDER[profile.membership_tier as keyof typeof TIER_ORDER] ?? 0;
    const requiredTierLevel = TIER_ORDER[requiredTier] ?? 0;

    if (userTierLevel < requiredTierLevel) {
      return <Navigate to="/upgrade" replace />;
    }
  }

  return <>{children}</>;
}
