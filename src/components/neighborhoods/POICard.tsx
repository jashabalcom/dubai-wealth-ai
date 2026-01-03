import { Star, MapPin, Globe, Utensils, GraduationCap, HeartPulse, Dumbbell, ShoppingCart, Film } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface POICardProps {
  poi: {
    id: string;
    poi_type: string;
    name: string;
    description?: string | null;
    address?: string | null;
    rating?: number | null;
    website?: string | null;
    image_url?: string | null;
    cuisine_type?: string | null;
    price_level?: string | null;
    curriculum?: string | null;
  };
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
  restaurant: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  school: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  healthcare: 'bg-red-500/20 text-red-400 border-red-500/30',
  gym: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  supermarket: 'bg-green-500/20 text-green-400 border-green-500/30',
  entertainment: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
};

export function POICard({ poi }: POICardProps) {
  const Icon = POI_ICONS[poi.poi_type] || MapPin;
  const colorClasses = POI_COLORS[poi.poi_type] || 'bg-primary/20 text-primary border-primary/30';

  return (
    <Card className="group overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 h-full">
      <CardContent className="p-4 flex flex-col h-full">
        {/* Header with Icon */}
        <div className="flex items-start gap-3 mb-3">
          <div className={`p-2.5 rounded-xl ${colorClasses} border shrink-0`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
              {poi.name}
            </h4>
            {poi.rating && (
              <div className="flex items-center gap-1 mt-0.5">
                <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                <span className="text-sm text-amber-400 font-medium">{poi.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {poi.cuisine_type && (
            <Badge variant="outline" className="text-xs px-2 py-0.5 bg-muted/50">
              {poi.cuisine_type}
            </Badge>
          )}
          {poi.curriculum && (
            <Badge variant="outline" className="text-xs px-2 py-0.5 bg-muted/50">
              {poi.curriculum}
            </Badge>
          )}
          {poi.price_level && (
            <Badge variant="outline" className="text-xs px-2 py-0.5 bg-muted/50">
              {poi.price_level}
            </Badge>
          )}
        </div>

        {/* Address */}
        {poi.address && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">
            <MapPin className="h-3 w-3 inline-block mr-1 opacity-60" />
            {poi.address}
          </p>
        )}

        {/* Website Link */}
        {poi.website && (
          <a 
            href={poi.website} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-auto"
          >
            <Globe className="h-3 w-3" />
            Visit Website
          </a>
        )}
      </CardContent>
    </Card>
  );
}
