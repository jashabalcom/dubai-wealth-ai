import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Neighborhood {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  overview: string | null;
  image_url: string | null;
  cover_image_url: string | null;
  latitude: number | null;
  longitude: number | null;
  avg_price_sqft: number | null;
  avg_rental_yield: number | null;
  yoy_appreciation: number | null;
  avg_rent_studio: number | null;
  avg_rent_1br: number | null;
  avg_rent_2br: number | null;
  avg_rent_3br: number | null;
  lifestyle_type: string | null;
  walkability_score: number | null;
  transit_score: number | null;
  safety_score: number | null;
  pros: string[];
  cons: string[];
  best_for: string[];
  is_freehold: boolean | null;
  golden_visa_eligible: boolean | null;
  has_metro_access: boolean | null;
  has_beach_access: boolean | null;
  has_mall_access: boolean | null;
  population_estimate: number | null;
  established_year: number | null;
  developer_name: string | null;
  is_published: boolean | null;
  order_index: number | null;
  created_at: string;
  updated_at: string;
}

export interface NeighborhoodPOI {
  id: string;
  neighborhood_id: string;
  poi_type: string;
  name: string;
  description: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  rating: number | null;
  review_count: number | null;
  price_level: string | null;
  curriculum: string | null;
  grade_levels: string | null;
  annual_fees_from: number | null;
  annual_fees_to: number | null;
  cuisine: string | null;
  is_delivery_available: boolean | null;
  website_url: string | null;
  phone: string | null;
  image_url: string | null;
  is_featured: boolean | null;
  order_index: number | null;
}

export interface NeighborhoodFilters {
  lifestyle?: string;
  isFreehold?: boolean;
  hasMetro?: boolean;
  hasBeach?: boolean;
  search?: string;
}

export function useNeighborhoods(filters?: NeighborhoodFilters) {
  return useQuery({
    queryKey: ['neighborhoods', filters],
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    queryFn: async () => {
      let query = supabase
        .from('neighborhoods')
        .select('*')
        .eq('is_published', true)
        .order('name');

      if (filters?.lifestyle && filters.lifestyle !== 'all') {
        query = query.eq('lifestyle_type', filters.lifestyle);
      }
      if (filters?.isFreehold) {
        query = query.eq('is_freehold', true);
      }
      if (filters?.hasMetro) {
        query = query.eq('has_metro_access', true);
      }
      if (filters?.hasBeach) {
        query = query.eq('has_beach_access', true);
      }
      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map(n => ({
        ...n,
        pros: Array.isArray(n.pros) ? n.pros : [],
        cons: Array.isArray(n.cons) ? n.cons : [],
        best_for: Array.isArray(n.best_for) ? n.best_for : [],
      })) as Neighborhood[];
    },
  });
}

export function useNeighborhood(slug: string) {
  return useQuery({
    queryKey: ['neighborhood', slug],
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    queryFn: async () => {
      const { data, error } = await supabase
        .from('neighborhoods')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      
      return {
        ...data,
        pros: Array.isArray(data.pros) ? data.pros : [],
        cons: Array.isArray(data.cons) ? data.cons : [],
        best_for: Array.isArray(data.best_for) ? data.best_for : [],
      } as Neighborhood;
    },
    enabled: !!slug,
  });
}

export function useNeighborhoodPOIs(neighborhoodId: string, poiType?: string) {
  return useQuery({
    queryKey: ['neighborhood-pois', neighborhoodId, poiType],
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    queryFn: async () => {
      let query = supabase
        .from('neighborhood_pois')
        .select('*')
        .eq('neighborhood_id', neighborhoodId)
        .order('is_featured', { ascending: false })
        .order('order_index');

      if (poiType && poiType !== 'all') {
        query = query.eq('poi_type', poiType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as NeighborhoodPOI[];
    },
    enabled: !!neighborhoodId,
  });
}

export function useNeighborhoodProperties(neighborhoodName: string) {
  return useQuery({
    queryKey: ['neighborhood-properties', neighborhoodName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, slug, price_aed, location_area, images, bedrooms, size_sqft')
        .ilike('location_area', `%${neighborhoodName}%`)
        .eq('status', 'active')
        .limit(6);

      if (error) throw error;
      return data || [];
    },
    enabled: !!neighborhoodName,
  });
}
