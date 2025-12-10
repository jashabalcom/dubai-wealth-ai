import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DirectoryMember {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  country: string | null;
  membership_tier: 'free' | 'investor' | 'elite';
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

type SortOption = 'newest' | 'alphabetical';

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

  // Fetch all directory-visible members using secure function
  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ['directory-members'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_directory_members');

      if (error) throw error;
      return (data || []) as DirectoryMember[];
    },
  });

  // Extract unique filter values
  const filterOptions = useMemo(() => {
    const countries = [...new Set(members.map(m => m.country).filter(Boolean))] as string[];
    const investmentGoals = [...new Set(members.map(m => m.investment_goal).filter(Boolean))] as string[];
    const budgetRanges = [...new Set(members.map(m => m.budget_range).filter(Boolean))] as string[];
    const timelines = [...new Set(members.map(m => m.timeline).filter(Boolean))] as string[];

    return { countries, investmentGoals, budgetRanges, timelines };
  }, [members]);

  // Filter and sort members
  const filteredMembers = useMemo(() => {
    let result = [...members];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(m =>
        m.full_name?.toLowerCase().includes(searchLower) ||
        m.bio?.toLowerCase().includes(searchLower) ||
        m.looking_for?.toLowerCase().includes(searchLower)
      );
    }

    // Country filter
    if (filters.country) {
      result = result.filter(m => m.country === filters.country);
    }

    // Membership tier filter
    if (filters.membershipTier) {
      result = result.filter(m => m.membership_tier === filters.membershipTier);
    }

    // Investment goal filter
    if (filters.investmentGoal) {
      result = result.filter(m => m.investment_goal === filters.investmentGoal);
    }

    // Budget range filter
    if (filters.budgetRange) {
      result = result.filter(m => m.budget_range === filters.budgetRange);
    }

    // Timeline filter
    if (filters.timeline) {
      result = result.filter(m => m.timeline === filters.timeline);
    }

    // Sort
    if (sortBy === 'alphabetical') {
      result.sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''));
    } else {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return result;
  }, [members, filters, sortBy]);

  const updateFilter = <K extends keyof DirectoryFilters>(key: K, value: DirectoryFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      country: null,
      membershipTier: null,
      investmentGoal: null,
      budgetRange: null,
      timeline: null,
    });
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== null && v !== '');

  return {
    members: filteredMembers,
    totalCount: members.length,
    membersLoading,
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    filterOptions,
    sortBy,
    setSortBy,
  };
}
