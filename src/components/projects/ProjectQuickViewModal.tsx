import { Link } from 'react-router-dom';
import { 
  X, 
  MapPin, 
  Calendar, 
  Home, 
  Building2, 
  ExternalLink,
  Video,
  FileText,
  ArrowRight,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { ProjectWithDeveloper } from '@/hooks/useProjects';
import { formatCurrency } from '@/lib/format';

interface ProjectQuickViewModalProps {
  project: ProjectWithDeveloper | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export function ProjectQuickViewModal({ project, open, onOpenChange }: ProjectQuickViewModalProps) {
  if (!project) return null;

  const status = statusConfig[project.status || 'completed'] || statusConfig.completed;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        {/* Hero Image */}
        <div className="relative h-64 overflow-hidden">
          {project.image_url ? (
            <img
              src={project.image_url}
              alt={project.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-muted to-background flex items-center justify-center">
              <Building2 className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          
          {/* Status Badge */}
          <div className="absolute top-4 right-4">
            <Badge variant="outline" className={status.className}>
              {status.label}
            </Badge>
          </div>

          {/* Flagship Badge */}
          {project.is_flagship && (
            <div className="absolute top-4 left-4">
              <Badge className="bg-gold text-primary-foreground border-0">
                <Star className="h-3 w-3 mr-1 fill-current" />
                Flagship
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Header */}
          <div>
            {project.developer && (
              <div className="flex items-center gap-2 mb-2">
                {project.developer.logo_url && (
                  <img 
                    src={project.developer.logo_url} 
                    alt={project.developer.name}
                    className="h-6 w-6 rounded-full object-contain bg-white"
                  />
                )}
                <span className="text-sm text-muted-foreground">{project.developer.name}</span>
              </div>
            )}
            <DialogHeader>
              <DialogTitle className="text-2xl">{project.name}</DialogTitle>
            </DialogHeader>
            {project.location_area && (
              <div className="flex items-center gap-1 text-muted-foreground mt-1">
                <MapPin className="h-4 w-4" />
                <span>{project.location_area}</span>
              </div>
            )}
          </div>

          {/* Price */}
          {project.starting_price && (
            <div className="p-4 bg-gold/5 border border-gold/20 rounded-lg">
              <span className="text-sm text-muted-foreground">Starting From</span>
              <p className="text-2xl font-bold text-gold">
                {formatCurrency(project.starting_price)}
              </p>
              {project.price_per_sqft_from && (
                <span className="text-sm text-muted-foreground">
                  AED {project.price_per_sqft_from.toLocaleString()} / sq.ft
                </span>
              )}
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            {project.completion_year && (
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <Calendar className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <span className="text-sm text-muted-foreground block">Handover</span>
                <span className="font-semibold">{project.completion_year}</span>
              </div>
            )}
            {project.total_units && (
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <Home className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <span className="text-sm text-muted-foreground block">Units</span>
                <span className="font-semibold">{project.total_units.toLocaleString()}</span>
              </div>
            )}
            {project.bedrooms_range && (
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <Building2 className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <span className="text-sm text-muted-foreground block">Bedrooms</span>
                <span className="font-semibold">{project.bedrooms_range}</span>
              </div>
            )}
          </div>

          {/* Description */}
          {project.description && (
            <p className="text-muted-foreground">{project.description}</p>
          )}

          {/* Key Features */}
          {project.key_features && project.key_features.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Key Features</h4>
              <div className="flex flex-wrap gap-2">
                {project.key_features.slice(0, 6).map((feature, i) => (
                  <Badge key={i} variant="secondary">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Construction Progress */}
          {project.status === 'under_construction' && project.construction_progress_percent && (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Construction Progress</span>
                <span className="text-amber-400 font-medium">{project.construction_progress_percent}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-400 rounded-full transition-all"
                  style={{ width: `${project.construction_progress_percent}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
            {project.virtual_tour_url && (
              <Button variant="outline" className="flex-1" asChild>
                <a href={project.virtual_tour_url} target="_blank" rel="noopener noreferrer">
                  <Video className="h-4 w-4 mr-2" />
                  Virtual Tour
                  <ExternalLink className="h-3 w-3 ml-2" />
                </a>
              </Button>
            )}
            {project.brochure_url && (
              <Button variant="outline" className="flex-1" asChild>
                <a href={project.brochure_url} target="_blank" rel="noopener noreferrer">
                  <FileText className="h-4 w-4 mr-2" />
                  Brochure
                  <ExternalLink className="h-3 w-3 ml-2" />
                </a>
              </Button>
            )}
            <Button className="flex-1" asChild>
              <Link to={`/projects/${project.slug}`}>
                View Full Details
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
