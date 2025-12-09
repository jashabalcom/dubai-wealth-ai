import { useState } from 'react';
import { FileImage, X, ZoomIn } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface FloorPlan {
  id: string;
  url: string;
  title: string | null;
  floor_number: number | null;
  order_index: number;
}

interface FloorPlansGalleryProps {
  floorPlans: FloorPlan[];
}

export function FloorPlansGallery({ floorPlans }: FloorPlansGalleryProps) {
  const [selectedPlan, setSelectedPlan] = useState<FloorPlan | null>(null);

  if (floorPlans.length === 0) return null;

  return (
    <div className="p-6 rounded-xl bg-card border border-border">
      <h2 className="font-heading text-xl text-foreground mb-4 flex items-center gap-2">
        <FileImage className="h-5 w-5 text-gold" />
        Floor Plans
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {floorPlans.map((plan) => (
          <button
            key={plan.id}
            onClick={() => setSelectedPlan(plan)}
            className="group relative aspect-[4/3] rounded-lg overflow-hidden border border-border bg-muted hover:border-gold/50 transition-all"
          >
            <img
              src={plan.url}
              alt={plan.title || `Floor Plan ${plan.floor_number || plan.order_index + 1}`}
              className="w-full h-full object-contain p-2"
            />
            
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="flex flex-col items-center gap-1">
                <ZoomIn className="h-6 w-6 text-gold" />
                <span className="text-xs text-foreground">View Full Size</span>
              </div>
            </div>
            
            {/* Label */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-2">
              <p className="text-xs text-foreground text-center truncate">
                {plan.title || (plan.floor_number ? `Floor ${plan.floor_number}` : `Plan ${plan.order_index + 1}`)}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={!!selectedPlan} onOpenChange={() => setSelectedPlan(null)}>
        <DialogContent className="max-w-4xl w-full p-0 bg-background border-none">
          <button
            onClick={() => setSelectedPlan(null)}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 hover:bg-background transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          
          {selectedPlan && (
            <div className="w-full aspect-[4/3] p-4">
              <img
                src={selectedPlan.url}
                alt={selectedPlan.title || 'Floor Plan'}
                className="w-full h-full object-contain"
              />
              {selectedPlan.title && (
                <p className="text-center text-foreground mt-2 font-medium">
                  {selectedPlan.title}
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
