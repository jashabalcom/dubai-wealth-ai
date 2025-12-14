import { useState, useMemo, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, MapPin, Building2, Train, Waves, Home, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { SEOHead } from '@/components/SEOHead';
import { useNeighborhoods } from '@/hooks/useNeighborhoods';
import { NeighborhoodCard } from '@/components/neighborhoods/NeighborhoodCard';
import { NeighborhoodCardSkeleton } from '@/components/neighborhoods/NeighborhoodCardSkeleton';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useCountUp, useInView } from '@/hooks/useCountUp';

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

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  
  const { ref: statsRef, hasBeenInView: statsInView } = useInView();

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
    if (typeof value === 'boolean' ? value : (value && value !== 'all')) {
      params.set(key, String(value));
    } else {
      params.delete(key);
    }
    setSearchParams(params);
  };

  const stats = useMemo(() => {
    if (!neighborhoods) return { total: 0, freehold: 0, metro: 0, beach: 0 };
    return {
      total: neighborhoods.length,
      freehold: neighborhoods.filter(n => n.is_freehold).length,
      metro: neighborhoods.filter(n => n.has_metro_access).length,
      beach: neighborhoods.filter(n => n.has_beach_access).length,
    };
  }, [neighborhoods]);

  // Animated count-up values
  const totalCount = useCountUp({ end: stats.total, duration: 2000, enabled: statsInView });
  const freeholdCount = useCountUp({ end: stats.freehold, duration: 2000, enabled: statsInView });
  const metroCount = useCountUp({ end: stats.metro, duration: 2000, enabled: statsInView });
  const beachCount = useCountUp({ end: stats.beach, duration: 2000, enabled: statsInView });

  return (
    <>
      <SEOHead 
        title="Dubai Neighborhood Guide | Investment Areas & Communities"
        description="Explore 100+ Dubai neighborhoods with detailed investment analysis, schools, restaurants, and lifestyle guides. Find your perfect area to invest or live."
        keywords={["Dubai neighborhoods", "Dubai areas", "Dubai communities", "Dubai investment areas", "where to live in Dubai", "Dubai real estate guide"]}
      />
      <Navbar />
      
      <main className="min-h-screen bg-background">
        {/* Hero Section with Parallax */}
        <section ref={heroRef} className="relative py-24 lg:py-32 overflow-hidden">
          {/* Layered Background Effects */}
          <motion.div 
            style={{ y: heroY }}
            className="absolute inset-0"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-primary/3 to-background" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent" />
            {/* Decorative Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
          </motion.div>

          {/* Decorative Gold Lines */}
          <div className="absolute top-20 left-0 w-1/3 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <div className="absolute top-20 right-0 w-1/3 h-px bg-gradient-to-l from-transparent via-primary/40 to-transparent" />
          
          <motion.div style={{ opacity: heroOpacity }} className="container relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="text-center max-w-3xl mx-auto"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                <Badge variant="outline" className="mb-6 px-4 py-1.5 border-primary/40 bg-primary/5 text-primary backdrop-blur-sm">
                  <Sparkles className="h-3.5 w-3.5 mr-2" />
                  Complete Dubai Investment Guide
                </Badge>
              </motion.div>

              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-6">
                <span className="block">Dubai</span>
                <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                  Neighborhood Guide
                </span>
              </h1>

              {/* Decorative Line with Text */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary/50" />
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Investment Intelligence</span>
                <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary/50" />
              </div>

              <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed">
                Comprehensive guides to every Dubai community. Investment analysis, top schools, 
                restaurants, and lifestyle insights to help you make informed decisions.
              </p>

              {/* Glass-morphism Search Bar */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="relative max-w-xl mx-auto"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-xl blur-xl" />
                <div className="relative bg-card/60 backdrop-blur-xl border border-primary/20 rounded-xl shadow-lg shadow-primary/5">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/60" />
                  <Input
                    placeholder="Search neighborhoods..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      updateFilters('search', e.target.value);
                    }}
                    className="pl-14 pr-6 h-14 text-lg bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
                  />
                </div>
              </motion.div>
            </motion.div>

            {/* Animated Stats */}
            <motion.div
              ref={statsRef}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto"
            >
              {[
                { icon: Building2, count: totalCount, label: 'Neighborhoods', delay: 0 },
                { icon: Home, count: freeholdCount, label: 'Freehold Areas', delay: 0.1 },
                { icon: Train, count: metroCount, label: 'Metro Access', delay: 0.2 },
                { icon: Waves, count: beachCount, label: 'Beachfront', delay: 0.3 },
              ].map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + stat.delay, duration: 0.5 }}
                  className="group relative"
                >
                  {/* Glass Card */}
                  <div className="relative p-5 rounded-xl bg-card/40 backdrop-blur-md border border-primary/10 transition-all duration-300 hover:border-primary/30 hover:bg-card/60">
                    {/* Glow Effect */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="relative text-center">
                      <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 mb-3">
                        <stat.icon className="h-5 w-5 text-primary" />
                      </div>
                      <p className="text-3xl md:text-4xl font-bold text-foreground mb-1">{stat.count}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* Filters & Results */}
        <section className="py-12 bg-gradient-to-b from-background to-card/30">
          <div className="container">
            {/* Glass-morphism Filter Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative mb-8"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50">
                <div className="flex items-center gap-4">
                  <Select value={lifestyle} onValueChange={(v) => { setLifestyle(v); updateFilters('lifestyle', v); }}>
                    <SelectTrigger className="w-[180px] bg-background/50 border-primary/20 focus:border-primary/50 focus:ring-primary/20">
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
                    className={`transition-all duration-300 ${showFilters ? 'border-primary bg-primary/10 text-primary' : 'border-border/50'}`}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    More Filters
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-semibold text-foreground">{neighborhoods?.length || 0}</span> neighborhoods
                </p>
              </div>
            </motion.div>

            {/* Expanded Filters with Animation */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="mb-8"
              >
                <div className="p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-primary/10">
                  <div className="flex flex-wrap gap-8">
                    {[
                      { id: 'freehold', label: 'Freehold Only', checked: isFreehold, onChange: (v: boolean) => { setIsFreehold(v); updateFilters('freehold', v); } },
                      { id: 'metro', label: 'Metro Access', checked: hasMetro, onChange: (v: boolean) => { setHasMetro(v); updateFilters('metro', v); } },
                      { id: 'beach', label: 'Beach Access', checked: hasBeach, onChange: (v: boolean) => { setHasBeach(v); updateFilters('beach', v); } },
                    ].map((filter) => (
                      <div key={filter.id} className="flex items-center space-x-3">
                        <Switch 
                          id={filter.id} 
                          checked={filter.checked}
                          onCheckedChange={filter.onChange}
                          className="data-[state=checked]:bg-primary"
                        />
                        <Label htmlFor={filter.id} className="text-sm font-medium cursor-pointer">{filter.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Results Grid with Staggered Animation */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <NeighborhoodCardSkeleton key={i} />
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
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.5, 
                      delay: Math.min(idx * 0.05, 0.4),
                      ease: [0.22, 1, 0.36, 1]
                    }}
                  >
                    <NeighborhoodCard neighborhood={neighborhood} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
                  <MapPin className="h-10 w-10 text-primary/60" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No neighborhoods found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or search term.</p>
              </motion.div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
