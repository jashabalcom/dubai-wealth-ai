import { motion } from 'framer-motion';
import {
  Waves,
  Dumbbell,
  Users,
  ShoppingBag,
  Car,
  TreePine,
  UtensilsCrossed,
  Baby,
  Wifi,
  Shield,
  Sparkles,
  Building2,
  Landmark,
  Heart,
  type LucideIcon
} from 'lucide-react';
import type { ProjectAmenity } from '@/hooks/useProject';

interface ProjectAmenitiesProps {
  amenities: ProjectAmenity[];
  brandColor?: string;
}

const categoryConfig: Record<string, { label: string; icon: LucideIcon; color: string }> = {
  leisure: { label: 'Pool & Leisure', icon: Waves, color: 'bg-blue-500/10 text-blue-600' },
  fitness: { label: 'Health & Fitness', icon: Dumbbell, color: 'bg-green-500/10 text-green-600' },
  community: { label: 'Community', icon: Users, color: 'bg-purple-500/10 text-purple-600' },
  retail: { label: 'Retail & Dining', icon: ShoppingBag, color: 'bg-amber-500/10 text-amber-600' },
  parking: { label: 'Parking & Access', icon: Car, color: 'bg-slate-500/10 text-slate-600' },
  outdoor: { label: 'Outdoor & Gardens', icon: TreePine, color: 'bg-emerald-500/10 text-emerald-600' },
  dining: { label: 'Dining', icon: UtensilsCrossed, color: 'bg-orange-500/10 text-orange-600' },
  kids: { label: 'Kids & Family', icon: Baby, color: 'bg-pink-500/10 text-pink-600' },
  tech: { label: 'Technology', icon: Wifi, color: 'bg-indigo-500/10 text-indigo-600' },
  security: { label: 'Security', icon: Shield, color: 'bg-red-500/10 text-red-600' },
  wellness: { label: 'Wellness & Spa', icon: Sparkles, color: 'bg-violet-500/10 text-violet-600' },
  business: { label: 'Business', icon: Building2, color: 'bg-gray-500/10 text-gray-600' },
  cultural: { label: 'Cultural', icon: Landmark, color: 'bg-teal-500/10 text-teal-600' },
  health: { label: 'Health', icon: Heart, color: 'bg-rose-500/10 text-rose-600' },
};

const iconMap: Record<string, LucideIcon> = {
  waves: Waves,
  pool: Waves,
  dumbbell: Dumbbell,
  gym: Dumbbell,
  fitness: Dumbbell,
  users: Users,
  community: Users,
  shopping: ShoppingBag,
  retail: ShoppingBag,
  car: Car,
  parking: Car,
  tree: TreePine,
  garden: TreePine,
  restaurant: UtensilsCrossed,
  dining: UtensilsCrossed,
  baby: Baby,
  kids: Baby,
  wifi: Wifi,
  tech: Wifi,
  shield: Shield,
  security: Shield,
  spa: Sparkles,
  wellness: Sparkles,
  building: Building2,
  business: Building2,
  landmark: Landmark,
  heart: Heart,
  health: Heart,
};

export function ProjectAmenities({ amenities, brandColor }: ProjectAmenitiesProps) {
  // Group amenities by category
  const groupedAmenities = amenities.reduce((acc, amenity) => {
    const category = amenity.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(amenity);
    return acc;
  }, {} as Record<string, ProjectAmenity[]>);

  const getIcon = (iconName: string | null, category: string): LucideIcon => {
    if (iconName && iconMap[iconName.toLowerCase()]) {
      return iconMap[iconName.toLowerCase()];
    }
    return categoryConfig[category]?.icon || Sparkles;
  };

  return (
    <div className="space-y-8">
      {Object.entries(groupedAmenities).map(([category, items], categoryIndex) => {
        const config = categoryConfig[category] || { label: category, icon: Sparkles, color: 'bg-muted text-muted-foreground' };
        const CategoryIcon = config.icon;

        return (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: categoryIndex * 0.1 }}
          >
            {/* Category Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg ${config.color}`}>
                <CategoryIcon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-foreground">{config.label}</h3>
              <span className="text-sm text-muted-foreground">({items.length})</span>
            </div>

            {/* Amenities Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {items.map((amenity, index) => {
                const Icon = getIcon(amenity.icon, category);
                
                return (
                  <motion.div
                    key={amenity.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (categoryIndex * 0.1) + (index * 0.03) }}
                    className="group flex items-start gap-3 p-3 bg-card border border-border rounded-lg hover:border-primary/30 hover:bg-muted/30 transition-colors"
                  >
                    <div 
                      className="p-1.5 rounded-md bg-primary/10 text-primary flex-shrink-0"
                      style={brandColor ? { backgroundColor: `${brandColor}15`, color: brandColor } : undefined}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {amenity.name}
                      </p>
                      {amenity.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {amenity.description}
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        );
      })}

      {amenities.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>Amenities information coming soon</p>
        </div>
      )}
    </div>
  );
}
