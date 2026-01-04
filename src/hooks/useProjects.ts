import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ProjectFilters {
  search?: string;
  area?: string;
  priceMin?: number;
  priceMax?: number;
  bedrooms?: string;
  status?: string;
  developerId?: string;
  handoverYear?: number;
  sortBy?: string;
}

export interface ProjectWithDeveloper {
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
  highlights: string[] | null;
  is_flagship: boolean | null;
  starting_price: number | null;
  price_per_sqft_from: number | null;
  bedrooms_range: string | null;
  handover_date: string | null;
  virtual_tour_url: string | null;
  video_url: string | null;
  brochure_url: string | null;
  latitude: number | null;
  longitude: number | null;
  construction_progress_percent: number | null;
  key_features: string[] | null;
  launch_date: string | null;
  // Investment Intelligence Fields
  investment_thesis: string | null;
  ideal_buyer_persona: string | null;
  capital_appreciation_rating: string | null;
  rental_yield_rating: string | null;
  risks_considerations: string | null;
  payment_plan_structure: string | null;
  unit_types: string[] | null;
  amenities: string[] | null;
  gallery_images: string[] | null;
  sales_deck_url: string | null;
  min_investment_aed: number | null;
  developer: {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
  } | null;
}

const PAGE_SIZE = 12;

export function useProjects(filters: ProjectFilters = {}) {
  return useInfiniteQuery({
    queryKey: ['projects', filters],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from('developer_projects')
        .select(`
          id,
          developer_id,
          name,
          slug,
          location_area,
          project_type,
          status,
          completion_year,
          total_units,
          image_url,
          description,
          highlights,
          is_flagship,
          starting_price,
          price_per_sqft_from,
          bedrooms_range,
          handover_date,
          virtual_tour_url,
          brochure_url,
          latitude,
          longitude,
          construction_progress_percent,
          key_features,
          developer:developers!developer_projects_developer_id_fkey(
            id,
            name,
            slug,
            logo_url
          )
        `)
        .range(pageParam * PAGE_SIZE, (pageParam + 1) * PAGE_SIZE - 1);

      // Apply search filter
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,location_area.ilike.%${filters.search}%`);
      }

      // Apply area filter
      if (filters.area && filters.area !== 'All Areas') {
        query = query.ilike('location_area', `%${filters.area}%`);
      }

      // Apply status filter
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      // Apply developer filter
      if (filters.developerId) {
        query = query.eq('developer_id', filters.developerId);
      }

      // Apply price filters
      if (filters.priceMin) {
        query = query.gte('starting_price', filters.priceMin);
      }
      if (filters.priceMax && filters.priceMax !== Infinity) {
        query = query.lte('starting_price', filters.priceMax);
      }

      // Apply handover year filter
      if (filters.handoverYear) {
        query = query.eq('completion_year', filters.handoverYear);
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'price-asc':
          query = query.order('starting_price', { ascending: true, nullsFirst: false });
          break;
        case 'price-desc':
          query = query.order('starting_price', { ascending: false, nullsFirst: false });
          break;
        case 'handover':
          query = query.order('completion_year', { ascending: true, nullsFirst: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        default:
          // Featured: flagship first, then by status priority
          query = query
            .order('is_flagship', { ascending: false })
            .order('status', { ascending: true })
            .order('completion_year', { ascending: true });
      }

      const { data, error } = await query;
      if (error) throw error;

      // Filter by bedrooms if specified (done client-side since bedrooms_range is text)
      let filteredData = (data || []) as unknown as ProjectWithDeveloper[];
      
      if (filters.bedrooms && filters.bedrooms !== 'all') {
        filteredData = filteredData.filter(project => {
          if (!project.bedrooms_range) return false;
          const range = project.bedrooms_range.toLowerCase();
          
          if (filters.bedrooms === 'studio') {
            return range.includes('studio') || range.includes('0');
          }
          if (filters.bedrooms === '4+') {
            return range.includes('4') || range.includes('5') || range.includes('6') || range.includes('7');
          }
          return range.includes(filters.bedrooms!);
        });
      }

      return {
        projects: filteredData,
        nextPage: filteredData.length === PAGE_SIZE ? pageParam + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
  });
}

export function useProjectAreas() {
  return useQuery({
    queryKey: ['project-areas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('developer_projects')
        .select('location_area')
        .not('location_area', 'is', null);

      if (error) throw error;

      // Get unique areas
      const areas = [...new Set(data?.map(p => p.location_area).filter(Boolean))] as string[];
      return ['All Areas', ...areas.sort()];
    },
  });
}

export function useProjectDevelopers() {
  return useQuery({
    queryKey: ['project-developers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('developers')
        .select('id, name, slug, logo_url')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data || [];
    },
  });
}

export function useProjectHandoverYears() {
  return useQuery({
    queryKey: ['project-handover-years'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('developer_projects')
        .select('completion_year')
        .not('completion_year', 'is', null)
        .order('completion_year');

      if (error) throw error;

      const years = [...new Set(data?.map(p => p.completion_year).filter(Boolean))] as number[];
      return years.sort((a, b) => a - b);
    },
  });
}

export function useProject(slug: string) {
  return useQuery({
    queryKey: ['project', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('developer_projects')
        .select(`
          *,
          developer:developers!developer_projects_developer_id_fkey(
            id,
            name,
            slug,
            logo_url,
            description,
            website,
            is_verified
          )
        `)
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return data as unknown as ProjectWithDeveloper;
    },
    enabled: !!slug,
  });
}
