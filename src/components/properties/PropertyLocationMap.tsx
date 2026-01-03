import { useEffect, useRef, useState, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useMapboxToken } from '@/hooks/useMapboxToken';
import { useNeighborhoodPOIs } from '@/hooks/useNeighborhoods';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  MapPin, Navigation, GraduationCap, Utensils, 
  Building2, Train, ShoppingCart, Dumbbell, Heart
} from 'lucide-react';
import { POI_COLORS, MAP_STYLES, MAP_3D_CONFIG } from '@/types/maps';

interface PropertyLocationMapProps {
  latitude: number | null;
  longitude: number | null;
  propertyTitle: string;
  locationArea: string;
  neighborhoodId?: string;
  className?: string;
}

const POI_ICONS: Record<string, React.ElementType> = {
  school: GraduationCap,
  restaurant: Utensils,
  healthcare: Heart,
  gym: Dumbbell,
  supermarket: ShoppingCart,
  transit: Train,
};

const POI_CATEGORIES = [
  { key: 'all', label: 'All', icon: MapPin },
  { key: 'school', label: 'Schools', icon: GraduationCap },
  { key: 'restaurant', label: 'Dining', icon: Utensils },
  { key: 'supermarket', label: 'Shops', icon: ShoppingCart },
  { key: 'transit', label: 'Transit', icon: Train },
];

export function PropertyLocationMap({
  latitude,
  longitude,
  propertyTitle,
  locationArea,
  neighborhoodId,
  className,
}: PropertyLocationMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const propertyMarkerRef = useRef<mapboxgl.Marker | null>(null);
  
  const [isMapReady, setIsMapReady] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  
  const { token: mapToken, loading: tokenLoading, error: tokenError } = useMapboxToken();
  const { data: allPOIs = [] } = useNeighborhoodPOIs(neighborhoodId || '');
  
  // Filter POIs by category
  const filteredPOIs = useMemo(() => {
    if (activeCategory === 'all') return allPOIs.slice(0, 20); // Limit for performance
    return allPOIs.filter(poi => poi.poi_type === activeCategory).slice(0, 15);
  }, [allPOIs, activeCategory]);
  
  // Count POIs by type
  const poiCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allPOIs.length };
    allPOIs.forEach(poi => {
      counts[poi.poi_type] = (counts[poi.poi_type] || 0) + 1;
    });
    return counts;
  }, [allPOIs]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapToken || !latitude || !longitude) return;

    mapboxgl.accessToken = mapToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAP_STYLES.light, // Reliable style that works everywhere
      center: [longitude, latitude],
      zoom: 16,
      pitch: 45, // Simple tilt for depth
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({ visualizePitch: true }), 
      'top-right'
    );

    // Create property marker with pulsing effect
    const propertyEl = document.createElement('div');
    propertyEl.className = 'property-marker';
    propertyEl.innerHTML = `
      <div class="relative">
        <div class="absolute inset-0 rounded-full bg-primary animate-ping opacity-25"></div>
        <div class="relative w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/40 border-3 border-white">
          <svg class="w-6 h-6 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
          </svg>
        </div>
      </div>
    `;

    propertyMarkerRef.current = new mapboxgl.Marker({ element: propertyEl })
      .setLngLat([longitude, latitude])
      .setPopup(
        new mapboxgl.Popup({ offset: 35, closeButton: false })
          .setHTML(`
            <div class="p-3 min-w-[200px]">
              <p class="text-xs text-muted-foreground uppercase tracking-wider mb-1">Property Location</p>
              <strong class="block text-sm font-semibold">${propertyTitle}</strong>
              <p class="text-xs text-muted-foreground mt-1">${locationArea}</p>
            </div>
          `)
      )
      .addTo(map.current);

    // Handle errors gracefully
    map.current.on('error', (e) => {
      console.error('Mapbox error:', e.error);
    });

    // Set ready state on load event (more reliable than style.load)
    map.current.on('load', () => {
      setIsMapReady(true);
    });

    return () => {
      map.current?.remove();
    };
  }, [mapToken, latitude, longitude, propertyTitle, locationArea]);

  // Update POI markers when filtered POIs change
  useEffect(() => {
    if (!map.current || !isMapReady) return;

    // Clear existing POI markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current.clear();

    // Add new POI markers
    filteredPOIs.forEach(poi => {
      if (!poi.latitude || !poi.longitude) return;

      const color = POI_COLORS[poi.poi_type] || '#C9A961';
      const IconComponent = POI_ICONS[poi.poi_type];

      const el = document.createElement('div');
      el.className = 'poi-marker cursor-pointer transition-transform hover:scale-110';
      el.style.cssText = `
        width: 32px;
        height: 32px;
        background: ${color};
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      `;
      el.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
          <circle cx="12" cy="12" r="5"/>
        </svg>
      `;

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([poi.longitude, poi.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25, closeButton: false })
            .setHTML(`
              <div class="p-3 min-w-[180px]">
                <div class="flex items-center gap-2 mb-1">
                  <span class="w-2 h-2 rounded-full" style="background: ${color}"></span>
                  <span class="text-xs uppercase tracking-wider text-muted-foreground">${poi.poi_type}</span>
                </div>
                <strong class="block text-sm">${poi.name}</strong>
                ${poi.address ? `<p class="text-xs text-muted-foreground mt-1 line-clamp-2">${poi.address}</p>` : ''}
                ${poi.rating ? `<div class="flex items-center gap-1 mt-2"><span class="text-amber-500">★</span><span class="text-xs font-medium">${poi.rating}</span></div>` : ''}
              </div>
            `)
        )
        .addTo(map.current!);

      markersRef.current.set(poi.id, marker);
    });

    // Fit bounds to show property and nearby POIs
    if (filteredPOIs.length > 0 && latitude && longitude) {
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([longitude, latitude]);
      
      filteredPOIs.slice(0, 10).forEach(poi => {
        if (poi.latitude && poi.longitude) {
          bounds.extend([poi.longitude, poi.latitude]);
        }
      });

      map.current.fitBounds(bounds, {
        padding: { top: 80, bottom: 50, left: 50, right: 50 },
        maxZoom: 16,
        duration: 800,
      });
    }
  }, [filteredPOIs, isMapReady, latitude, longitude]);

  // Handle missing coordinates
  if (!latitude || !longitude) {
    return (
      <Card className={cn("border-border/50 bg-card/60", className)}>
        <CardContent className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
            <MapPin className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">Location map not available for this property</p>
        </CardContent>
      </Card>
    );
  }

  // Loading state
  if (tokenLoading) {
    return <Skeleton className={cn("w-full h-[400px] rounded-xl", className)} />;
  }

  // Error state
  if (tokenError) {
    return (
      <Card className={cn("border-destructive/50", className)}>
        <CardContent className="p-8 text-center">
          <p className="text-destructive">Unable to load map</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("relative rounded-xl overflow-hidden", className)}>
      {/* Map Container */}
      <div ref={mapContainer} className="w-full h-[400px]" />
      
      {/* Loading Overlay */}
      {!isMapReady && (
        <div className="absolute inset-0 bg-muted/50 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      )}

      {/* Category Filter Chips */}
      {isMapReady && allPOIs.length > 0 && (
        <div className="absolute top-4 left-4 right-16 z-10">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {POI_CATEGORIES.map(category => {
              const count = poiCounts[category.key] || 0;
              const isActive = activeCategory === category.key;
              const Icon = category.icon;
              
              if (category.key !== 'all' && count === 0) return null;
              
              return (
                <Button
                  key={category.key}
                  size="sm"
                  variant={isActive ? "default" : "secondary"}
                  className={cn(
                    "shrink-0 gap-1.5 shadow-md",
                    isActive && "bg-primary text-primary-foreground"
                  )}
                  onClick={() => setActiveCategory(category.key)}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{category.label}</span>
                  {count > 0 && (
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "ml-1 h-5 px-1.5 text-[10px]",
                        isActive ? "border-primary-foreground/30 text-primary-foreground" : "border-border"
                      )}
                    >
                      {count}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Location Badge */}
      <div className="absolute bottom-4 left-4 z-10">
        <Badge 
          variant="secondary" 
          className="bg-background/95 backdrop-blur-sm shadow-lg border-border/50 gap-1.5 py-1.5"
        >
          <Navigation className="h-3.5 w-3.5 text-primary" />
          <span className="font-medium">{locationArea}</span>
        </Badge>
      </div>
    </div>
  );
}
