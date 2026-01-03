import { useRef, useState, useEffect, ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScrollableRailProps {
  children: ReactNode;
  className?: string;
  showArrows?: boolean;
  showFade?: boolean;
  gap?: number;
}

export function ScrollableRail({
  children,
  className,
  showArrows = true,
  showFade = true,
  gap = 8
}: ScrollableRailProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 2);
  };

  useEffect(() => {
    checkScroll();
    const ref = scrollRef.current;
    if (ref) {
      ref.addEventListener('scroll', checkScroll, { passive: true });
      // Also check on resize
      const resizeObserver = new ResizeObserver(checkScroll);
      resizeObserver.observe(ref);
      return () => {
        ref.removeEventListener('scroll', checkScroll);
        resizeObserver.disconnect();
      };
    }
  }, [children]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 200;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  return (
    <div className={cn("relative", className)}>
      {/* Left fade indicator */}
      {showFade && canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      )}

      {/* Left arrow - desktop only */}
      {showArrows && canScrollLeft && (
        <button
          type="button"
          onClick={() => scroll('left')}
          className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-20 h-8 w-8 items-center justify-center rounded-full bg-background/95 backdrop-blur-sm shadow-lg border border-border hover:bg-muted transition-colors"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}

      {/* Scrollable container */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto scrollbar-none"
        style={{
          gap: `${gap}px`,
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-x',
          scrollSnapType: 'x proximity',
        }}
      >
        {children}
      </div>

      {/* Right arrow - desktop only */}
      {showArrows && canScrollRight && (
        <button
          type="button"
          onClick={() => scroll('right')}
          className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 h-8 w-8 items-center justify-center rounded-full bg-background/95 backdrop-blur-sm shadow-lg border border-border hover:bg-muted transition-colors"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      {/* Right fade indicator */}
      {showFade && canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      )}
    </div>
  );
}
