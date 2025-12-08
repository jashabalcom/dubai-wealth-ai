import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSavedProperties } from '@/hooks/useSavedProperties';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { PropertyFilters, priceRanges } from '@/components/properties/PropertyFilters';
import { PropertyGridSkeleton } from '@/components/properties/PropertySkeleton';
import { PropertyComparison, ComparisonBar } from '@/components/properties/PropertyComparison';
import { PropertyMap } from '@/components/properties/PropertyMap';
import { Link } from 'react-router-dom';

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
}

export default function Properties() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { toggleSave, isSaved } = useSavedProperties();
  
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

      return matchesSearch && matchesArea && matchesType && matchesBedrooms && matchesPrice && matchesOffPlan;
    });

    // Sort
    switch (sortBy) {
      case 'price-asc': result.sort((a, b) => a.price_aed - b.price_aed); break;
      case 'price-desc': result.sort((a, b) => b.price_aed - a.price_aed); break;
      case 'yield-desc': result.sort((a, b) => b.rental_yield_estimate - a.rental_yield_estimate); break;
      case 'size-desc': result.sort((a, b) => b.size_sqft - a.size_sqft); break;
      case 'newest': result.sort((a, b) => b.id.localeCompare(a.id)); break;
      default: result.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0)); break;
    }

    return result;
  }, [properties, searchQuery, selectedArea, selectedType, selectedBedrooms, selectedPrice, showOffPlanOnly, sortBy]);

  const toggleCompare = (id: string) => {
    setCompareIds(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : prev.length < 4 ? [...prev, id] : prev
    );
  };

  const compareProperties = properties.filter(p => compareIds.includes(p.id));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-8 bg-gradient-to-b from-primary-dark to-background">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-foreground mb-4">
              Dubai <span className="text-gradient-gold">Properties</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Discover premium investment opportunities across Dubai's most sought-after locations.
            </p>
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
          />
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <PropertyGridSkeleton />
          ) : filteredAndSortedProperties.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-heading text-xl text-foreground mb-2">No properties found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your filters.</p>
              <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
            </div>
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
