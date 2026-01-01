import { useEffect, useRef, useState, useCallback } from 'react';

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

interface UseScrollAnimationReturn {
  ref: React.RefObject<HTMLElement>;
  isVisible: boolean;
  hasAnimated: boolean;
}

/**
 * Custom hook for triggering animations based on scroll visibility
 * Uses Intersection Observer for performance
 */
export function useScrollAnimation({
  threshold = 0.1,
  rootMargin = '0px 0px -50px 0px',
  triggerOnce = true,
}: UseScrollAnimationOptions = {}): UseScrollAnimationReturn {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setHasAnimated(true);
          
          if (triggerOnce) {
            observer.disconnect();
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isVisible, hasAnimated };
}

interface UseParallaxOptions {
  speed?: number;
  direction?: 'up' | 'down';
  disabled?: boolean;
}

/**
 * Custom hook for parallax scrolling effects
 */
export function useParallax({
  speed = 0.5,
  direction = 'up',
  disabled = false,
}: UseParallaxOptions = {}) {
  const ref = useRef<HTMLElement>(null);
  const [offset, setOffset] = useState(0);

  const handleScroll = useCallback(() => {
    if (disabled || !ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const elementCenter = rect.top + rect.height / 2;
    const windowCenter = windowHeight / 2;
    
    const distance = (windowCenter - elementCenter) * speed;
    const finalOffset = direction === 'up' ? distance : -distance;
    
    setOffset(finalOffset);
  }, [speed, direction, disabled]);

  useEffect(() => {
    if (disabled) return;
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll, disabled]);

  return { ref, offset };
}

interface UseStaggeredRevealOptions {
  staggerDelay?: number;
  initialDelay?: number;
  threshold?: number;
}

/**
 * Custom hook for staggered reveal animations of child elements
 */
export function useStaggeredReveal({
  staggerDelay = 100,
  initialDelay = 0,
  threshold = 0.1,
}: UseStaggeredRevealOptions = {}) {
  const containerRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [visibleItems, setVisibleItems] = useState<number[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          observer.disconnect();
          
          // Get all direct children
          const children = container.children;
          const totalChildren = children.length;
          
          // Stagger reveal each child
          for (let i = 0; i < totalChildren; i++) {
            setTimeout(() => {
              setVisibleItems((prev) => [...prev, i]);
            }, initialDelay + i * staggerDelay);
          }
        }
      },
      { threshold }
    );

    observer.observe(container);

    return () => observer.disconnect();
  }, [staggerDelay, initialDelay, threshold, isVisible]);

  const getItemStyle = (index: number) => ({
    opacity: visibleItems.includes(index) ? 1 : 0,
    transform: visibleItems.includes(index) 
      ? 'translateY(0)' 
      : 'translateY(20px)',
    transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
  });

  return { containerRef, visibleItems, isVisible, getItemStyle };
}

interface UseScrollProgressOptions {
  start?: 'top' | 'bottom' | 'center';
  end?: 'top' | 'bottom' | 'center';
}

/**
 * Custom hook for tracking scroll progress through an element
 */
export function useScrollProgress({
  start = 'bottom',
  end = 'top',
}: UseScrollProgressOptions = {}) {
  const ref = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);

  const getPosition = useCallback((position: string, rect: DOMRect) => {
    switch (position) {
      case 'top':
        return rect.top;
      case 'bottom':
        return rect.bottom;
      case 'center':
        return rect.top + rect.height / 2;
      default:
        return rect.top;
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    const startPos = getPosition(start, rect);
    const endPos = getPosition(end, rect);
    
    // Calculate progress based on element position relative to viewport
    const totalDistance = windowHeight;
    const currentPosition = windowHeight - startPos;
    const elementProgress = Math.max(0, Math.min(1, currentPosition / totalDistance));
    
    setProgress(elementProgress);
  }, [start, end, getPosition]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return { ref, progress };
}

/**
 * Custom hook for animated number counting
 */
export function useCountUp(
  end: number,
  duration: number = 2000,
  startOnVisible: boolean = true
) {
  const [count, setCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const { ref, isVisible } = useScrollAnimation({ triggerOnce: true });
  const hasStarted = useRef(false);

  useEffect(() => {
    if (startOnVisible && !isVisible) return;
    if (hasStarted.current) return;
    
    hasStarted.current = true;
    
    const startTime = Date.now();
    const startValue = 0;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(startValue + (end - startValue) * easeOut);
      
      setCount(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
        setIsComplete(true);
      }
    };
    
    requestAnimationFrame(animate);
  }, [end, duration, isVisible, startOnVisible]);

  return { ref, count, isComplete };
}

/**
 * Custom hook for scroll-triggered class toggling
 */
export function useScrollClass(
  activeClass: string,
  threshold: number = 0.5
) {
  const ref = useRef<HTMLElement>(null);
  const [className, setClassName] = useState('');

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setClassName(entry.isIntersecting ? activeClass : '');
      },
      { threshold }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [activeClass, threshold]);

  return { ref, className };
}

export default {
  useScrollAnimation,
  useParallax,
  useStaggeredReveal,
  useScrollProgress,
  useCountUp,
  useScrollClass,
};
