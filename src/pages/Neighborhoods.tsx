import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, MapPin, Building2, Train, Waves, Home } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { SEOHead } from '@/components/SEOHead';
import { useNeighborhoods } from '@/hooks/useNeighborhoods';
import { NeighborhoodCard } from '@/components/neighborhoods/NeighborhoodCard';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const lifestyleOptions = [
  { value: 'all', label: 'All Lifestyles' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'family', label: 'Family-Friendly' },
  { value: 'affordable', label: 'Affordable' },
  { value: 'urban', label: 'Urban' },
  { value: 'emerging', label: 'Emerging' },
];

export default function Neighborhoods() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [lifestyle, setLifestyle] = useState(searchParams.get('lifestyle') || 'all');
  const [isFreehold, setIsFreehold] = useState(searchParams.get('freehold') === 'true');
  const [hasMetro, setHasMetro] = useState(searchParams.get('metro') === 'true');
  const [hasBeach, setHasBeach] = useState(searchParams.get('beach') === 'true');
  const [showFilters, setShowFilters] = useState(false);

  const { data: neighborhoods, isLoading } = useNeighborhoods({
    lifestyle: lifestyle !== 'all' ? lifestyle : undefined,
    isFreehold: isFreehold || undefined,
    hasMetro: hasMetro || undefined,
    hasBeach: hasBeach || undefined,
    search: search || undefined,
  });

  // Update URL params when filters change
  const updateFilters = (key: string, value: string | boolean) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== 'all' && value !== false) {
      params.set(key, String(value));
    } else {
      params.delete(key);
    }
    setSearchParams(params);
  };

  // Group neighborhoods by lifestyle
  const groupedNeighborhoods = useMemo(() => {
    if (!neighborhoods) return {};
    return neighborhoods.reduce((acc, n) => {
      const type = n.lifestyle_type || 'mixed';
      if (!acc[type]) acc[type] = [];
      acc[type].push(n);
      return acc;
    }, {} as Record<string, typeof neighborhoods>);
  }, [neighborhoods]);

  const stats = useMemo(() => {
    if (!neighborhoods) return { total: 0, freehold: 0, metro: 0, beach: 0 };
    return {
      total: neighborhoods.length,
      freehold: neighborhoods.filter(n => n.is_freehold).length,
      metro: neighborhoods.filter(n => n.has_metro_access).length,
      beach: neighborhoods.filter(n => n.has_beach_access).length,
    };
  }, [neighborhoods]);

  return (
    <>
      <SEOHead 
        title="Dubai Neighborhood Guide | Investment Areas & Communities"
        description="Explore 100+ Dubai neighborhoods with detailed investment analysis, schools, restaurants, and lifestyle guides. Find your perfect area to invest or live."
        keywords="Dubai neighborhoods, Dubai areas, Dubai communities, Dubai investment areas, where to live in Dubai, Dubai real estate guide"
      />
      <Navbar />
      
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
          
          <div className="container relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
                <MapPin className="h-3 w-3 mr-1" />
                100+ Dubai Neighborhoods
              </Badge>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                Dubai Neighborhood Guide
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Comprehensive guides to every Dubai community. Investment analysis, top schools, 
                restaurants, and lifestyle insights to help you make informed decisions.
              </p>

              {/* Search Bar */}
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search neighborhoods..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    updateFilters('search', e.target.value);
                  }}
                  className="pl-12 pr-4 h-14 text-lg bg-card/50 border-border/50 focus:border-primary/50"
                />
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
            >
              <div className="text-center p-4 rounded-lg bg-card/50 border border-border/50">
                <Building2 className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Neighborhoods</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-card/50 border border-border/50">
                <Home className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{stats.freehold}</p>
                <p className="text-sm text-muted-foreground">Freehold Areas</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-card/50 border border-border/50">
                <Train className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{stats.metro}</p>
                <p className="text-sm text-muted-foreground">Metro Access</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-card/50 border border-border/50">
                <Waves className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{stats.beach}</p>
                <p className="text-sm text-muted-foreground">Beachfront</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Filters & Results */}
        <section className="py-12">
          <div className="container">
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <Select value={lifestyle} onValueChange={(v) => { setLifestyle(v); updateFilters('lifestyle', v); }}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Lifestyle" />
                  </SelectTrigger>
                  <SelectContent>
                    {lifestyleOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className={showFilters ? 'border-primary text-primary' : ''}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">
                Showing {neighborhoods?.length || 0} neighborhoods
              </p>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 p-4 rounded-lg bg-card/50 border border-border/50"
              >
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="freehold" 
                      checked={isFreehold}
                      onCheckedChange={(v) => { setIsFreehold(v); updateFilters('freehold', v); }}
                    />
                    <Label htmlFor="freehold">Freehold Only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="metro" 
                      checked={hasMetro}
                      onCheckedChange={(v) => { setHasMetro(v); updateFilters('metro', v); }}
                    />
                    <Label htmlFor="metro">Metro Access</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="beach" 
                      checked={hasBeach}
                      onCheckedChange={(v) => { setHasBeach(v); updateFilters('beach', v); }}
                    />
                    <Label htmlFor="beach">Beach Access</Label>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Results Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-48 w-full rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            ) : neighborhoods && neighborhoods.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {neighborhoods.map((neighborhood, idx) => (
                  <motion.div
                    key={neighborhood.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                  >
                    <NeighborhoodCard neighborhood={neighborhood} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-16">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No neighborhoods found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or search term.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
