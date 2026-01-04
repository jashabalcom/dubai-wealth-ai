import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export interface Developer {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  cover_image_url: string | null;
  description: string | null;
  website: string | null;
  headquarters: string | null;
  established_year: number | null;
  total_projects: number | null;
  is_verified: boolean | null;
  is_active: boolean | null;
  tier: string | null;
  specialty: string | null;
  tagline: string | null;
  total_units_delivered: number | null;
  awards: Json;
  key_partnerships: Json;
  social_links: Json;
  brand_primary_color: string | null;
  brand_accent_color: string | null;
  // Investment Intelligence Fields
  target_buyer_profile: string | null;
  investment_reputation: string | null;
  total_value_delivered: number | null;
  market_share_percent: number | null;
  avg_delivery_months: number | null;
  on_time_delivery_rate: number | null;
  brand_partnerships: Json;
}

export interface DeveloperProject {
  id: string;
  developer_id: string;
  name: string;
  slug: string;
  location_area: string | null;
  project_type: string | null;
  status: string | null;
  completion_year: number | null;
  total_units: number | null;
  image_url: string | null;
  description: string | null;
  highlights: string[];
  is_flagship: boolean | null;
}

export function useDevelopers(tier?: string) {
  return useQuery({
    queryKey: ['developers', tier],
    queryFn: async () => {
      let query = supabase
        .from('developers')
        .select('*')
        .eq('is_active', true)
        .order('is_verified', { ascending: false })
        .order('total_projects', { ascending: false });

      if (tier && tier !== 'all') {
        query = query.eq('tier', tier);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as Developer[];
    },
  });
}

export function useDeveloper(slug: string) {
  return useQuery({
    queryKey: ['developer', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('developers')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data as unknown as Developer;
    },
    enabled: !!slug,
  });
}

export function useDeveloperProjects(developerId: string, status?: string) {
  return useQuery({
    queryKey: ['developer-projects', developerId, status],
    queryFn: async () => {
      let query = supabase
        .from('developer_projects')
        .select('*')
        .eq('developer_id', developerId)
        .order('is_flagship', { ascending: false })
        .order('completion_year', { ascending: false });

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as DeveloperProject[];
    },
    enabled: !!developerId,
  });
}

export function usePropertiesByDeveloper(developerId: string) {
  return useQuery({
    queryKey: ['properties-by-developer', developerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, slug, price_aed, location_area, images, bedrooms, size_sqft')
        .eq('developer_id', developerId)
        .eq('status', 'active')
        .limit(6);

      if (error) throw error;
      return data || [];
    },
    enabled: !!developerId,
  });
}
