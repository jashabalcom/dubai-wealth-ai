import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Calendar, 
  MapPin, 
  Star, 
  Eye, 
  Home,
  Video,
  TrendingUp
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ProjectWithDeveloper } from '@/hooks/useProjects';
import { formatCurrency } from '@/lib/format';

interface ProjectDiscoveryCardProps {
  project: ProjectWithDeveloper;
  index?: number;
  onQuickView?: (project: ProjectWithDeveloper) => void;
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

export function ProjectDiscoveryCard({ project, index = 0, onQuickView }: ProjectDiscoveryCardProps) {
  const status = statusConfig[project.status || 'completed'] || statusConfig.completed;

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(project);
  };

  return (
    <Link to={`/projects/${project.slug}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg hover:shadow-gold/5 transition-all duration-300 cursor-pointer h-full flex flex-col"
      >
        {/* Image */}
        <div className="relative h-52 overflow-hidden">
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
          <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-card/20 to-transparent" />

          {/* Developer Logo */}
          {project.developer?.logo_url && (
            <div className="absolute top-3 left-3">
              <div className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm p-1 shadow-sm">
                <img 
                  src={project.developer.logo_url} 
                  alt={project.developer.name}
                  className="h-full w-full object-contain rounded-full"
                />
              </div>
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <Badge variant="outline" className={status.className}>
              {status.label}
            </Badge>
          </div>

          {/* Flagship Badge */}
          {project.is_flagship && (
            <div className="absolute bottom-3 left-3">
              <Badge className="bg-gold text-primary-foreground border-0">
                <Star className="h-3 w-3 mr-1 fill-current" />
                Flagship
              </Badge>
            </div>
          )}

          {/* Virtual Tour Badge */}
          {project.virtual_tour_url && (
            <div className="absolute bottom-3 right-3">
              <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                <Video className="h-3 w-3 mr-1" />
                Virtual Tour
              </Badge>
            </div>
          )}

          {/* Quick View Button - appears on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
            <Button
              size="sm"
              variant="secondary"
              className="gap-1.5 bg-background/95 backdrop-blur-sm hover:bg-background"
              onClick={handleQuickView}
            >
              <Eye className="h-4 w-4" />
              Quick View
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 flex-1 flex flex-col">
          {/* Developer Name */}
          {project.developer && (
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              {project.developer.name}
            </span>
          )}

          <h3 className="font-semibold text-foreground group-hover:text-gold transition-colors line-clamp-1">
            {project.name}
          </h3>

          {project.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
              {project.description}
            </p>
          )}

          {/* Price */}
          {project.starting_price && (
            <div className="flex items-center gap-1 text-gold font-semibold">
              <TrendingUp className="h-4 w-4" />
              <span>From {formatCurrency(project.starting_price)}</span>
            </div>
          )}

          {/* Details */}
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-2 border-t border-border">
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

          {/* Construction Progress */}
          {project.status === 'under_construction' && project.construction_progress_percent && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Construction Progress</span>
                <span className="text-amber-400 font-medium">{project.construction_progress_percent}%</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-400 rounded-full transition-all"
                  style={{ width: `${project.construction_progress_percent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
