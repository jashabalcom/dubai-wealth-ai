import { Utensils, GraduationCap, HeartPulse, Dumbbell, ShoppingCart, Film, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollableRail } from '@/components/ui/ScrollableRail';

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
  isLoading?: boolean;
}

export function POICategoryFilter({
  activeCategory,
  onCategoryChange,
  counts,
  totalCount,
  className,
  isLoading = false
}: POICategoryFilterProps) {
  // Filter to only show categories that have POIs (plus 'all')
  const visibleCategories = POI_CATEGORIES.filter(cat => {
    if (cat.key === 'all') return true;
    return (counts[cat.key] || 0) > 0;
  });

  if (isLoading) {
    return (
      <div className={cn("flex gap-2 overflow-hidden", className)}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-11 w-24 rounded-full bg-muted animate-pulse flex-none" />
        ))}
      </div>
    );
  }

  return (
    <ScrollableRail className={className} gap={8} showFade={false}>
      {visibleCategories.map(cat => {
        const Icon = cat.icon;
        const isActive = activeCategory === cat.key;
        const count = cat.key === 'all' ? totalCount : (counts[cat.key] || 0);

        return (
          <button
            key={cat.key}
            type="button"
            onClick={() => onCategoryChange(cat.key)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-full border text-sm font-medium transition-all duration-200 flex-none min-h-[44px]",
              "scroll-snap-align-start",
              isActive
                ? "bg-primary text-primary-foreground border-primary shadow-md"
                : "bg-card hover:bg-muted border-border"
            )}
          >
            <Icon
              className="h-4 w-4 flex-none"
              style={{ color: isActive ? undefined : cat.color }}
            />
            <span className="whitespace-nowrap">{cat.label}</span>
            {count > 0 && (
              <span className={cn(
                "text-xs px-1.5 py-0.5 rounded-full flex-none tabular-nums",
                isActive
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </ScrollableRail>
  );
}
