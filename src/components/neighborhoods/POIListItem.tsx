import { Star, MapPin, ExternalLink, Utensils, GraduationCap, HeartPulse, Dumbbell, ShoppingCart, Film } from 'lucide-react';
import { cn } from '@/lib/utils';

interface POIListItemProps {
  poi: {
    id: string;
    poi_type: string;
    name: string;
    address?: string | null;
    rating?: number | null;
    cuisine?: string | null;
    website_url?: string | null;
  };
  isSelected?: boolean;
  onClick?: () => void;
}

const POI_ICONS: Record<string, React.ElementType> = {
  restaurant: Utensils,
  school: GraduationCap,
  healthcare: HeartPulse,
  gym: Dumbbell,
  supermarket: ShoppingCart,
  entertainment: Film,
};

const POI_COLORS: Record<string, string> = {
  restaurant: '#F97316',
  school: '#3B82F6',
  healthcare: '#EF4444',
  gym: '#8B5CF6',
  supermarket: '#22C55E',
  entertainment: '#EC4899',
};

export function POIListItem({ poi, isSelected, onClick }: POIListItemProps) {
  const Icon = POI_ICONS[poi.poi_type] || MapPin;
  const color = POI_COLORS[poi.poi_type] || 'hsl(var(--primary))';

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all duration-200",
        "hover:bg-muted/50 active:bg-muted",
        isSelected && "bg-primary/10 ring-1 ring-primary/30"
      )}
    >
      {/* Icon */}
      <div
        className="flex-none w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon className="h-5 w-5" style={{ color }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-foreground truncate">{poi.name}</h4>
        
        {poi.cuisine && (
          <span className="text-xs text-muted-foreground">{poi.cuisine}</span>
        )}
        
        {poi.address && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {poi.address}
          </p>
        )}
      </div>

      {/* Rating & Link */}
      <div className="flex-none flex flex-col items-end gap-1">
        {poi.rating && (
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
            <span className="text-sm font-medium text-amber-500">{poi.rating.toFixed(1)}</span>
          </div>
        )}
        {poi.website_url && (
          <a
            href={poi.website_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-primary hover:text-primary/80"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>
    </button>
  );
}
