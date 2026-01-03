import { Utensils, GraduationCap, HeartPulse, Dumbbell, ShoppingCart, Film, Train, Waves } from 'lucide-react';
import { motion } from 'framer-motion';

interface NeighborhoodAmenitiesProps {
  poiCounts: Record<string, number>;
  hasMetro?: boolean;
  hasBeach?: boolean;
  className?: string;
}

const AMENITY_CONFIG = [
  { key: 'restaurant', label: 'Restaurants & Cafes', icon: Utensils, color: 'text-orange-400', bgColor: 'bg-orange-500/10' },
  { key: 'school', label: 'Schools', icon: GraduationCap, color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
  { key: 'healthcare', label: 'Healthcare', icon: HeartPulse, color: 'text-red-400', bgColor: 'bg-red-500/10' },
  { key: 'gym', label: 'Fitness Centers', icon: Dumbbell, color: 'text-violet-400', bgColor: 'bg-violet-500/10' },
  { key: 'supermarket', label: 'Supermarkets', icon: ShoppingCart, color: 'text-green-400', bgColor: 'bg-green-500/10' },
  { key: 'entertainment', label: 'Entertainment', icon: Film, color: 'text-pink-400', bgColor: 'bg-pink-500/10' },
];

export function NeighborhoodAmenities({ poiCounts, hasMetro, hasBeach, className }: NeighborhoodAmenitiesProps) {
  const totalPOIs = Object.values(poiCounts).reduce((a, b) => a + b, 0);

  if (totalPOIs === 0 && !hasMetro && !hasBeach) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
        Nearby Amenities
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {/* POI Counts */}
        {AMENITY_CONFIG.map((amenity, index) => {
          const count = poiCounts[amenity.key] || 0;
          if (count === 0) return null;
          
          const Icon = amenity.icon;
          
          return (
            <motion.div
              key={amenity.key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center gap-3 p-3 rounded-xl ${amenity.bgColor} border border-white/5`}
            >
              <div className={`p-2 rounded-lg bg-background/50 ${amenity.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{count}</p>
                <p className="text-xs text-muted-foreground">{amenity.label}</p>
              </div>
            </motion.div>
          );
        })}

        {/* Metro Access */}
        {hasMetro && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-sky-500/10 border border-white/5"
          >
            <div className="p-2 rounded-lg bg-background/50 text-sky-400">
              <Train className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Metro</p>
              <p className="text-xs text-muted-foreground">Nearby Access</p>
            </div>
          </motion.div>
        )}

        {/* Beach Access */}
        {hasBeach && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-cyan-500/10 border border-white/5"
          >
            <div className="p-2 rounded-lg bg-background/50 text-cyan-400">
              <Waves className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Beach</p>
              <p className="text-xs text-muted-foreground">Walking Distance</p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
