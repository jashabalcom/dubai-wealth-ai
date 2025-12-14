import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MapPin, TrendingUp, Home, Train, Waves, Shield, Check, X, 
  GraduationCap, Utensils, Building2, ChevronRight, Star, Phone, Globe, ArrowLeft
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { SEOHead } from '@/components/SEOHead';
import { useNeighborhood, useNeighborhoodPOIs, useNeighborhoodProperties } from '@/hooks/useNeighborhoods';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function NeighborhoodDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: neighborhood, isLoading } = useNeighborhood(slug || '');
  const { data: schools } = useNeighborhoodPOIs(neighborhood?.id || '', 'school');
  const { data: restaurants } = useNeighborhoodPOIs(neighborhood?.id || '', 'restaurant');
  const { data: properties } = useNeighborhoodProperties(neighborhood?.name || '');

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
            <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Neighborhood Not Found</h1>
            <p className="text-muted-foreground mb-6">The neighborhood you're looking for doesn't exist.</p>
            <Button asChild>
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

  const lifestyleLabel = neighborhood.lifestyle_type?.charAt(0).toUpperCase() + (neighborhood.lifestyle_type?.slice(1) || '');

  return (
    <>
      <SEOHead 
        title={`${neighborhood.name} Dubai | Investment Guide, Schools & Restaurants`}
        description={neighborhood.description || `Explore ${neighborhood.name} in Dubai. Investment analysis, top schools, restaurants, and everything you need to know about living in ${neighborhood.name}.`}
        keywords={[`${neighborhood.name} Dubai`, `${neighborhood.name} property`, `${neighborhood.name} real estate`, `invest in ${neighborhood.name}`, `${neighborhood.name} schools`]}
      />
      <Navbar />
      
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
          {neighborhood.cover_image_url || neighborhood.image_url ? (
            <img
              src={neighborhood.cover_image_url || neighborhood.image_url || ''}
              alt={neighborhood.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/10" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          
          <div className="absolute inset-0 flex items-end">
            <div className="container pb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Link to="/neighborhoods" className="hover:text-primary transition-colors">Neighborhoods</Link>
                  <ChevronRight className="h-4 w-4" />
                  <span className="text-foreground">{neighborhood.name}</span>
                </nav>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30">
                    {lifestyleLabel}
                  </Badge>
                  {neighborhood.is_freehold && (
                    <Badge variant="outline" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                      <Home className="h-3 w-3 mr-1" />
                      Freehold
                    </Badge>
                  )}
                  {neighborhood.golden_visa_eligible && (
                    <Badge variant="outline" className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                      <Shield className="h-3 w-3 mr-1" />
                      Golden Visa Eligible
                    </Badge>
                  )}
                  {neighborhood.has_metro_access && (
                    <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                      <Train className="h-3 w-3 mr-1" />
                      Metro Access
                    </Badge>
                  )}
                  {neighborhood.has_beach_access && (
                    <Badge variant="outline" className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                      <Waves className="h-3 w-3 mr-1" />
                      Beach Access
                    </Badge>
                  )}
                </div>

                <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
                  {neighborhood.name}
                </h1>
                
                {neighborhood.description && (
                  <p className="text-lg text-muted-foreground max-w-2xl">
                    {neighborhood.description}
                  </p>
                )}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Quick Stats Bar */}
        <section className="border-b border-border/50 bg-card/50">
          <div className="container py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {neighborhood.avg_price_sqft && (
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Price/sqft</p>
                  <p className="text-xl font-bold text-foreground">AED {neighborhood.avg_price_sqft.toLocaleString()}</p>
                </div>
              )}
              {neighborhood.avg_rental_yield && (
                <div>
                  <p className="text-sm text-muted-foreground">Rental Yield</p>
                  <p className="text-xl font-bold text-primary">{neighborhood.avg_rental_yield.toFixed(1)}%</p>
                </div>
              )}
              {neighborhood.yoy_appreciation && (
                <div>
                  <p className="text-sm text-muted-foreground">YoY Growth</p>
                  <p className={`text-xl font-bold ${neighborhood.yoy_appreciation >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {neighborhood.yoy_appreciation >= 0 ? '+' : ''}{neighborhood.yoy_appreciation.toFixed(1)}%
                  </p>
                </div>
              )}
              {neighborhood.walkability_score && (
                <div>
                  <p className="text-sm text-muted-foreground">Walkability</p>
                  <p className="text-xl font-bold text-foreground">{neighborhood.walkability_score}/100</p>
                </div>
              )}
              {neighborhood.transit_score && (
                <div>
                  <p className="text-sm text-muted-foreground">Transit Score</p>
                  <p className="text-xl font-bold text-foreground">{neighborhood.transit_score}/100</p>
                </div>
              )}
              {neighborhood.safety_score && (
                <div>
                  <p className="text-sm text-muted-foreground">Safety Score</p>
                  <p className="text-xl font-bold text-foreground">{neighborhood.safety_score}/100</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12">
          <div className="container">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Overview */}
                {neighborhood.overview && (
                  <Card className="border-border/50 bg-card/50">
                    <CardHeader>
                      <CardTitle className="font-serif">About {neighborhood.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {neighborhood.overview}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Pros & Cons */}
                <div className="grid md:grid-cols-2 gap-6">
                  {neighborhood.pros && neighborhood.pros.length > 0 && (
                    <Card className="border-emerald-500/30 bg-emerald-500/5">
                      <CardHeader>
                        <CardTitle className="text-emerald-400 flex items-center gap-2">
                          <Check className="h-5 w-5" />
                          Advantages
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {neighborhood.pros.map((pro, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-muted-foreground">
                              <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {neighborhood.cons && neighborhood.cons.length > 0 && (
                    <Card className="border-red-500/30 bg-red-500/5">
                      <CardHeader>
                        <CardTitle className="text-red-400 flex items-center gap-2">
                          <X className="h-5 w-5" />
                          Considerations
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {neighborhood.cons.map((con, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-muted-foreground">
                              <X className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                              {con}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Tabs for Schools, Restaurants, Investment */}
                <Tabs defaultValue="schools" className="w-full">
                  <TabsList className="w-full justify-start">
                    <TabsTrigger value="schools" className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Schools
                    </TabsTrigger>
                    <TabsTrigger value="restaurants" className="flex items-center gap-2">
                      <Utensils className="h-4 w-4" />
                      Dining
                    </TabsTrigger>
                    <TabsTrigger value="investment" className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Investment
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="schools" className="mt-6">
                    {schools && schools.length > 0 ? (
                      <div className="grid gap-4">
                        {schools.map((school) => (
                          <Card key={school.id} className="border-border/50 bg-card/50">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-foreground">{school.name}</h4>
                                  {school.curriculum && (
                                    <Badge variant="secondary" className="mt-1">{school.curriculum} Curriculum</Badge>
                                  )}
                                  {school.description && (
                                    <p className="text-sm text-muted-foreground mt-2">{school.description}</p>
                                  )}
                                  <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                                    {school.grade_levels && <span>{school.grade_levels}</span>}
                                    {school.annual_fees_from && (
                                      <span>
                                        AED {school.annual_fees_from.toLocaleString()}
                                        {school.annual_fees_to && ` - ${school.annual_fees_to.toLocaleString()}`}/year
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                  {school.rating && (
                                    <div className="flex items-center gap-1">
                                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                      <span className="font-medium">{school.rating}</span>
                                    </div>
                                  )}
                                  {school.website_url && (
                                    <Button variant="ghost" size="sm" asChild>
                                      <a href={school.website_url} target="_blank" rel="noopener noreferrer">
                                        <Globe className="h-4 w-4" />
                                      </a>
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No schools data available yet. Check back soon!</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="restaurants" className="mt-6">
                    {restaurants && restaurants.length > 0 ? (
                      <div className="grid md:grid-cols-2 gap-4">
                        {restaurants.map((restaurant) => (
                          <Card key={restaurant.id} className="border-border/50 bg-card/50">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-foreground">{restaurant.name}</h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    {restaurant.cuisine && <Badge variant="secondary">{restaurant.cuisine}</Badge>}
                                    {restaurant.price_level && (
                                      <span className="text-sm text-muted-foreground">{restaurant.price_level}</span>
                                    )}
                                  </div>
                                  {restaurant.description && (
                                    <p className="text-sm text-muted-foreground mt-2">{restaurant.description}</p>
                                  )}
                                </div>
                                {restaurant.rating && (
                                  <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                    <span className="font-medium">{restaurant.rating}</span>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <Utensils className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No restaurant data available yet. Check back soon!</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="investment" className="mt-6">
                    <Card className="border-border/50 bg-card/50">
                      <CardHeader>
                        <CardTitle>Investment Analysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h5 className="font-medium text-foreground mb-3">Average Rent Prices</h5>
                            <div className="space-y-2">
                              {neighborhood.avg_rent_studio && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Studio</span>
                                  <span className="font-medium">AED {neighborhood.avg_rent_studio.toLocaleString()}/year</span>
                                </div>
                              )}
                              {neighborhood.avg_rent_1br && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">1 Bedroom</span>
                                  <span className="font-medium">AED {neighborhood.avg_rent_1br.toLocaleString()}/year</span>
                                </div>
                              )}
                              {neighborhood.avg_rent_2br && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">2 Bedrooms</span>
                                  <span className="font-medium">AED {neighborhood.avg_rent_2br.toLocaleString()}/year</span>
                                </div>
                              )}
                              {neighborhood.avg_rent_3br && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">3 Bedrooms</span>
                                  <span className="font-medium">AED {neighborhood.avg_rent_3br.toLocaleString()}/year</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            <h5 className="font-medium text-foreground mb-3">Key Metrics</h5>
                            <div className="space-y-2">
                              {neighborhood.avg_price_sqft && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Avg. Price/sqft</span>
                                  <span className="font-medium">AED {neighborhood.avg_price_sqft.toLocaleString()}</span>
                                </div>
                              )}
                              {neighborhood.avg_rental_yield && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Rental Yield</span>
                                  <span className="font-medium text-primary">{neighborhood.avg_rental_yield.toFixed(1)}%</span>
                                </div>
                              )}
                              {neighborhood.yoy_appreciation && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">YoY Appreciation</span>
                                  <span className={`font-medium ${neighborhood.yoy_appreciation >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {neighborhood.yoy_appreciation >= 0 ? '+' : ''}{neighborhood.yoy_appreciation.toFixed(1)}%
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Best For */}
                {neighborhood.best_for && neighborhood.best_for.length > 0 && (
                  <Card className="border-border/50 bg-card/50">
                    <CardHeader>
                      <CardTitle className="text-lg">Best For</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {neighborhood.best_for.map((tag, idx) => (
                          <Badge key={idx} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Available Properties */}
                {properties && properties.length > 0 && (
                  <Card className="border-border/50 bg-card/50">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg">Available Properties</CardTitle>
                      <Button variant="ghost" size="sm" asChild>
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
                          className="flex gap-3 p-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-muted">
                            {property.images && Array.isArray(property.images) && property.images[0] ? (
                              <img src={property.images[0] as string} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Building2 className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-foreground line-clamp-1">{property.title}</h4>
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
                )}

                {/* Quick Info */}
                <Card className="border-border/50 bg-card/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {neighborhood.developer_name && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Developer</span>
                        <span className="font-medium">{neighborhood.developer_name}</span>
                      </div>
                    )}
                    {neighborhood.established_year && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Established</span>
                        <span className="font-medium">{neighborhood.established_year}</span>
                      </div>
                    )}
                    {neighborhood.population_estimate && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Est. Population</span>
                        <span className="font-medium">{neighborhood.population_estimate.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Ownership</span>
                      <span className="font-medium">{neighborhood.is_freehold ? 'Freehold' : 'Leasehold'}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
