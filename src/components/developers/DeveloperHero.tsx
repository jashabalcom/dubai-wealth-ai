import { motion } from 'framer-motion';
import { Building2, CheckCircle2, ExternalLink, Globe, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TierBadge } from './TierBadge';
import type { Developer } from '@/hooks/useDevelopers';

interface DeveloperHeroProps {
  developer: Developer;
}

export function DeveloperHero({ developer }: DeveloperHeroProps) {
  return (
    <div className="relative">
      {/* Cover Image */}
      <div className="h-64 md:h-80 lg:h-96 overflow-hidden">
        {developer.cover_image_url ? (
          <img
            src={developer.cover_image_url}
            alt={developer.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted to-background" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>

      {/* Content Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 lg:p-12">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row md:items-end gap-6"
          >
            {/* Logo */}
            <div className="flex-shrink-0">
              {developer.logo_url ? (
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl bg-card/90 backdrop-blur-sm border border-border p-4 flex items-center justify-center shadow-xl">
                  <img
                    src={developer.logo_url}
                    alt={`${developer.name} logo`}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl bg-card/90 backdrop-blur-sm border border-border flex items-center justify-center shadow-xl">
                  <Building2 className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <TierBadge tier={developer.tier} size="lg" />
                {developer.is_verified && (
                  <span className="inline-flex items-center gap-1.5 text-sm text-gold">
                    <CheckCircle2 className="h-4 w-4" />
                    Verified Developer
                  </span>
                )}
              </div>

              <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                {developer.name}
              </h1>

              {developer.tagline && (
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
                  "{developer.tagline}"
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 pt-2">
                {developer.headquarters && (
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {developer.headquarters}
                  </span>
                )}
                {developer.established_year && (
                  <span className="text-sm text-muted-foreground">
                    Established {developer.established_year}
                  </span>
                )}
                {developer.website && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="hover:bg-gold hover:text-primary-foreground hover:border-gold"
                  >
                    <a
                      href={developer.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      Visit Website
                      <ExternalLink className="h-3 w-3 ml-2" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
