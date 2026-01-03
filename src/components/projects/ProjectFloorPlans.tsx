import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Maximize2, Bed, Maximize, X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { ProjectFloorPlan } from '@/hooks/useProject';

interface ProjectFloorPlansProps {
  floorPlans: ProjectFloorPlan[];
  brandColor?: string;
}

export function ProjectFloorPlans({ floorPlans, brandColor }: ProjectFloorPlansProps) {
  const [bedroomFilter, setBedroomFilter] = useState<string>('all');
  const [selectedPlanIndex, setSelectedPlanIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

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

  const selectedPlan = selectedPlanIndex !== null ? filteredPlans[selectedPlanIndex] : null;
  const hasMultiplePlans = filteredPlans.length > 1;

  // Reset zoom/pan when changing plans
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [selectedPlanIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedPlanIndex === null) return;

      switch (e.key) {
        case 'Escape':
          setSelectedPlanIndex(null);
          break;
        case 'ArrowLeft':
          if (selectedPlanIndex > 0) {
            setSelectedPlanIndex(selectedPlanIndex - 1);
          }
          break;
        case 'ArrowRight':
          if (selectedPlanIndex < filteredPlans.length - 1) {
            setSelectedPlanIndex(selectedPlanIndex + 1);
          }
          break;
        case '+':
        case '=':
          setZoom(z => Math.min(z + 0.25, 3));
          break;
        case '-':
          setZoom(z => Math.max(z - 0.25, 0.5));
          break;
        case '0':
          setZoom(1);
          setPan({ x: 0, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPlanIndex, filteredPlans.length]);

  // Handle mouse wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(z => Math.min(Math.max(z + delta, 0.5), 3));
    }
  }, []);

  // Handle pan start
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [zoom, pan]);

  // Handle pan move
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart, zoom]);

  // Handle pan end
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const goToPrevious = () => {
    if (selectedPlanIndex !== null && selectedPlanIndex > 0) {
      setSelectedPlanIndex(selectedPlanIndex - 1);
    }
  };

  const goToNext = () => {
    if (selectedPlanIndex !== null && selectedPlanIndex < filteredPlans.length - 1) {
      setSelectedPlanIndex(selectedPlanIndex + 1);
    }
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
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
              onClick={() => setSelectedPlanIndex(index)}
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

      {/* Enhanced Lightbox Dialog */}
      <Dialog open={selectedPlanIndex !== null} onOpenChange={() => setSelectedPlanIndex(null)}>
        <DialogContent className="max-w-6xl p-0 bg-secondary border-border">
          {selectedPlan && (
            <div className="relative">
              {/* Top Controls */}
              <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
                {/* Counter */}
                <div className="px-3 py-1.5 rounded-full bg-secondary/80 backdrop-blur-sm text-sm font-medium">
                  {selectedPlanIndex !== null ? selectedPlanIndex + 1 : 0} of {filteredPlans.length}
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-9 w-9 bg-secondary/80 backdrop-blur-sm"
                    onClick={() => setZoom(z => Math.max(z - 0.25, 0.5))}
                    disabled={zoom <= 0.5}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="px-2 text-sm font-medium min-w-[50px] text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-9 w-9 bg-secondary/80 backdrop-blur-sm"
                    onClick={() => setZoom(z => Math.min(z + 0.25, 3))}
                    disabled={zoom >= 3}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-9 w-9 bg-secondary/80 backdrop-blur-sm"
                    onClick={resetView}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setSelectedPlanIndex(null)}
                  className="p-2 rounded-full bg-secondary/80 backdrop-blur-sm text-secondary-foreground hover:bg-secondary transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Arrows */}
              {hasMultiplePlans && (
                <>
                  <button
                    onClick={goToPrevious}
                    disabled={selectedPlanIndex === 0}
                    className={cn(
                      "absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-secondary/80 backdrop-blur-sm transition-all",
                      selectedPlanIndex === 0 
                        ? "opacity-30 cursor-not-allowed" 
                        : "hover:bg-secondary hover:scale-110"
                    )}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={goToNext}
                    disabled={selectedPlanIndex === filteredPlans.length - 1}
                    className={cn(
                      "absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-secondary/80 backdrop-blur-sm transition-all",
                      selectedPlanIndex === filteredPlans.length - 1 
                        ? "opacity-30 cursor-not-allowed" 
                        : "hover:bg-secondary hover:scale-110"
                    )}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}

              {/* Image Container with Zoom/Pan */}
              <div 
                className={cn(
                  "bg-card p-8 flex items-center justify-center min-h-[60vh] overflow-hidden",
                  zoom > 1 && "cursor-grab",
                  isDragging && "cursor-grabbing"
                )}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <img
                  src={selectedPlan.url}
                  alt={selectedPlan.title}
                  className="max-w-full max-h-[70vh] object-contain select-none"
                  style={{
                    transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                    transition: isDragging ? 'none' : 'transform 0.2s ease-out'
                  }}
                  draggable={false}
                />
              </div>

              {/* Thumbnail Strip */}
              {hasMultiplePlans && (
                <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/80 backdrop-blur-sm">
                    {filteredPlans.map((plan, index) => (
                      <button
                        key={plan.id}
                        onClick={() => setSelectedPlanIndex(index)}
                        className={cn(
                          "w-12 h-12 rounded-md overflow-hidden border-2 transition-all",
                          index === selectedPlanIndex 
                            ? "border-primary ring-2 ring-primary/30" 
                            : "border-transparent opacity-60 hover:opacity-100"
                        )}
                      >
                        <img
                          src={plan.url}
                          alt={plan.title}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

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

                {/* Keyboard hints */}
                <div className="mt-4 pt-4 border-t border-border/50 flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Use <kbd className="px-1.5 py-0.5 rounded bg-muted">←</kbd> <kbd className="px-1.5 py-0.5 rounded bg-muted">→</kbd> to navigate</span>
                  <span><kbd className="px-1.5 py-0.5 rounded bg-muted">+</kbd> <kbd className="px-1.5 py-0.5 rounded bg-muted">-</kbd> to zoom</span>
                  <span><kbd className="px-1.5 py-0.5 rounded bg-muted">0</kbd> to reset</span>
                  <span><kbd className="px-1.5 py-0.5 rounded bg-muted">ESC</kbd> to close</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
