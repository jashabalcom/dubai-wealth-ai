import { motion } from 'framer-motion';
import { Building2, Calendar, Home, MapPin, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { DeveloperProject } from '@/hooks/useDevelopers';

interface ProjectCardProps {
  project: DeveloperProject;
  index?: number;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  completed: {
    label: 'Completed',
    className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  under_construction: {
    label: 'Under Construction',
    className: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  upcoming: {
    label: 'Upcoming',
    className: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  iconic: {
    label: 'Iconic',
    className: 'bg-gold/10 text-gold border-gold/20',
  },
};

export function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  const status = statusConfig[project.status || 'completed'] || statusConfig.completed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg hover:shadow-gold/5 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        {project.image_url ? (
          <img
            src={project.image_url}
            alt={project.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted to-background flex items-center justify-center">
            <Building2 className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <Badge variant="outline" className={status.className}>
            {status.label}
          </Badge>
        </div>

        {/* Flagship Badge */}
        {project.is_flagship && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-gold text-primary-foreground border-0">
              <Star className="h-3 w-3 mr-1 fill-current" />
              Flagship
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-foreground group-hover:text-gold transition-colors line-clamp-1">
          {project.name}
        </h3>

        {project.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {project.description}
          </p>
        )}

        {/* Details */}
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {project.location_area && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {project.location_area}
            </span>
          )}
          {project.completion_year && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {project.completion_year}
            </span>
          )}
          {project.total_units && (
            <span className="flex items-center gap-1">
              <Home className="h-3 w-3" />
              {project.total_units.toLocaleString()} Units
            </span>
          )}
        </div>

        {/* Highlights */}
        {project.highlights && project.highlights.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {project.highlights.slice(0, 3).map((highlight, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="text-[10px] px-2 py-0.5"
              >
                {highlight}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
