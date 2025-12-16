import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MapPin, Bed, Bath, Maximize, TrendingUp, Calendar, Heart, Scale, Share2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { InvestmentScoreBadge } from './InvestmentScoreBadge';
import { GoldenVisaBadge } from './GoldenVisaBadge';
import { PopularityIndicator } from './PopularityIndicator';
import { DualPrice } from '@/components/DualPrice';
import { ImageCarousel } from './ImageCarousel';

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
          "h-full rounded-2xl bg-card border overflow-hidden transition-all duration-300",
          "hover:-translate-y-2 hover:shadow-2xl hover:shadow-gold/10",
          isComparing ? "border-gold ring-2 ring-gold/20" : "border-border hover:border-gold/30"
        )}>
          {/* Image Carousel */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <ImageCarousel 
              images={property.images} 
              alt={property.title}
              className="w-full h-full"
            />
            {/* Image Overlay on Hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            
            {/* Top Left Badges */}
            <div className="absolute top-2 left-2 flex flex-wrap gap-1.5 max-w-[70%]">
              {property.is_off_plan && (
                <motion.span 
                  className="px-2 py-0.5 bg-blue-500 text-white text-[10px] sm:text-xs font-medium rounded-full"
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  Off-Plan
                </motion.span>
              )}
              {property.is_featured && (
                <motion.span 
                  className="px-2 py-0.5 bg-gold text-primary-dark text-[10px] sm:text-xs font-medium rounded-full badge-pulse"
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  Featured
                </motion.span>
              )}
              <PopularityIndicator 
                viewsCount={property.views_count} 
                inquiriesCount={property.inquiries_count}
                variant="badge"
              />
              <GoldenVisaBadge priceAed={property.price_aed} variant="badge" />
            </div>

            {/* Top Right Badges */}
            <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
              <InvestmentScoreBadge
                price={property.price_aed}
                sizeSqft={property.size_sqft}
                rentalYield={property.rental_yield_estimate || 0}
                area={property.location_area}
                isOffPlan={property.is_off_plan}
                developerName={property.developer_name}
                variant="badge"
              />
              {property.rental_yield_estimate > 0 && (
                <div className="px-2 py-1 bg-emerald-500/90 text-white text-xs font-medium rounded-full flex items-center gap-1 backdrop-blur-sm">
                  <TrendingUp className="w-3 h-3" />
                  {property.rental_yield_estimate}% yield
                </div>
              )}
            </div>

            {/* Action Buttons - Always visible on mobile, hover on desktop */}
            <div className="absolute bottom-3 right-3 flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 translate-y-0 sm:translate-y-2 sm:group-hover:translate-y-0">
              {isAuthenticated && onToggleSave && (
                <Button
                  size="icon"
                  variant="secondary"
                  className="w-11 h-11 sm:w-9 sm:h-9 rounded-full bg-background/90 hover:bg-background backdrop-blur-sm transition-transform active:scale-95 hover:scale-110"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onToggleSave();
                  }}
                >
                  <Heart className={cn("w-5 h-5 sm:w-4 sm:h-4 transition-colors", isSaved && "fill-red-500 text-red-500")} />
                </Button>
              )}
              {showCompareButton && onCompare && (
                <Button
                  size="icon"
                  variant="secondary"
                  className={cn(
                    "w-11 h-11 sm:w-9 sm:h-9 rounded-full bg-background/90 hover:bg-background backdrop-blur-sm transition-transform active:scale-95 hover:scale-110",
                    isComparing && "bg-gold text-primary-dark"
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onCompare();
                  }}
                >
                  <Scale className="w-5 h-5 sm:w-4 sm:h-4" />
                </Button>
              )}
              <Button
                size="icon"
                variant="secondary"
                className="w-11 h-11 sm:w-9 sm:h-9 rounded-full bg-background/90 hover:bg-background backdrop-blur-sm transition-transform active:scale-95 hover:scale-110"
                onClick={handleShare}
              >
                <Share2 className="w-5 h-5 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-5">
            {/* Location */}
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2 transition-colors group-hover:text-muted-foreground/80">
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="truncate">{property.location_area}</span>
              {property.developer_name && (
                <span className="text-xs hidden sm:inline">• {property.developer_name}</span>
              )}
            </div>

            {/* Title */}
            <h3 className="font-heading text-lg sm:text-xl text-foreground mb-3 group-hover:text-gold transition-colors duration-300 line-clamp-2">
              {property.title}
            </h3>

            {/* Price */}
            <div className="mb-3 transition-all group-hover:scale-[1.02] origin-left">
              <DualPrice amountAED={property.price_aed} size="lg" abbreviate />
            </div>

            {/* Features */}
            <div className="flex items-center gap-3 sm:gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5 transition-colors group-hover:text-foreground">
                <Bed className="w-4 h-4" />
                <span>{property.bedrooms === 0 ? 'Studio' : `${property.bedrooms} BR`}</span>
              </span>
              <span className="flex items-center gap-1.5 transition-colors group-hover:text-foreground">
                <Bath className="w-4 h-4" />
                {property.bathrooms}
              </span>
              <span className="flex items-center gap-1.5 transition-colors group-hover:text-foreground">
                <Maximize className="w-4 h-4" />
                <span className="hidden sm:inline">{property.size_sqft.toLocaleString()} sqft</span>
                <span className="sm:hidden">{(property.size_sqft / 1000).toFixed(1)}k</span>
              </span>
            </div>

            {/* Completion Date for Off-Plan */}
            {property.is_off_plan && property.completion_date && (
              <div className="mt-3 pt-3 border-t border-border">
                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Completion: {new Date(property.completion_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
              </div>
            )}

            {/* Popularity Indicator */}
            {(property.views_count != null && property.views_count > 0) || (property.inquiries_count != null && property.inquiries_count > 0) ? (
              <div className="mt-3 pt-3 border-t border-border">
                <PopularityIndicator 
                  viewsCount={property.views_count} 
                  inquiriesCount={property.inquiries_count}
                  variant="inline"
                />
              </div>
            ) : null}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
