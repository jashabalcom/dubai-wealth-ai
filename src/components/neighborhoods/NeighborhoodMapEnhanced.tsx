import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useMapboxToken } from '@/hooks/useMapboxToken';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface POI {
  id: string;
  poi_type: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  address?: string | null;
  rating?: number | null;
}

interface NeighborhoodMapEnhancedProps {
  latitude: number;
  longitude: number;
  neighborhoodId: string;
  neighborhoodName: string;
  pois: POI[];
  activeCategory: string;
  selectedPOIId: string | null;
  onPOISelect: (poiId: string | null) => void;
  className?: string;
}

const POI_COLORS: Record<string, string> = {
  restaurant: '#F97316',
  school: '#3B82F6',
  healthcare: '#EF4444',
  gym: '#8B5CF6',
  supermarket: '#22C55E',
  entertainment: '#EC4899',
};

export function NeighborhoodMapEnhanced({
  latitude,
  longitude,
  neighborhoodId,
  neighborhoodName,
  pois,
  activeCategory,
  selectedPOIId,
  onPOISelect,
  className
}: NeighborhoodMapEnhancedProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  
  // Use cached Mapbox token from React Query
  const { token: mapToken, loading: tokenLoading, error: tokenError } = useMapboxToken();

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapToken || !latitude || !longitude) return;

    mapboxgl.accessToken = mapToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11', // Dark style for better contrast and visibility
      center: [longitude, latitude],
      zoom: 14,
      pitch: 45,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({ visualizePitch: true }), 
      'top-right'
    );

    // Add neighborhood center marker with custom styling
    const centerEl = document.createElement('div');
    centerEl.className = 'neighborhood-center-marker';
    centerEl.innerHTML = `
      <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30 border-2 border-white">
        <svg class="w-4 h-4 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      </div>
    `;
    
    new mapboxgl.Marker({ element: centerEl })
      .setLngLat([longitude, latitude])
      .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="p-2">
          <strong class="text-sm">${neighborhoodName}</strong>
          <p class="text-xs text-gray-500 mt-1">Neighborhood Center</p>
        </div>
      `))
      .addTo(map.current);

    map.current.on('load', () => {
      setIsLoading(false);
    });

    return () => {
      map.current?.remove();
    };
  }, [mapToken, latitude, longitude, neighborhoodName]);

  // Update markers when POIs change
  useEffect(() => {
    if (!map.current || isLoading) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current.clear();

    // Add new markers
    pois.forEach(poi => {
      if (!poi.latitude || !poi.longitude) return;

      const color = POI_COLORS[poi.poi_type] || '#C9A961';
      const isSelected = selectedPOIId === poi.id;

      // Create custom marker element
      const el = document.createElement('div');
      el.className = `poi-marker ${isSelected ? 'selected' : ''}`;
      el.style.cssText = `
        width: ${isSelected ? '36px' : '28px'};
        height: ${isSelected ? '36px' : '28px'};
        background: ${color};
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        ${isSelected ? 'transform: scale(1.2); z-index: 10;' : ''}
      `;
      
      el.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
          <circle cx="12" cy="12" r="4"/>
        </svg>
      `;

      const popupContent = `
        <div class="p-3 min-w-[200px]">
          <strong class="block text-sm font-medium">${poi.name}</strong>
          ${poi.address ? `<p class="text-xs text-gray-600 mt-1 line-clamp-2">${poi.address}</p>` : ''}
          ${poi.rating ? `<div class="flex items-center gap-1 mt-2"><span class="text-amber-500">★</span><span class="text-xs font-medium">${poi.rating}</span></div>` : ''}
        </div>
      `;

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([poi.longitude, poi.latitude])
        .setPopup(new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(popupContent))
        .addTo(map.current!);

      // Click handler
      el.addEventListener('click', () => {
        onPOISelect(poi.id);
      });

      markersRef.current.set(poi.id, marker);
    });

    // Fit bounds to show all markers with animation
    if (pois.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([longitude, latitude]); // Include center
      
      pois.forEach(poi => {
        if (poi.latitude && poi.longitude) {
          bounds.extend([poi.longitude, poi.latitude]);
        }
      });

      map.current.fitBounds(bounds, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        maxZoom: 15,
        duration: 1000
      });
    }
  }, [pois, isLoading, selectedPOIId, onPOISelect, longitude, latitude]);

  // Fly to selected POI
  useEffect(() => {
    if (!map.current || !selectedPOIId) return;

    const selectedPOI = pois.find(p => p.id === selectedPOIId);
    if (selectedPOI?.latitude && selectedPOI?.longitude) {
      map.current.flyTo({
        center: [selectedPOI.longitude, selectedPOI.latitude],
        zoom: 16,
        duration: 1000
      });

      // Open popup
      const marker = markersRef.current.get(selectedPOIId);
      marker?.togglePopup();
    }
  }, [selectedPOIId, pois]);

  if (!latitude || !longitude) {
    return (
      <div className={cn("bg-muted/30 flex items-center justify-center", className)}>
        <p className="text-muted-foreground text-sm">No coordinates available for map</p>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {/* Loading State - show while token loading or map initializing */}
      {(tokenLoading || isLoading) && (
        <div className="absolute inset-0 z-10">
          <Skeleton className="w-full h-full" />
        </div>
      )}

      {/* Map Container */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* POI Count Badge */}
      {pois.length > 0 && !isLoading && (
        <div className="absolute top-4 left-4 z-10 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium shadow-lg border border-border">
          {pois.length} {pois.length === 1 ? 'place' : 'places'}
        </div>
      )}

      {/* Empty State Overlay */}
      {pois.length === 0 && !isLoading && (
        <div className="absolute bottom-4 left-4 z-10 bg-background/90 backdrop-blur-sm px-4 py-2 rounded-lg text-sm text-muted-foreground shadow-lg border border-border">
          No points of interest loaded for this area
        </div>
      )}
    </div>
  );
}
