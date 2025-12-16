import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { PropertyGridSkeleton } from '@/components/properties/PropertySkeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { useSavedProperties } from '@/hooks/useSavedProperties';
import { useAuth } from '@/hooks/useAuth';
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

export default function SavedProperties() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { savedPropertyIds, isLoading: savedLoading, toggleSave, isSaved } = useSavedProperties();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (savedPropertyIds.length > 0) {
      fetchSavedProperties();
    } else if (!savedLoading) {
      setProperties([]);
      setLoading(false);
    }
  }, [savedPropertyIds, savedLoading]);

  const fetchSavedProperties = async () => {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .in('id', savedPropertyIds);

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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-8 bg-gradient-to-b from-primary-dark to-background">
        <div className="container mx-auto px-4">
          <Link
            to="/properties"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Properties
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                <Heart className="w-6 h-6 text-red-500 fill-red-500" />
              </div>
              <div>
                <h1 className="font-heading text-3xl md:text-4xl text-foreground">
                  Saved Properties
                </h1>
                <p className="text-muted-foreground">
                  {properties.length} {properties.length === 1 ? 'property' : 'properties'} saved
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading || savedLoading ? (
            <PropertyGridSkeleton count={6} />
          ) : properties.length === 0 ? (
            <EmptyState
              icon={Heart}
              title="No saved properties yet"
              description="Save properties you're interested in to easily compare them later and track their details."
              action={{ label: 'Browse Properties', href: '/properties' }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property, index) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  index={index}
                  isSaved={isSaved(property.id)}
                  onToggleSave={() => toggleSave(property.id)}
                  isAuthenticated={!!user}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
