import { useState, useEffect, useCallback } from 'react';

interface RecentlyViewedProperty {
  id: string;
  slug: string;
  title: string;
  location_area: string;
  price_aed: number;
  images: string[];
  viewedAt: number;
}

const STORAGE_KEY = 'recently_viewed_properties';
const MAX_ITEMS = 10;

export function useRecentlyViewed() {
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedProperty[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Filter out items older than 30 days
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        const filtered = parsed.filter((item: RecentlyViewedProperty) => item.viewedAt > thirtyDaysAgo);
        setRecentlyViewed(filtered);
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  const addToRecentlyViewed = useCallback((property: {
    id: string;
    slug: string;
    title: string;
    location_area: string;
    price_aed: number;
    images: string[];
  }) => {
    setRecentlyViewed(prev => {
      // Remove if already exists
      const filtered = prev.filter(p => p.id !== property.id);
      
      // Add to front with timestamp
      const updated = [
        { ...property, viewedAt: Date.now() },
        ...filtered
      ].slice(0, MAX_ITEMS);

      // Persist to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore storage errors
      }

      return updated;
    });
  }, []);

  const clearRecentlyViewed = useCallback(() => {
    setRecentlyViewed([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }, []);

  return {
    recentlyViewed,
    addToRecentlyViewed,
    clearRecentlyViewed,
  };
}
