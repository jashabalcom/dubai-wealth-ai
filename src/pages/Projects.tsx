import { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Building2, Sparkles } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProjectsFilters, projectPriceRanges } from '@/components/projects/ProjectsFilters';
import { ProjectDiscoveryCard } from '@/components/projects/ProjectDiscoveryCard';
import { ProjectQuickViewModal } from '@/components/projects/ProjectQuickViewModal';
import { ProjectStatusTabs } from '@/components/projects/ProjectStatusTabs';
import { ProjectsMap } from '@/components/projects/ProjectsMap';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { 
  useProjects, 
  useProjectAreas, 
  useProjectDevelopers, 
  useProjectHandoverYears,
  type ProjectWithDeveloper 
} from '@/hooks/useProjects';

export default function Projects() {
  const [searchParams, setSearchParams] = useSearchParams();
  
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

  const [quickViewProject, setQuickViewProject] = useState<ProjectWithDeveloper | null>(null);

  // Update URL params helper
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

  // Get price range values
  const priceRange = projectPriceRanges.find(r => r.value === selectedPrice);

  // Fetch data
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

  // Flatten paginated results
  const allProjects = useMemo(() => {
    return projectsData?.pages.flatMap(page => page.projects) || [];
  }, [projectsData]);

  // Filter by multiple developers on client side if more than one selected
  const filteredProjects = useMemo(() => {
    if (selectedDevelopers.length <= 1) return allProjects;
    return allProjects.filter(p => selectedDevelopers.includes(p.developer_id));
  }, [allProjects, selectedDevelopers]);

  // Calculate status counts for tabs
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allProjects.forEach(p => {
      const status = p.status || 'completed';
      counts[status] = (counts[status] || 0) + 1;
    });
    return counts;
  }, [allProjects]);

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <>
      <Helmet>
        <title>Off-Plan Projects | Dubai Wealth Hub</title>
        <meta 
          name="description" 
          content="Explore Dubai's premier off-plan developments. Browse projects from top developers with virtual tours, floor plans, and payment plans."
        />
      </Helmet>

      <Navbar />

      <main className="min-h-screen bg-background pt-20">
        {/* Hero Section */}
        <section className="relative py-12 md:py-16 bg-gradient-hero overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold/20 via-transparent to-transparent" />
          </div>
          
          <div className="container-luxury relative">
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
                Discover Premium <span className="text-gold">Projects</span>
              </h1>
              
              <p className="text-secondary-foreground/70 text-lg">
                Explore Dubai's most prestigious developments from world-renowned developers.
                Compare projects, view virtual tours, and find your perfect investment.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Filters Section */}
        <section className="py-6 border-b border-border sticky top-16 md:top-20 bg-background/95 backdrop-blur-sm z-30">
          <div className="container-luxury">
            {/* Status Tabs */}
            <div className="mb-4">
              <ProjectStatusTabs
                selectedStatus={selectedStatus}
                onStatusChange={(status) => updateParams({ status })}
                counts={statusCounts}
              />
            </div>

            {/* Filters */}
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
            ) : viewMode === 'map' ? (
              <ProjectsMap
                projects={filteredProjects}
                onProjectClick={setQuickViewProject}
                className="h-[600px]"
              />
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

                {/* Load More */}
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

        {/* Quick View Modal */}
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
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
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
