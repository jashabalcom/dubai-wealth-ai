import { motion } from 'framer-motion';
import { Award, Building2, Handshake, Home, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Developer } from '@/hooks/useDevelopers';

interface DeveloperStatsProps {
  developer: Developer;
}

export function DeveloperStats({ developer }: DeveloperStatsProps) {
  const yearsActive = developer.established_year
    ? new Date().getFullYear() - developer.established_year
    : null;

  const stats = [
    {
      label: 'Years Active',
      value: yearsActive ? `${yearsActive}+` : 'N/A',
      icon: TrendingUp,
    },
    {
      label: 'Projects',
      value: developer.total_projects !== null && developer.total_projects !== undefined 
        ? developer.total_projects.toString() 
        : 'N/A',
      icon: Building2,
    },
    {
      label: 'Units Delivered',
      value: developer.total_units_delivered
        ? developer.total_units_delivered.toLocaleString() + '+'
        : 'N/A',
      icon: Home,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Key Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-gold" />
              Key Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <stat.icon className="h-4 w-4" />
                  {stat.label}
                </span>
                <span className="font-semibold text-foreground">{stat.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Specialty */}
      {developer.specialty && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">Specialty</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gold font-medium">{developer.specialty}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Key Partnerships */}
      {developer.key_partnerships && Array.isArray(developer.key_partnerships) && developer.key_partnerships.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Handshake className="h-4 w-4 text-gold" />
                Brand Partnerships
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {(developer.key_partnerships as string[]).map((partner, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-gold/10 text-gold border-gold/20"
                  >
                    {partner}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Awards */}
      {developer.awards && Array.isArray(developer.awards) && developer.awards.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Award className="h-4 w-4 text-gold" />
                Awards & Recognition
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(developer.awards as { name: string; year?: number }[]).map((award, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Award className="h-4 w-4 text-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {award.name}
                    </p>
                    {award.year && (
                      <p className="text-xs text-muted-foreground">{award.year}</p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
