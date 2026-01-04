import { useState, useMemo, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Sparkles, MapPin, Calendar, TrendingUp } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SEOHead } from '@/components/SEOHead';
import { BreadcrumbNav } from '@/components/seo/BreadcrumbNav';
import { ProjectsFilters, projectPriceRanges } from '@/components/projects/ProjectsFilters';
import { ProjectDiscoveryCard } from '@/components/projects/ProjectDiscoveryCard';
import { ProjectQuickViewModal } from '@/components/projects/ProjectQuickViewModal';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  useProjects, 
  useProjectAreas, 
  useProjectDevelopers, 
  useProjectHandoverYears,
  type ProjectWithDeveloper 
} from '@/hooks/useProjects';
import { generateBreadcrumbSchema, generateFAQSchema, SITE_CONFIG } from '@/lib/seo-config';

const FAQ_ITEMS = [
  {
    question: "What is off-plan property in Dubai?",
    answer: "Off-plan property refers to real estate purchased before or during construction. Buyers pay in installments according to a payment plan (e.g., 40/60 or 20/80), often at lower prices than ready properties. Handover occurs once construction is complete."
  },
  {
    question: "Is buying off-plan safe in Dubai?",
    answer: "Dubai has strong regulations for off-plan purchases. Developers must register with RERA and funds are held in escrow accounts. Look for projects by established developers with strong delivery track records. Always verify the project is RERA-registered."
  },
  {
    question: "What are the benefits of buying off-plan in Dubai?",
    answer: "Benefits include: lower purchase prices (10-30% below ready), flexible payment plans, modern designs and amenities, potential capital appreciation during construction, and ability to customize interiors. Many projects also qualify for Golden Visa."
  },
  {
    question: "Can I sell my off-plan property before handover?",
    answer: "Yes, most developers allow assignment (resale) after a certain payment threshold (typically 30-40%). You can profit from capital appreciation during construction. Some restrictions may apply during the first year of purchase."
  },
];

export default function OffPlanIndex() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [quickViewProject, setQuickViewProject] = useState<ProjectWithDeveloper | null>(null);
  
  // State from URL params
  const searchQuery = searchParams.get('q') || '';
  const selectedArea = searchParams.get('area') || 'All Areas';
  const selectedBedrooms = searchParams.get('beds') || 'all';
  const selectedPrice = searchParams.get('price') || 'all';
  const selectedStatus = searchParams.get('status') || 'all';
  const selectedDevelopersParam = searchParams.get('developers') || '';
  const selectedDevelopers = selectedDevelopersParam ? selectedDevelopersParam.split(',') : [];
  const selectedHandoverYear = searchParams.get('handover') || 'all';
  const sortBy = searchParams.get('sort') || 'featured';
  const viewMode = (searchParams.get('view') as 'grid' | 'map') || 'grid';

  const updateParams = useCallback((updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '' || value === 'all' || value === 'All Areas') {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  const priceRange = projectPriceRanges.find(r => r.value === selectedPrice);

  const { data: areasData } = useProjectAreas();
  const { data: developersData } = useProjectDevelopers();
  const { data: handoverYearsData } = useProjectHandoverYears();

  const {
    data: projectsData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useProjects({
    search: searchQuery,
    area: selectedArea,
    priceMin: priceRange?.min,
    priceMax: priceRange?.max,
    bedrooms: selectedBedrooms,
    status: selectedStatus,
    developerId: selectedDevelopers.length === 1 ? selectedDevelopers[0] : undefined,
    handoverYear: selectedHandoverYear !== 'all' ? parseInt(selectedHandoverYear) : undefined,
    sortBy,
  });

  const allProjects = useMemo(() => {
    return projectsData?.pages.flatMap(page => page.projects) || [];
  }, [projectsData]);

  const filteredProjects = useMemo(() => {
    if (selectedDevelopers.length <= 1) return allProjects;
    return allProjects.filter(p => selectedDevelopers.includes(p.developer_id));
  }, [allProjects, selectedDevelopers]);

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  // Top developers for internal linking
  const topDevelopers = useMemo(() => {
    if (!developersData) return [];
    return developersData.slice(0, 8);
  }, [developersData]);

  const breadcrumbs = [{ label: 'Off-Plan Projects' }];

  return (
    <>
      <SEOHead
        title="Dubai Off-Plan Projects 2025 — New Developments & Payment Plans"
        description={`Browse ${filteredProjects.length}+ off-plan projects in Dubai from top developers. Compare payment plans, handover dates, and investment potential. Expert analysis included.`}
        keywords={[
          'Dubai off-plan projects',
          'off-plan Dubai',
          'new developments Dubai',
          'Dubai property payment plans',
          'buy off-plan Dubai',
          'Emaar projects',
          'DAMAC projects',
          'Dubai off-plan investment',
        ]}
        canonical={`${SITE_CONFIG.url}/off-plan`}
        structuredData={[
          generateBreadcrumbSchema([
            { name: 'Home', url: SITE_CONFIG.url },
            { name: 'Off-Plan Projects', url: `${SITE_CONFIG.url}/off-plan` },
          ]),
          generateFAQSchema(FAQ_ITEMS),
        ]}
      />

      <Navbar />

      <main className="min-h-screen bg-background pt-20">
        {/* Hero Section */}
        <section className="relative py-12 md:py-16 bg-gradient-hero overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold/20 via-transparent to-transparent" />
          </div>
          
          <div className="container-luxury relative">
            <BreadcrumbNav items={breadcrumbs} className="mb-6" />
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 rounded-full border border-gold/20 mb-6">
                <Sparkles className="h-4 w-4 text-gold" />
                <span className="text-sm text-gold font-medium">
                  {filteredProjects.length} Projects Available
                </span>
              </div>
              
              <h1 className="text-secondary-foreground mb-4">
                Dubai <span className="text-gold">Off-Plan Projects</span>
              </h1>
              
              <p className="text-secondary-foreground/70 text-lg mb-6">
                Discover Dubai's most prestigious new developments from world-renowned developers.
                Compare payment plans, view virtual tours, and find your perfect investment.
              </p>

              <Link to="/off-plan/payment-plans">
                <Button variant="outline" className="border-gold/30 text-gold hover:bg-gold/10">
                  <Calendar className="w-4 h-4 mr-2" />
                  Payment Plans Guide
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Developer Quick Links */}
        <section className="py-4 border-b border-border bg-card/50">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center gap-2 justify-center">
              <span className="text-sm text-muted-foreground mr-2">Top Developers:</span>
              {topDevelopers.map((dev) => (
                <Link
                  key={dev.id}
                  to={`/off-plan/${dev.slug || dev.id}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <Building2 className="w-3 h-3" />
                  {dev.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Filters Section */}
        <section className="py-6 border-b border-border sticky top-16 md:top-20 bg-background/95 backdrop-blur-sm z-30">
          <div className="container-luxury">
            <ProjectsFilters
              searchQuery={searchQuery}
              onSearchChange={(value) => updateParams({ q: value })}
              selectedArea={selectedArea}
              onAreaChange={(value) => updateParams({ area: value })}
              selectedBedrooms={selectedBedrooms}
              onBedroomsChange={(value) => updateParams({ beds: value })}
              selectedPrice={selectedPrice}
              onPriceChange={(value) => updateParams({ price: value })}
              selectedStatus={selectedStatus}
              onStatusChange={(value) => updateParams({ status: value })}
              selectedDevelopers={selectedDevelopers}
              onDevelopersChange={(value) => updateParams({ developers: value.length > 0 ? value.join(',') : null })}
              selectedHandoverYear={selectedHandoverYear}
              onHandoverYearChange={(value) => updateParams({ handover: value })}
              sortBy={sortBy}
              onSortChange={(value) => updateParams({ sort: value })}
              onClearFilters={clearFilters}
              resultCount={filteredProjects.length}
              viewMode={viewMode}
              onViewModeChange={(mode) => updateParams({ view: mode })}
              areas={areasData || ['All Areas']}
              developers={developersData || []}
              handoverYears={handoverYearsData || []}
            />
          </div>
        </section>

        {/* Content Section */}
        <section className="py-8">
          <div className="container-luxury">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <ProjectCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredProjects.length === 0 ? (
              <EmptyState onClear={clearFilters} />
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.map((project, index) => (
                    <ProjectDiscoveryCard
                      key={project.id}
                      project={project}
                      index={index}
                      onQuickView={setQuickViewProject}
                    />
                  ))}
                </div>

                {hasNextPage && (
                  <div className="flex justify-center mt-8">
                    <Button
                      variant="outline"
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                    >
                      {isFetchingNextPage ? 'Loading...' : 'Load More Projects'}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="font-heading text-3xl text-foreground mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="max-w-3xl mx-auto space-y-6">
              {FAQ_ITEMS.map((faq, index) => (
                <div key={index} className="bg-card rounded-xl p-6 border border-border">
                  <h3 className="font-semibold text-foreground mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Internal Links */}
        <section className="py-12 border-t border-border">
          <div className="container mx-auto px-4">
            <h2 className="font-heading text-2xl text-foreground mb-6">Explore More</h2>
            <div className="flex flex-wrap gap-4">
              <Link to="/off-plan/payment-plans" className="inline-flex items-center gap-2 text-primary hover:underline">
                <Calendar className="w-4 h-4" />
                Payment Plans Guide
              </Link>
              <Link to="/golden-visa" className="inline-flex items-center gap-2 text-primary hover:underline">
                <TrendingUp className="w-4 h-4" />
                Golden Visa Properties
              </Link>
              <Link to="/invest" className="inline-flex items-center gap-2 text-primary hover:underline">
                <TrendingUp className="w-4 h-4" />
                Investment Guide
              </Link>
              <Link to="/for-sale" className="inline-flex items-center gap-2 text-primary hover:underline">
                <Building2 className="w-4 h-4" />
                Ready Properties
              </Link>
            </div>
          </div>
        </section>

        <ProjectQuickViewModal
          project={quickViewProject}
          open={!!quickViewProject}
          onOpenChange={(open) => !open && setQuickViewProject(null)}
        />
      </main>

      <Footer />
    </>
  );
}

function ProjectCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <Skeleton className="h-52 w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
        <Building2 className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No projects found</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        Try adjusting your filters or search criteria to find more projects.
      </p>
      <Button onClick={onClear} variant="outline">
        Clear All Filters
      </Button>
    </div>
  );
}
