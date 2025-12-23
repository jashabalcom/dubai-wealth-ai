import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PropertyFilters {
  search: string;
  locationArea: string;
  propertyType: string;
  listingType: string;
  source: 'all' | 'bayut' | 'manual';
  hasImages: 'all' | 'yes' | 'no';
  hasCoords: 'all' | 'yes' | 'no';
  isPublished: 'all' | 'yes' | 'no';
  status: string;
}

export interface PropertyStats {
  total: number;
  forSale: number;
  forRent: number;
  published: number;
  unpublished: number;
  withImages: number;
  withoutImages: number;
  withCoords: number;
  withoutCoords: number;
  bayutSynced: number;
  manual: number;
}

const PAGE_SIZE_OPTIONS = [25, 50, 100] as const;
const DEFAULT_PAGE_SIZE = 50;

export function useAdminProperties() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<PropertyFilters>({
    search: '',
    locationArea: '',
    propertyType: '',
    listingType: '',
    source: 'all',
    hasImages: 'all',
    hasCoords: 'all',
    isPublished: 'all',
    status: '',
  });

  // Fetch stats (unfiltered totals)
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-properties-stats'],
    queryFn: async (): Promise<PropertyStats> => {
      const { data, error } = await supabase
        .from('properties')
        .select('id, listing_type, is_published, external_id, latitude, longitude, images, gallery_urls');
      
      if (error) throw error;
      
      const properties = data || [];
      const hasImages = (p: typeof properties[0]) => {
        const imgs = p.images as any[] | null;
        const gallery = p.gallery_urls as any[] | null;
        return (imgs && imgs.length > 0) || (gallery && gallery.length > 0);
      };
      
      return {
        total: properties.length,
        forSale: properties.filter(p => p.listing_type === 'sale').length,
        forRent: properties.filter(p => p.listing_type === 'rent').length,
        published: properties.filter(p => p.is_published).length,
        unpublished: properties.filter(p => !p.is_published).length,
        withImages: properties.filter(hasImages).length,
        withoutImages: properties.filter(p => !hasImages(p)).length,
        withCoords: properties.filter(p => p.latitude && p.longitude).length,
        withoutCoords: properties.filter(p => !p.latitude || !p.longitude).length,
        bayutSynced: properties.filter(p => p.external_id).length,
        manual: properties.filter(p => !p.external_id).length,
      };
    },
  });

  // Fetch unique location areas for filter dropdown
  const { data: locationAreas = [] } = useQuery({
    queryKey: ['admin-properties-areas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('location_area')
        .not('location_area', 'is', null)
        .order('location_area');
      
      if (error) throw error;
      const unique = [...new Set(data.map(p => p.location_area).filter(Boolean))];
      return unique as string[];
    },
  });

  // Fetch properties with pagination and filters
  const { data: propertiesData, isLoading, refetch } = useQuery({
    queryKey: ['admin-properties', page, pageSize, filters],
    queryFn: async () => {
      let query = supabase
        .from('properties')
        .select(`
          *,
          agent:agents(id, full_name),
          brokerage:brokerages(id, name),
          community:communities(id, name)
        `, { count: 'exact' });

      // Apply filters
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,location_area.ilike.%${filters.search}%,developer_name.ilike.%${filters.search}%`);
      }
      if (filters.locationArea) {
        query = query.eq('location_area', filters.locationArea);
      }
      if (filters.propertyType) {
        query = query.eq('property_type', filters.propertyType);
      }
      if (filters.listingType) {
        query = query.eq('listing_type', filters.listingType);
      }
      if (filters.source === 'bayut') {
        query = query.not('external_id', 'is', null);
      } else if (filters.source === 'manual') {
        query = query.is('external_id', null);
      }
      if (filters.hasCoords === 'yes') {
        query = query.not('latitude', 'is', null).not('longitude', 'is', null);
      } else if (filters.hasCoords === 'no') {
        query = query.or('latitude.is.null,longitude.is.null');
      }
      if (filters.isPublished === 'yes') {
        query = query.eq('is_published', true);
      } else if (filters.isPublished === 'no') {
        query = query.eq('is_published', false);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      // Pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      return { properties: data || [], total: count || 0 };
    },
  });

  const properties = propertiesData?.properties || [];
  const totalCount = propertiesData?.total || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Bulk actions
  const bulkPublish = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from('properties')
        .update({ is_published: true })
        .in('id', ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      queryClient.invalidateQueries({ queryKey: ['admin-properties-stats'] });
      toast.success(`${selectedIds.size} properties published`);
      setSelectedIds(new Set());
    },
    onError: (error) => toast.error('Failed to publish: ' + error.message),
  });

  const bulkUnpublish = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from('properties')
        .update({ is_published: false })
        .in('id', ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      queryClient.invalidateQueries({ queryKey: ['admin-properties-stats'] });
      toast.success(`${selectedIds.size} properties unpublished`);
      setSelectedIds(new Set());
    },
    onError: (error) => toast.error('Failed to unpublish: ' + error.message),
  });

  const bulkDelete = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from('properties')
        .delete()
        .in('id', ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      queryClient.invalidateQueries({ queryKey: ['admin-properties-stats'] });
      toast.success(`${selectedIds.size} properties deleted`);
      setSelectedIds(new Set());
    },
    onError: (error) => toast.error('Failed to delete: ' + error.message),
  });

  const bulkAssignAgent = useMutation({
    mutationFn: async ({ ids, agentId }: { ids: string[]; agentId: string | null }) => {
      const { error } = await supabase
        .from('properties')
        .update({ agent_id: agentId })
        .in('id', ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      toast.success(`Agent assigned to ${selectedIds.size} properties`);
      setSelectedIds(new Set());
    },
    onError: (error) => toast.error('Failed to assign agent: ' + error.message),
  });

  // Selection helpers
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(properties.map(p => p.id)));
  }, [properties]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const updateFilter = useCallback((key: keyof PropertyFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page on filter change
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      locationArea: '',
      propertyType: '',
      listingType: '',
      source: 'all',
      hasImages: 'all',
      hasCoords: 'all',
      isPublished: 'all',
      status: '',
    });
    setPage(1);
  }, []);

  return {
    // Data
    properties,
    stats,
    totalCount,
    locationAreas,
    
    // Loading states
    isLoading,
    statsLoading,
    
    // Pagination
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    PAGE_SIZE_OPTIONS,
    
    // Filters
    filters,
    updateFilter,
    clearFilters,
    
    // Selection
    selectedIds,
    toggleSelect,
    selectAll,
    clearSelection,
    
    // Bulk actions
    bulkPublish,
    bulkUnpublish,
    bulkDelete,
    bulkAssignAgent,
    
    // Refresh
    refetch,
  };
}
