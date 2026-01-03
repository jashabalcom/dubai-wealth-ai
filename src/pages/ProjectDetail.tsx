import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { ArrowLeft, Building2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProject, useProjectImages, useProjectFloorPlans, useProjectAmenities, useProjectUnitTypes, useProjectPaymentPlans } from "@/hooks/useProject";
import { useDeveloper } from "@/hooks/useDevelopers";
import { ProjectHero } from "@/components/projects/ProjectHero";
import { ProjectSidebar } from "@/components/projects/ProjectSidebar";
import { ProjectUnitTypes } from "@/components/projects/ProjectUnitTypes";
import { ProjectAmenities } from "@/components/projects/ProjectAmenities";
import { ProjectPaymentPlans } from "@/components/projects/ProjectPaymentPlans";
import { ProjectFloorPlans } from "@/components/projects/ProjectFloorPlans";
import { ProjectMediaSection } from "@/components/projects/ProjectMediaSection";
import { ConstructionTimeline } from "@/components/projects/ConstructionTimeline";
const ProjectDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: project, isLoading: projectLoading } = useProject(slug || '');
  const { data: developer } = useDeveloper(project?.developer_id || '');
  const { data: images = [] } = useProjectImages(project?.id || '');
  const { data: floorPlans = [] } = useProjectFloorPlans(project?.id || '');
  const { data: amenities = [] } = useProjectAmenities(project?.id || '');
  const { data: unitTypes = [] } = useProjectUnitTypes(project?.id || '');
  const { data: paymentPlans = [] } = useProjectPaymentPlans(project?.id || '');

  if (projectLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Skeleton className="h-[70vh] w-full" />
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-32 w-full" />
            </div>
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Building2 className="h-16 w-16 text-muted-foreground mx-auto" />
          <h1 className="text-2xl font-bold">Project Not Found</h1>
          <p className="text-muted-foreground">The project you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/developers">Browse Developers</Link>
          </Button>
        </div>
      </div>
    );
  }

  const brandColor = (developer as any)?.brand_primary_color || undefined;

  return (
    <>
      <Helmet>
        <title>{project.name} by {developer?.name || 'Developer'} | Dubai REI</title>
        <meta name="description" content={project.description || `Explore ${project.name} - a premium development in ${project.location_area}`} />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Back Navigation */}
        <div className="absolute top-4 left-4 z-50">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="bg-background/80 backdrop-blur-sm hover:bg-background/90"
          >
            <Link to={developer ? `/developers/${developer.slug}` : '/developers'}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to {developer?.name || 'Developers'}
            </Link>
          </Button>
        </div>

        {/* Hero Section */}
        <ProjectHero
          project={project}
          images={images}
        />

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Area */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent mb-8 flex-wrap">
                  <TabsTrigger
                    value="overview"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
                  >
                    Overview
                  </TabsTrigger>
                  {unitTypes.length > 0 && (
                    <TabsTrigger
                      value="units"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
                    >
                      Unit Types
                    </TabsTrigger>
                  )}
                  {floorPlans.length > 0 && (
                    <TabsTrigger
                      value="floorplans"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
                    >
                      Floor Plans
                    </TabsTrigger>
                  )}
                  {amenities.length > 0 && (
                    <TabsTrigger
                      value="amenities"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
                    >
                      Amenities
                    </TabsTrigger>
                  )}
                  {paymentPlans.length > 0 && (
                    <TabsTrigger
                      value="payment"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
                    >
                      Payment Plans
                    </TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="overview" className="mt-0">
                  <div className="space-y-8">
                    {/* Description */}
                    <div className="prose prose-lg dark:prose-invert max-w-none">
                      <h2 className="text-2xl font-semibold mb-4">About {project.name}</h2>
                      <p className="text-muted-foreground leading-relaxed">
                        {project.description || `${project.name} is a prestigious development located in ${project.location_area}, offering exceptional living spaces with world-class amenities.`}
                      </p>
                    </div>

                    {/* Media Section - Video & Virtual Tour */}
                    <ProjectMediaSection
                      videoUrl={project.video_url}
                      virtualTourUrl={project.virtual_tour_url}
                      projectName={project.name}
                      thumbnailUrl={project.image_url || undefined}
                      brandColor={brandColor}
                    />

                    {/* Construction Timeline for Under Construction Projects */}
                    {project.status === 'under_construction' && (
                      <ConstructionTimeline
                        status={project.status}
                        launchDate={project.launch_date}
                        handoverDate={project.handover_date}
                        progressPercent={project.construction_progress_percent}
                        brandColor={brandColor}
                      />
                    )}

                    {/* Key Features */}
                    {project.key_features && Array.isArray(project.key_features) && project.key_features.length > 0 && (
                      <div>
                        <h3 className="text-xl font-semibold mb-4">Key Features</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {(project.key_features as string[]).map((feature, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-center gap-3 p-4 rounded-lg bg-muted/50"
                            >
                              <div
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: brandColor || 'hsl(var(--primary))' }}
                              />
                              <span>{feature}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Location Map Placeholder */}
                    {(project.latitude && project.longitude) && (
                      <div>
                        <h3 className="text-xl font-semibold mb-4">Location</h3>
                        <div className="aspect-video rounded-xl bg-muted flex items-center justify-center border">
                          <p className="text-muted-foreground">Interactive map coming soon</p>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="units" className="mt-0">
                  <ProjectUnitTypes unitTypes={unitTypes} brandColor={brandColor} />
                </TabsContent>

                <TabsContent value="floorplans" className="mt-0">
                  <ProjectFloorPlans floorPlans={floorPlans} />
                </TabsContent>

                <TabsContent value="amenities" className="mt-0">
                  <ProjectAmenities amenities={amenities} brandColor={brandColor} />
                </TabsContent>

                <TabsContent value="payment" className="mt-0">
                  <ProjectPaymentPlans paymentPlans={paymentPlans} brandColor={brandColor} />
                </TabsContent>
              </Tabs>
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-1"
            >
              <ProjectSidebar project={project} />
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectDetail;
