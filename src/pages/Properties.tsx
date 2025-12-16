import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Heart, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSavedProperties } from '@/hooks/useSavedProperties';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { PropertyFilters, priceRanges, scoreRanges, yieldRanges } from '@/components/properties/PropertyFilters';
import { PropertyGridSkeleton } from '@/components/properties/PropertySkeleton';
import { PropertyComparison, ComparisonBar } from '@/components/properties/PropertyComparison';
import { PropertyMap } from '@/components/properties/PropertyMap';
import { RecentlyViewedSection } from '@/components/properties/RecentlyViewedSection';
import { PropertyDisclaimer } from '@/components/ui/disclaimers';
import { calculateInvestmentScore, isGoldenVisaEligible, isBelowMarketValue } from '@/lib/investmentScore';

interface Property {
  id: string;
  title: string;
  slug: string;
  location_area: string;
  property_type: string;
  developer_name: string;
  is_off_plan: boolean;
  status: string;
  price_aed: number;
  bedrooms: number;
  bathrooms: number;
  size_sqft: number;
  rental_yield_estimate: number;
  images: string[];
  completion_date: string | null;
  is_featured: boolean;
  latitude?: number;
  longitude?: number;
  views_count?: number | null;
  inquiries_count?: number | null;
}

export default function Properties() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { toggleSave, isSaved } = useSavedProperties();
  const { recentlyViewed, clearRecentlyViewed } = useRecentlyViewed();
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('status', 'available');

    if (!error && data) {
      setProperties(data.map(p => ({
        ...p,
        images: Array.isArray(p.images) ? (p.images as string[]) : [],
        price_aed: Number(p.price_aed),
        size_sqft: Number(p.size_sqft),
        rental_yield_estimate: Number(p.rental_yield_estimate),
        latitude: p.latitude ? Number(p.latitude) : undefined,
        longitude: p.longitude ? Number(p.longitude) : undefined,
      })));
    }
    setLoading(false);
  };

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

  const filteredAndSortedProperties = useMemo(() => {
    let result = properties.filter((property) => {
      // Basic filters
      const matchesSearch = 
        property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.location_area.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.developer_name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesArea = selectedArea === 'All Areas' || property.location_area === selectedArea;
      const matchesType = selectedType === 'all' || property.property_type === selectedType;
      const beds = parseInt(selectedBedrooms);
      const matchesBedrooms = beds === -1 || (beds === 4 ? property.bedrooms >= 4 : property.bedrooms === beds);
      const priceRange = priceRanges.find(p => p.value === selectedPrice);
      const matchesPrice = priceRange ? property.price_aed >= priceRange.min && property.price_aed < priceRange.max : true;
      const matchesOffPlan = !showOffPlanOnly || property.is_off_plan;

      // Smart investment filters
      const scoreRange = scoreRanges.find(s => s.value === selectedScore);
      const propertyScore = calculateInvestmentScore({
        priceAed: property.price_aed,
        sizeSqft: property.size_sqft,
        rentalYield: property.rental_yield_estimate,
        area: property.location_area,
        developerName: property.developer_name,
        isOffPlan: property.is_off_plan,
      }).score;
      const matchesScore = !scoreRange || scoreRange.value === 'all' || propertyScore >= scoreRange.min;

      const yieldRange = yieldRanges.find(y => y.value === selectedYield);
      const matchesYield = !yieldRange || yieldRange.value === 'all' || property.rental_yield_estimate >= yieldRange.min;

      const matchesGoldenVisa = !showGoldenVisaOnly || isGoldenVisaEligible(property.price_aed);
      
      const matchesBelowMarket = !showBelowMarketOnly || isBelowMarketValue(
        property.price_aed, 
        property.size_sqft, 
        property.location_area
      );

      return matchesSearch && matchesArea && matchesType && matchesBedrooms && matchesPrice && matchesOffPlan 
        && matchesScore && matchesYield && matchesGoldenVisa && matchesBelowMarket;
    });

    // Sort
    switch (sortBy) {
      case 'score-desc': 
        result.sort((a, b) => {
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
        break;
      case 'price-asc': result.sort((a, b) => a.price_aed - b.price_aed); break;
      case 'price-desc': result.sort((a, b) => b.price_aed - a.price_aed); break;
      case 'yield-desc': result.sort((a, b) => b.rental_yield_estimate - a.rental_yield_estimate); break;
      case 'size-desc': result.sort((a, b) => b.size_sqft - a.size_sqft); break;
      case 'newest': result.sort((a, b) => b.id.localeCompare(a.id)); break;
      default: result.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0)); break;
    }

    return result;
  }, [properties, searchQuery, selectedArea, selectedType, selectedBedrooms, selectedPrice, showOffPlanOnly, sortBy, selectedScore, selectedYield, showGoldenVisaOnly, showBelowMarketOnly]);

  const toggleCompare = (id: string) => {
    setCompareIds(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : prev.length < 4 ? [...prev, id] : prev
    );
  };

  const compareProperties = properties.filter(p => compareIds.includes(p.id));

  // Calculate property counts for autocomplete
  const propertyCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    properties.forEach(p => {
      counts[p.location_area] = (counts[p.location_area] || 0) + 1;
    });
    return counts;
  }, [properties]);

  const developerCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    properties.forEach(p => {
      if (p.developer_name) {
        counts[p.developer_name] = (counts[p.developer_name] || 0) + 1;
      }
    });
    return counts;
  }, [properties]);

  return (
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

      <section className="py-6 border-b border-border bg-card/50 sticky top-16 z-30">
        <div className="container mx-auto px-4">
          <PropertyFilters
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
            resultCount={filteredAndSortedProperties.length}
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

          {loading ? (
            <PropertyGridSkeleton />
          ) : filteredAndSortedProperties.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="No properties found"
              description="Try adjusting your filters or search criteria to find properties that match what you're looking for."
              action={{ label: 'Clear Filters', onClick: clearFilters }}
            />
          ) : viewMode === 'map' ? (
            <PropertyMap properties={filteredAndSortedProperties} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedProperties.map((property, index) => (
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

      <Footer />
    </div>
  );
}
