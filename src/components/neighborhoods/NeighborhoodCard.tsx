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
  luxury: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
  family: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
  affordable: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
  urban: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
  emerging: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
  industrial: 'bg-slate-500/20 text-slate-400 border-slate-500/40',
  mixed: 'bg-gray-500/20 text-gray-400 border-gray-500/40',
};

export function NeighborhoodCard({ neighborhood }: NeighborhoodCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const lifestyleClass = lifestyleColors[neighborhood.lifestyle_type || 'mixed'] || lifestyleColors.mixed;

  return (
    <Link to={`/neighborhoods/${neighborhood.slug}`} className="block group">
      <Card className="relative overflow-hidden border-border/40 bg-card/80 backdrop-blur-sm transition-all duration-500 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-2">
        {/* Gold Glow Effect on Hover */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative h-44 overflow-hidden">
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
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
          
          {/* Badges - Top Left */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            <Badge variant="outline" className={`${lifestyleClass} backdrop-blur-md font-medium text-xs`}>
              {neighborhood.lifestyle_type?.charAt(0).toUpperCase() + (neighborhood.lifestyle_type?.slice(1) || '')}
            </Badge>
            {neighborhood.is_freehold && (
              <Badge variant="outline" className="bg-primary/20 text-primary border-primary/40 backdrop-blur-md font-medium text-xs">
                Freehold
              </Badge>
            )}
          </div>

          {/* Feature Icons - Top Right */}
          <div className="absolute top-3 right-3 flex gap-1.5">
            {neighborhood.has_metro_access && (
              <div className="p-1.5 rounded-full bg-card/90 backdrop-blur-md border border-border/50 shadow-md" title="Metro Access">
                <Train className="h-3.5 w-3.5 text-primary" />
              </div>
            )}
            {neighborhood.has_beach_access && (
              <div className="p-1.5 rounded-full bg-card/90 backdrop-blur-md border border-border/50 shadow-md" title="Beach Access">
                <Waves className="h-3.5 w-3.5 text-primary" />
              </div>
            )}
            {neighborhood.golden_visa_eligible && (
              <div className="p-1.5 rounded-full bg-card/90 backdrop-blur-md border border-border/50 shadow-md" title="Golden Visa Eligible">
                <Shield className="h-3.5 w-3.5 text-primary" />
              </div>
            )}
          </div>

          {/* View Details Hint */}
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <div className="flex items-center gap-1 text-xs font-medium text-primary bg-card/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-primary/30 shadow-lg">
              Explore
              <ArrowRight className="h-3 w-3" />
            </div>
          </div>
        </div>

        <CardContent className="relative p-5">
          {/* Title - Larger and bolder */}
          <h3 className="font-serif font-bold text-xl text-foreground group-hover:text-primary transition-colors duration-300 mb-2">
            {neighborhood.name}
          </h3>
          
          {/* Description - Better contrast and line height */}
          {neighborhood.description && (
            <p className="text-sm text-foreground/70 line-clamp-2 leading-relaxed mb-4">
              {neighborhood.description}
            </p>
          )}

          {/* Stats Grid - Clearer visual hierarchy */}
          <div className="grid grid-cols-2 gap-4 p-4 -mx-1 rounded-xl bg-muted/30 border border-border/30">
            {neighborhood.avg_price_sqft ? (
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-card border border-border/50 shadow-sm">
                  <Home className="h-4 w-4 text-foreground/60" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-foreground/50 font-medium">Price/sqft</p>
                  <p className="text-sm font-bold text-foreground">
                    AED {neighborhood.avg_price_sqft.toLocaleString()}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-card border border-border/50 shadow-sm">
                  <Home className="h-4 w-4 text-foreground/60" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-foreground/50 font-medium">Price/sqft</p>
                  <p className="text-sm font-medium text-foreground/40">--</p>
                </div>
              </div>
            )}
            
            {neighborhood.avg_rental_yield ? (
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 shadow-sm">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-foreground/50 font-medium">Yield</p>
                  <p className="text-sm font-bold text-primary">
                    {neighborhood.avg_rental_yield.toFixed(1)}%
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-card border border-border/50 shadow-sm">
                  <TrendingUp className="h-4 w-4 text-foreground/60" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-foreground/50 font-medium">Yield</p>
                  <p className="text-sm font-medium text-foreground/40">--</p>
                </div>
              </div>
            )}
          </div>

          {/* Best For Tags - Better visibility */}
          {neighborhood.best_for && neighborhood.best_for.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {neighborhood.best_for.slice(0, 2).map((tag, idx) => (
                <Badge 
                  key={idx} 
                  variant="secondary" 
                  className="text-xs font-medium bg-card border border-border/50 text-foreground/80 hover:bg-muted transition-colors px-2.5 py-0.5"
                >
                  {tag}
                </Badge>
              ))}
              {neighborhood.best_for.length > 2 && (
                <Badge 
                  variant="secondary" 
                  className="text-xs font-medium bg-primary/10 border border-primary/20 text-primary px-2.5 py-0.5"
                >
                  +{neighborhood.best_for.length - 2} more
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
