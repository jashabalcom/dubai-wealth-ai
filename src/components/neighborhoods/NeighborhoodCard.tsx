import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, TrendingUp, Home, Train, Waves, Shield, ArrowRight } from 'lucide-react';
import type { Neighborhood } from '@/hooks/useNeighborhoods';

interface NeighborhoodCardProps {
  neighborhood: Neighborhood;
}

const lifestyleColors: Record<string, string> = {
  luxury: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  family: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  affordable: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  urban: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  emerging: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  industrial: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  mixed: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
};

export function NeighborhoodCard({ neighborhood }: NeighborhoodCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const lifestyleClass = lifestyleColors[neighborhood.lifestyle_type || 'mixed'] || lifestyleColors.mixed;

  return (
    <Link to={`/neighborhoods/${neighborhood.slug}`} className="block group">
      <Card className="relative overflow-hidden border-border/30 bg-card/60 backdrop-blur-sm transition-all duration-500 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-2">
        {/* Gold Glow Effect on Hover */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative h-52 overflow-hidden">
          {/* Image Shimmer Loading State */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted/50 to-muted animate-pulse">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
            </div>
          )}
          
          {neighborhood.image_url ? (
            <img
              src={neighborhood.image_url}
              alt={neighborhood.name}
              className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <MapPin className="h-12 w-12 text-primary/40" />
            </div>
          )}
          
          {/* Multi-layer Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-background/20" />
          
          {/* Badges - Top Left */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            <Badge variant="outline" className={`${lifestyleClass} backdrop-blur-sm`}>
              {neighborhood.lifestyle_type?.charAt(0).toUpperCase() + (neighborhood.lifestyle_type?.slice(1) || '')}
            </Badge>
            {neighborhood.is_freehold && (
              <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30 backdrop-blur-sm">
                Freehold
              </Badge>
            )}
          </div>

          {/* Feature Icons - Top Right */}
          <div className="absolute top-3 right-3 flex gap-1.5">
            {neighborhood.has_metro_access && (
              <div className="p-1.5 rounded-full bg-background/80 backdrop-blur-md border border-primary/20 shadow-lg" title="Metro Access">
                <Train className="h-3.5 w-3.5 text-primary" />
              </div>
            )}
            {neighborhood.has_beach_access && (
              <div className="p-1.5 rounded-full bg-background/80 backdrop-blur-md border border-primary/20 shadow-lg" title="Beach Access">
                <Waves className="h-3.5 w-3.5 text-primary" />
              </div>
            )}
            {neighborhood.golden_visa_eligible && (
              <div className="p-1.5 rounded-full bg-background/80 backdrop-blur-md border border-primary/20 shadow-lg" title="Golden Visa Eligible">
                <Shield className="h-3.5 w-3.5 text-primary" />
              </div>
            )}
          </div>

          {/* View Details Hint */}
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <div className="flex items-center gap-1 text-xs text-primary bg-background/80 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-primary/30">
              Explore
              <ArrowRight className="h-3 w-3" />
            </div>
          </div>
        </div>

        <CardContent className="relative p-5">
          <h3 className="font-serif font-semibold text-lg text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-1">
            {neighborhood.name}
          </h3>
          
          {neighborhood.description && (
            <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
              {neighborhood.description}
            </p>
          )}

          {/* Stats Grid */}
          <div className="mt-5 pt-4 border-t border-border/50 grid grid-cols-2 gap-4">
            {neighborhood.avg_price_sqft && (
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-muted/50">
                  <Home className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Price/sqft</p>
                  <p className="text-sm font-semibold text-foreground">
                    AED {neighborhood.avg_price_sqft.toLocaleString()}
                  </p>
                </div>
              </div>
            )}
            {neighborhood.avg_rental_yield && (
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Rental Yield</p>
                  <p className="text-sm font-semibold text-primary">
                    {neighborhood.avg_rental_yield.toFixed(1)}%
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Best For Tags */}
          {neighborhood.best_for && neighborhood.best_for.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {neighborhood.best_for.slice(0, 3).map((tag, idx) => (
                <Badge 
                  key={idx} 
                  variant="secondary" 
                  className="text-xs bg-muted/50 hover:bg-muted transition-colors"
                >
                  {tag}
                </Badge>
              ))}
              {neighborhood.best_for.length > 3 && (
                <Badge variant="secondary" className="text-xs bg-muted/50">
                  +{neighborhood.best_for.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
