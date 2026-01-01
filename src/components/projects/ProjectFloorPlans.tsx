import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Maximize2, Bed, Maximize, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import type { ProjectFloorPlan } from '@/hooks/useProject';

interface ProjectFloorPlansProps {
  floorPlans: ProjectFloorPlan[];
  brandColor?: string;
}

export function ProjectFloorPlans({ floorPlans, brandColor }: ProjectFloorPlansProps) {
  const [bedroomFilter, setBedroomFilter] = useState<string>('all');
  const [selectedPlan, setSelectedPlan] = useState<ProjectFloorPlan | null>(null);

  // Get unique bedroom counts
  const bedroomOptions = ['all', ...new Set(floorPlans.map(p => p.bedrooms?.toString() || 'other'))].sort((a, b) => {
    if (a === 'all') return -1;
    if (b === 'all') return 1;
    if (a === 'other') return 1;
    if (b === 'other') return -1;
    return parseInt(a) - parseInt(b);
  });

  const filteredPlans = bedroomFilter === 'all' 
    ? floorPlans 
    : floorPlans.filter(p => (p.bedrooms?.toString() || 'other') === bedroomFilter);

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
                {option === 'all' ? 'All' : option === 'other' ? 'Other' : option === '0' ? 'Studio' : `${option} BR`}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {/* Floor Plans Grid */}
      <AnimatePresence mode="popLayout">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              className="group relative bg-card border border-border rounded-xl overflow-hidden hover:shadow-elegant transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedPlan(plan)}
            >
              {/* Floor Plan Image */}
              <div className="relative aspect-square bg-muted/30 p-4">
                <img
                  src={plan.url}
                  alt={plan.title}
                  className="w-full h-full object-contain"
                />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-secondary/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button variant="secondary" size="sm" className="gap-2">
                    <Maximize2 className="h-4 w-4" />
                    View Full Size
                  </Button>
                </div>
              </div>

              {/* Plan Info */}
              <div className="p-4 border-t border-border">
                <h3 className="font-medium text-foreground mb-2">{plan.title}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {plan.bedrooms !== null && (
                    <div className="flex items-center gap-1">
                      <Bed className="h-4 w-4" />
                      <span>{plan.bedrooms === 0 ? 'Studio' : `${plan.bedrooms} BR`}</span>
                    </div>
                  )}
                  {plan.size_sqft && (
                    <div className="flex items-center gap-1">
                      <Maximize className="h-4 w-4" />
                      <span>{plan.size_sqft.toLocaleString()} sqft</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {filteredPlans.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No floor plans available for this selection.</p>
        </div>
      )}

      {/* Lightbox Dialog */}
      <Dialog open={!!selectedPlan} onOpenChange={() => setSelectedPlan(null)}>
        <DialogContent className="max-w-5xl p-0 bg-secondary border-border">
          {selectedPlan && (
            <div className="relative">
              {/* Close Button */}
              <button
                onClick={() => setSelectedPlan(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-secondary/80 text-secondary-foreground hover:bg-secondary transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Image Container */}
              <div className="bg-card p-8 flex items-center justify-center min-h-[60vh]">
                <img
                  src={selectedPlan.url}
                  alt={selectedPlan.title}
                  className="max-w-full max-h-[70vh] object-contain"
                />
              </div>

              {/* Info Bar */}
              <div className="p-6 border-t border-border bg-secondary">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-xl font-semibold text-secondary-foreground">
                      {selectedPlan.title}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-secondary-foreground/70">
                      {selectedPlan.bedrooms !== null && (
                        <div className="flex items-center gap-1">
                          <Bed className="h-4 w-4" />
                          <span>{selectedPlan.bedrooms === 0 ? 'Studio' : `${selectedPlan.bedrooms} Bedrooms`}</span>
                        </div>
                      )}
                      {selectedPlan.size_sqft && (
                        <div className="flex items-center gap-1">
                          <Maximize className="h-4 w-4" />
                          <span>{selectedPlan.size_sqft.toLocaleString()} sqft</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button variant="outline" className="gap-2" asChild>
                    <a href={selectedPlan.url} download target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4" />
                      Download
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
