import { useState, useMemo, useCallback, Component, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Compass, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
        <Card className="border-destructive/20 bg-card/60 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-8 text-center">
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
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
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
  const handleViewOnMap = useCallback((poiId: string, lat: number, lng: number) => {
    setSelectedPOIId(poiId);
    // The map component will handle the fly-to animation
  }, []);

  return (
    <NeighborhoodExplorerErrorBoundary neighborhoodName={neighborhoodName}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
      <Card className="border-primary/10 bg-card/60 backdrop-blur-sm">
          {/* Gold accent line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        
        <CardHeader className="pb-4">
          <CardTitle className="font-serif text-xl flex items-center gap-2">
            <Compass className="h-5 w-5 text-primary" />
            Explore {neighborhoodName}
          </CardTitle>
          
          {/* Category Filter Pills */}
          <POICategoryFilter
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            counts={poiCounts}
            totalCount={allPOIs?.length || 0}
            className="mt-4"
          />
        </CardHeader>
        
        <CardContent className="p-0 space-y-0">
          {/* Enhanced Map */}
          <NeighborhoodMapEnhanced
            latitude={latitude}
            longitude={longitude}
            neighborhoodId={neighborhoodId}
            neighborhoodName={neighborhoodName}
            pois={filteredPOIs}
            activeCategory={activeCategory}
            selectedPOIId={selectedPOIId}
            onPOISelect={handlePOISelect}
            className="h-[300px] sm:h-[400px] md:h-[500px]"
          />
          
          {/* POI Cards - Horizontal Scroll */}
          {filteredPOIs.length > 0 && (
            <div className="p-4 border-t border-border/50 overflow-x-hidden">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {activeCategory === 'all' ? 'All Places' : POI_CATEGORIES.find(c => c.key === activeCategory)?.label}
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{filteredPOIs.length}</span>
                </h4>
              </div>
              
              <div 
                className="flex gap-3 sm:gap-4 pb-4 overflow-x-auto scrollbar-none"
                style={{ 
                  WebkitOverflowScrolling: 'touch',
                  overscrollBehaviorX: 'contain',
                  overscrollBehaviorY: 'auto',
                  scrollSnapType: 'x mandatory',
                  paddingLeft: '1rem',
                  paddingRight: '1rem'
                }}
              >
                {filteredPOIs.map((poi) => (
                  <motion.div
                    key={poi.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`w-[240px] sm:w-[280px] shrink-0 transition-all duration-300 cursor-pointer ${
                      selectedPOIId === poi.id 
                        ? 'ring-2 ring-primary ring-offset-2 ring-offset-background rounded-xl' 
                        : ''
                    }`}
                    style={{ scrollSnapAlign: 'start' }}
                    onClick={() => {
                      if (poi.latitude && poi.longitude) {
                        handleViewOnMap(poi.id, poi.latitude, poi.longitude);
                      }
                    }}
                  >
                    <POICard poi={poi} />
                  </motion.div>
                ))}
              </div>
            </div>
          )}
          
          {/* Empty State */}
          {!isLoading && filteredPOIs.length === 0 && (
            <div className="p-8 text-center">
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
        </CardContent>
      </Card>
    </motion.div>
    </NeighborhoodExplorerErrorBoundary>
  );
}
