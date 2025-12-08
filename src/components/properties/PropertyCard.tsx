import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MapPin, Bed, Bath, Maximize, TrendingUp, Calendar, Heart, Scale, Share2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Property {
  id: string;
  title: string;
  slug: string;
  location_area: string;
  property_type: string;
  developer_name: string;
  is_off_plan: boolean;
  status: string;
  price_aed: number;
  bedrooms: number;
  bathrooms: number;
  size_sqft: number;
  rental_yield_estimate: number;
  images: string[];
  completion_date: string | null;
  is_featured: boolean;
}

interface PropertyCardProps {
  property: Property;
  index?: number;
  isSaved?: boolean;
  onToggleSave?: () => void;
  onCompare?: () => void;
  isComparing?: boolean;
  showCompareButton?: boolean;
  isAuthenticated?: boolean;
}

function formatPrice(price: number): string {
  if (price >= 1000000) {
    return `AED ${(price / 1000000).toFixed(1)}M`;
  }
  return `AED ${(price / 1000).toFixed(0)}K`;
}

export function PropertyCard({
  property,
  index = 0,
  isSaved = false,
  onToggleSave,
  onCompare,
  isComparing = false,
  showCompareButton = false,
  isAuthenticated = false,
}: PropertyCardProps) {
  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/properties/${property.slug}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: `Check out this property: ${property.title}`,
          url,
        });
      } catch (err) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group h-full"
    >
      <Link to={`/properties/${property.slug}`} className="block h-full">
        <div className={cn(
          "h-full rounded-2xl bg-card border overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-gold/5",
          isComparing ? "border-gold ring-2 ring-gold/20" : "border-border hover:border-gold/30"
        )}>
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <img
              src={property.images[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'}
              alt={property.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            
            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              {property.is_off_plan && (
                <span className="px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
                  Off-Plan
                </span>
              )}
              {property.is_featured && (
                <span className="px-2 py-1 bg-gold text-primary-dark text-xs font-medium rounded-full">
                  Featured
                </span>
              )}
            </div>

            {/* Yield Badge */}
            {property.rental_yield_estimate && (
              <div className="absolute top-3 right-3 px-2 py-1 bg-emerald-500/90 text-white text-xs font-medium rounded-full flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {property.rental_yield_estimate}% yield
              </div>
            )}

            {/* Action Buttons */}
            <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {isAuthenticated && onToggleSave && (
                <Button
                  size="icon"
                  variant="secondary"
                  className="w-8 h-8 rounded-full bg-background/90 hover:bg-background"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onToggleSave();
                  }}
                >
                  <Heart className={cn("w-4 h-4", isSaved && "fill-red-500 text-red-500")} />
                </Button>
              )}
              {showCompareButton && onCompare && (
                <Button
                  size="icon"
                  variant="secondary"
                  className={cn(
                    "w-8 h-8 rounded-full bg-background/90 hover:bg-background",
                    isComparing && "bg-gold text-primary-dark"
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onCompare();
                  }}
                >
                  <Scale className="w-4 h-4" />
                </Button>
              )}
              <Button
                size="icon"
                variant="secondary"
                className="w-8 h-8 rounded-full bg-background/90 hover:bg-background"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            {/* Location */}
            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
              <MapPin className="w-4 h-4" />
              {property.location_area}
              {property.developer_name && (
                <span className="text-xs">• {property.developer_name}</span>
              )}
            </div>

            {/* Title */}
            <h3 className="font-heading text-lg text-foreground mb-3 group-hover:text-gold transition-colors line-clamp-2">
              {property.title}
            </h3>

            {/* Price */}
            <p className="font-heading text-xl text-gold mb-3">
              {formatPrice(property.price_aed)}
            </p>

            {/* Features */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Bed className="w-4 h-4" />
                {property.bedrooms === 0 ? 'Studio' : `${property.bedrooms} BR`}
              </span>
              <span className="flex items-center gap-1">
                <Bath className="w-4 h-4" />
                {property.bathrooms}
              </span>
              <span className="flex items-center gap-1">
                <Maximize className="w-4 h-4" />
                {property.size_sqft.toLocaleString()} sqft
              </span>
            </div>

            {/* Completion Date for Off-Plan */}
            {property.is_off_plan && property.completion_date && (
              <div className="mt-3 pt-3 border-t border-border">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Completion: {new Date(property.completion_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
