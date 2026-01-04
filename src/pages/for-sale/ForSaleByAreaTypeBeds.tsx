import { useMemo } from 'react';
import { useParams, useSearchParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, MapPin, TrendingUp } from 'lucide-react';
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

const VALID_BEDS: Record<string, { display: string; value: number }> = {
  'studio': { display: 'Studio', value: 0 },
  '1br': { display: '1 Bedroom', value: 1 },
  '2br': { display: '2 Bedroom', value: 2 },
  '3br': { display: '3 Bedroom', value: 3 },
  '4br': { display: '4+ Bedroom', value: 4 },
  '5br': { display: '5+ Bedroom', value: 5 },
};

function slugToName(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function ForSaleByAreaTypeBeds() {
  const { area, type, beds } = useParams<{ area: string; type: string; beds: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { toggleSave, isSaved } = useSavedProperties();

  // Validate parameters
  const typeConfig = type ? VALID_TYPES[type.toLowerCase()] : null;
  const bedsConfig = beds ? VALID_BEDS[beds.toLowerCase()] : null;
  
  if (!typeConfig) {
    return <Navigate to={`/for-sale/${area}`} replace />;
  }
  if (!bedsConfig) {
    return <Navigate to={`/for-sale/${area}/${type}`} replace />;
  }

  const areaName = area ? slugToName(area) : '';

  // Filter state
  const selectedPrice = searchParams.get('price') || 'all';
  const sortBy = searchParams.get('sort') || 'featured';
  const showGoldenVisaOnly = searchParams.get('visa') === 'true';

  const filters: PropertyFilters = useMemo(() => {
    return {
      area: areaName || undefined,
      type: typeConfig.dbValue,
      bedrooms: bedsConfig.value,
      goldenVisaOnly: showGoldenVisaOnly || undefined,
      sortBy,
      listingType: 'buy',
    };
  }, [areaName, typeConfig.dbValue, bedsConfig.value, sortBy, showGoldenVisaOnly]);

  const {
    properties,
    isLoading,
    isLoadingMore,
    hasMore,
    totalCount,
    loadMore,
    isGuestLimited,
  } = useProperties(filters, { isAuthenticated: !!user });

  const breadcrumbs = [
    { label: 'For Sale', href: '/for-sale' },
    { label: areaName, href: `/for-sale/${area}` },
    { label: typeConfig.display, href: `/for-sale/${area}/${type}` },
    { label: bedsConfig.display },
  ];

  const seoTitle = `${bedsConfig.display} ${typeConfig.display} for Sale in ${areaName} 2025`;
  const seoDescription = `${totalCount} ${bedsConfig.display.toLowerCase()} ${typeConfig.display.toLowerCase()} for sale in ${areaName}, Dubai. Compare prices and investment potential. Expert analysis.`;

  // Determine if page should be noindex (fewer than 5 listings)
  const shouldNoIndex = totalCount < 5;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        keywords={[
          `${bedsConfig.display.toLowerCase()} ${typeConfig.singular} ${areaName}`,
          `${beds} ${typeConfig.singular} ${areaName} for sale`,
          `buy ${bedsConfig.display.toLowerCase()} ${typeConfig.singular} ${areaName}`,
          `${areaName} ${beds} ${typeConfig.singular} price`,
        ]}
        canonical={`${SITE_CONFIG.url}/for-sale/${area}/${type}/${beds}`}
        noIndex={shouldNoIndex}
        structuredData={[
          generateBreadcrumbSchema([
            { name: 'Home', url: SITE_CONFIG.url },
            { name: 'For Sale', url: `${SITE_CONFIG.url}/for-sale` },
            { name: areaName, url: `${SITE_CONFIG.url}/for-sale/${area}` },
            { name: typeConfig.display, url: `${SITE_CONFIG.url}/for-sale/${area}/${type}` },
            { name: bedsConfig.display, url: `${SITE_CONFIG.url}/for-sale/${area}/${type}/${beds}` },
          ]),
        ]}
      />
      <Navbar />

      <section className="pt-32 pb-8 bg-gradient-to-b from-secondary to-background">
        <div className="container mx-auto px-4">
          <BreadcrumbNav items={breadcrumbs} className="mb-6" />
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl text-foreground mb-4">
              {bedsConfig.display} {typeConfig.display} in {areaName}
            </h1>
            <p className="text-lg text-muted-foreground">
              {totalCount} {bedsConfig.display.toLowerCase()} {typeConfig.display.toLowerCase()} for sale in {areaName}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <PropertyGridSkeleton />
          ) : properties.length === 0 ? (
            <EmptyState
              icon={Building2}
              title={`No ${bedsConfig.display.toLowerCase()} ${typeConfig.display.toLowerCase()} in ${areaName}`}
              description="Try viewing all properties in this area or different bedroom configurations."
              action={{ label: `View All ${areaName} ${typeConfig.display}`, onClick: () => window.location.href = `/for-sale/${area}/${type}` }}
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
                Sign up to see all properties
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
          <h2 className="font-heading text-2xl text-foreground mb-6">Related Searches</h2>
          <div className="flex flex-wrap gap-4">
            <Link to={`/for-sale/${area}/${type}`} className="inline-flex items-center gap-2 text-primary hover:underline">
              <Building2 className="w-4 h-4" />
              All {areaName} {typeConfig.display}
            </Link>
            <Link to={`/for-sale/${area}`} className="inline-flex items-center gap-2 text-primary hover:underline">
              <Building2 className="w-4 h-4" />
              All {areaName} Properties
            </Link>
            <Link to={`/neighborhoods/${area}`} className="inline-flex items-center gap-2 text-primary hover:underline">
              <MapPin className="w-4 h-4" />
              {areaName} Area Guide
            </Link>
          </div>
        </div>
      </section>

      <ScrollToTopButton />
      <Footer />
    </div>
  );
}
