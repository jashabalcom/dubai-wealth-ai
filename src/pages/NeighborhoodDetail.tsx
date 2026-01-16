import { useRef, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  MapPin, TrendingUp, Home, Train, Waves, Shield, Check, X, 
  Building2, ChevronRight, ArrowLeft, Sparkles
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { SEOHead } from '@/components/SEOHead';
import { useNeighborhood, useNeighborhoodProperties } from '@/hooks/useNeighborhoods';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/hooks/useAuth';
import { NeighborhoodLeadCapture } from '@/components/leadgen/NeighborhoodLeadCapture';
import { useCountUp, useInView } from '@/hooks/useCountUp';
import { MarketEstimateDisclaimer } from '@/components/ui/disclaimers';
import { NeighborhoodExplorer } from '@/components/neighborhoods/NeighborhoodExplorer';
import { generateFAQSchema, generateBreadcrumbSchema, SITE_CONFIG } from '@/lib/seo-config';

export default function NeighborhoodDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: neighborhood, isLoading } = useNeighborhood(slug || '');
  const { data: properties } = useNeighborhoodProperties(neighborhood?.name || '');
  const { profile } = useAuth();

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 400], [0, 100]);
  const heroScale = useTransform(scrollY, [0, 400], [1, 1.1]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  const { ref: statsRef, hasBeenInView: statsInView } = useInView();

  // All hooks must be called before any conditional returns
  const priceCount = useCountUp({ end: neighborhood?.avg_price_sqft || 0, duration: 2000, enabled: statsInView && !!neighborhood });
  const yieldCount = useCountUp({ end: (neighborhood?.avg_rental_yield || 0) * 10, duration: 2000, decimals: 0, enabled: statsInView && !!neighborhood });
  const yoyCount = useCountUp({ end: Math.abs(neighborhood?.yoy_appreciation || 0) * 10, duration: 2000, decimals: 0, enabled: statsInView && !!neighborhood });

  const lifestyleLabel = neighborhood?.lifestyle_type?.charAt(0).toUpperCase() + (neighborhood?.lifestyle_type?.slice(1) || '') || '';

  // Generate dynamic FAQs based on neighborhood data
  const neighborhoodFAQs = useMemo(() => {
    if (!neighborhood) return [];
    
    const faqs: Array<{ question: string; answer: string }> = [];
    
    if (neighborhood.avg_price_sqft) {
      faqs.push({
        question: `What is the average price per square foot in ${neighborhood.name}?`,
        answer: `The average price per square foot in ${neighborhood.name} is AED ${neighborhood.avg_price_sqft.toLocaleString()}. This figure is based on recent market data and may vary by property type and specific location within the area.`
      });
    }
    
    faqs.push({
      question: `Is ${neighborhood.name} freehold for foreigners?`,
      answer: neighborhood.is_freehold 
        ? `Yes, ${neighborhood.name} is a freehold area where foreign nationals can purchase property with full ownership rights. This makes it an attractive option for international investors.`
        : `${neighborhood.name} may have restrictions on foreign ownership. We recommend consulting with a licensed real estate professional for the latest regulations.`
    });
    
    if (neighborhood.avg_rental_yield) {
      faqs.push({
        question: `What is the rental yield in ${neighborhood.name}?`,
        answer: `${neighborhood.name} offers an average rental yield of ${neighborhood.avg_rental_yield.toFixed(1)}%. This is calculated based on current market rents and property prices in the area.`
      });
    }
    
    faqs.push({
      question: `Does ${neighborhood.name} qualify for UAE Golden Visa?`,
      answer: neighborhood.golden_visa_eligible
        ? `Yes, properties in ${neighborhood.name} can qualify for the UAE Golden Visa program when the property value meets the minimum threshold of AED 2 million. This visa grants 10-year residency to the investor and their family.`
        : `Golden Visa eligibility depends on the individual property value meeting the AED 2 million threshold. Contact us for specific properties that qualify.`
    });
    
    if (neighborhood.has_metro_access) {
      faqs.push({
        question: `Does ${neighborhood.name} have metro access?`,
        answer: `Yes, ${neighborhood.name} has convenient access to the Dubai Metro, making commuting easy and adding value to properties in the area.`
      });
    }
    
    if (neighborhood.has_beach_access) {
      faqs.push({
        question: `Does ${neighborhood.name} have beach access?`,
        answer: `Yes, ${neighborhood.name} offers beach access, making it ideal for those seeking a coastal lifestyle in Dubai.`
      });
    }
    
    return faqs;
  }, [neighborhood]);

  // Generate breadcrumb schema
  const breadcrumbItems = useMemo(() => {
    if (!neighborhood) return [];
    return [
      { name: 'Home', url: SITE_CONFIG.url },
      { name: 'Neighborhoods', url: `${SITE_CONFIG.url}/neighborhoods` },
      { name: neighborhood.name, url: `${SITE_CONFIG.url}/neighborhoods/${slug}` }
    ];
  }, [neighborhood, slug]);

  // Combined structured data
  const structuredData = useMemo(() => {
    if (!neighborhood) return undefined;
    return [
      generateFAQSchema(neighborhoodFAQs),
      generateBreadcrumbSchema(breadcrumbItems)
    ];
  }, [neighborhoodFAQs, breadcrumbItems, neighborhood]);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background pt-20">
          <div className="container py-8">
            <Skeleton className="h-64 w-full rounded-xl mb-8" />
            <Skeleton className="h-8 w-1/2 mb-4" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!neighborhood) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-6">
              <MapPin className="h-12 w-12 text-primary/60" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-foreground mb-2">Neighborhood Not Found</h1>
            <p className="text-muted-foreground mb-6">The neighborhood you're looking for doesn't exist.</p>
            <Button asChild variant="outline">
              <Link to="/neighborhoods">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Neighborhoods
              </Link>
            </Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SEOHead 
        title={`${neighborhood.name} Dubai | Investment Guide, Schools & Restaurants`}
        description={neighborhood.description || `Explore ${neighborhood.name} in Dubai. Investment analysis, top schools, restaurants, and everything you need to know about living in ${neighborhood.name}.`}
        keywords={[`${neighborhood.name} Dubai`, `${neighborhood.name} property`, `${neighborhood.name} real estate`, `invest in ${neighborhood.name}`, `${neighborhood.name} schools`]}
        structuredData={structuredData}
      />
      <Navbar />
      
      <main className="min-h-screen bg-background">
        {/* Parallax Hero Section */}
        <section ref={heroRef} className="relative h-[50vh] min-h-[350px] md:min-h-[450px] overflow-hidden">
          <motion.div 
            style={{ y: heroY, scale: heroScale }}
            className="absolute inset-0"
          >
            {neighborhood.cover_image_url || neighborhood.image_url ? (
              <img
                src={neighborhood.cover_image_url || neighborhood.image_url || ''}
                alt={neighborhood.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/10" />
            )}
          </motion.div>
          
          {/* Multi-layer Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/50 via-transparent to-background/50" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
          
          {/* Decorative Gold Lines */}
          <div className="absolute top-1/3 left-0 w-1/4 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <div className="absolute top-1/3 right-0 w-1/4 h-px bg-gradient-to-l from-transparent via-primary/40 to-transparent" />
          
          <motion.div style={{ opacity: heroOpacity }} className="absolute inset-0 flex items-end">
            <div className="container pb-16">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm mb-6">
                  <Link to="/neighborhoods" className="text-muted-foreground hover:text-primary transition-colors">
                    Neighborhoods
                  </Link>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground font-medium">{neighborhood.name}</span>
                </nav>

                {/* Animated Badges */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.6 }}
                  className="flex flex-wrap gap-2 mb-5"
                >
                  <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30 backdrop-blur-sm px-3 py-1">
                    <Sparkles className="h-3 w-3 mr-1.5" />
                    {lifestyleLabel}
                  </Badge>
                  {neighborhood.is_freehold && (
                    <Badge variant="outline" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 backdrop-blur-sm px-3 py-1">
                      <Home className="h-3 w-3 mr-1.5" />
                      Freehold
                    </Badge>
                  )}
                  {neighborhood.golden_visa_eligible && (
                    <Badge variant="outline" className="bg-amber-500/20 text-amber-300 border-amber-500/30 backdrop-blur-sm px-3 py-1">
                      <Shield className="h-3 w-3 mr-1.5" />
                      Golden Visa Eligible
                    </Badge>
                  )}
                  {neighborhood.has_metro_access && (
                    <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/30 backdrop-blur-sm px-3 py-1">
                      <Train className="h-3 w-3 mr-1.5" />
                      Metro Access
                    </Badge>
                  )}
                  {neighborhood.has_beach_access && (
                    <Badge variant="outline" className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 backdrop-blur-sm px-3 py-1">
                      <Waves className="h-3 w-3 mr-1.5" />
                      Beach Access
                    </Badge>
                  )}
                </motion.div>

                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4"
                >
                  {neighborhood.name}
                </motion.h1>
                
                {neighborhood.description && (
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="text-lg text-muted-foreground max-w-2xl leading-relaxed"
                  >
                    {neighborhood.description}
                  </motion.p>
                )}
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Glass-morphism Quick Stats Bar */}
        <section ref={statsRef} className="relative -mt-8 z-10 mb-8">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="relative"
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl blur-xl" />
              
              <div className="relative bg-card/80 backdrop-blur-xl rounded-2xl border border-primary/20 shadow-xl shadow-primary/5 overflow-hidden">
                {/* Gold Accent Line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                
                <div className="p-4 md:p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-4 md:gap-6">
                    {neighborhood.avg_price_sqft && (
                      <div className="text-center">
                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 mb-2">
                          <Home className="h-5 w-5 text-primary" />
                        </div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Price/sqft</p>
                        <p className="text-lg md:text-xl font-bold text-foreground">
                          AED {statsInView ? priceCount.toLocaleString() : neighborhood.avg_price_sqft.toLocaleString()}
                        </p>
                      </div>
                    )}
                    {neighborhood.avg_rental_yield && (
                      <div className="text-center">
                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 mb-2">
                          <TrendingUp className="h-5 w-5 text-primary" />
                        </div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Rental Yield</p>
                        <p className="text-lg md:text-xl font-bold text-primary">
                          {statsInView ? (yieldCount / 10).toFixed(1) : neighborhood.avg_rental_yield.toFixed(1)}%
                        </p>
                      </div>
                    )}
                    {neighborhood.yoy_appreciation && (
                      <div className="text-center">
                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 mb-2">
                          <TrendingUp className="h-5 w-5 text-primary" />
                        </div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">YoY Growth</p>
                        <p className={`text-lg md:text-xl font-bold ${neighborhood.yoy_appreciation >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {neighborhood.yoy_appreciation >= 0 ? '+' : '-'}{statsInView ? (yoyCount / 10).toFixed(1) : Math.abs(neighborhood.yoy_appreciation).toFixed(1)}%
                        </p>
                      </div>
                    )}
                    {neighborhood.walkability_score && (
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Walkability</p>
                        <p className="text-lg md:text-xl font-bold text-foreground">{neighborhood.walkability_score}/100</p>
                      </div>
                    )}
                    {neighborhood.transit_score && (
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Transit Score</p>
                        <p className="text-lg md:text-xl font-bold text-foreground">{neighborhood.transit_score}/100</p>
                      </div>
                    )}
                    {neighborhood.safety_score && (
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Safety Score</p>
                        <p className="text-lg md:text-xl font-bold text-foreground">{neighborhood.safety_score}/100</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Market Estimate Disclaimer */}
                  {(neighborhood.avg_price_sqft || neighborhood.avg_rental_yield) && (
                    <MarketEstimateDisclaimer variant="inline" className="mt-4 justify-center" />
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-8">
          <div className="container">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content Column */}
              <div className="lg:col-span-2 space-y-8">
                {/* Glass-morphism Overview Card */}
                {neighborhood.overview && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                  >
                    <Card className="border-primary/10 bg-card/60 backdrop-blur-sm overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                      <CardHeader>
                        <CardTitle className="font-serif text-xl flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-primary" />
                          About {neighborhood.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                          {neighborhood.overview}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Unified Neighborhood Explorer - Map + POIs */}
                {neighborhood.latitude && neighborhood.longitude && (
                  <NeighborhoodExplorer
                    neighborhoodId={neighborhood.id}
                    neighborhoodName={neighborhood.name}
                    latitude={neighborhood.latitude}
                    longitude={neighborhood.longitude}
                  />
                )}

                {/* Pros & Cons Cards */}
                <div className="grid md:grid-cols-2 gap-6">
                  {neighborhood.pros && neighborhood.pros.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    >
                      <Card className="h-full border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent backdrop-blur-sm overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
                        <CardHeader>
                          <CardTitle className="text-emerald-400 flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-emerald-500/20">
                              <Check className="h-4 w-4" />
                            </div>
                            Advantages
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-3">
                            {neighborhood.pros.map((pro, idx) => (
                              <motion.li 
                                key={idx} 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + idx * 0.05 }}
                                className="flex items-start gap-3 text-muted-foreground"
                              >
                                <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                                <span>{pro}</span>
                              </motion.li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  {neighborhood.cons && neighborhood.cons.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    >
                      <Card className="h-full border-red-500/20 bg-gradient-to-br from-red-500/5 to-transparent backdrop-blur-sm overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
                        <CardHeader>
                          <CardTitle className="text-red-400 flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-red-500/20">
                              <X className="h-4 w-4" />
                            </div>
                            Considerations
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-3">
                            {neighborhood.cons.map((con, idx) => (
                              <motion.li 
                                key={idx} 
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + idx * 0.05 }}
                                className="flex items-start gap-3 text-muted-foreground"
                              >
                                <X className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                <span>{con}</span>
                              </motion.li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </div>

              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Lead Capture */}
                <NeighborhoodLeadCapture neighborhoodName={neighborhood.name} />
                
                {/* Best For Card */}
                {neighborhood.best_for && neighborhood.best_for.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    <Card className="border-primary/10 bg-card/60 backdrop-blur-sm overflow-hidden sticky top-24">
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                      <CardHeader>
                        <CardTitle className="text-lg font-serif flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          Best For
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {neighborhood.best_for.map((tag, idx) => (
                            <Badge 
                              key={idx} 
                              variant="secondary"
                              className="bg-primary/10 text-primary border-primary/20"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Available Properties */}
                {properties && properties.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <Card className="border-border/30 bg-card/60 backdrop-blur-sm overflow-hidden">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-serif">Available Properties</CardTitle>
                        <Button variant="ghost" size="sm" asChild className="text-primary hover:text-primary">
                          <Link to={`/properties?area=${encodeURIComponent(neighborhood.name)}`}>
                            View All
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Link>
                        </Button>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {properties.slice(0, 3).map((property) => (
                          <Link
                            key={property.id}
                            to={`/properties/${property.slug}`}
                            className="flex gap-3 p-3 -mx-3 rounded-xl hover:bg-primary/5 transition-colors group"
                          >
                            <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-muted">
                              {property.images && Array.isArray(property.images) && property.images[0] ? (
                                <img src={property.images[0] as string} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Building2 className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">{property.title}</h4>
                              <p className="text-sm text-primary font-semibold">
                                AED {property.price_aed?.toLocaleString()}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {property.bedrooms} bed • {property.size_sqft?.toLocaleString()} sqft
                              </p>
                            </div>
                          </Link>
                        ))}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Quick Info */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <Card className="border-border/30 bg-card/60 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-lg font-serif">Quick Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {neighborhood.developer_name && (
                        <div className="flex justify-between text-sm p-2 rounded-lg hover:bg-muted/30 transition-colors">
                          <span className="text-muted-foreground">Developer</span>
                          <span className="font-medium">{neighborhood.developer_name}</span>
                        </div>
                      )}
                      {neighborhood.established_year && (
                        <div className="flex justify-between text-sm p-2 rounded-lg hover:bg-muted/30 transition-colors">
                          <span className="text-muted-foreground">Established</span>
                          <span className="font-medium">{neighborhood.established_year}</span>
                        </div>
                      )}
                      {neighborhood.population_estimate && (
                        <div className="flex justify-between text-sm p-2 rounded-lg hover:bg-muted/30 transition-colors">
                          <span className="text-muted-foreground">Est. Population</span>
                          <span className="font-medium">{neighborhood.population_estimate.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm p-2 rounded-lg hover:bg-muted/30 transition-colors">
                        <span className="text-muted-foreground">Ownership</span>
                        <span className="font-medium">{neighborhood.is_freehold ? 'Freehold' : 'Leasehold'}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
