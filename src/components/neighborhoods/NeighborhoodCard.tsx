import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, TrendingUp, Home, Train, Waves, Shield } from 'lucide-react';
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
  const lifestyleClass = lifestyleColors[neighborhood.lifestyle_type || 'mixed'] || lifestyleColors.mixed;

  return (
    <Link to={`/neighborhoods/${neighborhood.slug}`}>
      <Card className="group overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
        <div className="relative h-48 overflow-hidden">
          {neighborhood.image_url ? (
            <img
              src={neighborhood.image_url}
              alt={neighborhood.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <MapPin className="h-12 w-12 text-primary/40" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            <Badge variant="outline" className={lifestyleClass}>
              {neighborhood.lifestyle_type?.charAt(0).toUpperCase() + (neighborhood.lifestyle_type?.slice(1) || '')}
            </Badge>
            {neighborhood.is_freehold && (
              <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30">
                Freehold
              </Badge>
            )}
          </div>

          {/* Feature icons */}
          <div className="absolute top-3 right-3 flex gap-1">
            {neighborhood.has_metro_access && (
              <div className="p-1.5 rounded-full bg-background/80 backdrop-blur-sm" title="Metro Access">
                <Train className="h-3.5 w-3.5 text-primary" />
              </div>
            )}
            {neighborhood.has_beach_access && (
              <div className="p-1.5 rounded-full bg-background/80 backdrop-blur-sm" title="Beach Access">
                <Waves className="h-3.5 w-3.5 text-primary" />
              </div>
            )}
            {neighborhood.golden_visa_eligible && (
              <div className="p-1.5 rounded-full bg-background/80 backdrop-blur-sm" title="Golden Visa Eligible">
                <Shield className="h-3.5 w-3.5 text-primary" />
              </div>
            )}
          </div>
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {neighborhood.name}
          </h3>
          
          {neighborhood.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {neighborhood.description}
            </p>
          )}

          {/* Stats */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            {neighborhood.avg_price_sqft && (
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Avg. Price/sqft</p>
                  <p className="text-sm font-medium text-foreground">
                    AED {neighborhood.avg_price_sqft.toLocaleString()}
                  </p>
                </div>
              </div>
            )}
            {neighborhood.avg_rental_yield && (
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Rental Yield</p>
                  <p className="text-sm font-medium text-foreground">
                    {neighborhood.avg_rental_yield.toFixed(1)}%
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Best for tags */}
          {neighborhood.best_for && neighborhood.best_for.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {neighborhood.best_for.slice(0, 3).map((tag, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
