import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

const STORAGE_KEY = 'anonymous_property_views';
const FREE_VIEW_LIMIT = 5;

interface UsePropertyViewLimitReturn {
  viewCount: number;
  remainingViews: number;
  hasReachedLimit: boolean;
  trackView: (propertyId: string) => void;
  canViewProperty: (propertyId: string) => boolean;
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
  const remainingViews = Math.max(0, FREE_VIEW_LIMIT - viewCount);
  
  // Logged-in users always have unlimited access
  const hasReachedLimit = !user && viewCount >= FREE_VIEW_LIMIT;

  const canViewProperty = useCallback((propertyId: string): boolean => {
    // Logged-in users can always view
    if (user) return true;
    // Already viewed properties don't count against limit
    if (viewedProperties.includes(propertyId)) return true;
    // Check if under limit
    return viewCount < FREE_VIEW_LIMIT;
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
    remainingViews,
    hasReachedLimit,
    trackView,
    canViewProperty,
  };
}
