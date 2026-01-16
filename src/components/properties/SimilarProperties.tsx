import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { MapPin, Bed, Maximize, TrendingUp, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface Property {
  id: string;
  title: string;
  slug: string;
  location_area: string;
  price_aed: number;
  bedrooms: number;
  bathrooms: number;
  size_sqft: number;
  rental_yield_estimate: number;
  images: string[];
  property_type: string;
}

interface SimilarPropertiesProps {
  currentPropertyId: string;
  locationArea: string;
  priceAed: number;
  propertyType: string;
}

function formatPrice(price: number): string {
  if (price >= 1000000) {
    return `AED ${(price / 1000000).toFixed(1)}M`;
  }
  return `AED ${(price / 1000).toFixed(0)}K`;
}

export function SimilarProperties({ 
  currentPropertyId, 
  locationArea, 
  priceAed, 
  propertyType 
}: SimilarPropertiesProps) {
  const priceMin = priceAed * 0.7;
  const priceMax = priceAed * 1.3;

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['similar-properties', currentPropertyId, locationArea],
    queryFn: async () => {
      // First try to find properties in the same area
      const { data: sameArea, error: sameAreaError } = await supabase
        .from('properties')
        .select('id, title, slug, location_area, price_aed, bedrooms, bathrooms, size_sqft, rental_yield_estimate, images, property_type')
        .eq('status', 'available')
        .neq('id', currentPropertyId)
        .eq('location_area', locationArea)
        .gte('price_aed', priceMin)
        .lte('price_aed', priceMax)
        .limit(4);

      if (!sameAreaError && sameArea && sameArea.length >= 4) {
        return sameArea.map(p => ({
          ...p,
          images: Array.isArray(p.images) ? (p.images as string[]) : [],
          price_aed: Number(p.price_aed),
          size_sqft: Number(p.size_sqft),
          rental_yield_estimate: Number(p.rental_yield_estimate),
        })) as Property[];
      }

      // If not enough, add properties from other areas
      const { data: otherAreas, error: otherError } = await supabase
        .from('properties')
        .select('id, title, slug, location_area, price_aed, bedrooms, bathrooms, size_sqft, rental_yield_estimate, images, property_type')
        .eq('status', 'available')
        .neq('id', currentPropertyId)
        .neq('location_area', locationArea)
        .eq('property_type', propertyType)
        .gte('price_aed', priceMin)
        .lte('price_aed', priceMax)
        .limit(4 - (sameArea?.length || 0));

      const combined = [...(sameArea || []), ...(otherAreas || [])];
      
      return combined.map(p => ({
        ...p,
        images: Array.isArray(p.images) ? (p.images as string[]) : [],
        price_aed: Number(p.price_aed),
        size_sqft: Number(p.size_sqft),
        rental_yield_estimate: Number(p.rental_yield_estimate),
      })) as Property[];
    },
  });

  if (isLoading) {
    return (
      <div className="p-6 rounded-xl bg-card border border-border">
        <h2 className="font-heading text-xl text-foreground mb-4">Similar Properties</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="w-full aspect-[4/3] rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (properties.length === 0) {
    return null;
  }

  return (
    <div className="p-6 rounded-xl bg-card/80 backdrop-blur-sm border border-primary/10 overflow-hidden relative">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <h2 className="font-serif text-xl text-foreground">Similar Properties</h2>
        </div>
        <Link to={`/properties?area=${encodeURIComponent(locationArea)}`}>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">
            View all in {locationArea}
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>
      
      {/* Grid Layout - 2x2 on desktop, 1 column on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {properties.slice(0, 4).map((property) => (
          <Link
            key={property.id}
            to={`/properties/${property.slug}`}
            className="group block"
          >
            <div className="rounded-xl overflow-hidden border border-border/50 bg-background/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
              {/* Image */}
              <div className="aspect-[4/3] overflow-hidden relative">
                <img
                  src={property.images[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400'}
                  alt={property.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Price badge */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <Badge className="bg-primary/90 text-primary-foreground backdrop-blur-sm shadow-lg">
                    {formatPrice(property.price_aed)}
                  </Badge>
                  {property.rental_yield_estimate && property.rental_yield_estimate > 0 && (
                    <Badge variant="outline" className="bg-emerald-500/90 text-white border-0 backdrop-blur-sm">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {property.rental_yield_estimate}%
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Content */}
              <div className="p-3">
                <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                  <MapPin className="w-3 h-3" />
                  {property.location_area}
                </p>
                <h3 className="font-medium text-foreground text-sm line-clamp-1 group-hover:text-primary transition-colors">
                  {property.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                  <span className="flex items-center gap-1">
                    <Bed className="w-3 h-3" />
                    {property.bedrooms === 0 ? 'Studio' : `${property.bedrooms} BR`}
                  </span>
                  <span className="flex items-center gap-1">
                    <Maximize className="w-3 h-3" />
                    {property.size_sqft.toLocaleString()} sqft
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}