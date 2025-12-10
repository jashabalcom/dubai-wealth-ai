import React, { useState, createContext, useContext, ReactNode } from 'react';

export type DevTier = 'free' | 'investor' | 'elite';

interface DevModeState {
  isDevMode: boolean;
  devTier: DevTier;
  setDevMode: (enabled: boolean) => void;
  setDevTier: (tier: DevTier) => void;
}

const DevModeContext = createContext<DevModeState | null>(null);

const DEV_MODE_KEY = 'lovable_dev_mode';
const DEV_TIER_KEY = 'lovable_dev_tier';

export function useDevModeProvider() {
  const [isDevMode, setIsDevMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(DEV_MODE_KEY) === 'true';
  });
  
  const [devTier, setDevTierState] = useState<DevTier>(() => {
    if (typeof window === 'undefined') return 'elite';
    return (localStorage.getItem(DEV_TIER_KEY) as DevTier) || 'elite';
  });

  const setDevMode = (enabled: boolean) => {
    setIsDevMode(enabled);
    localStorage.setItem(DEV_MODE_KEY, String(enabled));
  };

  const setDevTier = (tier: DevTier) => {
    setDevTierState(tier);
    localStorage.setItem(DEV_TIER_KEY, tier);
  };

  return {
    isDevMode: import.meta.env.DEV && isDevMode,
    devTier,
    setDevMode,
    setDevTier,
  };
}

export function DevModeProvider({ children, value }: { children: ReactNode; value: DevModeState }) {
  return (
    <DevModeContext.Provider value={value}>
      {children}
    </DevModeContext.Provider>
  );
}

export function useDevMode() {
  const context = useContext(DevModeContext);
  if (!context) {
    // Return safe defaults if not in provider
    return {
      isDevMode: false,
      devTier: 'free' as DevTier,
      setDevMode: () => {},
      setDevTier: () => {},
    };
  }
  return context;
}

// Mock user for dev mode
export function getDevModeUser() {
  return {
    id: 'dev-user-id-12345',
    email: 'dev@test.com',
    created_at: new Date().toISOString(),
  };
}

export function getDevModeProfile(tier: DevTier) {
  return {
    id: 'dev-user-id-12345',
    email: 'dev@test.com',
    full_name: 'Dev Tester',
    membership_tier: tier,
    membership_status: 'active' as const,
    avatar_url: null,
    country: 'United States',
    investment_goal: 'Capital Growth',
    budget_range: '$500K - $1M',
    timeline: '6-12 months',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_visible_in_directory: true,
    bio: 'Testing user for development',
    looking_for: 'Investment opportunities',
    linkedin_url: null,
    stripe_customer_id: null,
    membership_renews_at: null,
    onboarding_step: 4,
    onboarding_completed_at: new Date().toISOString(),
  };
}
