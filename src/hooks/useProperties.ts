import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const PAGE_SIZE = 24;
const GUEST_RESULT_LIMIT = 12; // Limit for non-logged-in users

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

interface Cursor {
  id: string;
  sortValue: number | string | boolean;
  secondarySortValue?: string;
}

interface UsePropertiesOptions {
  isAuthenticated?: boolean;
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
  isGuestLimited: boolean;
}

export function useProperties(filters: PropertyFilters, options: UsePropertiesOptions = {}): UsePropertiesReturn {
  const { isAuthenticated = true } = options;
  const effectivePageSize = isAuthenticated ? PAGE_SIZE : GUEST_RESULT_LIMIT;
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [propertyCounts, setPropertyCounts] = useState<Record<string, number>>({});
  const [developerCounts, setDeveloperCounts] = useState<Record<string, number>>({});
  
  const cursorRef = useRef<Cursor | null>(null);
  const filtersRef = useRef(filters);

  // Get sort configuration based on sortBy filter
  const getSortConfig = useCallback(() => {
    switch (filters.sortBy) {
      case 'price-asc':
        return { column: 'price_aed', ascending: true };
      case 'price-desc':
        return { column: 'price_aed', ascending: false };
      case 'yield-desc':
        return { column: 'rental_yield_estimate', ascending: false };
      case 'size-desc':
        return { column: 'size_sqft', ascending: false };
      case 'newest':
        return { column: 'created_at', ascending: false };
      case 'score-desc':
        return { column: 'rental_yield_estimate', ascending: false };
      default:
        return { column: 'is_featured', ascending: false, secondary: 'created_at' };
    }
  }, [filters.sortBy]);

  // Build base query with filters (no pagination)
  const buildBaseQuery = useCallback(() => {
    let query = supabase
      .from('properties')
      .select('*', { count: 'exact' })
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

  // Apply cursor-based pagination
  const applyCursorPagination = useCallback((query: any, cursor: Cursor | null) => {
    const sortConfig = getSortConfig();
    
    if (cursor) {
      // For cursor-based pagination, we need to fetch items after the cursor
      // Using compound cursor: (sortValue, id) for stable pagination
      if (sortConfig.ascending) {
        // Ascending: get items where (sortValue > cursor.sortValue) OR (sortValue = cursor.sortValue AND id > cursor.id)
        query = query.or(
          `${sortConfig.column}.gt.${cursor.sortValue},and(${sortConfig.column}.eq.${cursor.sortValue},id.gt.${cursor.id})`
        );
      } else {
        // Descending: get items where (sortValue < cursor.sortValue) OR (sortValue = cursor.sortValue AND id > cursor.id)
        query = query.or(
          `${sortConfig.column}.lt.${cursor.sortValue},and(${sortConfig.column}.eq.${cursor.sortValue},id.gt.${cursor.id})`
        );
      }
    }

    // Apply sorting
    query = query.order(sortConfig.column, { ascending: sortConfig.ascending });
    
    // Secondary sort for featured (featured first, then by created_at)
    if (sortConfig.secondary) {
      query = query.order(sortConfig.secondary, { ascending: false });
    }
    
    // Always add id as final sort for stable cursor pagination
    query = query.order('id', { ascending: true });
    
    // Limit results - use guest limit if not authenticated
    query = query.limit(effectivePageSize);

    return query;
  }, [getSortConfig]);

  // Fetch properties with cursor-based pagination
  const fetchProperties = useCallback(async (reset = true) => {
    if (reset) {
      setIsLoading(true);
      cursorRef.current = null;
    } else {
      setIsLoadingMore(true);
    }

    try {
      let query = buildBaseQuery();
      query = applyCursorPagination(query, reset ? null : cursorRef.current);

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

      // Update cursor to last item for next page
      if (mappedData.length > 0) {
        const lastItem = mappedData[mappedData.length - 1];
        const sortConfig = getSortConfig();
        cursorRef.current = {
          id: lastItem.id,
          sortValue: lastItem[sortConfig.column as keyof Property] as number | string | boolean,
          secondarySortValue: sortConfig.secondary ? lastItem[sortConfig.secondary as keyof Property] as string : undefined,
        };
      }

      if (reset) {
        setProperties(mappedData);
        if (count !== null) {
          setTotalCount(count);
        }
      } else {
        setProperties(prev => [...prev, ...mappedData]);
      }

      // For guests, disable load more after first batch
      setHasMore(isAuthenticated && mappedData.length === effectivePageSize);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [buildBaseQuery, applyCursorPagination, getSortConfig]);

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
    isGuestLimited: !isAuthenticated && totalCount > GUEST_RESULT_LIMIT,
  };
}
