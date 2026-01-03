import { useState, useMemo, useCallback, Component, ReactNode } from 'react';
import { MapPin, Compass, AlertTriangle, ChevronUp, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { POICategoryFilter, POI_CATEGORIES } from './POICategoryFilter';
import { NeighborhoodMapEnhanced } from './NeighborhoodMapEnhanced';
import { POIListItem } from './POIListItem';
import { useNeighborhoodPOIs } from '@/hooks/useNeighborhoods';
import { cn } from '@/lib/utils';

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
  const [drawerOpen, setDrawerOpen] = useState(false);

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

  // Handle POI selection from map or list
  const handlePOISelect = useCallback((poiId: string | null) => {
    setSelectedPOIId(poiId);
  }, []);

  // Handle POI click from list - select and close drawer on mobile
  const handleListPOIClick = useCallback((poiId: string) => {
    setSelectedPOIId(poiId);
    // Close drawer on mobile after selection
    setDrawerOpen(false);
  }, []);

  const activeCategoryLabel = activeCategory === 'all'
    ? 'All Places'
    : POI_CATEGORIES.find(c => c.key === activeCategory)?.label || 'Places';

  return (
    <NeighborhoodExplorerErrorBoundary neighborhoodName={neighborhoodName}>
      <div className="rounded-xl border border-primary/10 bg-card/60 backdrop-blur-sm overflow-visible">
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
            isLoading={isLoading}
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

        {/* Mobile: Bottom Sheet Drawer for POI List */}
        {filteredPOIs.length > 0 && (
          <div className="sm:hidden border-t border-border/50">
            <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
              <DrawerTrigger asChild>
                <button
                  type="button"
                  className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <List className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{activeCategoryLabel}</span>
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                      {filteredPOIs.length}
                    </span>
                  </div>
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                </button>
              </DrawerTrigger>
              <DrawerContent className="max-h-[85vh]">
                <DrawerHeader className="pb-2">
                  <DrawerTitle className="flex items-center gap-2 text-lg">
                    <MapPin className="h-5 w-5 text-primary" />
                    {activeCategoryLabel}
                    <span className="text-sm font-normal text-muted-foreground">
                      ({filteredPOIs.length})
                    </span>
                  </DrawerTitle>
                </DrawerHeader>
                <ScrollArea className="flex-1 px-4 pb-6" style={{ maxHeight: 'calc(85vh - 80px)' }}>
                  <div className="space-y-1">
                    {filteredPOIs.map((poi) => (
                      <POIListItem
                        key={poi.id}
                        poi={poi}
                        isSelected={selectedPOIId === poi.id}
                        onClick={() => handleListPOIClick(poi.id)}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </DrawerContent>
            </Drawer>
          </div>
        )}

        {/* Desktop: Simple list below map */}
        {filteredPOIs.length > 0 && (
          <div className="hidden sm:block border-t border-border/50">
            <div className="p-4">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-3">
                <MapPin className="h-4 w-4" />
                {activeCategoryLabel}
                <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                  {filteredPOIs.length}
                </span>
              </h4>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {filteredPOIs.slice(0, 9).map((poi) => (
                  <POIListItem
                    key={poi.id}
                    poi={poi}
                    isSelected={selectedPOIId === poi.id}
                    onClick={() => handlePOISelect(poi.id)}
                  />
                ))}
              </div>
              {filteredPOIs.length > 9 && (
                <p className="text-center text-sm text-muted-foreground mt-3">
                  +{filteredPOIs.length - 9} more places
                </p>
              )}
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
              No points of interest found for this category
            </p>
          </div>
        )}
      </div>
    </NeighborhoodExplorerErrorBoundary>
  );
}
