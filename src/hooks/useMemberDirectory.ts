import { useState, useMemo, useCallback, useEffect } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DirectoryMember {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  country: string | null;
  membership_tier: 'free' | 'investor' | 'elite' | 'private';
  investment_goal: string | null;
  budget_range: string | null;
  timeline: string | null;
  bio: string | null;
  looking_for: string | null;
  created_at: string;
}

export interface DirectoryFilters {
  search: string;
  country: string | null;
  membershipTier: string | null;
  investmentGoal: string | null;
  budgetRange: string | null;
  timeline: string | null;
}

interface FilterOptions {
  countries: string[];
  investmentGoals: string[];
  budgetRanges: string[];
  timelines: string[];
}

type SortOption = 'newest' | 'alphabetical';

const PAGE_SIZE = 20;

// Debounce hook for search
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export function useMemberDirectory() {
  const [filters, setFilters] = useState<DirectoryFilters>({
    search: '',
    country: null,
    membershipTier: null,
    investmentGoal: null,
    budgetRange: null,
    timeline: null,
  });
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Debounce search to avoid too many API calls
  const debouncedSearch = useDebounce(filters.search, 300);

  // Fetch filter options separately (cached)
  const { data: filterOptions = { countries: [], investmentGoals: [], budgetRanges: [], timelines: [] } } = useQuery({
    queryKey: ['directory-filter-options'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_directory_filter_options');
      if (error) throw error;
      const result = data as unknown as FilterOptions;
      return result || { countries: [], investmentGoals: [], budgetRanges: [], timelines: [] };
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Infinite query for paginated members
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: membersLoading,
    refetch: refetchMembers,
  } = useInfiniteQuery({
    queryKey: ['directory-members-paginated', debouncedSearch, filters.country, filters.membershipTier, filters.investmentGoal, sortBy],
    queryFn: async ({ pageParam = 0 }) => {
      const { data, error } = await supabase.rpc('get_directory_members_paginated', {
        p_limit: PAGE_SIZE,
        p_offset: pageParam,
        p_search: debouncedSearch || null,
        p_country: filters.country,
        p_membership_tier: filters.membershipTier,
        p_investment_goal: filters.investmentGoal,
        p_sort_by: sortBy,
      });

      if (error) throw error;
      
      const members = (data || []) as (DirectoryMember & { total_count: number })[];
      const totalCount = members[0]?.total_count || 0;

      return {
        members: members.map(({ total_count, ...member }) => member as DirectoryMember),
        totalCount,
        nextOffset: pageParam + PAGE_SIZE,
        hasMore: pageParam + PAGE_SIZE < totalCount,
      };
    },
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextOffset : undefined,
    initialPageParam: 0,
  });

  // Flatten all pages into single array
  const members = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap(page => page.members);
  }, [data]);

  // Get total count from first page
  const totalCount = data?.pages[0]?.totalCount || 0;

  // Client-side filtering for budget/timeline (not in DB query for simplicity)
  const filteredMembers = useMemo(() => {
    let result = [...members];

    if (filters.budgetRange) {
      result = result.filter(m => m.budget_range === filters.budgetRange);
    }

    if (filters.timeline) {
      result = result.filter(m => m.timeline === filters.timeline);
    }

    return result;
  }, [members, filters.budgetRange, filters.timeline]);

  const updateFilter = useCallback(<K extends keyof DirectoryFilters>(key: K, value: DirectoryFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      country: null,
      membershipTier: null,
      investmentGoal: null,
      budgetRange: null,
      timeline: null,
    });
  }, []);

  const hasActiveFilters = Object.values(filters).some(v => v !== null && v !== '');

  // Load more function for infinite scroll
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return {
    members: filteredMembers,
    totalCount,
    membersLoading,
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    filterOptions,
    sortBy,
    setSortBy,
    refetchMembers,
    // Infinite scroll props
    loadMore,
    hasNextPage: hasNextPage || false,
    isFetchingNextPage,
  };
}