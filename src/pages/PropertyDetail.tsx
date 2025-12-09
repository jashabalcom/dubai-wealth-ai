import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Bed, Bath, Maximize, TrendingUp, Calendar, Building2, CheckCircle2, Heart, Share2, Plus, Home, DollarSign, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSavedProperties } from '@/hooks/useSavedProperties';
import { PropertyGallery } from '@/components/properties/PropertyGallery';
import { SimilarProperties } from '@/components/properties/SimilarProperties';
import { PropertyInquiryForm } from '@/components/properties/PropertyInquiryForm';
import { InlineROICalculator } from '@/components/properties/InlineROICalculator';
import { PropertyAIAnalysis } from '@/components/properties/PropertyAIAnalysis';
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
  completion_date: string | null;
  payment_plan_json: { down_payment: number; during_construction: number; on_handover: number; post_handover: number; post_handover_years: number; } | null;
  description: string;
  amenities: string[];
  highlights: string[];
  is_featured: boolean;
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
    const { data, error } = await supabase.from('properties').select('*').eq('slug', slug).maybeSingle();
    if (error || !data) { navigate('/properties'); return; }
    setProperty({
      ...data,
      images: Array.isArray(data.images) ? (data.images as string[]) : [],
      amenities: Array.isArray(data.amenities) ? (data.amenities as string[]) : [],
      highlights: Array.isArray(data.highlights) ? (data.highlights as string[]) : [],
      payment_plan_json: data.payment_plan_json as Property['payment_plan_json'],
      price_aed: Number(data.price_aed),
      size_sqft: Number(data.size_sqft),
      rental_yield_estimate: Number(data.rental_yield_estimate),
    });
    setLoading(false);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: property?.title, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: 'Link copied!' });
    }
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>;
  if (!property) return null;

  const pricePerSqft = Math.round(property.price_aed / property.size_sqft);
  const estimatedMonthlyRent = Math.round((property.price_aed * (property.rental_yield_estimate / 100)) / 12);
  const estimatedAnnualRent = estimatedMonthlyRent * 12;
  const propertyIsSaved = isSaved(property.id);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-20">
        <PropertyGallery images={property.images} title={property.title} />
        <div className="absolute top-24 left-4 flex flex-wrap gap-2 z-10">
          {property.is_off_plan && <span className="px-3 py-1 bg-blue-500 text-white text-sm font-medium rounded-full">Off-Plan</span>}
          {property.is_featured && <span className="px-3 py-1 bg-gold text-primary-dark text-sm font-medium rounded-full">Featured</span>}
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <Link to="/properties" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Properties
            </Link>
            <div className="flex gap-2">
              {user && (
                <Button variant="outline" size="sm" onClick={() => toggleSave(property.id)}>
                  <Heart className={cn("w-4 h-4 mr-2", propertyIsSaved && "fill-red-500 text-red-500")} />
                  {propertyIsSaved ? 'Saved' : 'Save'}
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" /> Share
              </Button>
              {user && profile?.membership_tier === 'elite' && (
                <Link to="/portfolio">
                  <Button variant="gold" size="sm"><Plus className="w-4 h-4 mr-2" /> Add to Portfolio</Button>
                </Link>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <MapPin className="w-4 h-4" /> {property.location_area} {property.developer_name && <span>• {property.developer_name}</span>}
                </div>
                <h1 className="font-heading text-3xl md:text-4xl text-foreground mb-4">{property.title}</h1>
                <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-4">
                  <span className="flex items-center gap-2"><Bed className="w-5 h-5" /> {property.bedrooms === 0 ? 'Studio' : `${property.bedrooms} Bedrooms`}</span>
                  <span className="flex items-center gap-2"><Bath className="w-5 h-5" /> {property.bathrooms} Bathrooms</span>
                  <span className="flex items-center gap-2"><Maximize className="w-5 h-5" /> {property.size_sqft.toLocaleString()} sqft</span>
                  <span className="flex items-center gap-2"><Home className="w-5 h-5" /> {property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1)}</span>
                </div>
                <p className="font-heading text-3xl text-gold">{formatPrice(property.price_aed)}</p>
              </motion.div>

              {property.highlights.length > 0 && (
                <div className="p-6 rounded-xl bg-card border border-border">
                  <h2 className="font-heading text-xl text-foreground mb-4">Key Highlights</h2>
                  <div className="flex flex-wrap gap-2">{property.highlights.map((h, i) => <span key={i} className="px-3 py-1 bg-gold/10 text-gold border border-gold/20 text-sm rounded-full">{h}</span>)}</div>
                </div>
              )}

              {property.description && (
                <div className="p-6 rounded-xl bg-card border border-border">
                  <h2 className="font-heading text-xl text-foreground mb-4">Description</h2>
                  <p className="text-muted-foreground leading-relaxed">{property.description}</p>
                </div>
              )}

              {property.is_off_plan && property.payment_plan_json && (
                <div className="p-6 rounded-xl bg-card border border-border">
                  <h2 className="font-heading text-xl text-foreground mb-4">Payment Plan</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-muted/50 text-center"><p className="text-2xl font-heading text-gold">{property.payment_plan_json.down_payment}%</p><p className="text-sm text-muted-foreground">Down Payment</p></div>
                    <div className="p-4 rounded-lg bg-muted/50 text-center"><p className="text-2xl font-heading text-foreground">{property.payment_plan_json.during_construction}%</p><p className="text-sm text-muted-foreground">During Construction</p></div>
                    <div className="p-4 rounded-lg bg-muted/50 text-center"><p className="text-2xl font-heading text-foreground">{property.payment_plan_json.on_handover}%</p><p className="text-sm text-muted-foreground">On Handover</p></div>
                    {property.payment_plan_json.post_handover > 0 && <div className="p-4 rounded-lg bg-muted/50 text-center"><p className="text-2xl font-heading text-foreground">{property.payment_plan_json.post_handover}%</p><p className="text-sm text-muted-foreground">Post-Handover ({property.payment_plan_json.post_handover_years} yrs)</p></div>}
                  </div>
                  {property.completion_date && <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-muted-foreground"><Calendar className="w-4 h-4" /> Expected: {new Date(property.completion_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>}
                </div>
              )}

              {property.amenities.length > 0 && (
                <div className="p-6 rounded-xl bg-card border border-border">
                  <h2 className="font-heading text-xl text-foreground mb-4">Amenities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">{property.amenities.map((a, i) => <div key={i} className="flex items-center gap-2 text-muted-foreground"><CheckCircle2 className="w-4 h-4 text-gold" />{a}</div>)}</div>
                </div>
              )}

              <InlineROICalculator purchasePrice={property.price_aed} estimatedYield={property.rental_yield_estimate} sizeSquft={property.size_sqft} />
            </div>

            <div className="space-y-6">
              <div className="p-6 rounded-xl bg-card border border-border sticky top-32">
                <h2 className="font-heading text-xl text-foreground mb-4">Investment Metrics</h2>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20"><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground flex items-center gap-1"><TrendingUp className="w-4 h-4" /> Est. Rental Yield</span><span className="font-heading text-xl text-emerald-400">{property.rental_yield_estimate}%</span></div></div>
                  <div className="p-4 rounded-lg bg-muted/50"><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground flex items-center gap-1"><DollarSign className="w-4 h-4" /> Est. Monthly Rent</span><span className="font-heading text-lg text-foreground">AED {estimatedMonthlyRent.toLocaleString()}</span></div></div>
                  <div className="p-4 rounded-lg bg-muted/50"><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground flex items-center gap-1"><Calendar className="w-4 h-4" /> Est. Annual Rent</span><span className="font-heading text-lg text-foreground">AED {estimatedAnnualRent.toLocaleString()}</span></div></div>
                  <div className="p-4 rounded-lg bg-muted/50"><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground flex items-center gap-1"><Maximize className="w-4 h-4" /> Price per sqft</span><span className="font-heading text-lg text-foreground">AED {pricePerSqft.toLocaleString()}</span></div></div>
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

              <PropertyInquiryForm propertyTitle={property.title} propertyId={property.id} />
              <SimilarProperties currentPropertyId={property.id} locationArea={property.location_area} priceAed={property.price_aed} propertyType={property.property_type} />
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
