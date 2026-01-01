import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bed, Bath, Maximize, Eye, Layers, Check, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { ProjectUnitType } from '@/hooks/useProject';
import { formatCurrency } from '@/lib/utils';

interface ProjectUnitTypesProps {
  unitTypes: ProjectUnitType[];
  brandColor?: string;
}

const availabilityConfig: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  available: { label: 'Available', icon: <Check className="h-3 w-3" />, className: 'bg-green-500/10 text-green-600 border-green-500/20' },
  limited: { label: 'Limited Units', icon: <AlertCircle className="h-3 w-3" />, className: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  sold_out: { label: 'Sold Out', icon: null, className: 'bg-muted text-muted-foreground border-border' },
};

export function ProjectUnitTypes({ unitTypes, brandColor }: ProjectUnitTypesProps) {
  const [bedroomFilter, setBedroomFilter] = useState<string>('all');
  const [selectedFloorPlan, setSelectedFloorPlan] = useState<string | null>(null);

  // Get unique bedroom counts
  const bedroomOptions = ['all', ...new Set(unitTypes.map(u => u.bedrooms.toString()))].sort((a, b) => {
    if (a === 'all') return -1;
    if (b === 'all') return 1;
    return parseInt(a) - parseInt(b);
  });

  const filteredUnits = bedroomFilter === 'all' 
    ? unitTypes 
    : unitTypes.filter(u => u.bedrooms.toString() === bedroomFilter);

  const formatSize = (min: number | null, max: number | null) => {
    if (!min && !max) return null;
    if (min && max && min !== max) return `${min.toLocaleString()} - ${max.toLocaleString()} sqft`;
    return `${(min || max)?.toLocaleString()} sqft`;
  };

  const formatPriceRange = (from: number | null, to: number | null) => {
    if (!from && !to) return null;
    if (from && to && from !== to) return `${formatCurrency(from)} - ${formatCurrency(to)}`;
    return formatCurrency(from || to || 0);
  };

  return (
    <div className="space-y-6">
      {/* Bedroom Filter */}
      {bedroomOptions.length > 2 && (
        <Tabs value={bedroomFilter} onValueChange={setBedroomFilter}>
          <TabsList className="bg-muted/50">
            {bedroomOptions.map((option) => (
              <TabsTrigger
                key={option}
                value={option}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {option === 'all' ? 'All' : option === '0' ? 'Studio' : `${option} BR`}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {/* Unit Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredUnits.map((unit, index) => {
          const availability = availabilityConfig[unit.availability_status] || availabilityConfig.available;
          const sizeText = formatSize(unit.size_sqft_min, unit.size_sqft_max);
          const priceText = formatPriceRange(unit.price_from, unit.price_to);

          return (
            <motion.div
              key={unit.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group relative bg-card border border-border rounded-xl p-5 hover:shadow-elegant transition-all duration-300"
            >
              {/* Availability Badge */}
              <Badge 
                variant="outline" 
                className={`absolute top-4 right-4 gap-1 ${availability.className}`}
              >
                {availability.icon}
                {availability.label}
              </Badge>

              {/* Unit Name */}
              <h3 className="font-serif text-lg font-semibold text-foreground mb-3 pr-24">
                {unit.name}
              </h3>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Bed className="h-4 w-4 text-primary" />
                  <span className="text-sm">
                    {unit.bedrooms === 0 ? 'Studio' : `${unit.bedrooms} Bedroom${unit.bedrooms > 1 ? 's' : ''}`}
                  </span>
                </div>
                {unit.bathrooms && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Bath className="h-4 w-4 text-primary" />
                    <span className="text-sm">{unit.bathrooms} Bath</span>
                  </div>
                )}
                {sizeText && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Maximize className="h-4 w-4 text-primary" />
                    <span className="text-sm">{sizeText}</span>
                  </div>
                )}
                {unit.view_type && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Eye className="h-4 w-4 text-primary" />
                    <span className="text-sm">{unit.view_type}</span>
                  </div>
                )}
                {unit.floor_range && (
                  <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                    <Layers className="h-4 w-4 text-primary" />
                    <span className="text-sm">Floors {unit.floor_range}</span>
                  </div>
                )}
              </div>

              {/* Price */}
              {priceText && (
                <div className="border-t border-border pt-4 mt-4">
                  <span className="text-sm text-muted-foreground">Starting from</span>
                  <div className="text-xl font-bold text-foreground font-mono">
                    {priceText}
                  </div>
                </div>
              )}

              {/* Floor Plan Button */}
              {unit.floor_plan_url && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full"
                  onClick={() => setSelectedFloorPlan(unit.floor_plan_url)}
                >
                  View Floor Plan
                </Button>
              )}
            </motion.div>
          );
        })}
      </div>

      {filteredUnits.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No unit types available for this selection.</p>
        </div>
      )}

      {/* Floor Plan Dialog */}
      <Dialog open={!!selectedFloorPlan} onOpenChange={() => setSelectedFloorPlan(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Floor Plan</DialogTitle>
          </DialogHeader>
          {selectedFloorPlan && (
            <img 
              src={selectedFloorPlan} 
              alt="Floor Plan" 
              className="w-full h-auto max-h-[70vh] object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
