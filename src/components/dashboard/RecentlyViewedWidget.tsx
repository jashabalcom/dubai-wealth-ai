import { motion } from 'framer-motion';
import { Clock, Bed, MapPin, Heart, Building2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { useSavedProperties } from '@/hooks/useSavedProperties';
import { useCurrencyConverter } from '@/hooks/useCurrencyConverter';

export function RecentlyViewedWidget() {
  const navigate = useNavigate();
  const { recentlyViewed } = useRecentlyViewed();
  const { toggleSave, isSaved, isToggling } = useSavedProperties();
  const { formatAED } = useCurrencyConverter();

  // Take first 4 properties
  const properties = recentlyViewed?.slice(0, 4) || [];
  const isLoading = false; // localStorage is synchronous

  if (isLoading) {
    return (
      <div className="p-5 rounded-xl bg-card border border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-muted animate-pulse" />
          <div className="h-5 w-32 bg-muted rounded animate-pulse" />
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-40 flex-shrink-0">
              <div className="h-24 bg-muted rounded-lg animate-pulse mb-2" />
              <div className="h-3 w-3/4 bg-muted rounded animate-pulse mb-1" />
              <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h3 className="font-heading text-base text-foreground">Explore Properties</h3>
            <p className="text-xs text-muted-foreground">Find your next investment</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Browse thousands of Dubai properties with detailed analytics and ROI projections.
        </p>

        <Button 
          onClick={() => navigate('/properties')}
          className="w-full gap-2"
          variant="default"
        >
          Browse Properties
          <ArrowRight className="w-4 h-4" />
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-xl bg-card border border-border"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
            <Clock className="w-4 h-4 text-muted-foreground" />
          </div>
          <h3 className="font-heading text-base text-foreground">Recently Viewed</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate('/properties')} className="text-xs">
          View All
        </Button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        {properties.map((property, index) => (
          <motion.button
            key={property.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => navigate(`/properties/${property.id}`)}
            className="w-40 flex-shrink-0 group text-left"
          >
            {/* Image */}
            <div className="relative h-24 rounded-lg overflow-hidden mb-2">
              {property.images?.[0] ? (
                <img 
                  src={property.images[0]} 
                  alt={property.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
              
              {/* Save button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSave(property.id);
                }}
                disabled={isToggling}
                className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <Heart 
                  className={`w-3.5 h-3.5 ${isSaved(property.id) ? 'fill-rose-500 text-rose-500' : 'text-white'}`} 
                />
              </button>
            </div>

            {/* Info */}
            <p className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {formatAED(property.price_aed)}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
              <MapPin className="w-3 h-3" />
              <span className="line-clamp-1">{property.location_area}</span>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
