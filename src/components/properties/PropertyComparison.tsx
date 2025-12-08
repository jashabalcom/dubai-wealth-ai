import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, Scale, MapPin, Bed, Bath, Maximize, TrendingUp, DollarSign, Building2 } from 'lucide-react';
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
  price_aed: number;
  bedrooms: number;
  bathrooms: number;
  size_sqft: number;
  rental_yield_estimate: number;
  images: string[];
}

interface PropertyComparisonProps {
  properties: Property[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

function formatPrice(price: number): string {
  if (price >= 1000000) {
    return `AED ${(price / 1000000).toFixed(2)}M`;
  }
  return `AED ${(price / 1000).toFixed(0)}K`;
}

export function PropertyComparison({ properties, onRemove, onClear }: PropertyComparisonProps) {
  if (properties.length === 0) return null;

  const metrics = [
    { 
      label: 'Price', 
      key: 'price_aed', 
      format: (v: number) => formatPrice(v),
      icon: DollarSign,
      highlight: 'lowest',
    },
    { 
      label: 'Price/sqft', 
      key: 'price_per_sqft', 
      format: (v: number) => `AED ${v.toLocaleString()}`,
      icon: Maximize,
      highlight: 'lowest',
    },
    { 
      label: 'Size', 
      key: 'size_sqft', 
      format: (v: number) => `${v.toLocaleString()} sqft`,
      icon: Maximize,
      highlight: 'highest',
    },
    { 
      label: 'Bedrooms', 
      key: 'bedrooms', 
      format: (v: number) => v === 0 ? 'Studio' : `${v} BR`,
      icon: Bed,
      highlight: 'highest',
    },
    { 
      label: 'Bathrooms', 
      key: 'bathrooms', 
      format: (v: number) => `${v}`,
      icon: Bath,
      highlight: 'highest',
    },
    { 
      label: 'Est. Yield', 
      key: 'rental_yield_estimate', 
      format: (v: number) => `${v}%`,
      icon: TrendingUp,
      highlight: 'highest',
    },
    { 
      label: 'Est. Monthly Rent', 
      key: 'monthly_rent', 
      format: (v: number) => `AED ${v.toLocaleString()}`,
      icon: DollarSign,
      highlight: 'highest',
    },
  ];

  // Calculate derived metrics
  const propertiesWithMetrics = properties.map(p => ({
    ...p,
    price_per_sqft: Math.round(p.price_aed / p.size_sqft),
    monthly_rent: Math.round((p.price_aed * (p.rental_yield_estimate / 100)) / 12),
  }));

  const getHighlightClass = (metric: typeof metrics[0], value: number) => {
    const values = propertiesWithMetrics.map(p => p[metric.key as keyof typeof p] as number);
    const best = metric.highlight === 'highest' ? Math.max(...values) : Math.min(...values);
    return value === best ? 'text-emerald-500 font-semibold' : '';
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-2xl"
      >
        <div className="container mx-auto px-4 py-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-gold" />
              <h3 className="font-heading text-lg text-foreground">
                Comparing {properties.length} Properties
              </h3>
            </div>
            <Button variant="ghost" size="sm" onClick={onClear}>
              Clear All
            </Button>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto pb-2">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr>
                  <th className="text-left p-2 w-32"></th>
                  {propertiesWithMetrics.map((property) => (
                    <th key={property.id} className="p-2 min-w-[200px]">
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute -top-1 -right-1 w-6 h-6 rounded-full"
                          onClick={() => onRemove(property.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                        <Link to={`/properties/${property.slug}`}>
                          <div className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                            <img
                              src={property.images[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=200'}
                              alt={property.title}
                              className="w-24 h-16 object-cover rounded"
                            />
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {property.location_area}
                              </p>
                              <p className="text-sm font-medium text-foreground line-clamp-1">
                                {property.title}
                              </p>
                            </div>
                          </div>
                        </Link>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {metrics.map((metric) => (
                  <tr key={metric.key} className="border-t border-border">
                    <td className="p-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <metric.icon className="w-4 h-4" />
                        {metric.label}
                      </div>
                    </td>
                    {propertiesWithMetrics.map((property) => {
                      const value = property[metric.key as keyof typeof property] as number;
                      return (
                        <td 
                          key={property.id} 
                          className={cn(
                            "p-2 text-center text-sm",
                            getHighlightClass(metric, value)
                          )}
                        >
                          {metric.format(value)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr className="border-t border-border">
                  <td className="p-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Type
                    </div>
                  </td>
                  {propertiesWithMetrics.map((property) => (
                    <td key={property.id} className="p-2 text-center text-sm">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs",
                        property.is_off_plan 
                          ? "bg-blue-500/10 text-blue-500" 
                          : "bg-muted text-muted-foreground"
                      )}>
                        {property.is_off_plan ? 'Off-Plan' : 'Ready'}
                      </span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Floating comparison bar component
export function ComparisonBar({ 
  count, 
  onView, 
  onClear 
}: { 
  count: number; 
  onView: () => void; 
  onClear: () => void;
}) {
  if (count === 0) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-secondary text-secondary-foreground px-6 py-3 rounded-full shadow-lg flex items-center gap-4"
    >
      <div className="flex items-center gap-2">
        <Scale className="w-5 h-5 text-gold" />
        <span className="font-medium">{count} selected</span>
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={onClear} className="text-secondary-foreground hover:text-foreground">
          Clear
        </Button>
        <Button variant="gold" size="sm" onClick={onView} disabled={count < 2}>
          Compare
        </Button>
      </div>
    </motion.div>
  );
}
