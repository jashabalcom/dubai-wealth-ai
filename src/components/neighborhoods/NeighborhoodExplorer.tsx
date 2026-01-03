import { useState, useMemo, useCallback, Component, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Compass, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { POICategoryFilter, POI_CATEGORIES } from './POICategoryFilter';
import { NeighborhoodMapEnhanced } from './NeighborhoodMapEnhanced';
import { POICard } from './POICard';
import { useNeighborhoodPOIs } from '@/hooks/useNeighborhoods';

// Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class NeighborhoodExplorerErrorBoundary extends Component<
  { children: ReactNode; neighborhoodName: string },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode; neighborhoodName: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('NeighborhoodExplorer error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl border border-destructive/20 bg-card/60 backdrop-blur-sm p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="text-lg font-medium mb-2">Unable to load map</h3>
          <p className="text-muted-foreground text-sm mb-4">
            There was an error loading the neighborhood explorer for {this.props.neighborhoodName}.
          </p>
          <Button 
            variant="outline" 
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="min-h-[44px]"
          >
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

interface NeighborhoodExplorerProps {
  neighborhoodId: string;
  neighborhoodName: string;
  latitude: number;
  longitude: number;
}

export function NeighborhoodExplorer({
  neighborhoodId,
  neighborhoodName,
  latitude,
  longitude
}: NeighborhoodExplorerProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedPOIId, setSelectedPOIId] = useState<string | null>(null);
  
  const { data: allPOIs, isLoading } = useNeighborhoodPOIs(neighborhoodId);
  
  // Calculate counts per category
  const poiCounts = useMemo(() => {
    if (!allPOIs) return {};
    return allPOIs.reduce((acc, poi) => {
      acc[poi.poi_type] = (acc[poi.poi_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [allPOIs]);
  
  // Filter POIs by active category
  const filteredPOIs = useMemo(() => {
    if (!allPOIs) return [];
    if (activeCategory === 'all') return allPOIs;
    return allPOIs.filter(poi => poi.poi_type === activeCategory);
  }, [allPOIs, activeCategory]);
  
  // Handle POI selection from map or card
  const handlePOISelect = useCallback((poiId: string | null) => {
    setSelectedPOIId(poiId);
  }, []);
  
  // Handle fly to POI from card click
  const handleViewOnMap = useCallback((poiId: string) => {
    setSelectedPOIId(poiId);
  }, []);

  const activeCategoryLabel = activeCategory === 'all' 
    ? 'All Places' 
    : POI_CATEGORIES.find(c => c.key === activeCategory)?.label || 'Places';

  return (
    <NeighborhoodExplorerErrorBoundary neighborhoodName={neighborhoodName}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-xl border border-primary/10 bg-card/60 backdrop-blur-sm overflow-hidden"
      >
        {/* Gold accent line */}
        <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        
        {/* Header */}
        <div className="p-4 pb-3">
          <h3 className="font-serif text-xl flex items-center gap-2 mb-3">
            <Compass className="h-5 w-5 text-primary" />
            Explore {neighborhoodName}
          </h3>
          
          {/* Category Filter Pills */}
          <POICategoryFilter
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            counts={poiCounts}
            totalCount={allPOIs?.length || 0}
          />
        </div>
        
        {/* Map */}
        <NeighborhoodMapEnhanced
          latitude={latitude}
          longitude={longitude}
          neighborhoodId={neighborhoodId}
          neighborhoodName={neighborhoodName}
          pois={filteredPOIs}
          activeCategory={activeCategory}
          selectedPOIId={selectedPOIId}
          onPOISelect={handlePOISelect}
          className="h-[280px] sm:h-[360px] md:h-[450px]"
        />
        
        {/* POI Cards Section */}
        {filteredPOIs.length > 0 && (
          <div className="border-t border-border/50">
            {/* Section Header */}
            <div className="px-4 pt-4 pb-2">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {activeCategoryLabel}
                <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                  {filteredPOIs.length}
                </span>
              </h4>
            </div>
            
            {/* Horizontal Scroll Container */}
            <div 
              className="flex gap-3 overflow-x-auto scrollbar-none pb-4 px-4"
              style={{ 
                WebkitOverflowScrolling: 'touch',
                overscrollBehaviorX: 'contain'
              }}
            >
              {filteredPOIs.map((poi) => (
                <motion.div
                  key={poi.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`w-[240px] flex-none cursor-pointer transition-all duration-200 ${
                    selectedPOIId === poi.id 
                      ? 'ring-2 ring-primary ring-offset-2 ring-offset-background rounded-xl' 
                      : ''
                  }`}
                  onClick={() => handleViewOnMap(poi.id)}
                >
                  <POICard poi={poi} />
                </motion.div>
              ))}
            </div>
          </div>
        )}
        
        {/* Empty State */}
        {!isLoading && filteredPOIs.length === 0 && (
          <div className="p-8 text-center border-t border-border/50">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
              <MapPin className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              No points of interest found for this area
            </p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              POIs can be fetched from the admin panel
            </p>
          </div>
        )}
      </motion.div>
    </NeighborhoodExplorerErrorBoundary>
  );
}
