import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const PAGE_SIZE = 24;

export interface PropertyFilters {
  search?: string;
  area?: string;
  type?: string;
  bedrooms?: number;
  priceMin?: number;
  priceMax?: number;
  offPlanOnly?: boolean;
  goldenVisaOnly?: boolean;
  yieldMin?: number;
  sortBy?: string;
  developer?: string;
}

export interface Property {
  id: string;
  title: string;
  slug: string;
  location_area: string;
  property_type: string;
  developer_name: string;
  is_off_plan: boolean;
  status: string;
  price_aed: number;
  bedrooms: number;
  bathrooms: number;
  size_sqft: number;
  rental_yield_estimate: number;
  images: string[];
  completion_date: string | null;
  is_featured: boolean;
  latitude?: number;
  longitude?: number;
  views_count?: number | null;
  inquiries_count?: number | null;
  created_at?: string;
}

interface UsePropertiesReturn {
  properties: Property[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  totalCount: number;
  loadMore: () => void;
  refresh: () => void;
  propertyCounts: Record<string, number>;
  developerCounts: Record<string, number>;
}

export function useProperties(filters: PropertyFilters): UsePropertiesReturn {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [propertyCounts, setPropertyCounts] = useState<Record<string, number>>({});
  const [developerCounts, setDeveloperCounts] = useState<Record<string, number>>({});
  
  const offsetRef = useRef(0);
  const filtersRef = useRef(filters);

  // Build query with filters
  const buildQuery = useCallback((countOnly = false) => {
    let query = supabase
      .from('properties')
      .select(countOnly ? '*' : '*', { count: 'exact' })
      .eq('status', 'available');

    // Search filter
    if (filters.search && filters.search.trim()) {
      const searchTerm = `%${filters.search.trim()}%`;
      query = query.or(`title.ilike.${searchTerm},location_area.ilike.${searchTerm},developer_name.ilike.${searchTerm}`);
    }

    // Area filter
    if (filters.area && filters.area !== 'All Areas') {
      query = query.eq('location_area', filters.area);
    }

    // Property type filter
    if (filters.type && filters.type !== 'all') {
      query = query.eq('property_type', filters.type);
    }

    // Bedrooms filter
    if (filters.bedrooms !== undefined && filters.bedrooms >= 0) {
      if (filters.bedrooms >= 4) {
        query = query.gte('bedrooms', 4);
      } else {
        query = query.eq('bedrooms', filters.bedrooms);
      }
    }

    // Price range filter
    if (filters.priceMin !== undefined) {
      query = query.gte('price_aed', filters.priceMin);
    }
    if (filters.priceMax !== undefined) {
      query = query.lt('price_aed', filters.priceMax);
    }

    // Off-plan only filter
    if (filters.offPlanOnly) {
      query = query.eq('is_off_plan', true);
    }

    // Golden visa filter (price >= 2M AED)
    if (filters.goldenVisaOnly) {
      query = query.gte('price_aed', 2000000);
    }

    // Yield filter
    if (filters.yieldMin !== undefined && filters.yieldMin > 0) {
      query = query.gte('rental_yield_estimate', filters.yieldMin);
    }

    // Developer filter
    if (filters.developer && filters.developer.trim()) {
      query = query.ilike('developer_name', `%${filters.developer.trim()}%`);
    }

    return query;
  }, [filters]);

  // Apply sorting
  const applySorting = useCallback((query: any) => {
    switch (filters.sortBy) {
      case 'price-asc':
        return query.order('price_aed', { ascending: true });
      case 'price-desc':
        return query.order('price_aed', { ascending: false });
      case 'yield-desc':
        return query.order('rental_yield_estimate', { ascending: false });
      case 'size-desc':
        return query.order('size_sqft', { ascending: false });
      case 'newest':
        return query.order('created_at', { ascending: false });
      case 'score-desc':
        // Score requires client-side calculation, so we order by yield as proxy
        return query.order('rental_yield_estimate', { ascending: false });
      default:
        // Featured first, then by created_at
        return query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
    }
  }, [filters.sortBy]);

  // Fetch initial properties
  const fetchProperties = useCallback(async (reset = true) => {
    if (reset) {
      setIsLoading(true);
      offsetRef.current = 0;
    } else {
      setIsLoadingMore(true);
    }

    try {
      let query = buildQuery();
      query = applySorting(query);
      query = query.range(offsetRef.current, offsetRef.current + PAGE_SIZE - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching properties:', error);
        return;
      }

      const mappedData: Property[] = (data || []).map(p => ({
        ...p,
        images: Array.isArray(p.images) ? (p.images as string[]) : [],
        price_aed: Number(p.price_aed),
        size_sqft: Number(p.size_sqft),
        rental_yield_estimate: Number(p.rental_yield_estimate),
        latitude: p.latitude ? Number(p.latitude) : undefined,
        longitude: p.longitude ? Number(p.longitude) : undefined,
      }));

      if (reset) {
        setProperties(mappedData);
        setTotalCount(count || 0);
      } else {
        setProperties(prev => [...prev, ...mappedData]);
      }

      setHasMore(mappedData.length === PAGE_SIZE);
      offsetRef.current += mappedData.length;
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [buildQuery, applySorting]);

  // Fetch area and developer counts using server-side aggregation
  const fetchCounts = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('get_property_counts');
      
      if (error) {
        console.error('Error fetching property counts:', error);
        return;
      }

      if (data && data.length > 0) {
        const { area_counts, developer_counts } = data[0];
        if (area_counts) {
          setPropertyCounts(area_counts as Record<string, number>);
        }
        if (developer_counts) {
          setDeveloperCounts(developer_counts as Record<string, number>);
        }
      }
    } catch (error) {
      console.error('Error fetching property counts:', error);
    }
  }, []);

  // Load more function with error handling
  const loadMore = useCallback(async () => {
    if (!isLoadingMore && hasMore) {
      try {
        await fetchProperties(false);
      } catch (error) {
        console.error('Error loading more properties:', error);
        toast({
          title: "Error loading properties",
          description: "Failed to load more properties. Please try again.",
          variant: "destructive",
        });
      }
    }
  }, [isLoadingMore, hasMore, fetchProperties]);

  // Refresh function
  const refresh = useCallback(() => {
    fetchProperties(true);
  }, [fetchProperties]);

  // Effect to fetch on filter change
  useEffect(() => {
    // Check if filters actually changed
    if (JSON.stringify(filtersRef.current) !== JSON.stringify(filters)) {
      filtersRef.current = filters;
      fetchProperties(true);
    }
  }, [filters, fetchProperties]);

  // Initial fetch
  useEffect(() => {
    fetchProperties(true);
    fetchCounts();
  }, []); // Only run once on mount

  return {
    properties,
    isLoading,
    isLoadingMore,
    hasMore,
    totalCount,
    loadMore,
    refresh,
    propertyCounts,
    developerCounts,
  };
}
