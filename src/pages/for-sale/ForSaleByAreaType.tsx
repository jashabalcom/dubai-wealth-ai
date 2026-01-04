import { useMemo } from 'react';
import { useParams, useSearchParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, MapPin, TrendingUp, ArrowRight } from 'lucide-react';
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

const VALID_TYPES: Record<string, { display: string; dbValue: string; singular: string }> = {
  'apartments': { display: 'Apartments', dbValue: 'apartment', singular: 'apartment' },
  'villas': { display: 'Villas', dbValue: 'villa', singular: 'villa' },
  'townhouses': { display: 'Townhouses', dbValue: 'townhouse', singular: 'townhouse' },
  'penthouses': { display: 'Penthouses', dbValue: 'penthouse', singular: 'penthouse' },
  'duplexes': { display: 'Duplexes', dbValue: 'duplex', singular: 'duplex' },
  'studios': { display: 'Studios', dbValue: 'studio', singular: 'studio' },
};

function slugToName(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function ForSaleByAreaType() {
  const { area, type } = useParams<{ area: string; type: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { toggleSave, isSaved } = useSavedProperties();

  // Validate parameters
  const typeConfig = type ? VALID_TYPES[type.toLowerCase()] : null;
  if (!typeConfig) {
    return <Navigate to={`/for-sale/${area}`} replace />;
  }

  const areaName = area ? slugToName(area) : '';

  // Filter state
  const selectedBedrooms = searchParams.get('beds') || '-1';
  const selectedPrice = searchParams.get('price') || 'all';
  const sortBy = searchParams.get('sort') || 'featured';
  const selectedYield = searchParams.get('yield') || 'all';
  const showGoldenVisaOnly = searchParams.get('visa') === 'true';

  const filters: PropertyFilters = useMemo(() => {
    const priceRange = priceRanges.find(p => p.value === selectedPrice);
    const yieldRange = yieldRanges.find(y => y.value === selectedYield);
    
    return {
      area: areaName || undefined,
      type: typeConfig.dbValue,
      bedrooms: selectedBedrooms !== '-1' ? parseInt(selectedBedrooms) : undefined,
      priceMin: priceRange?.min,
      priceMax: priceRange?.max !== Infinity ? priceRange?.max : undefined,
      goldenVisaOnly: showGoldenVisaOnly || undefined,
      yieldMin: yieldRange?.min,
      sortBy,
      listingType: 'buy',
    };
  }, [areaName, typeConfig.dbValue, selectedBedrooms, selectedPrice, sortBy, selectedYield, showGoldenVisaOnly]);

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
    { label: areaName, href: `/for-sale/${area}` },
    { label: typeConfig.display },
  ];

  const seoTitle = `${areaName} ${typeConfig.display} for Sale 2025 — Investment Properties Dubai`;
  const seoDescription = `${totalCount.toLocaleString()} ${typeConfig.display.toLowerCase()} for sale in ${areaName}, Dubai. Compare prices, rental yields, and investment potential. Expert analysis included.`;

  // Bedroom options for internal links
  const bedroomOptions = ['1br', '2br', '3br', '4br'];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        keywords={[
          `${areaName} ${typeConfig.display.toLowerCase()} for sale`,
          `buy ${typeConfig.singular} ${areaName}`,
          `${areaName} ${typeConfig.singular} price`,
          `${areaName} ${typeConfig.singular} investment`,
          `${typeConfig.display} Dubai`,
        ]}
        canonical={`${SITE_CONFIG.url}/for-sale/${area}/${type}`}
        structuredData={[
          generateBreadcrumbSchema([
            { name: 'Home', url: SITE_CONFIG.url },
            { name: 'For Sale', url: `${SITE_CONFIG.url}/for-sale` },
            { name: areaName, url: `${SITE_CONFIG.url}/for-sale/${area}` },
            { name: typeConfig.display, url: `${SITE_CONFIG.url}/for-sale/${area}/${type}` },
          ]),
        ]}
        noIndex={totalCount < 5}
      />
      <Navbar />

      <section className="pt-32 pb-8 bg-gradient-to-b from-secondary to-background">
        <div className="container mx-auto px-4">
          <BreadcrumbNav items={breadcrumbs} className="mb-6" />
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <h1 className="font-heading text-4xl md:text-5xl text-foreground mb-4">
              {areaName} {typeConfig.display} <span className="text-gradient-gold">for Sale</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              {totalCount.toLocaleString()} {typeConfig.display.toLowerCase()} available in {areaName}. 
              Compare investment yields and find your ideal property.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Bedroom Quick Links */}
      <section className="py-4 border-b border-border bg-card/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center gap-2 justify-center">
            <span className="text-sm text-muted-foreground mr-2">By Bedrooms:</span>
            {bedroomOptions.map((beds) => (
              <Link
                key={beds}
                to={`/for-sale/${area}/${type}/${beds}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
              >
                {beds.replace('br', ' Bedroom')} {typeConfig.display}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-6 border-b border-border bg-card/50 sticky top-20 z-30">
        <div className="container mx-auto px-4">
          <PropertyFiltersComponent
            searchQuery=""
            onSearchChange={() => {}}
            selectedArea={areaName}
            onAreaChange={() => {}}
            selectedType={typeConfig.dbValue}
            onTypeChange={() => {}}
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
              title={`No ${typeConfig.display.toLowerCase()} found in ${areaName}`}
              description="Try viewing all properties in this area or browse other property types."
              action={{ label: `View All ${areaName} Properties`, onClick: () => window.location.href = `/for-sale/${area}` }}
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
        </div>
      </section>

      {/* Related Links */}
      <section className="py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-2xl text-foreground mb-6">More in {areaName}</h2>
          <div className="flex flex-wrap gap-4">
            <Link to={`/for-sale/${area}`} className="inline-flex items-center gap-2 text-primary hover:underline">
              <Building2 className="w-4 h-4" />
              All {areaName} Properties
            </Link>
            <Link to={`/neighborhoods/${area}`} className="inline-flex items-center gap-2 text-primary hover:underline">
              <MapPin className="w-4 h-4" />
              {areaName} Guide
            </Link>
            <Link to={`/for-sale/${type}`} className="inline-flex items-center gap-2 text-primary hover:underline">
              <Building2 className="w-4 h-4" />
              All Dubai {typeConfig.display}
            </Link>
          </div>
        </div>
      </section>

      <ScrollToTopButton />
      <Footer />
    </div>
  );
}
