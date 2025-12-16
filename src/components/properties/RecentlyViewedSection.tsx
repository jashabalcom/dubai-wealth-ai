import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DualPrice } from '@/components/DualPrice';
import { cn } from '@/lib/utils';

interface RecentlyViewedProperty {
  id: string;
  slug: string;
  title: string;
  location_area: string;
  price_aed: number;
  images: string[];
  viewedAt: number;
}

interface RecentlyViewedSectionProps {
  properties: RecentlyViewedProperty[];
  onClear: () => void;
  className?: string;
}

export function RecentlyViewedSection({ 
  properties, 
  onClear, 
  className 
}: RecentlyViewedSectionProps) {
  if (properties.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("mb-8", className)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">Recently Viewed</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          <X className="w-3 h-3 mr-1" />
          Clear
        </Button>
      </div>

      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
          {properties.slice(0, 6).map((property, index) => (
            <Link
              key={property.id}
              to={`/properties/${property.slug}`}
              className="group shrink-0"
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="w-48 rounded-xl bg-card border border-border overflow-hidden hover:border-gold/30 transition-all duration-300 hover:shadow-lg"
              >
                <div className="aspect-[4/3] relative overflow-hidden">
                  <img
                    src={property.images[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400'}
                    alt={property.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="p-3">
                  <p className="text-xs text-muted-foreground truncate mb-1">
                    {property.location_area}
                  </p>
                  <h4 className="text-sm font-medium text-foreground truncate group-hover:text-gold transition-colors">
                    {property.title}
                  </h4>
                  <div className="mt-2">
                    <DualPrice amountAED={property.price_aed} size="sm" abbreviate />
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}

          {properties.length > 6 && (
            <Link
              to="/properties/saved"
              className="shrink-0 w-32 flex flex-col items-center justify-center rounded-xl bg-muted/50 border border-border hover:border-gold/30 transition-colors group"
            >
              <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-gold transition-colors" />
              <span className="text-xs text-muted-foreground mt-1">
                View all ({properties.length})
              </span>
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}
