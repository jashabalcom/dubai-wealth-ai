import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Utensils, GraduationCap, HeartPulse, Dumbbell, ShoppingCart, Film, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface POICategory {
  key: string;
  label: string;
  icon: React.ElementType;
  color: string;
}

export const POI_CATEGORIES: POICategory[] = [
  { key: 'all', label: 'All', icon: MapPin, color: 'hsl(var(--primary))' },
  { key: 'restaurant', label: 'Dining', icon: Utensils, color: '#F97316' },
  { key: 'school', label: 'Schools', icon: GraduationCap, color: '#3B82F6' },
  { key: 'healthcare', label: 'Health', icon: HeartPulse, color: '#EF4444' },
  { key: 'gym', label: 'Fitness', icon: Dumbbell, color: '#8B5CF6' },
  { key: 'supermarket', label: 'Shopping', icon: ShoppingCart, color: '#22C55E' },
  { key: 'entertainment', label: 'Entertainment', icon: Film, color: '#EC4899' },
];

interface POICategoryFilterProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  counts: Record<string, number>;
  totalCount: number;
  className?: string;
}

export function POICategoryFilter({
  activeCategory,
  onCategoryChange,
  counts,
  totalCount,
  className
}: POICategoryFilterProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 200;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  return (
    <div className={cn("relative overflow-x-hidden", className)}>
      {/* Left Arrow - hidden on mobile */}
      {showLeftArrow && (
        <Button
          variant="ghost"
          size="icon"
          className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 bg-background/90 backdrop-blur-sm shadow-md hover:bg-background"
          onClick={() => scroll('left')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}

      {/* Scrollable Pills */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-2 overflow-x-auto scrollbar-none py-1 -mx-1 px-1"
        style={{ 
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain'
        }}
      >
        {POI_CATEGORIES.map(cat => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.key;
          const count = cat.key === 'all' ? totalCount : (counts[cat.key] || 0);

          return (
            <Button
              key={cat.key}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              className={cn(
                "shrink-0 gap-2 rounded-full transition-all duration-300",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                  : "bg-card hover:bg-muted border-border"
              )}
              onClick={() => onCategoryChange(cat.key)}
            >
              <Icon 
                className="h-4 w-4" 
                style={{ color: isActive ? undefined : cat.color }} 
              />
              <span className="font-medium">{cat.label}</span>
              {count > 0 && (
                <span className={cn(
                  "text-xs px-1.5 py-0.5 rounded-full",
                  isActive 
                    ? "bg-primary-foreground/20 text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
                )}>
                  {count}
                </span>
              )}
            </Button>
          );
        })}
      </div>

      {/* Right Arrow - hidden on mobile */}
      {showRightArrow && (
        <Button
          variant="ghost"
          size="icon"
          className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 bg-background/90 backdrop-blur-sm shadow-md hover:bg-background"
          onClick={() => scroll('right')}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
