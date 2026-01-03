// Shared map types for consistent typing across components

export interface MapCoordinates {
  latitude: number;
  longitude: number;
}

export interface POIMarker {
  id: string;
  type: string;
  name: string;
  coordinates: MapCoordinates;
  rating?: number | null;
  address?: string | null;
}

export interface PropertyMarker {
  id: string;
  slug: string;
  title: string;
  price: number;
  coordinates: MapCoordinates;
  isOffPlan?: boolean;
  isFeatured?: boolean;
  bedrooms?: number;
  propertyType?: string;
}

export interface NeighborhoodMarker {
  id: string;
  name: string;
  slug: string;
  coordinates: MapCoordinates;
  avgPriceSqft?: number;
  rentalYield?: number;
}

// POI type colors for consistent styling
export const POI_COLORS: Record<string, string> = {
  restaurant: '#F97316',  // Orange
  school: '#3B82F6',      // Blue
  healthcare: '#EF4444',  // Red
  gym: '#8B5CF6',         // Purple
  supermarket: '#22C55E', // Green
  entertainment: '#EC4899', // Pink
  transit: '#6366F1',     // Indigo
  park: '#10B981',        // Emerald
  atm: '#F59E0B',         // Amber
};

// Map style options
export const MAP_STYLES = {
  streets: 'mapbox://styles/mapbox/streets-v12',
  light: 'mapbox://styles/mapbox/light-v11',
  dark: 'mapbox://styles/mapbox/dark-v11',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
} as const;

export type MapStyleKey = keyof typeof MAP_STYLES;
