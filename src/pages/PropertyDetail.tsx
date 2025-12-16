import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, MapPin, Bed, Bath, Maximize, TrendingUp, Calendar, 
  Building2, CheckCircle2, Heart, Share2, Plus, Home, DollarSign, 
  Sparkles, Car, Sofa, Eye, Layers, Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SEOHead } from '@/components/SEOHead';
import { generateRealEstateListingSchema, generateBreadcrumbSchema, SITE_CONFIG } from '@/lib/seo-config';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSavedProperties } from '@/hooks/useSavedProperties';
import { PropertyGallery } from '@/components/properties/PropertyGallery';
import { SimilarProperties } from '@/components/properties/SimilarProperties';
import { PropertyInquiryForm } from '@/components/properties/PropertyInquiryForm';
import { InlineROICalculator } from '@/components/properties/InlineROICalculator';
import { PropertyAIAnalysis } from '@/components/properties/PropertyAIAnalysis';
import { AgentContactCard } from '@/components/properties/AgentContactCard';
import { FloorPlansGallery } from '@/components/properties/FloorPlansGallery';
import { PropertyFeaturesGrid } from '@/components/properties/PropertyFeaturesGrid';
import { AirbnbYieldCard } from '@/components/properties/AirbnbYieldCard';
import { InvestmentScoreBadge } from '@/components/properties/InvestmentScoreBadge';
import { GoldenVisaBadge } from '@/components/properties/GoldenVisaBadge';
import { TrueCostCard } from '@/components/properties/TrueCostCard';
import { NeighborhoodWidget } from '@/components/properties/NeighborhoodWidget';
import { PropertyNotesCard } from '@/components/properties/PropertyNotesCard';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

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
  gallery_urls: string[];       // CDN references from Bayut
  floor_plan_urls: string[];    // Re-hosted floor plans
  completion_date: string | null;
  payment_plan_json: { 
    down_payment: number; 
    during_construction: number; 
    on_handover: number; 
    post_handover: number; 
    post_handover_years: number; 
  } | null;
  description: string;
  amenities: Array<string | { type: string; items: string[] }>;
  highlights: string[];
  is_featured: boolean;
  // New fields
  listing_type: string;
  furnishing: string;
  view_type: string | null;
  floor_number: number | null;
  total_floors: number | null;
  year_built: number | null;
  parking_spaces: number;
  service_charge_per_sqft: number | null;
  rera_permit_number: string | null;
  rental_frequency: string;
  virtual_tour_url: string | null;
  video_url: string | null;
  agent_id: string | null;
  brokerage_id: string | null;
  community_id: string | null;
  agent?: {
    id: string;
    full_name: string;
    email: string | null;
    phone: string | null;
    whatsapp: string | null;
    rera_brn: string | null;
    avatar_url: string | null;
    years_experience: number;
    is_verified: boolean;
    specializations: string[];
    brokerage?: {
      name: string;
      logo_url: string | null;
    } | null;
  } | null;
  community?: {
    name: string;
    avg_price_per_sqft: number | null;
    avg_rental_yield: number | null;
  } | null;
  developer?: {
    name: string;
    slug: string;
  } | null;
}

interface PropertyImage {
  id: string;
  url: string;
  category: string;
  is_primary: boolean;
  order_index: number;
}

interface FloorPlan {
  id: string;
  url: string;
  title: string | null;
  floor_number: number | null;
  order_index: number;
}

interface PropertyFeature {
  id: string;
  feature_definitions: {
    name: string;
    slug: string;
    category: string;
    icon: string | null;
  };
}

function formatPrice(price: number): string {
  return `AED ${price.toLocaleString()}`;
}

export default function PropertyDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toggleSave, isSaved } = useSavedProperties();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);

  useEffect(() => {
    if (slug) fetchProperty();
  }, [slug]);

  const fetchProperty = async () => {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        agent:agents(
          id, full_name, email, phone, whatsapp, rera_brn, 
          avatar_url, years_experience, is_verified, specializations,
          brokerage:brokerages(name, logo_url)
        ),
        community:communities(name, avg_price_per_sqft, avg_rental_yield),
        developer:developers(name, slug)
      `)
      .eq('slug', slug)
      .maybeSingle();
    
    if (error || !data) { 
      navigate('/properties'); 
      return; 
    }
    
    setProperty({
      ...data,
      images: Array.isArray(data.images) ? (data.images as string[]) : [],
      gallery_urls: Array.isArray((data as any).gallery_urls) ? ((data as any).gallery_urls as string[]) : [],
      floor_plan_urls: Array.isArray((data as any).floor_plan_urls) ? ((data as any).floor_plan_urls as string[]) : [],
      amenities: Array.isArray(data.amenities) ? (data.amenities as Property['amenities']) : [],
      highlights: Array.isArray(data.highlights) ? (data.highlights as string[]) : [],
      payment_plan_json: data.payment_plan_json as Property['payment_plan_json'],
      price_aed: Number(data.price_aed),
      size_sqft: Number(data.size_sqft),
      rental_yield_estimate: Number(data.rental_yield_estimate),
      agent: data.agent as Property['agent'],
      community: data.community as Property['community'],
      developer: data.developer as Property['developer'],
    });
    setLoading(false);
  };

  // Fetch property images from property_images table
  const { data: propertyImages = [] } = useQuery({
    queryKey: ['property-images', property?.id],
    queryFn: async () => {
      if (!property?.id) return [];
      const { data, error } = await supabase
        .from('property_images')
        .select('*')
        .eq('property_id', property.id)
        .order('order_index');
      if (error) return [];
      return data as PropertyImage[];
    },
    enabled: !!property?.id,
  });

  // Fetch floor plans
  const { data: floorPlans = [] } = useQuery({
    queryKey: ['property-floor-plans', property?.id],
    queryFn: async () => {
      if (!property?.id) return [];
      const { data, error } = await supabase
        .from('property_floor_plans')
        .select('*')
        .eq('property_id', property.id)
        .order('order_index');
      if (error) return [];
      return data as FloorPlan[];
    },
    enabled: !!property?.id,
  });

  // Fetch property features
  const { data: propertyFeatures = [] } = useQuery({
    queryKey: ['property-features', property?.id],
    queryFn: async () => {
      if (!property?.id) return [];
      const { data, error } = await supabase
        .from('property_features')
        .select(`
          id,
          feature_definitions(name, slug, category, icon)
        `)
        .eq('property_id', property.id);
      if (error) return [];
      return data as PropertyFeature[];
    },
    enabled: !!property?.id,
  });

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: property?.title, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: 'Link copied!' });
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
    </div>
  );
  
  if (!property) return null;

  // Use property_images if available, fallback to legacy images array
  const galleryImages = propertyImages.length > 0 
    ? propertyImages.map(img => img.url) 
    : property.images;

  const pricePerSqft = property.size_sqft ? Math.round(property.price_aed / property.size_sqft) : 0;
  const rentalYield = property.rental_yield_estimate ?? 0;
  const estimatedMonthlyRent = Math.round((property.price_aed * (rentalYield / 100)) / 12);
  const estimatedAnnualRent = estimatedMonthlyRent * 12;
  const propertyIsSaved = isSaved(property.id);

  const furnishingLabel = !property.furnishing 
    ? null 
    : property.furnishing === 'semi-furnished' 
      ? 'Semi-Furnished' 
      : property.furnishing.charAt(0).toUpperCase() + property.furnishing.slice(1);

  // Generate SEO data
  const seoTitle = `${property.title} | ${(property.bedrooms ?? 0) === 0 ? 'Studio' : `${property.bedrooms} Bed`} ${property.property_type || 'Property'} in ${property.location_area}`;
  const seoDescription = `${property.listing_type === 'rent' ? 'Rent' : 'Buy'} this ${(property.bedrooms ?? 0) === 0 ? 'studio' : `${property.bedrooms}-bedroom`} ${property.property_type || 'property'} in ${property.location_area}, Dubai for ${formatPrice(property.price_aed)}. ${(property.size_sqft ?? 0).toLocaleString()} sqft${rentalYield ? `, ${rentalYield}% rental yield` : ''}. ${property.is_off_plan ? 'Off-plan with payment plan.' : 'Ready to move.'}`;
  const propertyUrl = `${SITE_CONFIG.url}/properties/${property.slug}`;
  const primaryImage = galleryImages[0] || 'https://lovable.dev/opengraph-image-p98pqg.png';

  const structuredData = [
    generateRealEstateListingSchema({
      title: property.title,
      description: property.description,
      price: property.price_aed,
      currency: 'AED',
      location: property.location_area,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      size: property.size_sqft,
      images: galleryImages,
      url: propertyUrl,
    }),
    generateBreadcrumbSchema([
      { name: 'Home', url: SITE_CONFIG.url },
      { name: 'Properties', url: `${SITE_CONFIG.url}/properties` },
      { name: property.title, url: propertyUrl },
    ]),
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        keywords={[
          `${property.property_type} for ${property.listing_type === 'rent' ? 'rent' : 'sale'} ${property.location_area}`,
          `Dubai ${property.property_type}`,
          `${property.bedrooms} bedroom ${property.location_area}`,
          property.developer_name ? `${property.developer_name} property` : '',
          property.is_off_plan ? 'off-plan Dubai' : 'ready property Dubai',
        ].filter(Boolean)}
        canonical={propertyUrl}
        ogImage={primaryImage}
        ogType="product"
        structuredData={structuredData}
      />
      <Navbar />

      <section className="pt-20">
        <PropertyGallery 
          images={galleryImages} 
          galleryUrls={property.gallery_urls}
          title={property.title} 
        />
        <div className="absolute top-24 left-4 flex flex-wrap gap-2 z-10">
          {property.is_off_plan && (
            <span className="px-3 py-1 bg-blue-500 text-white text-sm font-medium rounded-full">
              Off-Plan
            </span>
          )}
          {property.is_featured && (
            <span className="px-3 py-1 bg-gold text-primary-dark text-sm font-medium rounded-full">
              Featured
            </span>
          )}
          {property.listing_type === 'rent' && (
            <span className="px-3 py-1 bg-purple-500 text-white text-sm font-medium rounded-full">
              For Rent
            </span>
          )}
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <Link to="/properties" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Properties
            </Link>
            <div className="flex flex-wrap gap-2">
              {user && (
                <Button variant="outline" size="sm" onClick={() => toggleSave(property.id)} className="min-h-[44px]">
                  <Heart className={cn("w-4 h-4 mr-2", propertyIsSaved && "fill-red-500 text-red-500")} />
                  {propertyIsSaved ? 'Saved' : 'Save'}
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleShare} className="min-h-[44px]">
                <Share2 className="w-4 h-4 mr-2" /> Share
              </Button>
              {user && profile?.membership_tier === 'elite' && (
                <Link to="/portfolio">
                  <Button variant="gold" size="sm" className="min-h-[44px]">
                    <Plus className="w-4 h-4 mr-2" /> <span className="hidden sm:inline">Add to </span>Portfolio
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {/* Location & Developer */}
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <MapPin className="w-4 h-4" /> 
                  {property.community?.name || property.location_area}
                  {(property.developer?.name || property.developer_name) && (
                    <>
                      <span>•</span>
                      {property.developer?.slug ? (
                        <Link 
                          to={`/developers/${property.developer.slug}`}
                          className="text-primary hover:underline transition-colors"
                        >
                          {property.developer.name}
                        </Link>
                      ) : (
                        <span>{property.developer_name}</span>
                      )}
                    </>
                  )}
                </div>
                
                {/* Title */}
                <h1 className="font-heading text-3xl md:text-4xl text-foreground mb-4">
                  {property.title}
                </h1>
                
                {/* Key Stats */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 md:gap-6 text-sm sm:text-base text-muted-foreground mb-4">
                  <span className="flex items-center gap-1 sm:gap-2">
                    <Bed className="w-4 h-4 sm:w-5 sm:h-5" /> 
                    {(property.bedrooms ?? 0) === 0 ? 'Studio' : `${property.bedrooms} Bed`}
                  </span>
                  <span className="flex items-center gap-1 sm:gap-2">
                    <Bath className="w-4 h-4 sm:w-5 sm:h-5" /> 
                    {property.bathrooms ?? 0} Bath
                  </span>
                  <span className="flex items-center gap-1 sm:gap-2">
                    <Maximize className="w-4 h-4 sm:w-5 sm:h-5" /> 
                    {(property.size_sqft ?? 0).toLocaleString()} sqft
                  </span>
                  {property.property_type && (
                    <span className="flex items-center gap-1 sm:gap-2">
                      <Home className="w-4 h-4 sm:w-5 sm:h-5" /> 
                      {property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1)}
                    </span>
                  )}
                  {(property.parking_spaces ?? 0) > 0 && (
                    <span className="flex items-center gap-1 sm:gap-2">
                      <Car className="w-4 h-4 sm:w-5 sm:h-5" /> 
                      {property.parking_spaces} Parking
                    </span>
                  )}
                </div>

                {/* Price */}
                <p className="font-heading text-3xl text-gold">
                  {formatPrice(property.price_aed)}
                  {property.listing_type === 'rent' && (
                    <span className="text-lg text-muted-foreground">
                      /{property.rental_frequency || 'year'}
                    </span>
                  )}
                </p>

                {/* RERA Badge */}
                {property.rera_permit_number && (
                  <p className="text-sm text-muted-foreground mt-2">
                    RERA Permit: {property.rera_permit_number}
                  </p>
                )}
              </motion.div>

              {/* Property Details Grid */}
              <div className="p-4 sm:p-6 rounded-xl bg-card border border-border">
                <h2 className="font-heading text-lg sm:text-xl text-foreground mb-4">Property Details</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {furnishingLabel && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <Sofa className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Furnishing</p>
                        <p className="text-sm font-medium text-foreground">{furnishingLabel}</p>
                      </div>
                    </div>
                  )}
                  
                  {property.view_type && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">View</p>
                        <p className="text-sm font-medium text-foreground capitalize">{property.view_type}</p>
                      </div>
                    </div>
                  )}
                  
                  {property.floor_number && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <Layers className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Floor</p>
                        <p className="text-sm font-medium text-foreground">
                          {property.floor_number}
                          {property.total_floors && ` of ${property.total_floors}`}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {property.year_built && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <Building className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Year Built</p>
                        <p className="text-sm font-medium text-foreground">{property.year_built}</p>
                      </div>
                    </div>
                  )}
                  
                  {property.service_charge_per_sqft && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Service Charge</p>
                        <p className="text-sm font-medium text-foreground">
                          AED {property.service_charge_per_sqft}/sqft
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Highlights */}
              {property.highlights.length > 0 && (
                <div className="p-6 rounded-xl bg-card border border-border">
                  <h2 className="font-heading text-xl text-foreground mb-4">Key Highlights</h2>
                  <div className="flex flex-wrap gap-2">
                    {property.highlights.map((h, i) => (
                      <span key={i} className="px-3 py-1 bg-gold/10 text-gold border border-gold/20 text-sm rounded-full">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {property.description && (
                <div className="p-6 rounded-xl bg-card border border-border">
                  <h2 className="font-heading text-xl text-foreground mb-4">Description</h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {property.description}
                  </p>
                </div>
              )}

              {/* Floor Plans */}
              <FloorPlansGallery floorPlans={floorPlans} />

              {/* Features from property_features table */}
              {propertyFeatures.length > 0 && (
                <PropertyFeaturesGrid features={propertyFeatures} />
              )}

              {/* Legacy Amenities (fallback) */}
              {propertyFeatures.length === 0 && property.amenities.length > 0 && (
                <div className="p-6 rounded-xl bg-card border border-border">
                  <h2 className="font-heading text-xl text-foreground mb-4">Amenities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {property.amenities.flatMap((amenity, groupIndex) => {
                      if (!amenity) return [];
                      // Handle object format {type, items}
                      if (typeof amenity === 'object' && 'items' in amenity) {
                        const items = (amenity as { type: string; items: string[] }).items;
                        return items.map((item, itemIndex) => (
                          <div key={`${groupIndex}-${itemIndex}`} className="flex items-center gap-2 text-muted-foreground">
                            <CheckCircle2 className="w-4 h-4 text-gold" />
                            {item}
                          </div>
                        ));
                      }
                      // Simple string format
                      return (
                        <div key={groupIndex} className="flex items-center gap-2 text-muted-foreground">
                          <CheckCircle2 className="w-4 h-4 text-gold" />
                          {String(amenity)}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Payment Plan */}
              {property.is_off_plan && property.payment_plan_json && (
                <div className="p-6 rounded-xl bg-card border border-border">
                  <h2 className="font-heading text-xl text-foreground mb-4">Payment Plan</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {(property.payment_plan_json.down_payment ?? 0) > 0 && (
                      <div className="p-4 rounded-lg bg-muted/50 text-center">
                        <p className="text-2xl font-heading text-gold">
                          {property.payment_plan_json.down_payment}%
                        </p>
                        <p className="text-sm text-muted-foreground">Down Payment</p>
                      </div>
                    )}
                    {(property.payment_plan_json.during_construction ?? 0) > 0 && (
                      <div className="p-4 rounded-lg bg-muted/50 text-center">
                        <p className="text-2xl font-heading text-foreground">
                          {property.payment_plan_json.during_construction}%
                        </p>
                        <p className="text-sm text-muted-foreground">During Construction</p>
                      </div>
                    )}
                    {(property.payment_plan_json.on_handover ?? 0) > 0 && (
                      <div className="p-4 rounded-lg bg-muted/50 text-center">
                        <p className="text-2xl font-heading text-foreground">
                          {property.payment_plan_json.on_handover}%
                        </p>
                        <p className="text-sm text-muted-foreground">On Handover</p>
                      </div>
                    )}
                    {(property.payment_plan_json.post_handover ?? 0) > 0 && (
                      <div className="p-4 rounded-lg bg-muted/50 text-center">
                        <p className="text-2xl font-heading text-foreground">
                          {property.payment_plan_json.post_handover}%
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Post-Handover ({property.payment_plan_json.post_handover_years ?? 0} yrs)
                        </p>
                      </div>
                    )}
                  </div>
                  {property.completion_date && (
                    <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" /> 
                      Expected: {new Date(property.completion_date).toLocaleDateString('en-US', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Virtual Tour */}
              {property.virtual_tour_url && (
                <div className="p-6 rounded-xl bg-card border border-border">
                  <h2 className="font-heading text-xl text-foreground mb-4">Virtual Tour</h2>
                  <a 
                    href={property.virtual_tour_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-gold hover:underline"
                  >
                    <Eye className="w-4 h-4" />
                    View 360° Virtual Tour
                  </a>
                </div>
              )}

              <InlineROICalculator 
                purchasePrice={property.price_aed} 
                estimatedYield={property.rental_yield_estimate || 6} 
                sizeSquft={property.size_sqft}
                area={property.location_area || 'Dubai Marina'}
              />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Investment Score Card */}
              <InvestmentScoreBadge
                price={property.price_aed}
                sizeSqft={property.size_sqft}
                rentalYield={property.rental_yield_estimate || 0}
                area={property.location_area}
                isOffPlan={property.is_off_plan}
                developerName={property.developer?.name || property.developer_name}
                variant="card"
              />

              {/* Golden Visa Eligibility */}
              <GoldenVisaBadge
                priceAed={property.price_aed}
                variant="card"
              />

              {/* True Cost of Ownership */}
              <TrueCostCard
                priceAed={property.price_aed}
                sizeSqft={property.size_sqft}
                area={property.location_area}
                isOffPlan={property.is_off_plan}
              />

              {/* Neighborhood Deep-Dive */}
              <NeighborhoodWidget
                areaName={property.location_area}
                propertyPricePerSqft={pricePerSqft}
                propertyYield={rentalYield}
                propertyType={property.property_type || 'apartment'}
              />

              {/* Property Notes (Elite Only) */}
              <PropertyNotesCard propertyId={property.id} />

              {/* Investment Metrics */}
              <div className="p-6 rounded-xl bg-card border border-border">
                <h2 className="font-heading text-xl text-foreground mb-4">Investment Metrics</h2>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" /> Est. Rental Yield
                      </span>
                      <span className="font-heading text-xl text-emerald-400">
                        {rentalYield}%
                      </span>
                    </div>
                    {property.community?.avg_rental_yield != null && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Area avg: {property.community.avg_rental_yield}%
                      </p>
                    )}
                  </div>
                  
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <DollarSign className="w-4 h-4" /> Est. Monthly Rent
                      </span>
                      <span className="font-heading text-lg text-foreground">
                        AED {estimatedMonthlyRent.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-4 h-4" /> Est. Annual Rent
                      </span>
                      <span className="font-heading text-lg text-foreground">
                        AED {estimatedAnnualRent.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Maximize className="w-4 h-4" /> Price per sqft
                      </span>
                      <span className="font-heading text-lg text-foreground">
                        AED {pricePerSqft.toLocaleString()}
                      </span>
                    </div>
                    {property.community?.avg_price_per_sqft && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Area avg: AED {property.community.avg_price_per_sqft.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* AI Analysis Button */}
                <Button 
                  variant="gold" 
                  className="w-full mt-4" 
                  onClick={() => setShowAIAnalysis(true)}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Get AI Investment Analysis
                </Button>
              </div>

              {/* STR Yield Card */}
              <AirbnbYieldCard
                propertyPrice={property.price_aed}
                areaName={property.location_area}
                bedrooms={property.bedrooms ?? 0}
                propertyType={property.property_type || 'apartment'}
                ltrYield={rentalYield}
              />

              {/* Agent Contact Card */}
              {property.agent && (
                <AgentContactCard 
                  agent={property.agent} 
                  propertyTitle={property.title} 
                />
              )}

              <PropertyInquiryForm propertyTitle={property.title} propertyId={property.id} />
              
              <SimilarProperties 
                currentPropertyId={property.id} 
                locationArea={property.location_area} 
                priceAed={property.price_aed} 
                propertyType={property.property_type} 
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* AI Analysis Modal */}
      {property && (
        <PropertyAIAnalysis
          propertyId={property.id}
          propertyTitle={property.title}
          isOpen={showAIAnalysis}
          onClose={() => setShowAIAnalysis(false)}
        />
      )}
    </div>
  );
}
