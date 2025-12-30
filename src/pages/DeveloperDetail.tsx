import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { ScrollToTopButton } from '@/components/ui/scroll-to-top-button';
import { Skeleton } from '@/components/ui/skeleton';
import { DeveloperHero } from '@/components/developers/DeveloperHero';
import { DeveloperStats } from '@/components/developers/DeveloperStats';
import { ProjectPortfolio } from '@/components/developers/ProjectPortfolio';
import { useDeveloper, usePropertiesByDeveloper } from '@/hooks/useDevelopers';
import { SEOHead } from '@/components/SEOHead';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function DeveloperDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: developer, isLoading, error } = useDeveloper(slug || '');
  const { data: properties } = usePropertiesByDeveloper(developer?.id || '');

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background">
          <Skeleton className="h-96 w-full" />
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-10 w-1/2" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
              <div className="space-y-6">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !developer) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <Building2 className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Developer Not Found
            </h1>
            <p className="text-muted-foreground mb-6">
              The developer you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link to="/developers">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Directory
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
        title={`${developer.name} | Dubai Developer Directory`}
        description={developer.description || `Explore ${developer.name}'s project portfolio and track record in Dubai real estate.`}
        keywords={[developer.name, 'dubai developer', 'real estate projects', developer.specialty || ''].filter(Boolean)}
      />

      <Navbar />

      <div className="min-h-screen bg-background">
        {/* Breadcrumb Navigation */}
        <div className="container mx-auto px-4 py-4">
          <Breadcrumbs
            items={[
              { label: 'Developers', href: '/developers' },
              { label: developer.name }
            ]}
          />
        </div>

        {/* Hero */}
        <DeveloperHero developer={developer} />

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - About & Projects */}
            <div className="lg:col-span-2 space-y-12">
              {/* About Section */}
              {developer.description && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <h2 className="font-serif text-2xl font-bold text-foreground mb-4">
                    About {developer.name}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {developer.description}
                  </p>
                </motion.section>
              )}

              {/* Project Portfolio */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <h2 className="font-serif text-2xl font-bold text-foreground mb-6">
                  Project Portfolio
                </h2>
                <ProjectPortfolio developerId={developer.id} />
              </motion.section>

              {/* Available Properties */}
              {properties && properties.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-serif text-2xl font-bold text-foreground">
                      Available Listings
                    </h2>
                    <Button variant="outline" asChild>
                      <Link to={`/properties?developer=${developer.id}`}>
                        View All
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {properties.slice(0, 4).map((property) => (
                      <PropertyCard key={property.id} property={property as any} />
                    ))}
                  </div>
                </motion.section>
              )}
            </div>

            {/* Right Column - Stats Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <DeveloperStats developer={developer} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <ScrollToTopButton />
      <Footer />
    </>
  );
}
