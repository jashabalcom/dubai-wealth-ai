import { useState, useMemo, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Heart, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useSavedProperties } from '@/hooks/useSavedProperties';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { useProperties, PropertyFilters } from '@/hooks/useProperties';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { PropertyFilters as PropertyFiltersComponent, priceRanges, yieldRanges } from '@/components/properties/PropertyFilters';
import { PropertyGridSkeleton } from '@/components/properties/PropertySkeleton';
import { PropertyComparison, ComparisonBar } from '@/components/properties/PropertyComparison';
import { PropertyMap } from '@/components/properties/PropertyMap';
import { RecentlyViewedSection } from '@/components/properties/RecentlyViewedSection';
import { InfiniteScrollTrigger } from '@/components/properties/InfiniteScrollTrigger';
import { PropertyDisclaimer } from '@/components/ui/disclaimers';
import { ScrollToTopButton } from '@/components/ui/scroll-to-top-button';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { useScrollRestoration } from '@/hooks/useScrollRestoration';
import { calculateInvestmentScore, isGoldenVisaEligible, isBelowMarketValue } from '@/lib/investmentScore';
import { useQueryClient } from '@tanstack/react-query';

export default function Properties() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { toggleSave, isSaved } = useSavedProperties();
  const { recentlyViewed, clearRecentlyViewed } = useRecentlyViewed();
  const queryClient = useQueryClient();
  
  // Scroll restoration
  useScrollRestoration('properties-list');
  
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  // Filter state from URL params
  const searchQuery = searchParams.get('q') || '';
  const selectedArea = searchParams.get('area') || 'All Areas';
  const selectedType = searchParams.get('type') || 'all';
  const selectedBedrooms = searchParams.get('beds') || '-1';
  const selectedPrice = searchParams.get('price') || 'all';
  const showOffPlanOnly = searchParams.get('offplan') === 'true';
  const sortBy = searchParams.get('sort') || 'featured';
  const viewMode = (searchParams.get('view') as 'grid' | 'map') || 'grid';
  
  // Smart investment filters
  const selectedScore = searchParams.get('score') || 'all';
  const selectedYield = searchParams.get('yield') || 'all';
  const showGoldenVisaOnly = searchParams.get('visa') === 'true';
  const showBelowMarketOnly = searchParams.get('belowmarket') === 'true';

  // Build filters object for the hook
  const filters: PropertyFilters = useMemo(() => {
    const priceRange = priceRanges.find(p => p.value === selectedPrice);
    const yieldRange = yieldRanges.find(y => y.value === selectedYield);
    
    return {
      search: searchQuery || undefined,
      area: selectedArea !== 'All Areas' ? selectedArea : undefined,
      type: selectedType !== 'all' ? selectedType : undefined,
      bedrooms: selectedBedrooms !== '-1' ? parseInt(selectedBedrooms) : undefined,
      priceMin: priceRange?.min,
      priceMax: priceRange?.max !== Infinity ? priceRange?.max : undefined,
      offPlanOnly: showOffPlanOnly || undefined,
      goldenVisaOnly: showGoldenVisaOnly || undefined,
      yieldMin: yieldRange?.min,
      sortBy,
    };
  }, [searchQuery, selectedArea, selectedType, selectedBedrooms, selectedPrice, showOffPlanOnly, sortBy, selectedYield, showGoldenVisaOnly]);

  // Use server-side filtering hook
  const {
    properties,
    isLoading,
    isLoadingMore,
    hasMore,
    totalCount,
    loadMore,
    propertyCounts,
    developerCounts,
  } = useProperties(filters);

  // Client-side filters that require complex calculation (score, below market value)
  const filteredProperties = useMemo(() => {
    let result = properties;

    // Investment score filter (requires client-side calculation)
    if (selectedScore !== 'all') {
      const minScore = selectedScore === '80' ? 80 : selectedScore === '70' ? 70 : 60;
      result = result.filter(property => {
        const score = calculateInvestmentScore({
          priceAed: property.price_aed,
          sizeSqft: property.size_sqft,
          rentalYield: property.rental_yield_estimate,
          area: property.location_area,
          developerName: property.developer_name,
          isOffPlan: property.is_off_plan,
        }).score;
        return score >= minScore;
      });
    }

    // Below market value filter (requires area benchmarks)
    if (showBelowMarketOnly) {
      result = result.filter(property => 
        isBelowMarketValue(property.price_aed, property.size_sqft, property.location_area)
      );
    }

    // Sort by investment score if selected (requires client-side)
    if (sortBy === 'score-desc') {
      result = [...result].sort((a, b) => {
        const scoreA = calculateInvestmentScore({
          priceAed: a.price_aed,
          sizeSqft: a.size_sqft,
          rentalYield: a.rental_yield_estimate,
          area: a.location_area,
          developerName: a.developer_name,
          isOffPlan: a.is_off_plan,
        }).score;
        const scoreB = calculateInvestmentScore({
          priceAed: b.price_aed,
          sizeSqft: b.size_sqft,
          rentalYield: b.rental_yield_estimate,
          area: b.location_area,
          developerName: b.developer_name,
          isOffPlan: b.is_off_plan,
        }).score;
        return scoreB - scoreA;
      });
    }

    return result;
  }, [properties, selectedScore, showBelowMarketOnly, sortBy]);

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === '' || value === 'All Areas' || value === 'all' || value === '-1' || value === 'false') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const toggleCompare = (id: string) => {
    setCompareIds(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : prev.length < 4 ? [...prev, id] : prev
    );
  };

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['properties'] });
  }, [queryClient]);

  const compareProperties = properties.filter(p => compareIds.includes(p.id));

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen bg-background">
        <Navbar />

        <section className="pt-32 pb-8 bg-gradient-to-b from-secondary to-background">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-foreground mb-4">
              Dubai <span className="text-gradient-gold">Properties</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Discover premium investment opportunities across Dubai's most sought-after locations.
            </p>
            <PropertyDisclaimer variant="inline" className="mt-2" />
            {user && (
              <Link to="/properties/saved" className="inline-flex mt-4">
                <Button variant="outline" size="sm">
                  <Heart className="w-4 h-4 mr-2" />
                  View Saved
                </Button>
              </Link>
            )}
          </motion.div>
        </div>
      </section>

      <section className="py-6 border-b border-border bg-card/50 sticky top-20 z-30">
        <div className="container mx-auto px-4">
          <PropertyFiltersComponent
            searchQuery={searchQuery}
            onSearchChange={(v) => updateFilter('q', v)}
            selectedArea={selectedArea}
            onAreaChange={(v) => updateFilter('area', v)}
            selectedType={selectedType}
            onTypeChange={(v) => updateFilter('type', v)}
            selectedBedrooms={selectedBedrooms}
            onBedroomsChange={(v) => updateFilter('beds', v)}
            selectedPrice={selectedPrice}
            onPriceChange={(v) => updateFilter('price', v)}
            showOffPlanOnly={showOffPlanOnly}
            onOffPlanChange={(v) => updateFilter('offplan', v ? 'true' : 'false')}
            sortBy={sortBy}
            onSortChange={(v) => updateFilter('sort', v)}
            onClearFilters={clearFilters}
            resultCount={totalCount}
            viewMode={viewMode}
            onViewModeChange={(mode) => updateFilter('view', mode)}
            // Smart investment filters
            selectedScore={selectedScore}
            onScoreChange={(v) => updateFilter('score', v)}
            selectedYield={selectedYield}
            onYieldChange={(v) => updateFilter('yield', v)}
            showGoldenVisaOnly={showGoldenVisaOnly}
            onGoldenVisaChange={(v) => updateFilter('visa', v ? 'true' : 'false')}
            showBelowMarketOnly={showBelowMarketOnly}
            onBelowMarketChange={(v) => updateFilter('belowmarket', v ? 'true' : 'false')}
            propertyCounts={propertyCounts}
            developerCounts={developerCounts}
          />
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Recently Viewed Section */}
          {recentlyViewed.length > 0 && (
            <RecentlyViewedSection
              properties={recentlyViewed}
              onClear={clearRecentlyViewed}
            />
          )}
          {/* Explore Developers Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link to="/developers" className="group block">
              <div className="p-6 rounded-2xl bg-gradient-to-r from-gold/10 to-gold/5 border border-gold/20 hover:border-gold/40 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gold/20 flex items-center justify-center">
                      <Users className="w-6 h-6 text-gold" />
                    </div>
                    <div>
                      <h3 className="font-heading text-lg text-foreground group-hover:text-gold transition-colors">
                        Explore Developers
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Browse Dubai's top developers and their portfolio of projects
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gold group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </Link>
          </motion.div>

          {isLoading ? (
            <PropertyGridSkeleton />
          ) : filteredProperties.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="No properties found"
              description="Try adjusting your filters or search criteria to find properties that match what you're looking for."
              action={{ label: 'Clear Filters', onClick: clearFilters }}
            />
          ) : viewMode === 'map' ? (
            <PropertyMap properties={filteredProperties} />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.map((property, index) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    index={index}
                    isSaved={isSaved(property.id)}
                    onToggleSave={() => toggleSave(property.id)}
                    onCompare={() => toggleCompare(property.id)}
                    isComparing={compareIds.includes(property.id)}
                    showCompareButton
                    isAuthenticated={!!user}
                  />
                ))}
              </div>
              
              {/* Infinite scroll trigger */}
              <InfiniteScrollTrigger
                onLoadMore={loadMore}
                hasMore={hasMore}
                isLoading={isLoadingMore}
                totalCount={totalCount}
                loadedCount={filteredProperties.length}
              />
            </>
          )}
        </div>
      </section>

      <ComparisonBar
        count={compareIds.length}
        onView={() => setShowComparison(true)}
        onClear={() => setCompareIds([])}
      />

      {showComparison && (
        <PropertyComparison
          properties={compareProperties}
          onRemove={(id) => setCompareIds(prev => prev.filter(p => p !== id))}
          onClear={() => { setCompareIds([]); setShowComparison(false); }}
        />
      )}

      <ScrollToTopButton />
        <Footer />
      </div>
    </PullToRefresh>
  );
}
