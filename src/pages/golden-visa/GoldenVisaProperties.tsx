import { useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Award, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { VirtualGrid } from '@/components/ui/virtual-grid';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SEOHead } from '@/components/SEOHead';
import { BreadcrumbNav } from '@/components/seo/BreadcrumbNav';
import { useAuth } from '@/hooks/useAuth';
import { useSavedProperties } from '@/hooks/useSavedProperties';
import { useProperties, PropertyFilters } from '@/hooks/useProperties';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { PropertyFilters as PropertyFiltersComponent, priceRanges } from '@/components/properties/PropertyFilters';
import { PropertyGridSkeleton } from '@/components/properties/PropertySkeleton';
import { ScrollToTopButton } from '@/components/ui/scroll-to-top-button';
import { generateBreadcrumbSchema, SITE_CONFIG } from '@/lib/seo-config';
import { Badge } from '@/components/ui/badge';

export default function GoldenVisaProperties() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { toggleSave, isSaved } = useSavedProperties();

  // Filter state
  const selectedArea = searchParams.get('area') || 'All Areas';
  const selectedType = searchParams.get('type') || 'all';
  const selectedBedrooms = searchParams.get('beds') || '-1';
  const selectedPrice = searchParams.get('price') || 'all';
  const sortBy = searchParams.get('sort') || 'price-asc';

  const filters: PropertyFilters = useMemo(() => {
    const priceRange = priceRanges.find(p => p.value === selectedPrice);
    
    return {
      area: selectedArea !== 'All Areas' ? selectedArea : undefined,
      type: selectedType !== 'all' ? selectedType : undefined,
      bedrooms: selectedBedrooms !== '-1' ? parseInt(selectedBedrooms) : undefined,
      priceMin: priceRange?.min || 2000000, // Minimum 2M for Golden Visa
      priceMax: priceRange?.max !== Infinity ? priceRange?.max : undefined,
      goldenVisaOnly: true,
      sortBy,
      listingType: 'buy',
    };
  }, [selectedArea, selectedType, selectedBedrooms, selectedPrice, sortBy]);

  const {
    properties,
    isLoading,
    isLoadingMore,
    hasMore,
    totalCount,
    loadMore,
    propertyCounts,
    developerCounts,
    isGuestLimited,
  } = useProperties(filters, { isAuthenticated: !!user });

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === '' || value === 'All Areas' || value === 'all' || value === '-1') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const breadcrumbs = [
    { label: 'Golden Visa', href: '/golden-visa' },
    { label: 'Eligible Properties' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Golden Visa Eligible Properties Dubai 2025 — AED 2M+ Investments"
        description={`${totalCount.toLocaleString()} properties eligible for UAE Golden Visa. All properties ≥ AED 2 million with investment analysis. Secure 10-year residency through property.`}
        keywords={[
          'Golden Visa property Dubai',
          'AED 2 million property Dubai',
          'UAE investor visa property',
          'Golden Visa eligible properties',
          '10 year visa Dubai property',
          'Dubai property for visa',
        ]}
        canonical={`${SITE_CONFIG.url}/golden-visa/properties`}
        structuredData={[
          generateBreadcrumbSchema([
            { name: 'Home', url: SITE_CONFIG.url },
            { name: 'Golden Visa', url: `${SITE_CONFIG.url}/golden-visa` },
            { name: 'Properties', url: `${SITE_CONFIG.url}/golden-visa/properties` },
          ]),
        ]}
      />
      <Navbar />

      <section className="pt-32 pb-8 bg-gradient-to-b from-gold/10 to-background">
        <div className="container mx-auto px-4">
          <BreadcrumbNav items={breadcrumbs} className="mb-6" />
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-gold/20 border border-gold/30 flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-gold" />
            </div>
            
            <Badge className="mb-4 bg-gold/20 text-gold border-gold/30">
              10-Year UAE Residency
            </Badge>
            
            <h1 className="font-heading text-4xl md:text-5xl text-foreground mb-4">
              Golden Visa <span className="text-gradient-gold">Properties</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-4">
              {totalCount.toLocaleString()} properties eligible for UAE Golden Visa. 
              All listings ≥ AED 2 million with investment analysis.
            </p>
            
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/golden-visa">
                <Button variant="outline" size="sm" className="border-gold/30">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Golden Visa Guide
                </Button>
              </Link>
              <Link to="/golden-visa/requirements">
                <Button variant="outline" size="sm">
                  Requirements
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-6 border-b border-border bg-card/50 sticky top-20 z-30">
        <div className="container mx-auto px-4">
          <PropertyFiltersComponent
            searchQuery=""
            onSearchChange={() => {}}
            selectedArea={selectedArea}
            onAreaChange={(v) => updateFilter('area', v)}
            selectedType={selectedType}
            onTypeChange={(v) => updateFilter('type', v)}
            selectedBedrooms={selectedBedrooms}
            onBedroomsChange={(v) => updateFilter('beds', v)}
            selectedPrice={selectedPrice}
            onPriceChange={(v) => updateFilter('price', v)}
            showOffPlanOnly={false}
            onOffPlanChange={() => {}}
            sortBy={sortBy}
            onSortChange={(v) => updateFilter('sort', v)}
            onClearFilters={clearFilters}
            resultCount={totalCount}
            viewMode="grid"
            onViewModeChange={() => {}}
            selectedScore="all"
            onScoreChange={() => {}}
            selectedYield="all"
            onYieldChange={() => {}}
            showGoldenVisaOnly={true}
            onGoldenVisaChange={() => {}}
            showBelowMarketOnly={false}
            onBelowMarketChange={() => {}}
            propertyCounts={propertyCounts}
            developerCounts={developerCounts}
            hideInvestmentFilters={false}
          />
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Golden Visa Info Banner */}
          <div className="mb-8 p-4 bg-gold/5 border border-gold/20 rounded-xl">
            <div className="flex items-start gap-3">
              <Award className="w-5 h-5 text-gold mt-0.5" />
              <div>
                <p className="text-sm text-foreground font-medium">All properties listed qualify for UAE Golden Visa</p>
                <p className="text-xs text-muted-foreground">Minimum investment AED 2 million. Property can be mortgaged with ≥ AED 2M equity.</p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <PropertyGridSkeleton />
          ) : properties.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="No Golden Visa properties found"
              description="Try adjusting your filters to find eligible properties."
              action={{ label: 'Clear Filters', onClick: clearFilters }}
            />
          ) : (
            <VirtualGrid
              items={properties}
              renderItem={(property, index) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  index={index}
                  isSaved={isSaved(property.id)}
                  onToggleSave={() => toggleSave(property.id)}
                  onCompare={() => {}}
                  isComparing={false}
                  showCompareButton={false}
                  isAuthenticated={!!user}
                  isRental={false}
                />
              )}
              estimatedItemHeight={420}
              gap={24}
              onLoadMore={loadMore}
              hasMore={hasMore}
              isLoading={isLoadingMore}
            />
          )}

          {isGuestLimited && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-6 rounded-xl bg-gold/10 border border-gold/20 text-center"
            >
              <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                Sign up to see all {totalCount} Golden Visa properties
              </h3>
              <p className="text-muted-foreground mb-4">
                Create a free account to browse unlimited listings
              </p>
              <Button asChild className="bg-gold hover:bg-gold/90 text-background">
                <Link to="/auth?mode=signup">Create Free Account</Link>
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      <ScrollToTopButton />
      <Footer />
    </div>
  );
}
