import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Utensils, GraduationCap, HeartPulse, Dumbbell, ShoppingCart, Film, MapPin } from 'lucide-react';

interface NeighborhoodMapProps {
  latitude: number;
  longitude: number;
  neighborhoodId: string;
  neighborhoodName: string;
  className?: string;
}

interface POI {
  id: string;
  poi_type: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  address?: string | null;
  rating?: number | null;
}

const POI_CATEGORIES = [
  { key: 'all', label: 'All', icon: MapPin, color: '#C9A961' },
  { key: 'restaurant', label: 'Dining', icon: Utensils, color: '#F97316' },
  { key: 'school', label: 'Schools', icon: GraduationCap, color: '#3B82F6' },
  { key: 'healthcare', label: 'Health', icon: HeartPulse, color: '#EF4444' },
  { key: 'gym', label: 'Fitness', icon: Dumbbell, color: '#8B5CF6' },
  { key: 'supermarket', label: 'Shopping', icon: ShoppingCart, color: '#22C55E' },
  { key: 'entertainment', label: 'Entertainment', icon: Film, color: '#EC4899' },
];

const POI_COLORS: Record<string, string> = {
  restaurant: '#F97316',
  school: '#3B82F6',
  healthcare: '#EF4444',
  gym: '#8B5CF6',
  supermarket: '#22C55E',
  entertainment: '#EC4899',
};

export function NeighborhoodMap({ latitude, longitude, neighborhoodId, neighborhoodName, className }: NeighborhoodMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mapToken, setMapToken] = useState<string | null>(null);
  const [pois, setPois] = useState<POI[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');

  // Fetch Mapbox token
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (error) throw error;
        setMapToken(data.token);
      } catch (error) {
        console.error('Error fetching Mapbox token:', error);
      }
    };
    fetchToken();
  }, []);

  // Fetch POIs
  useEffect(() => {
    const fetchPOIs = async () => {
      if (!neighborhoodId) return;
      
      const { data, error } = await supabase
        .from('neighborhood_pois')
        .select('id, poi_type, name, latitude, longitude, address, rating')
        .eq('neighborhood_id', neighborhoodId);
      
      if (!error && data) {
        setPois(data as POI[]);
      }
    };
    fetchPOIs();
  }, [neighborhoodId]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapToken || !latitude || !longitude) return;

    mapboxgl.accessToken = mapToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [longitude, latitude],
      zoom: 14,
      pitch: 30,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');

    // Add neighborhood center marker
    new mapboxgl.Marker({ color: '#C9A961' })
      .setLngLat([longitude, latitude])
      .setPopup(new mapboxgl.Popup().setHTML(`<strong>${neighborhoodName}</strong>`))
      .addTo(map.current);

    map.current.on('load', () => {
      setIsLoading(false);
    });

    return () => {
      map.current?.remove();
    };
  }, [mapToken, latitude, longitude, neighborhoodName]);

  // Update markers when category or POIs change
  useEffect(() => {
    if (!map.current || isLoading) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Filter POIs by category
    const filteredPOIs = activeCategory === 'all' 
      ? pois 
      : pois.filter(poi => poi.poi_type === activeCategory);

    // Add new markers
    filteredPOIs.forEach(poi => {
      if (!poi.latitude || !poi.longitude) return;

      const color = POI_COLORS[poi.poi_type] || '#C9A961';
      
      const popupContent = `
        <div class="p-2">
          <strong class="block text-sm">${poi.name}</strong>
          ${poi.address ? `<span class="text-xs text-gray-600 block mt-1">${poi.address}</span>` : ''}
          ${poi.rating ? `<span class="text-xs text-amber-500 block mt-1">★ ${poi.rating}</span>` : ''}
        </div>
      `;

      const marker = new mapboxgl.Marker({ color, scale: 0.7 })
        .setLngLat([poi.longitude, poi.latitude])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent))
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  }, [pois, activeCategory, isLoading]);

  if (!latitude || !longitude) {
    return (
      <div className={`bg-muted/30 rounded-xl flex items-center justify-center ${className}`}>
        <p className="text-muted-foreground text-sm">No coordinates available for map</p>
      </div>
    );
  }

  return (
    <div className={`relative rounded-xl overflow-hidden border border-border ${className}`}>
      {/* Category Filter */}
      <div className="absolute top-4 left-4 right-4 z-10 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {POI_CATEGORIES.map(cat => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.key;
          const count = cat.key === 'all' 
            ? pois.length 
            : pois.filter(p => p.poi_type === cat.key).length;
          
          return (
            <Button
              key={cat.key}
              size="sm"
              variant={isActive ? 'default' : 'secondary'}
              className={`shrink-0 gap-1.5 ${isActive ? 'bg-primary text-primary-foreground' : 'bg-background/90 backdrop-blur-sm'}`}
              onClick={() => setActiveCategory(cat.key)}
            >
              <Icon className="h-3.5 w-3.5" style={{ color: isActive ? undefined : cat.color }} />
              <span>{cat.label}</span>
              {count > 0 && <span className="text-xs opacity-70">({count})</span>}
            </Button>
          );
        })}
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="absolute inset-0 z-5">
          <Skeleton className="w-full h-full" />
        </div>
      )}

      {/* Map Container */}
      <div ref={mapContainer} className="w-full h-[400px]" />
    </div>
  );
}
