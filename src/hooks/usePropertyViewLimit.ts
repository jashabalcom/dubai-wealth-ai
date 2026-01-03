import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

const ANONYMOUS_STORAGE_KEY = 'anonymous_property_views';
const FREE_TIER_STORAGE_KEY_PREFIX = 'free_tier_property_views_';

// Tier-based view limits
const VIEW_LIMITS = {
  anonymous: { full: 5, partial: 3 },     // 8 total before blocked
  free: { full: 20, partial: 10 },        // 30 total before blocked
  investor: { full: Infinity, partial: Infinity },
  elite: { full: Infinity, partial: Infinity },
  private: { full: Infinity, partial: Infinity },
};

export type AccessLevel = 'full' | 'partial' | 'blocked';
export type UserTier = 'anonymous' | 'free' | 'investor' | 'elite' | 'private';

interface UsePropertyViewLimitReturn {
  viewCount: number;
  remainingFullViews: number;
  remainingPartialViews: number;
  hasReachedLimit: boolean;
  accessLevel: AccessLevel;
  trackView: (propertyId: string) => void;
  canViewProperty: (propertyId: string) => boolean;
  getPropertyAccessLevel: (propertyId: string) => AccessLevel;
  showRemainingBadge: boolean;
  userTier: UserTier;
  totalFullLimit: number;
  totalPartialLimit: number;
  isPaidMember: boolean;
}

export function usePropertyViewLimit(): UsePropertyViewLimitReturn {
  const { user, profile } = useAuth();
  const [viewedProperties, setViewedProperties] = useState<string[]>([]);

  // Determine user tier
  const membershipTier = profile?.membership_tier;
  const isPaidMember = membershipTier !== undefined && 
    ['investor', 'elite', 'private'].includes(membershipTier);
  
  const userTier: UserTier = !user 
    ? 'anonymous' 
    : isPaidMember 
      ? (membershipTier as UserTier)
      : 'free';

  const limits = VIEW_LIMITS[userTier];
  const totalFullLimit = limits.full;
  const totalPartialLimit = limits.full + limits.partial;

  // Get storage key based on user type
  const getStorageKey = useCallback(() => {
    if (!user) return ANONYMOUS_STORAGE_KEY;
    if (isPaidMember) return null; // Paid members don't need tracking
    return `${FREE_TIER_STORAGE_KEY_PREFIX}${user.id}`;
  }, [user, isPaidMember]);

  // Load viewed properties from localStorage on mount
  useEffect(() => {
    const storageKey = getStorageKey();
    if (!storageKey) {
      setViewedProperties([]);
      return;
    }

    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setViewedProperties(parsed);
        }
      } catch {
        localStorage.removeItem(storageKey);
      }
    } else {
      setViewedProperties([]);
    }
  }, [getStorageKey]);

  // Save to localStorage whenever viewedProperties changes
  useEffect(() => {
    const storageKey = getStorageKey();
    if (!storageKey) return;
    
    if (viewedProperties.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(viewedProperties));
    }
  }, [viewedProperties, getStorageKey]);

  const viewCount = viewedProperties.length;
  const remainingFullViews = Math.max(0, totalFullLimit - viewCount);
  const remainingPartialViews = Math.max(0, totalPartialLimit - viewCount);
  
  // Paid members never hit limits
  const hasReachedLimit = !isPaidMember && viewCount >= totalPartialLimit;
  
  // Show badge when ≤5 full views remaining (for non-paid users)
  const showRemainingBadge = !isPaidMember && remainingFullViews > 0 && remainingFullViews <= 5;

  // Get access level based on current view count
  const getAccessLevel = useCallback((): AccessLevel => {
    if (isPaidMember) return 'full';
    if (viewCount < totalFullLimit) return 'full';
    if (viewCount < totalPartialLimit) return 'partial';
    return 'blocked';
  }, [isPaidMember, viewCount, totalFullLimit, totalPartialLimit]);

  // Get access level for a specific property (considering if already viewed)
  const getPropertyAccessLevel = useCallback((propertyId: string): AccessLevel => {
    if (isPaidMember) return 'full';
    
    const propertyIndex = viewedProperties.indexOf(propertyId);
    if (propertyIndex === -1) {
      // Not yet viewed - use current access level
      return getAccessLevel();
    }
    
    // Already viewed - access level is based on when it was first viewed
    if (propertyIndex < totalFullLimit) return 'full';
    if (propertyIndex < totalPartialLimit) return 'partial';
    return 'blocked';
  }, [isPaidMember, viewedProperties, getAccessLevel, totalFullLimit, totalPartialLimit]);

  const canViewProperty = useCallback((propertyId: string): boolean => {
    // Paid members can always view
    if (isPaidMember) return true;
    // Already viewed properties don't count against limit
    if (viewedProperties.includes(propertyId)) return true;
    // Check if under limit
    return viewCount < totalPartialLimit;
  }, [isPaidMember, viewedProperties, viewCount, totalPartialLimit]);

  const trackView = useCallback((propertyId: string) => {
    // Don't track for paid members
    if (isPaidMember) return;
    // Don't track if already viewed
    if (viewedProperties.includes(propertyId)) return;
    
    setViewedProperties(prev => [...prev, propertyId]);
  }, [isPaidMember, viewedProperties]);

  return {
    viewCount,
    remainingFullViews,
    remainingPartialViews,
    hasReachedLimit,
    accessLevel: getAccessLevel(),
    trackView,
    canViewProperty,
    getPropertyAccessLevel,
    showRemainingBadge,
    userTier,
    totalFullLimit,
    totalPartialLimit,
    isPaidMember,
  };
}
