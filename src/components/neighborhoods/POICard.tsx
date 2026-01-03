import { useState } from 'react';
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

const POI_GRADIENTS: Record<string, string> = {
  restaurant: 'from-orange-600/80 to-amber-700/80',
  school: 'from-blue-600/80 to-indigo-700/80',
  healthcare: 'from-red-600/80 to-rose-700/80',
  gym: 'from-violet-600/80 to-purple-700/80',
  supermarket: 'from-green-600/80 to-emerald-700/80',
  entertainment: 'from-pink-600/80 to-fuchsia-700/80',
};

export function POICard({ poi }: POICardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const Icon = POI_ICONS[poi.poi_type] || MapPin;
  const colorClasses = POI_COLORS[poi.poi_type] || 'bg-primary/20 text-primary border-primary/30';
  const gradientClasses = POI_GRADIENTS[poi.poi_type] || 'from-primary/80 to-primary/60';

  const hasImage = poi.image_url && !imageError;

  return (
    <Card className="group overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 h-full">
      {/* Image Section */}
      <div className="relative aspect-[16/9] overflow-hidden">
        {hasImage ? (
          <>
            {/* Shimmer loading state */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-muted animate-pulse" />
            )}
            <img
              src={poi.image_url!}
              alt={poi.name}
              className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
            {/* Gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </>
        ) : (
          /* Fallback gradient with icon */
          <div className={`absolute inset-0 bg-gradient-to-br ${gradientClasses} flex items-center justify-center`}>
            <Icon className="h-12 w-12 text-white/50" />
          </div>
        )}
        
        {/* Price level badge */}
        {poi.price_level && (
          <Badge 
            variant="secondary" 
            className="absolute top-2 right-2 bg-black/70 text-white border-none text-xs font-medium"
          >
            {poi.price_level}
          </Badge>
        )}
        
        {/* Category badge */}
        <div className={`absolute top-2 left-2 p-1.5 rounded-lg ${colorClasses} border backdrop-blur-sm`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <CardContent className="p-4 flex flex-col gap-2">
        {/* Name and Rating */}
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors flex-1">
            {poi.name}
          </h4>
          {poi.rating && (
            <div className="flex items-center gap-1 shrink-0">
              <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
              <span className="text-sm text-amber-400 font-medium">{poi.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
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
        </div>

        {/* Address */}
        {poi.address && (
          <p className="text-xs text-muted-foreground line-clamp-2 flex items-start gap-1">
            <MapPin className="h-3 w-3 shrink-0 mt-0.5 opacity-60" />
            <span>{poi.address}</span>
          </p>
        )}

        {/* Website Link */}
        {poi.website && (
          <a 
            href={poi.website} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-auto pt-1"
          >
            <Globe className="h-3 w-3" />
            Visit Website
          </a>
        )}
      </CardContent>
    </Card>
  );
}
