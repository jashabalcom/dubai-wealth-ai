import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Bed, Bath, Maximize, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMapboxToken } from '@/hooks/useMapboxToken';
import { Skeleton } from '@/components/ui/skeleton';

interface Property {
  id: string;
  title: string;
  slug: string;
  location_area: string;
  property_type: string;
  price_aed: number;
  bedrooms: number;
  bathrooms: number;
  size_sqft: number;
  rental_yield_estimate: number;
  images: string[];
  is_off_plan: boolean;
  is_featured: boolean;
  latitude?: number;
  longitude?: number;
}

interface PropertyMapProps {
  properties: Property[];
  onPropertySelect?: (property: Property) => void;
}

const formatPrice = (price: number) => {
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)}M`;
  }
  return `${(price / 1000).toFixed(0)}K`;
};

// Dubai area coordinates fallback
const areaCoordinates: Record<string, { lat: number; lng: number }> = {
  'Dubai Marina': { lat: 25.0805, lng: 55.1403 },
  'Downtown Dubai': { lat: 25.1972, lng: 55.2744 },
  'Palm Jumeirah': { lat: 25.1124, lng: 55.1390 },
  'Business Bay': { lat: 25.1880, lng: 55.2650 },
  'JVC': { lat: 25.0540, lng: 55.2094 },
  'Dubai Creek Harbour': { lat: 25.2010, lng: 55.3350 },
  'Emaar Beachfront': { lat: 25.0780, lng: 55.1200 },
  'MBR City': { lat: 25.1700, lng: 55.3200 },
  'Damac Lagoons': { lat: 25.0050, lng: 55.2600 },
  'The Valley': { lat: 25.0200, lng: 55.4000 },
  'Tilal Al Ghaf': { lat: 25.0300, lng: 55.1900 },
};

export function PropertyMap({ properties, onPropertySelect }: PropertyMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const { token, loading, error } = useMapboxToken();

  const getPropertyCoordinates = useCallback((property: Property) => {
    if (property.latitude && property.longitude) {
      return { lat: Number(property.latitude), lng: Number(property.longitude) };
    }
    const areaCoord = areaCoordinates[property.location_area];
    if (areaCoord) {
      // Add small random offset to prevent overlapping
      return {
        lat: areaCoord.lat + (Math.random() - 0.5) * 0.01,
        lng: areaCoord.lng + (Math.random() - 0.5) * 0.01,
      };
    }
    // Default to Dubai center
    return { lat: 25.2048, lng: 55.2708 };
  }, []);

  const handlePropertyClick = useCallback((property: Property) => {
    setSelectedProperty(property);
    onPropertySelect?.(property);
    
    if (map.current) {
      const coords = getPropertyCoordinates(property);
      map.current.flyTo({
        center: [coords.lng, coords.lat],
        zoom: 14,
        duration: 1000,
      });
    }
  }, [getPropertyCoordinates, onPropertySelect]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !token || map.current) return;

    mapboxgl.accessToken = token;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [55.2708, 25.2048], // Dubai center
      zoom: 10.5,
      pitch: 30,
    });

    map.current.addControl(
      new mapboxgl.NavigationControl({ visualizePitch: true }),
      'top-right'
    );

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [token]);

  // Update markers when properties change
  useEffect(() => {
    if (!map.current || !token) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    properties.forEach((property) => {
      const coords = getPropertyCoordinates(property);
      
      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'property-marker';
      el.innerHTML = `
        <div class="marker-content ${property.is_featured ? 'featured' : ''} ${property.is_off_plan ? 'off-plan' : ''}">
          <span class="marker-price">AED ${formatPrice(property.price_aed)}</span>
        </div>
      `;
      
      el.addEventListener('click', () => handlePropertyClick(property));

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([coords.lng, coords.lat])
        .addTo(map.current!);

      markersRef.current.push(marker);
    });

    // Fit bounds to all properties if there are any
    if (properties.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      properties.forEach((property) => {
        const coords = getPropertyCoordinates(property);
        bounds.extend([coords.lng, coords.lat]);
      });
      
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 13,
        duration: 1000,
      });
    }
  }, [properties, token, getPropertyCoordinates, handlePropertyClick]);

  if (loading) {
    return (
      <div className="relative h-[600px] lg:h-[calc(100vh-300px)] rounded-lg overflow-hidden">
        <Skeleton className="w-full h-full" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-muted-foreground animate-pulse mx-auto mb-2" />
            <p className="text-muted-foreground">Loading map...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative h-[600px] lg:h-[calc(100vh-300px)] rounded-lg overflow-hidden bg-muted flex items-center justify-center">
        <div className="text-center p-8">
          <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-heading text-xl text-foreground mb-2">Map unavailable</h3>
          <p className="text-muted-foreground mb-4">Unable to load the map. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[600px] lg:h-[calc(100vh-300px)] rounded-lg overflow-hidden">
      {/* Map container */}
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Selected property card */}
      <AnimatePresence>
        {selectedProperty && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 left-4 right-4 md:left-4 md:right-auto md:w-96 z-10"
          >
            <div className="bg-card border border-border rounded-lg overflow-hidden shadow-xl">
              {/* Property image */}
              <div className="relative h-40">
                <img
                  src={selectedProperty.images[0] || '/placeholder.svg'}
                  alt={selectedProperty.title}
                  className="w-full h-full object-cover"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                  onClick={() => setSelectedProperty(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
                <div className="absolute top-2 left-2 flex gap-1">
                  {selectedProperty.is_off_plan && (
                    <Badge variant="secondary" className="bg-accent text-accent-foreground">
                      Off-Plan
                    </Badge>
                  )}
                  {selectedProperty.is_featured && (
                    <Badge className="bg-primary text-primary-foreground">
                      Featured
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Property details */}
              <div className="p-4">
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                  <MapPin className="w-3 h-3" />
                  {selectedProperty.location_area}
                </div>
                <h3 className="font-heading text-lg font-semibold text-foreground line-clamp-1 mb-2">
                  {selectedProperty.title}
                </h3>
                <p className="text-xl font-bold text-gradient-gold mb-3">
                  AED {selectedProperty.price_aed.toLocaleString()}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Bed className="w-4 h-4" /> {selectedProperty.bedrooms}
                  </span>
                  <span className="flex items-center gap-1">
                    <Bath className="w-4 h-4" /> {selectedProperty.bathrooms}
                  </span>
                  <span className="flex items-center gap-1">
                    <Maximize className="w-4 h-4" /> {selectedProperty.size_sqft.toLocaleString()} sqft
                  </span>
                </div>

                {selectedProperty.rental_yield_estimate > 0 && (
                  <div className="flex items-center gap-1 text-sm text-emerald-500 mb-4">
                    <TrendingUp className="w-4 h-4" />
                    <span>{selectedProperty.rental_yield_estimate}% est. yield</span>
                  </div>
                )}

                <Link to={`/properties/${selectedProperty.slug}`}>
                  <Button className="w-full" variant="gold">
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map legend */}
      <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-3 text-xs">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-muted-foreground">Standard</span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 rounded-full bg-accent" />
          <span className="text-muted-foreground">Off-Plan</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary ring-2 ring-accent" />
          <span className="text-muted-foreground">Featured</span>
        </div>
      </div>

      {/* Property count */}
      <div className="absolute top-4 right-16 bg-card/90 backdrop-blur-sm border border-border rounded-lg px-3 py-2">
        <span className="text-sm font-medium">{properties.length} properties</span>
      </div>

      {/* Custom marker styles */}
      <style>{`
        .property-marker {
          cursor: pointer;
          transform: translate(-50%, -100%);
        }
        .marker-content {
          background: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          transition: all 0.2s ease;
          position: relative;
        }
        .marker-content::after {
          content: '';
          position: absolute;
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%);
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid hsl(var(--primary));
        }
        .marker-content.off-plan {
          background: hsl(var(--accent));
          color: hsl(var(--accent-foreground));
        }
        .marker-content.off-plan::after {
          border-top-color: hsl(var(--accent));
        }
        .marker-content.featured {
          box-shadow: 0 0 0 2px hsl(var(--accent)), 0 2px 8px rgba(0,0,0,0.3);
        }
        .property-marker:hover .marker-content {
          transform: scale(1.1);
          z-index: 10;
        }
        .mapboxgl-ctrl-group {
          background: hsl(var(--card)) !important;
          border: 1px solid hsl(var(--border)) !important;
        }
        .mapboxgl-ctrl-group button {
          background-color: transparent !important;
        }
        .mapboxgl-ctrl-group button + button {
          border-top: 1px solid hsl(var(--border)) !important;
        }
        .mapboxgl-ctrl-icon {
          filter: invert(1);
        }
      `}</style>
    </div>
  );
}
