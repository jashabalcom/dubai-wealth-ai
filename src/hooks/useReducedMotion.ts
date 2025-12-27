import { useState, useEffect } from 'react';

export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

export function useMobileOptimizedMotion(): boolean {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  });
  
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return prefersReducedMotion || isMobile;
}