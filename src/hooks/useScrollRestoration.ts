import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const scrollPositions = new Map<string, number>();

export function useScrollRestoration(key?: string) {
  const location = useLocation();
  const scrollKey = key || location.pathname;
  const isRestoring = useRef(false);

  // Save scroll position when navigating away
  useEffect(() => {
    const handleBeforeUnload = () => {
      scrollPositions.set(scrollKey, window.scrollY);
    };

    // Save position before navigation
    return () => {
      if (!isRestoring.current) {
        scrollPositions.set(scrollKey, window.scrollY);
      }
    };
  }, [scrollKey]);

  // Restore scroll position when returning
  useEffect(() => {
    const savedPosition = scrollPositions.get(scrollKey);
    if (savedPosition !== undefined) {
      isRestoring.current = true;
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        window.scrollTo(0, savedPosition);
        // Reset the flag after a short delay
        setTimeout(() => {
          isRestoring.current = false;
        }, 100);
      });
    }
  }, [scrollKey]);

  // Manual save function for imperative use
  const saveScrollPosition = () => {
    scrollPositions.set(scrollKey, window.scrollY);
  };

  // Manual restore function
  const restoreScrollPosition = () => {
    const savedPosition = scrollPositions.get(scrollKey);
    if (savedPosition !== undefined) {
      window.scrollTo(0, savedPosition);
    }
  };

  // Clear saved position
  const clearScrollPosition = () => {
    scrollPositions.delete(scrollKey);
  };

  return {
    saveScrollPosition,
    restoreScrollPosition,
    clearScrollPosition,
  };
}
