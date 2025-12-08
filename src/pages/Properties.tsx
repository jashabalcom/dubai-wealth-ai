import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Bed, 
  Bath, 
  Maximize, 
  TrendingUp,
  Building2,
  Home,
  Calendar,
  Filter,
  X,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { supabase } from '@/integrations/supabase/client';

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
}

const areas = [
  'All Areas',
  'Dubai Marina',
  'Downtown Dubai',
  'Palm Jumeirah',
  'Business Bay',
  'JVC',
  'Emaar Beachfront',
  'Dubai Creek Harbour',
  'MBR City',
  'Damac Lagoons',
  'The Valley',
  'Tilal Al Ghaf',
];

const propertyTypes = [
  { value: 'all', label: 'All Types' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'villa', label: 'Villa' },
  { value: 'townhouse', label: 'Townhouse' },
];

const bedroomOptions = [
  { value: -1, label: 'Any' },
  { value: 0, label: 'Studio' },
  { value: 1, label: '1 BR' },
  { value: 2, label: '2 BR' },
  { value: 3, label: '3 BR' },
  { value: 4, label: '4+ BR' },
];

const priceRanges = [
  { value: 'all', label: 'Any Price', min: 0, max: Infinity },
  { value: '0-1m', label: 'Under 1M', min: 0, max: 1000000 },
  { value: '1m-2m', label: '1M - 2M', min: 1000000, max: 2000000 },
  { value: '2m-5m', label: '2M - 5M', min: 2000000, max: 5000000 },
  { value: '5m-10m', label: '5M - 10M', min: 5000000, max: 10000000 },
  { value: '10m+', label: '10M+', min: 10000000, max: Infinity },
];

function formatPrice(price: number): string {
  if (price >= 1000000) {
    return `AED ${(price / 1000000).toFixed(1)}M`;
  }
  return `AED ${(price / 1000).toFixed(0)}K`;
}

export default function Properties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('All Areas');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedBedrooms, setSelectedBedrooms] = useState(-1);
  const [selectedPrice, setSelectedPrice] = useState('all');
  const [showOffPlanOnly, setShowOffPlanOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('status', 'available')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProperties(data.map(p => ({
        ...p,
        images: Array.isArray(p.images) ? (p.images as string[]) : [],
        price_aed: Number(p.price_aed),
        size_sqft: Number(p.size_sqft),
        rental_yield_estimate: Number(p.rental_yield_estimate),
      })));
    }
    setLoading(false);
  };

  const filteredProperties = properties.filter((property) => {
    // Search query
    const matchesSearch = 
      property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location_area.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.developer_name?.toLowerCase().includes(searchQuery.toLowerCase());

    // Area filter
    const matchesArea = selectedArea === 'All Areas' || property.location_area === selectedArea;

    // Type filter
    const matchesType = selectedType === 'all' || property.property_type === selectedType;

    // Bedrooms filter
    const matchesBedrooms = 
      selectedBedrooms === -1 || 
      (selectedBedrooms === 4 ? property.bedrooms >= 4 : property.bedrooms === selectedBedrooms);

    // Price filter
    const priceRange = priceRanges.find(p => p.value === selectedPrice);
    const matchesPrice = priceRange 
      ? property.price_aed >= priceRange.min && property.price_aed < priceRange.max
      : true;

    // Off-plan filter
    const matchesOffPlan = !showOffPlanOnly || property.is_off_plan;

    return matchesSearch && matchesArea && matchesType && matchesBedrooms && matchesPrice && matchesOffPlan;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedArea('All Areas');
    setSelectedType('all');
    setSelectedBedrooms(-1);
    setSelectedPrice('all');
    setShowOffPlanOnly(false);
  };

  const hasActiveFilters = 
    searchQuery || 
    selectedArea !== 'All Areas' || 
    selectedType !== 'all' || 
    selectedBedrooms !== -1 || 
    selectedPrice !== 'all' || 
    showOffPlanOnly;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-8 bg-gradient-to-b from-primary-dark to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-foreground mb-4">
              Dubai <span className="text-gradient-gold">Properties</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Discover premium investment opportunities across Dubai's most sought-after locations.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="py-6 border-b border-border bg-card/50 sticky top-16 z-30">
        <div className="container mx-auto px-4">
          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-center mb-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by location, developer, or property name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={showOffPlanOnly ? 'gold' : 'outline'}
                size="sm"
                onClick={() => setShowOffPlanOnly(!showOffPlanOnly)}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Off-Plan
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>

          {/* Filters Row - Desktop */}
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${showFilters ? 'block' : 'hidden lg:grid'}`}>
            {/* Area Filter */}
            <div className="relative">
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-full h-10 px-3 pr-10 rounded-md border border-input bg-background text-sm appearance-none cursor-pointer"
              >
                {areas.map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>

            {/* Type Filter */}
            <div className="relative">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full h-10 px-3 pr-10 rounded-md border border-input bg-background text-sm appearance-none cursor-pointer"
              >
                {propertyTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>

            {/* Bedrooms Filter */}
            <div className="relative">
              <select
                value={selectedBedrooms}
                onChange={(e) => setSelectedBedrooms(Number(e.target.value))}
                className="w-full h-10 px-3 pr-10 rounded-md border border-input bg-background text-sm appearance-none cursor-pointer"
              >
                {bedroomOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>

            {/* Price Filter */}
            <div className="relative">
              <select
                value={selectedPrice}
                onChange={(e) => setSelectedPrice(e.target.value)}
                className="w-full h-10 px-3 pr-10 rounded-md border border-input bg-background text-sm appearance-none cursor-pointer"
              >
                {priceRanges.map((range) => (
                  <option key={range.value} value={range.value}>{range.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 mt-4">
              <span className="text-sm text-muted-foreground">
                {filteredProperties.length} properties found
              </span>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-1" />
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Properties Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-heading text-xl text-foreground mb-2">No properties found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your filters to see more results.</p>
              <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Link
                    to={`/properties/${property.slug}`}
                    className="group block h-full"
                  >
                    <div className="h-full rounded-2xl bg-card border border-border overflow-hidden hover:border-gold/30 transition-all duration-300 hover:shadow-xl hover:shadow-gold/5">
                      {/* Image */}
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={property.images[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'}
                          alt={property.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        
                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                          {property.is_off_plan && (
                            <span className="px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
                              Off-Plan
                            </span>
                          )}
                          {property.is_featured && (
                            <span className="px-2 py-1 bg-gold text-primary-dark text-xs font-medium rounded-full">
                              Featured
                            </span>
                          )}
                        </div>

                        {/* Yield Badge */}
                        {property.rental_yield_estimate && (
                          <div className="absolute top-3 right-3 px-2 py-1 bg-emerald-500/90 text-white text-xs font-medium rounded-full flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {property.rental_yield_estimate}% yield
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        {/* Location */}
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                          <MapPin className="w-4 h-4" />
                          {property.location_area}
                          {property.developer_name && (
                            <span className="text-xs">• {property.developer_name}</span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="font-heading text-lg text-foreground mb-3 group-hover:text-gold transition-colors line-clamp-2">
                          {property.title}
                        </h3>

                        {/* Price */}
                        <p className="font-heading text-xl text-gold mb-3">
                          {formatPrice(property.price_aed)}
                        </p>

                        {/* Features */}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Bed className="w-4 h-4" />
                            {property.bedrooms === 0 ? 'Studio' : `${property.bedrooms} BR`}
                          </span>
                          <span className="flex items-center gap-1">
                            <Bath className="w-4 h-4" />
                            {property.bathrooms}
                          </span>
                          <span className="flex items-center gap-1">
                            <Maximize className="w-4 h-4" />
                            {property.size_sqft.toLocaleString()} sqft
                          </span>
                        </div>

                        {/* Completion Date for Off-Plan */}
                        {property.is_off_plan && property.completion_date && (
                          <div className="mt-3 pt-3 border-t border-border">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Completion: {new Date(property.completion_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
