// Centralized tier access utility
// Defines tier hierarchy and provides consistent access checking across the app

export const TIER_LEVELS: Record<string, number> = {
  free: 0,
  investor: 1,
  elite: 2,
  private: 3,
};

export type TierLevel = 'free' | 'investor' | 'elite' | 'private';

/**
 * Check if a user's tier meets or exceeds the required tier level
 * @param userTier - The user's current membership tier
 * @param requiredTier - The minimum tier required for access
 * @returns boolean - true if user has access
 */
export function hasTierAccess(
  userTier: string | null | undefined,
  requiredTier: TierLevel
): boolean {
  const userLevel = TIER_LEVELS[userTier || 'free'] ?? 0;
  const requiredLevel = TIER_LEVELS[requiredTier];
  return userLevel >= requiredLevel;
}

/**
 * Check if user has Elite or higher tier access
 * Commonly used for Elite+ features
 */
export function hasEliteAccess(userTier: string | null | undefined): boolean {
  return hasTierAccess(userTier, 'elite');
}

/**
 * Check if user has Investor or higher tier access
 * Used for paid member features
 */
export function hasInvestorAccess(userTier: string | null | undefined): boolean {
  return hasTierAccess(userTier, 'investor');
}

/**
 * Check if user has Private tier access
 */
export function hasPrivateAccess(userTier: string | null | undefined): boolean {
  return hasTierAccess(userTier, 'private');
}
