import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, CheckCircle2, Globe, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TierBadge } from './TierBadge';
import type { Developer } from '@/hooks/useDevelopers';

interface DeveloperCardProps {
  developer: Developer;
  index?: number;
}

export function DeveloperCard({ developer, index = 0 }: DeveloperCardProps) {
  const establishedYear = developer.established_year;
  const yearsActive = establishedYear ? new Date().getFullYear() - establishedYear : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link to={`/developers/${developer.slug}`} className="block group">
        <div className="bg-card border border-border rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-gold/5 hover:-translate-y-1">
          {/* Cover Image */}
          <div className="relative h-40 overflow-hidden">
            {developer.cover_image_url ? (
              <img
                src={developer.cover_image_url}
                alt={developer.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-muted to-background flex items-center justify-center">
                <Building2 className="h-12 w-12 text-muted-foreground/30" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
            
            {/* Tier Badge */}
            <div className="absolute top-3 right-3">
              <TierBadge tier={developer.tier} size="sm" />
            </div>

            {/* Logo */}
            <div className="absolute bottom-3 left-4">
              {developer.logo_url ? (
                <div className="w-14 h-14 rounded-lg bg-background/90 backdrop-blur-sm border border-border p-2 flex items-center justify-center">
                  <img
                    src={developer.logo_url}
                    alt={`${developer.name} logo`}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-lg bg-background/90 backdrop-blur-sm border border-border flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground group-hover:text-gold transition-colors line-clamp-1">
                  {developer.name}
                </h3>
                {developer.is_verified && (
                  <CheckCircle2 className="h-4 w-4 text-gold flex-shrink-0" />
                )}
              </div>
              {developer.tagline && (
                <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                  {developer.tagline}
                </p>
              )}
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {establishedYear && (
                <span className="flex items-center gap-1">
                  Est. {establishedYear}
                </span>
              )}
              {developer.total_projects !== null && developer.total_projects !== undefined && (
                <span className="flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {developer.total_projects} {developer.total_projects === 1 ? 'Project' : 'Projects'}
                </span>
              )}
              {developer.headquarters && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {developer.headquarters}
                </span>
              )}
            </div>

            {/* Specialty */}
            {developer.specialty && (
              <p className="text-xs text-gold/80 font-medium">
                {developer.specialty}
              </p>
            )}

            {/* CTA */}
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2 group-hover:bg-gold group-hover:text-primary-foreground group-hover:border-gold transition-all"
            >
              <Globe className="h-3.5 w-3.5 mr-2" />
              View Portfolio
            </Button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
