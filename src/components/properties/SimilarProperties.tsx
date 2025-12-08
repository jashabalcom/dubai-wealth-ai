import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Maximize, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
        .limit(3);

      if (!sameAreaError && sameArea && sameArea.length >= 3) {
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
        .limit(3 - (sameArea?.length || 0));

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
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="w-24 h-20 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
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
    <div className="p-6 rounded-xl bg-card border border-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-xl text-foreground">Similar Properties</h2>
        <Link to="/properties">
          <Button variant="ghost" size="sm">
            View All
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>
      
      <div className="space-y-4">
        {properties.map((property) => (
          <Link
            key={property.id}
            to={`/properties/${property.slug}`}
            className="flex gap-4 group"
          >
            <div className="w-24 h-20 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={property.images[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=200'}
                alt={property.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                <MapPin className="w-3 h-3" />
                {property.location_area}
              </p>
              <h3 className="font-medium text-foreground text-sm line-clamp-1 group-hover:text-gold transition-colors">
                {property.title}
              </h3>
              <p className="font-heading text-gold mt-1">
                {formatPrice(property.price_aed)}
              </p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                <span className="flex items-center gap-0.5">
                  <Bed className="w-3 h-3" />
                  {property.bedrooms === 0 ? 'S' : property.bedrooms}
                </span>
                <span className="flex items-center gap-0.5">
                  <Maximize className="w-3 h-3" />
                  {property.size_sqft.toLocaleString()}
                </span>
                {property.rental_yield_estimate && (
                  <span className="flex items-center gap-0.5 text-emerald-500">
                    <TrendingUp className="w-3 h-3" />
                    {property.rental_yield_estimate}%
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
