import { memo } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, Bed, Bath, Maximize, TrendingUp, Calendar, Heart, Scale, Share2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { InvestmentScoreBadge } from './InvestmentScoreBadge';
import { GoldenVisaBadge } from './GoldenVisaBadge';
import { DualPrice } from '@/components/DualPrice';
import { ImageCarousel } from './ImageCarousel';
import { usePrefetch } from '@/hooks/usePrefetch';

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
  views_count?: number | null;
  inquiries_count?: number | null;
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
  isRental?: boolean; // Hide investment badges for rentals
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
  isRental = false,
}: PropertyCardProps) {
  const { prefetchPropertyDetail, cancelPrefetch } = usePrefetch();

  const handleMouseEnter = () => {
    prefetchPropertyDetail(property.slug);
  };

  const handleMouseLeave = () => {
    cancelPrefetch();
  };

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
    <div className="group h-full">
      <Link 
        to={`/properties/${property.slug}`} 
        className="block h-full"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className={cn(
          "h-full rounded-2xl bg-card border overflow-hidden transition-all duration-200",
          "hover:shadow-xl hover:shadow-black/5",
          isComparing ? "border-gold ring-2 ring-gold/20" : "border-border hover:border-gold/40"
        )}>
          {/* Image Carousel */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <ImageCarousel 
              images={property.images} 
              alt={property.title}
              className="w-full h-full"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
            />
            {/* Image Overlay on Hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            
            {/* Top Left Badges - Consolidated to max 3 */}
            <div className="absolute top-2 left-2 flex flex-wrap gap-1.5 max-w-[70%]">
              {property.is_off_plan && (
                <span className="px-2 py-0.5 bg-blue-500 text-white text-[10px] sm:text-xs font-medium rounded-full">
                  Off-Plan
                </span>
              )}
              {property.is_featured && (
                <span className="px-2 py-0.5 bg-gold text-primary-dark text-[10px] sm:text-xs font-medium rounded-full">
                  Featured
                </span>
              )}
              {/* Only show Golden Visa badge for sale properties */}
              {!isRental && <GoldenVisaBadge priceAed={property.price_aed} variant="badge" />}
            </div>

            {/* Top Right - Yield only for sale properties */}
            {!isRental && property.rental_yield_estimate > 0 && (
              <div className="absolute top-3 right-3">
                <div className="px-2 py-1 bg-emerald-500/90 text-white text-xs font-medium rounded-full flex items-center gap-1 backdrop-blur-sm">
                  <TrendingUp className="w-3 h-3" />
                  {property.rental_yield_estimate}%
                </div>
              </div>
            )}

            {/* Action Buttons - Simplified, always visible on mobile */}
            <div className="absolute bottom-3 right-3 flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
              {isAuthenticated && onToggleSave && (
                <Button
                  size="icon"
                  variant="secondary"
                  className="w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-background/90 hover:bg-background backdrop-blur-sm"
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
                    "w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-background/90 hover:bg-background backdrop-blur-sm",
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
                className="w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-background/90 hover:bg-background backdrop-blur-sm"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Location */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{property.location_area}</span>
            </div>

            {/* Title - Larger for better scannability */}
            <h3 className="font-heading text-base sm:text-lg text-foreground mb-2 group-hover:text-gold transition-colors line-clamp-2 leading-tight">
              {property.title}
            </h3>

            {/* Price - More prominent */}
            <div className="mb-3">
              <DualPrice amountAED={property.price_aed} size="lg" abbreviate />
            </div>

            {/* Features - Cleaner layout */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Bed className="w-3.5 h-3.5" />
                <span>{property.bedrooms === 0 ? 'Studio' : property.bedrooms}</span>
              </span>
              <span className="flex items-center gap-1">
                <Bath className="w-3.5 h-3.5" />
                {property.bathrooms}
              </span>
              <span className="flex items-center gap-1">
                <Maximize className="w-3.5 h-3.5" />
                <span>{property.size_sqft.toLocaleString()}</span>
              </span>
            </div>

            {/* Completion Date & Investment Score Row - Only for sale properties */}
            {!isRental && (property.is_off_plan && property.completion_date) && (
              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(property.completion_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
                <InvestmentScoreBadge
                  price={property.price_aed}
                  sizeSqft={property.size_sqft}
                  rentalYield={property.rental_yield_estimate || 0}
                  area={property.location_area}
                  isOffPlan={property.is_off_plan}
                  developerName={property.developer_name}
                  variant="compact"
                />
              </div>
            )}
            
            {/* Investment Score for ready sale properties */}
            {!isRental && !(property.is_off_plan && property.completion_date) && (
              <div className="mt-3 pt-3 border-t border-border flex justify-end">
                <InvestmentScoreBadge
                  price={property.price_aed}
                  sizeSqft={property.size_sqft}
                  rentalYield={property.rental_yield_estimate || 0}
                  area={property.location_area}
                  isOffPlan={property.is_off_plan}
                  developerName={property.developer_name}
                  variant="compact"
                />
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
