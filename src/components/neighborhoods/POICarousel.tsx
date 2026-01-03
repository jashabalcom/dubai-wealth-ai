import { useRef } from 'react';
import { ChevronLeft, ChevronRight, Utensils, GraduationCap, HeartPulse, Dumbbell, ShoppingCart, Film, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { POICard } from './POICard';
import { motion } from 'framer-motion';

interface POI {
  id: string;
  poi_type: string;
  name: string;
  description?: string | null;
  address?: string | null;
  rating?: number | null;
  website_url?: string | null;
  image_url?: string | null;
  cuisine?: string | null;
  price_level?: string | null;
  curriculum?: string | null;
}

interface POICarouselProps {
  title: string;
  poiType: string;
  pois: POI[];
  className?: string;
}

const POI_ICONS: Record<string, React.ElementType> = {
  restaurant: Utensils,
  school: GraduationCap,
  healthcare: HeartPulse,
  gym: Dumbbell,
  supermarket: ShoppingCart,
  entertainment: Film,
};

const POI_COLORS: Record<string, string> = {
  restaurant: 'text-orange-400',
  school: 'text-blue-400',
  healthcare: 'text-red-400',
  gym: 'text-violet-400',
  supermarket: 'text-green-400',
  entertainment: 'text-pink-400',
};

export function POICarousel({ title, poiType, pois, className }: POICarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const Icon = POI_ICONS[poiType] || MapPin;
  const iconColor = POI_COLORS[poiType] || 'text-primary';

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 300;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (pois.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${iconColor}`} />
          <h3 className="font-serif text-lg font-semibold text-foreground">{title}</h3>
          <span className="text-sm text-muted-foreground">({pois.length})</span>
        </div>
        
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => scroll('left')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => scroll('right')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Carousel */}
      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-none pb-2 -mx-4 px-4"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {pois.map((poi, index) => (
          <motion.div
            key={poi.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="shrink-0 w-[280px]"
            style={{ scrollSnapAlign: 'start' }}
          >
            <POICard poi={poi} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
