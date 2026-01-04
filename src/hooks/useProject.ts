import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Json } from '@/integrations/supabase/types';

export interface ProjectImage {
  id: string;
  project_id: string;
  url: string;
  category: string;
  is_primary: boolean;
  order_index: number;
  caption: string | null;
}

export interface ProjectFloorPlan {
  id: string;
  project_id: string;
  url: string;
  title: string;
  bedrooms: number | null;
  size_sqft: number | null;
  order_index: number;
}

export interface ProjectAmenity {
  id: string;
  project_id: string;
  name: string;
  category: string;
  icon: string | null;
  description: string | null;
}

export interface ProjectUnitType {
  id: string;
  project_id: string;
  name: string;
  bedrooms: number;
  bathrooms: number | null;
  size_sqft_min: number | null;
  size_sqft_max: number | null;
  price_from: number | null;
  price_to: number | null;
  availability_status: string;
  floor_plan_url: string | null;
  view_type: string | null;
  floor_range: string | null;
}

export interface ProjectPaymentPlan {
  id: string;
  project_id: string;
  name: string;
  down_payment_percent: number;
  during_construction_percent: number;
  on_handover_percent: number;
  post_handover_percent: number;
  post_handover_months: number;
  is_default: boolean;
}

export interface ProjectWithDetails {
  id: string;
  developer_id: string;
  name: string;
  slug: string;
  description: string | null;
  location_area: string | null;
  project_type: string | null;
  status: string | null;
  completion_year: number | null;
  total_units: number | null;
  image_url: string | null;
  is_flagship: boolean | null;
  highlights: Json;
  video_url: string | null;
  virtual_tour_url: string | null;
  brochure_url: string | null;
  starting_price: number | null;
  price_per_sqft_from: number | null;
  handover_date: string | null;
  launch_date: string | null;
  construction_progress_percent: number | null;
  latitude: number | null;
  longitude: number | null;
  master_plan_url: string | null;
  location_map_url: string | null;
  key_features: Json;
  bedrooms_range: string | null;
  total_value: number | null;
  // Investment Intelligence Fields
  investment_thesis: string | null;
  ideal_buyer_persona: string | null;
  capital_appreciation_rating: string | null;
  rental_yield_rating: string | null;
  risks_considerations: string | null;
  payment_plan_structure: string | null;
  unit_types: Json;
  amenities: Json;
  gallery_images: Json;
  sales_deck_url: string | null;
  min_investment_aed: number | null;
  developer?: {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    brand_primary_color: string | null;
    brand_accent_color: string | null;
  };
}

export interface UserSavedProject {
  id: string;
  user_id: string;
  project_id: string;
  notify_on_launch: boolean;
  notify_on_handover: boolean;
  notes: string | null;
  created_at: string;
}

export function useProject(slug: string) {
  return useQuery({
    queryKey: ['project', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('developer_projects')
        .select(`
          *,
          developer:developers(id, name, slug, logo_url, brand_primary_color, brand_accent_color)
        `)
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return data as unknown as ProjectWithDetails;
    },
    enabled: !!slug,
  });
}

export function useProjectImages(projectId: string) {
  return useQuery({
    queryKey: ['project-images', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_images')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return (data || []) as ProjectImage[];
    },
    enabled: !!projectId,
  });
}

export function useProjectFloorPlans(projectId: string) {
  return useQuery({
    queryKey: ['project-floor-plans', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_floor_plans')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return (data || []) as ProjectFloorPlan[];
    },
    enabled: !!projectId,
  });
}

export function useProjectAmenities(projectId: string) {
  return useQuery({
    queryKey: ['project-amenities', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_amenities')
        .select('*')
        .eq('project_id', projectId)
        .order('category', { ascending: true });

      if (error) throw error;
      return (data || []) as ProjectAmenity[];
    },
    enabled: !!projectId,
  });
}

export function useProjectUnitTypes(projectId: string) {
  return useQuery({
    queryKey: ['project-unit-types', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_unit_types')
        .select('*')
        .eq('project_id', projectId)
        .order('bedrooms', { ascending: true });

      if (error) throw error;
      return (data || []) as ProjectUnitType[];
    },
    enabled: !!projectId,
  });
}

export function useProjectPaymentPlans(projectId: string) {
  return useQuery({
    queryKey: ['project-payment-plans', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_payment_plans')
        .select('*')
        .eq('project_id', projectId)
        .order('is_default', { ascending: false });

      if (error) throw error;
      return (data || []) as ProjectPaymentPlan[];
    },
    enabled: !!projectId,
  });
}

export function useUserSavedProjects() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-saved-projects', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_saved_projects')
        .select(`
          *,
          project:developer_projects(
            id, name, slug, image_url, status, handover_date, launch_date,
            developer:developers(name, logo_url)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

export function useIsProjectSaved(projectId: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['is-project-saved', projectId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_saved_projects')
        .select('*')
        .eq('user_id', user.id)
        .eq('project_id', projectId)
        .maybeSingle();

      if (error) throw error;
      return data as UserSavedProject | null;
    },
    enabled: !!user && !!projectId,
  });
}

export function useSaveProject() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      projectId, 
      notifyOnLaunch = true, 
      notifyOnHandover = true,
      notes = ''
    }: { 
      projectId: string; 
      notifyOnLaunch?: boolean;
      notifyOnHandover?: boolean;
      notes?: string;
    }) => {
      if (!user) throw new Error('Must be logged in');
      
      const { data, error } = await supabase
        .from('user_saved_projects')
        .insert({
          user_id: user.id,
          project_id: projectId,
          notify_on_launch: notifyOnLaunch,
          notify_on_handover: notifyOnHandover,
          notes,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['is-project-saved', projectId] });
      queryClient.invalidateQueries({ queryKey: ['user-saved-projects'] });
    },
  });
}

export function useUnsaveProject() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (projectId: string) => {
      if (!user) throw new Error('Must be logged in');
      
      const { error } = await supabase
        .from('user_saved_projects')
        .delete()
        .eq('user_id', user.id)
        .eq('project_id', projectId);

      if (error) throw error;
    },
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({ queryKey: ['is-project-saved', projectId] });
      queryClient.invalidateQueries({ queryKey: ['user-saved-projects'] });
    },
  });
}

export function useUpdateSavedProject() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      projectId,
      notifyOnLaunch,
      notifyOnHandover,
      notes
    }: { 
      projectId: string;
      notifyOnLaunch?: boolean;
      notifyOnHandover?: boolean;
      notes?: string;
    }) => {
      if (!user) throw new Error('Must be logged in');
      
      const updateData: Partial<UserSavedProject> = {};
      if (notifyOnLaunch !== undefined) updateData.notify_on_launch = notifyOnLaunch;
      if (notifyOnHandover !== undefined) updateData.notify_on_handover = notifyOnHandover;
      if (notes !== undefined) updateData.notes = notes;

      const { data, error } = await supabase
        .from('user_saved_projects')
        .update(updateData)
        .eq('user_id', user.id)
        .eq('project_id', projectId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['is-project-saved', projectId] });
      queryClient.invalidateQueries({ queryKey: ['user-saved-projects'] });
    },
  });
}
