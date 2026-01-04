import { useState, useMemo, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Heart, ArrowRight, TrendingUp, MapPin } from 'lucide-react';
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
import { PropertyDisclaimer } from '@/components/ui/disclaimers';
import { ScrollToTopButton } from '@/components/ui/scroll-to-top-button';
import { generateBreadcrumbSchema, generateFAQSchema, SITE_CONFIG } from '@/lib/seo-config';
import { useQueryClient } from '@tanstack/react-query';

const FAQ_ITEMS = [
  {
    question: "How do I buy property in Dubai as a foreigner?",
    answer: "Foreigners can buy freehold property in designated areas of Dubai. The process involves selecting a property, signing a Memorandum of Understanding (MOU), paying a deposit (typically 10%), and completing the transfer at the Dubai Land Department. No residency is required to purchase."
  },
  {
    question: "What are the costs of buying property in Dubai?",
    answer: "Total costs typically include: 4% Dubai Land Department (DLD) transfer fee, 2% real estate agent commission, AED 4,000-5,000 admin fees, and mortgage registration fee (0.25%) if financing. Budget approximately 7-8% above the purchase price for all fees."
  },
  {
    question: "Can I get a mortgage in Dubai as a non-resident?",
    answer: "Yes, non-residents can obtain mortgages in Dubai. Banks typically offer up to 50-75% LTV for non-residents (vs 80% for residents). You'll need proof of income, bank statements, and passport copies. Interest rates range from 4-6% depending on the bank and your profile."
  },
  {
    question: "What is the Golden Visa property requirement?",
    answer: "To qualify for UAE Golden Visa through property investment, you need to purchase property worth at least AED 2 million. The property must be fully paid (no mortgage) or have at least AED 2 million in equity. This grants a 10-year renewable residency visa."
  },
];

export default function ForSaleIndex() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { toggleSave, isSaved } = useSavedProperties();
  const queryClient = useQueryClient();

  // Filter state from URL params
  const searchQuery = searchParams.get('q') || '';
  const selectedArea = searchParams.get('area') || 'All Areas';
  const selectedType = searchParams.get('type') || 'all';
  const selectedBedrooms = searchParams.get('beds') || '-1';
  const selectedPrice = searchParams.get('price') || 'all';
  const sortBy = searchParams.get('sort') || 'featured';
  const selectedYield = searchParams.get('yield') || 'all';
  const showGoldenVisaOnly = searchParams.get('visa') === 'true';

  // Build filters object
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
      goldenVisaOnly: showGoldenVisaOnly || undefined,
      yieldMin: yieldRange?.min,
      sortBy,
      listingType: 'buy',
    };
  }, [searchQuery, selectedArea, selectedType, selectedBedrooms, selectedPrice, sortBy, selectedYield, showGoldenVisaOnly]);

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

  // Get unique areas for internal links
  const topAreas = useMemo(() => {
    const areas = Object.entries(propertyCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count, slug: name.toLowerCase().replace(/\s+/g, '-') }));
    return areas;
  }, [propertyCounts]);

  const breadcrumbs = [{ label: 'Properties for Sale' }];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Dubai Properties for Sale 2025 — Apartments, Villas & Off-Plan"
        description={`Browse ${totalCount.toLocaleString()}+ Dubai properties for sale. Compare apartments, villas, townhouses with investment yields, Golden Visa eligibility, and ROI analysis. Expert investor platform.`}
        keywords={[
          'Dubai properties for sale',
          'buy property Dubai',
          'Dubai apartments for sale',
          'Dubai villas for sale',
          'Dubai real estate',
          'invest in Dubai property',
          'off-plan Dubai',
          'Golden Visa property Dubai',
        ]}
        canonical={`${SITE_CONFIG.url}/for-sale`}
        structuredData={[
          generateBreadcrumbSchema([
            { name: 'Home', url: SITE_CONFIG.url },
            { name: 'Properties for Sale', url: `${SITE_CONFIG.url}/for-sale` },
          ]),
          generateFAQSchema(FAQ_ITEMS),
        ]}
      />
      <Navbar />

      <section className="pt-32 pb-8 bg-gradient-to-b from-secondary to-background">
        <div className="container mx-auto px-4">
          <BreadcrumbNav items={breadcrumbs} className="mb-6" />
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-foreground mb-4">
              Dubai Properties <span className="text-gradient-gold">for Sale</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-4">
              Discover {totalCount.toLocaleString()}+ investment opportunities across Dubai's most sought-after locations. 
              Compare yields, analyze ROI, and find Golden Visa eligible properties.
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

      {/* Quick Area Links */}
      <section className="py-6 border-b border-border bg-card/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center gap-2 justify-center">
            <span className="text-sm text-muted-foreground mr-2">Popular Areas:</span>
            {topAreas.map((area) => (
              <Link
                key={area.slug}
                to={`/for-sale/${area.slug}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <MapPin className="w-3 h-3" />
                {area.name}
                <span className="text-xs text-muted-foreground">({area.count})</span>
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
          {/* Quick Links to Property Types */}
          <div className="mb-8 flex flex-wrap gap-3">
            <Link to="/for-sale/apartments" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-primary/10 transition-colors">
              <Building2 className="w-4 h-4" />
              <span>Apartments</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
            <Link to="/for-sale/villas" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-primary/10 transition-colors">
              <Building2 className="w-4 h-4" />
              <span>Villas</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
            <Link to="/for-sale/townhouses" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-primary/10 transition-colors">
              <Building2 className="w-4 h-4" />
              <span>Townhouses</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
            <Link to="/for-sale/penthouses" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-primary/10 transition-colors">
              <Building2 className="w-4 h-4" />
              <span>Penthouses</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {isLoading ? (
            <PropertyGridSkeleton />
          ) : properties.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="No properties found"
              description="Try adjusting your filters or search criteria to find properties that match what you're looking for."
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
              className="mt-8 p-6 rounded-xl bg-primary/10 border border-primary/20 text-center"
            >
              <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                Sign up to see all {totalCount} properties
              </h3>
              <p className="text-muted-foreground mb-4">
                Create a free account to browse unlimited listings and save your favorites
              </p>
              <Button asChild>
                <Link to="/auth?mode=signup">Create Free Account</Link>
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      {/* FAQ Section for SEO */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-3xl text-foreground mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            {FAQ_ITEMS.map((faq, index) => (
              <div key={index} className="bg-card rounded-xl p-6 border border-border">
                <h3 className="font-semibold text-foreground mb-2">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Internal Links Section */}
      <section className="py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-2xl text-foreground mb-6">Explore by Area</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {topAreas.map((area) => (
              <Link
                key={area.slug}
                to={`/for-sale/${area.slug}`}
                className="p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors group"
              >
                <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                  {area.name}
                </h3>
                <p className="text-sm text-muted-foreground">{area.count} properties</p>
              </Link>
            ))}
          </div>
          
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/golden-visa" className="inline-flex items-center gap-2 text-primary hover:underline">
              <TrendingUp className="w-4 h-4" />
              Golden Visa Properties
            </Link>
            <Link to="/off-plan" className="inline-flex items-center gap-2 text-primary hover:underline">
              <Building2 className="w-4 h-4" />
              Off-Plan Projects
            </Link>
            <Link to="/invest" className="inline-flex items-center gap-2 text-primary hover:underline">
              <TrendingUp className="w-4 h-4" />
              Investment Guide
            </Link>
          </div>
        </div>
      </section>

      <ScrollToTopButton />
      <Footer />
    </div>
  );
}
