import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Download, 
  ExternalLink, 
  Share2, 
  MapPin,
  Calendar,
  Home,
  TrendingUp,
  Phone,
  Mail,
  ArrowUpRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import type { ProjectWithDetails } from '@/hooks/useProject';
import { formatCurrency } from '@/lib/utils';
import { AddToCalendarButton } from './AddToCalendarButton';
import { ConstructionProgressBar } from './ConstructionProgressBar';

interface ProjectSidebarProps {
  project: ProjectWithDetails;
}

export function ProjectSidebar({ project }: ProjectSidebarProps) {
  const handleShare = async () => {
    const url = window.location.href;
    const text = `Check out ${project.name} by ${project.developer?.name || 'Developer'}`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: project.name, text, url });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    }
  };

  const brandColor = project.developer?.brand_primary_color;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="sticky top-24 space-y-6"
    >
      {/* Developer Card */}
      {project.developer && (
        <div className="bg-card border border-border rounded-2xl p-6">
          <Link 
            to={`/developers/${project.developer.slug}`}
            className="flex items-center gap-4 group"
          >
            {project.developer.logo_url ? (
              <img 
                src={project.developer.logo_url} 
                alt={project.developer.name}
                className="h-12 w-auto"
              />
            ) : (
              <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                <Building2 className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Developed by</span>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                {project.developer.name}
              </h3>
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>
        </div>
      )}

      {/* Price & Key Info */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
        {project.starting_price && (
          <div>
            <span className="text-sm text-muted-foreground">Starting from</span>
            <div 
              className="text-3xl font-bold font-mono"
              style={brandColor ? { color: brandColor } : undefined}
            >
              {formatCurrency(project.starting_price)}
            </div>
            {project.price_per_sqft_from && (
              <span className="text-sm text-muted-foreground">
                AED {project.price_per_sqft_from.toLocaleString()}/sqft
              </span>
            )}
          </div>
        )}

        <Separator />

        {/* Quick Stats */}
        <div className="space-y-3">
          {project.location_area && (
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-foreground">{project.location_area}</span>
            </div>
          )}
          {project.bedrooms_range && (
            <div className="flex items-center gap-3 text-sm">
              <Home className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-foreground">{project.bedrooms_range}</span>
            </div>
          )}
          {project.total_units && (
            <div className="flex items-center gap-3 text-sm">
              <Building2 className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-foreground">{project.total_units.toLocaleString()} Units</span>
            </div>
          )}
          {project.handover_date && (
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-foreground">
                Handover: {new Date(project.handover_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </span>
            </div>
          )}
        </div>

        {/* Construction Progress */}
        {project.status === 'under_construction' && project.construction_progress_percent !== null && (
          <>
            <Separator />
            <ConstructionProgressBar 
              progress={project.construction_progress_percent} 
              brandColor={brandColor || undefined}
            />
          </>
        )}
      </div>

      {/* Actions */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
        <AddToCalendarButton project={project} variant="default" />
        
        {project.brochure_url && (
          <Button variant="outline" className="w-full gap-2" asChild>
            <a href={project.brochure_url} target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4" />
              Download Brochure
            </a>
          </Button>
        )}

        {project.virtual_tour_url && (
          <Button variant="outline" className="w-full gap-2" asChild>
            <a href={project.virtual_tour_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              Virtual Tour
            </a>
          </Button>
        )}

        <Button variant="ghost" className="w-full gap-2" onClick={handleShare}>
          <Share2 className="h-4 w-4" />
          Share Project
        </Button>
      </div>

      {/* Contact CTA */}
      <div 
        className="rounded-2xl p-6 text-center"
        style={{ 
          backgroundColor: brandColor ? `${brandColor}15` : 'hsl(var(--primary) / 0.1)',
          borderColor: brandColor || 'hsl(var(--primary))'
        }}
      >
        <h3 className="font-semibold text-foreground mb-2">Interested in this project?</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Get personalized pricing and availability
        </p>
        <Button className="w-full" asChild>
          <Link to="/contact">
            Request Information
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}
