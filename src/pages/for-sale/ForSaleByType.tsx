import { useState, useMemo } from 'react';
import { useParams, useSearchParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Heart, MapPin, ArrowRight } from 'lucide-react';
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

const VALID_TYPES: Record<string, { display: string; dbValue: string }> = {
  'apartments': { display: 'Apartments', dbValue: 'apartment' },
  'villas': { display: 'Villas', dbValue: 'villa' },
  'townhouses': { display: 'Townhouses', dbValue: 'townhouse' },
  'penthouses': { display: 'Penthouses', dbValue: 'penthouse' },
  'duplexes': { display: 'Duplexes', dbValue: 'duplex' },
  'studios': { display: 'Studios', dbValue: 'studio' },
};

const TYPE_META: Record<string, { title: string; description: string; keywords: string[] }> = {
  'apartments': {
    title: 'Dubai Apartments for Sale 2025 — Investment Properties',
    description: 'Browse Dubai apartments for sale in Marina, Downtown, JBR & more. Compare rental yields, investment scores, and Golden Visa eligibility. Expert analysis included.',
    keywords: ['Dubai apartments for sale', 'buy apartment Dubai', 'Dubai Marina apartments', 'Downtown Dubai apartment', 'investment apartments Dubai'],
  },
  'villas': {
    title: 'Dubai Villas for Sale 2025 — Luxury & Investment Properties',
    description: 'Discover Dubai villas for sale in Palm Jumeirah, Emirates Hills, Arabian Ranches. Premium properties with investment analysis and Golden Visa eligibility.',
    keywords: ['Dubai villas for sale', 'buy villa Dubai', 'Palm Jumeirah villa', 'luxury villa Dubai', 'investment villa Dubai'],
  },
  'townhouses': {
    title: 'Dubai Townhouses for Sale 2025 — Family & Investment Properties',
    description: 'Find Dubai townhouses in DAMAC Hills, Dubai Hills, Arabian Ranches. Family-friendly communities with excellent investment potential.',
    keywords: ['Dubai townhouses for sale', 'buy townhouse Dubai', 'family property Dubai', 'Dubai Hills townhouse'],
  },
  'penthouses': {
    title: 'Dubai Penthouses for Sale 2025 — Ultra-Luxury Properties',
    description: 'Exclusive Dubai penthouses in prime locations. Sky villas, duplex penthouses with panoramic views. Premium investment opportunities.',
    keywords: ['Dubai penthouse for sale', 'luxury penthouse Dubai', 'sky villa Dubai', 'Palm Jumeirah penthouse'],
  },
  'duplexes': {
    title: 'Dubai Duplexes for Sale 2025 — Multi-Level Properties',
    description: 'Browse Dubai duplex apartments and homes. Spacious multi-level living in prime locations with investment analysis.',
    keywords: ['Dubai duplex for sale', 'duplex apartment Dubai', 'multi-level home Dubai'],
  },
  'studios': {
    title: 'Dubai Studios for Sale 2025 — Entry-Level Investment',
    description: 'Affordable Dubai studio apartments for investors. High rental yields, low entry point. Perfect for first-time investors.',
    keywords: ['Dubai studio for sale', 'studio apartment Dubai', 'affordable Dubai property', 'high yield studio Dubai'],
  },
};

export default function ForSaleByType() {
  const { type } = useParams<{ type: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { toggleSave, isSaved } = useSavedProperties();

  // Validate type parameter
  const typeConfig = type ? VALID_TYPES[type.toLowerCase()] : null;
  if (!typeConfig) {
    return <Navigate to="/for-sale" replace />;
  }

  const typeMeta = TYPE_META[type!.toLowerCase()] || TYPE_META['apartments'];

  // Filter state
  const searchQuery = searchParams.get('q') || '';
  const selectedArea = searchParams.get('area') || 'All Areas';
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
      area: selectedArea !== 'All Areas' ? selectedArea : undefined,
      type: typeConfig.dbValue,
      bedrooms: selectedBedrooms !== '-1' ? parseInt(selectedBedrooms) : undefined,
      priceMin: priceRange?.min,
      priceMax: priceRange?.max !== Infinity ? priceRange?.max : undefined,
      goldenVisaOnly: showGoldenVisaOnly || undefined,
      yieldMin: yieldRange?.min,
      sortBy,
      listingType: 'buy',
    };
  }, [searchQuery, selectedArea, typeConfig.dbValue, selectedBedrooms, selectedPrice, sortBy, selectedYield, showGoldenVisaOnly]);

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

  // Top areas for this property type
  const topAreas = useMemo(() => {
    return Object.entries(propertyCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, count, slug: name.toLowerCase().replace(/\s+/g, '-') }));
  }, [propertyCounts]);

  const breadcrumbs = [
    { label: 'For Sale', href: '/for-sale' },
    { label: typeConfig.display },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={typeMeta.title}
        description={`${totalCount.toLocaleString()} ${typeConfig.display.toLowerCase()} available. ${typeMeta.description}`}
        keywords={typeMeta.keywords}
        canonical={`${SITE_CONFIG.url}/for-sale/${type}`}
        structuredData={[
          generateBreadcrumbSchema([
            { name: 'Home', url: SITE_CONFIG.url },
            { name: 'For Sale', url: `${SITE_CONFIG.url}/for-sale` },
            { name: typeConfig.display, url: `${SITE_CONFIG.url}/for-sale/${type}` },
          ]),
        ]}
      />
      <Navbar />

      <section className="pt-32 pb-8 bg-gradient-to-b from-secondary to-background">
        <div className="container mx-auto px-4">
          <BreadcrumbNav items={breadcrumbs} className="mb-6" />
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-foreground mb-4">
              Dubai {typeConfig.display} <span className="text-gradient-gold">for Sale</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              {totalCount.toLocaleString()} {typeConfig.display.toLowerCase()} available across Dubai. 
              Compare investment yields, analyze ROI, and find your ideal property.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Quick Area Links */}
      <section className="py-4 border-b border-border bg-card/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center gap-2 justify-center">
            <span className="text-sm text-muted-foreground mr-2">Browse by Area:</span>
            {topAreas.map((area) => (
              <Link
                key={area.slug}
                to={`/for-sale/${area.slug}/${type}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <MapPin className="w-3 h-3" />
                {area.name} {typeConfig.display}
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
            selectedArea={selectedArea}
            onAreaChange={(v) => updateFilter('area', v)}
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
              title={`No ${typeConfig.display.toLowerCase()} found`}
              description="Try adjusting your filters or search criteria."
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
        </div>
      </section>

      {/* Related Property Types */}
      <section className="py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-2xl text-foreground mb-6">Other Property Types</h2>
          <div className="flex flex-wrap gap-3">
            {Object.entries(VALID_TYPES)
              .filter(([key]) => key !== type?.toLowerCase())
              .map(([key, config]) => (
                <Link
                  key={key}
                  to={`/for-sale/${key}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-primary/10 transition-colors"
                >
                  <Building2 className="w-4 h-4" />
                  {config.display}
                  <ArrowRight className="w-3 h-3" />
                </Link>
              ))}
          </div>
        </div>
      </section>

      <ScrollToTopButton />
      <Footer />
    </div>
  );
}
