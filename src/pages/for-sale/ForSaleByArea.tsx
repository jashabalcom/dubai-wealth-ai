import { useState, useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Heart, MapPin, ArrowRight, TrendingUp } from 'lucide-react';
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
import { PropertyFilters as PropertyFiltersComponent, priceRanges, yieldRanges } from '@/components/properties/PropertyFilters';
import { PropertyGridSkeleton } from '@/components/properties/PropertySkeleton';
import { ScrollToTopButton } from '@/components/ui/scroll-to-top-button';
import { generateBreadcrumbSchema, SITE_CONFIG } from '@/lib/seo-config';

// Convert slug to display name
function slugToName(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Known Dubai areas for better SEO
const AREA_META: Record<string, { avgYield?: string; description: string }> = {
  'dubai-marina': { avgYield: '5.5-7%', description: 'Waterfront living with iconic skyline views, metro access, and vibrant nightlife' },
  'downtown-dubai': { avgYield: '4.5-6%', description: 'Home to Burj Khalifa and Dubai Mall, prime location for capital appreciation' },
  'palm-jumeirah': { avgYield: '4-5%', description: 'Exclusive island living with private beaches and luxury amenities' },
  'jbr': { avgYield: '6-7%', description: 'Beachfront apartments with high rental demand from tourists and residents' },
  'business-bay': { avgYield: '5.5-7%', description: 'Central business hub with excellent connectivity and strong rental yields' },
  'dubai-hills': { avgYield: '5-6%', description: 'Master-planned community with golf course, parks, and family amenities' },
  'arabian-ranches': { avgYield: '4.5-5.5%', description: 'Established villa community popular with families, stable investment' },
  'jumeirah-village-circle': { avgYield: '7-8%', description: 'Affordable entry point with highest rental yields in Dubai' },
  'dubai-creek-harbour': { avgYield: '5-6%', description: 'New waterfront district with Dubai Creek Tower, high growth potential' },
  'emaar-beachfront': { avgYield: '5.5-6.5%', description: 'Premium beachfront living between Marina and Palm Jumeirah' },
};

export default function ForSaleByArea() {
  const { area } = useParams<{ area: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { toggleSave, isSaved } = useSavedProperties();

  const areaName = area ? slugToName(area) : '';
  const areaMeta = area ? AREA_META[area.toLowerCase()] : null;

  // Filter state
  const searchQuery = searchParams.get('q') || '';
  const selectedType = searchParams.get('type') || 'all';
  const selectedBedrooms = searchParams.get('beds') || '-1';
  const selectedPrice = searchParams.get('price') || 'all';
  const sortBy = searchParams.get('sort') || 'featured';
  const selectedYield = searchParams.get('yield') || 'all';
  const showGoldenVisaOnly = searchParams.get('visa') === 'true';

  const filters: PropertyFilters = useMemo(() => {
    const priceRange = priceRanges.find(p => p.value === selectedPrice);
    const yieldRange = yieldRanges.find(y => y.value === selectedYield);
    
    return {
      search: searchQuery || undefined,
      area: areaName || undefined,
      type: selectedType !== 'all' ? selectedType : undefined,
      bedrooms: selectedBedrooms !== '-1' ? parseInt(selectedBedrooms) : undefined,
      priceMin: priceRange?.min,
      priceMax: priceRange?.max !== Infinity ? priceRange?.max : undefined,
      goldenVisaOnly: showGoldenVisaOnly || undefined,
      yieldMin: yieldRange?.min,
      sortBy,
      listingType: 'buy',
    };
  }, [searchQuery, areaName, selectedType, selectedBedrooms, selectedPrice, sortBy, selectedYield, showGoldenVisaOnly]);

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
    if (value === '' || value === 'all' || value === '-1' || value === 'false') {
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
    { label: 'For Sale', href: '/for-sale' },
    { label: areaName },
  ];

  const seoTitle = `${areaName} Properties for Sale 2025 — Apartments, Villas & Off-Plan`;
  const seoDescription = areaMeta
    ? `${totalCount.toLocaleString()} properties in ${areaName}. ${areaMeta.description}. Average rental yield: ${areaMeta.avgYield}. Investment analysis included.`
    : `${totalCount.toLocaleString()} properties for sale in ${areaName}, Dubai. Compare investment yields, analyze ROI, and find Golden Visa eligible properties.`;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        keywords={[
          `${areaName} properties for sale`,
          `buy property ${areaName}`,
          `${areaName} apartments`,
          `${areaName} villas`,
          `${areaName} investment`,
          `${areaName} real estate`,
          'Dubai property investment',
        ]}
        canonical={`${SITE_CONFIG.url}/for-sale/${area}`}
        structuredData={[
          generateBreadcrumbSchema([
            { name: 'Home', url: SITE_CONFIG.url },
            { name: 'For Sale', url: `${SITE_CONFIG.url}/for-sale` },
            { name: areaName, url: `${SITE_CONFIG.url}/for-sale/${area}` },
          ]),
        ]}
      />
      <Navbar />

      <section className="pt-32 pb-8 bg-gradient-to-b from-secondary to-background">
        <div className="container mx-auto px-4">
          <BreadcrumbNav items={breadcrumbs} className="mb-6" />
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-foreground mb-4">
              {areaName} Properties <span className="text-gradient-gold">for Sale</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-4">
              {totalCount.toLocaleString()} properties available in {areaName}
              {areaMeta && `. ${areaMeta.description}`}
            </p>
            {areaMeta?.avgYield && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
                <TrendingUp className="w-4 h-4" />
                <span className="font-medium">Average Rental Yield: {areaMeta.avgYield}</span>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Quick Property Type Links */}
      <section className="py-4 border-b border-border bg-card/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center gap-2 justify-center">
            <span className="text-sm text-muted-foreground mr-2">Property Types:</span>
            {['apartments', 'villas', 'townhouses', 'penthouses'].map((type) => (
              <Link
                key={type}
                to={`/for-sale/${area}/${type}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm bg-muted hover:bg-primary/10 hover:text-primary transition-colors capitalize"
              >
                <Building2 className="w-3 h-3" />
                {areaName} {type}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-6 border-b border-border bg-card/50 sticky top-20 z-30">
        <div className="container mx-auto px-4">
          <PropertyFiltersComponent
            searchQuery={searchQuery}
            onSearchChange={(v) => updateFilter('q', v)}
            selectedArea={areaName}
            onAreaChange={() => {}}
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
            selectedYield={selectedYield}
            onYieldChange={(v) => updateFilter('yield', v)}
            showGoldenVisaOnly={showGoldenVisaOnly}
            onGoldenVisaChange={(v) => updateFilter('visa', v ? 'true' : 'false')}
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
          {isLoading ? (
            <PropertyGridSkeleton />
          ) : properties.length === 0 ? (
            <EmptyState
              icon={Building2}
              title={`No properties found in ${areaName}`}
              description="Try adjusting your filters or browse other areas."
              action={{ label: 'View All Areas', onClick: () => window.location.href = '/for-sale' }}
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
              className="mt-8 p-6 rounded-xl bg-primary/10 border border-primary/20 text-center"
            >
              <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                Sign up to see all {totalCount} properties in {areaName}
              </h3>
              <p className="text-muted-foreground mb-4">
                Create a free account to browse unlimited listings
              </p>
              <Button asChild>
                <Link to="/auth?mode=signup">Create Free Account</Link>
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Related Links */}
      <section className="py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-2xl text-foreground mb-6">Explore {areaName}</h2>
          <div className="flex flex-wrap gap-4">
            <Link to={`/neighborhoods/${area}`} className="inline-flex items-center gap-2 text-primary hover:underline">
              <MapPin className="w-4 h-4" />
              {areaName} Neighborhood Guide
            </Link>
            <Link to={`/off-plan?area=${encodeURIComponent(areaName)}`} className="inline-flex items-center gap-2 text-primary hover:underline">
              <Building2 className="w-4 h-4" />
              Off-Plan in {areaName}
            </Link>
            <Link to={`/invest/rental-yield/${area}`} className="inline-flex items-center gap-2 text-primary hover:underline">
              <TrendingUp className="w-4 h-4" />
              {areaName} Rental Yield Analysis
            </Link>
          </div>
        </div>
      </section>

      <ScrollToTopButton />
      <Footer />
    </div>
  );
}
