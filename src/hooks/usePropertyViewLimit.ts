import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

const STORAGE_KEY = 'anonymous_property_views';
const FREE_FULL_ACCESS_LIMIT = 5;  // Full access to all features
const FREE_PARTIAL_ACCESS_LIMIT = 10; // Score visible, breakdown locked

export type AccessLevel = 'full' | 'partial' | 'blocked';

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
}

export function usePropertyViewLimit(): UsePropertyViewLimitReturn {
  const { user } = useAuth();
  const [viewedProperties, setViewedProperties] = useState<string[]>([]);

  // Load viewed properties from localStorage on mount
  useEffect(() => {
    if (!user) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setViewedProperties(parsed);
          }
        } catch {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    }
  }, [user]);

  // Save to localStorage whenever viewedProperties changes
  useEffect(() => {
    if (!user && viewedProperties.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(viewedProperties));
    }
  }, [viewedProperties, user]);

  const viewCount = viewedProperties.length;
  const remainingFullViews = Math.max(0, FREE_FULL_ACCESS_LIMIT - viewCount);
  const remainingPartialViews = Math.max(0, FREE_PARTIAL_ACCESS_LIMIT - viewCount);
  
  // Logged-in users always have unlimited access
  const hasReachedLimit = !user && viewCount >= FREE_PARTIAL_ACCESS_LIMIT;
  
  // Show badge when ≤3 full views remaining (for anonymous users)
  const showRemainingBadge = !user && remainingFullViews > 0 && remainingFullViews <= 3;

  // Get access level based on current view count
  const getAccessLevel = useCallback((): AccessLevel => {
    if (user) return 'full';
    if (viewCount < FREE_FULL_ACCESS_LIMIT) return 'full';
    if (viewCount < FREE_PARTIAL_ACCESS_LIMIT) return 'partial';
    return 'blocked';
  }, [user, viewCount]);

  // Get access level for a specific property (considering if already viewed)
  const getPropertyAccessLevel = useCallback((propertyId: string): AccessLevel => {
    if (user) return 'full';
    
    const propertyIndex = viewedProperties.indexOf(propertyId);
    if (propertyIndex === -1) {
      // Not yet viewed - use current access level
      return getAccessLevel();
    }
    
    // Already viewed - access level is based on when it was first viewed
    if (propertyIndex < FREE_FULL_ACCESS_LIMIT) return 'full';
    if (propertyIndex < FREE_PARTIAL_ACCESS_LIMIT) return 'partial';
    return 'blocked';
  }, [user, viewedProperties, getAccessLevel]);

  const canViewProperty = useCallback((propertyId: string): boolean => {
    // Logged-in users can always view
    if (user) return true;
    // Already viewed properties don't count against limit
    if (viewedProperties.includes(propertyId)) return true;
    // Check if under limit
    return viewCount < FREE_PARTIAL_ACCESS_LIMIT;
  }, [user, viewedProperties, viewCount]);

  const trackView = useCallback((propertyId: string) => {
    // Don't track for logged-in users
    if (user) return;
    // Don't track if already viewed
    if (viewedProperties.includes(propertyId)) return;
    
    setViewedProperties(prev => [...prev, propertyId]);
  }, [user, viewedProperties]);

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
  };
}
