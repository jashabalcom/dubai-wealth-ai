import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Play, 
  MapPin, 
  Calendar, 
  Building2, 
  Home, 
  ArrowUpRight,
  Star,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ProjectWithDetails, ProjectImage } from '@/hooks/useProject';
import { formatCurrency } from '@/lib/utils';
import { AddToCalendarButton } from './AddToCalendarButton';

interface ProjectHeroProps {
  project: ProjectWithDetails;
  images: ProjectImage[];
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  completed: { label: 'Completed', variant: 'default' },
  under_construction: { label: 'Under Construction', variant: 'secondary' },
  upcoming: { label: 'Coming Soon', variant: 'outline' },
  iconic: { label: 'Iconic', variant: 'default' },
};

export function ProjectHero({ project, images }: ProjectHeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Use project images or fallback to main image
  const galleryImages = images.length > 0 
    ? images.map(img => img.url) 
    : project.image_url 
      ? [project.image_url] 
      : ['/placeholder.svg'];

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const statusInfo = statusConfig[project.status || 'upcoming'] || statusConfig.upcoming;
  const brandColor = project.developer?.brand_primary_color || '#C9A961';

  return (
    <div className="relative">
      {/* Hero Image Gallery */}
      <div className="relative h-[50vh] md:h-[60vh] lg:h-[70vh] overflow-hidden">
        <motion.img
          key={currentIndex}
          src={galleryImages[currentIndex]}
          alt={project.name}
          className="w-full h-full object-cover"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        />
        
        {/* Gradient Overlay */}
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to top, 
              hsl(220 40% 8% / 0.95) 0%, 
              hsl(220 40% 8% / 0.6) 40%, 
              transparent 70%)`
          }}
        />

        {/* Brand accent line */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{ backgroundColor: brandColor }}
        />

        {/* Navigation Arrows */}
        {galleryImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-secondary/80 backdrop-blur-sm text-secondary-foreground hover:bg-secondary transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-secondary/80 backdrop-blur-sm text-secondary-foreground hover:bg-secondary transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Image Counter */}
        {galleryImages.length > 1 && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2">
            {galleryImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentIndex 
                    ? 'w-8 bg-primary' 
                    : 'bg-secondary-foreground/50 hover:bg-secondary-foreground/70'
                }`}
                aria-label={`Go to image ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-4xl"
            >
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge 
                  variant={statusInfo.variant}
                  className="text-sm"
                >
                  {statusInfo.label}
                </Badge>
                {project.is_flagship && (
                  <Badge className="bg-primary text-primary-foreground gap-1">
                    <Star className="h-3 w-3" />
                    Flagship
                  </Badge>
                )}
                {project.project_type && (
                  <Badge variant="outline" className="text-secondary-foreground border-secondary-foreground/30">
                    {project.project_type}
                  </Badge>
                )}
              </div>

              {/* Developer Link */}
              {project.developer && (
                <Link 
                  to={`/developers/${project.developer.slug}`}
                  className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors mb-3"
                >
                  {project.developer.logo_url ? (
                    <img 
                      src={project.developer.logo_url} 
                      alt={project.developer.name}
                      className="h-6 w-auto"
                    />
                  ) : (
                    <Building2 className="h-4 w-4" />
                  )}
                  <span className="font-medium">{project.developer.name}</span>
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              )}

              {/* Project Name */}
              <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl text-secondary-foreground font-bold mb-4">
                {project.name}
              </h1>

              {/* Quick Info */}
              <div className="flex flex-wrap items-center gap-4 md:gap-6 text-secondary-foreground/80 mb-6">
                {project.location_area && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{project.location_area}</span>
                  </div>
                )}
                {project.completion_year && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>Completion {project.completion_year}</span>
                  </div>
                )}
                {project.total_units && (
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-primary" />
                    <span>{project.total_units.toLocaleString()} Units</span>
                  </div>
                )}
              </div>

              {/* Price & CTA */}
              <div className="flex flex-wrap items-center gap-4">
                {project.starting_price && (
                  <div className="glass-dark px-5 py-3 rounded-lg">
                    <span className="text-secondary-foreground/60 text-sm">Starting from</span>
                    <div className="text-2xl font-bold text-primary font-mono">
                      {formatCurrency(project.starting_price)}
                    </div>
                  </div>
                )}

                <AddToCalendarButton project={project} variant="hero" />

                {project.video_url && (
                  <Button 
                    variant="outline" 
                    className="border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/10"
                    asChild
                  >
                    <a href={project.video_url} target="_blank" rel="noopener noreferrer">
                      <Play className="h-4 w-4 mr-2" />
                      Watch Video
                    </a>
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
