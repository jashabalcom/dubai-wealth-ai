import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import {
  DataRegistryEntry,
  AreaMarketData,
  DataSource,
  DataVerificationLog,
  DataCategory,
  DataConfidenceLevel,
  DEFAULT_DLD_FEES,
  DEFAULT_MORTGAGE_FEES,
  DEFAULT_GOLDEN_VISA,
  DEFAULT_EXIT_COSTS,
  DEFAULT_RENTAL_COSTS,
  DEFAULT_STR_COSTS,
  extractValue,
  isDataStale,
} from '@/lib/dataRegistry';

// Fetch all data sources
export function useDataSources() {
  return useQuery({
    queryKey: ['data-sources'],
    queryFn: async (): Promise<DataSource[]> => {
      const { data, error } = await supabase
        .from('data_sources')
        .select('*')
        .eq('is_active', true)
        .order('credibility_score', { ascending: false });

      if (error) throw error;
      return (data || []) as DataSource[];
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

// Fetch data registry by category
export function useDataRegistry(category?: DataCategory) {
  return useQuery({
    queryKey: ['data-registry', category],
    queryFn: async (): Promise<DataRegistryEntry[]> => {
      let query = supabase
        .from('dubai_data_registry')
        .select('*')
        .eq('is_active', true);

      if (category) {
        query = query.eq('data_category', category);
      }

      const { data, error } = await query.order('data_key');

      if (error) throw error;
      return (data || []) as DataRegistryEntry[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Fetch specific data entry by key
export function useDataEntry(dataKey: string, category: DataCategory) {
  return useQuery({
    queryKey: ['data-entry', dataKey, category],
    queryFn: async (): Promise<DataRegistryEntry | null> => {
      const { data, error } = await supabase
        .from('dubai_data_registry')
        .select('*')
        .eq('data_key', dataKey)
        .eq('data_category', category)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data as DataRegistryEntry;
    },
    staleTime: 1000 * 60 * 5,
  });
}

// Fetch all area market data
export function useAreaMarketData() {
  return useQuery({
    queryKey: ['area-market-data'],
    queryFn: async (): Promise<AreaMarketData[]> => {
      const { data, error } = await supabase
        .from('area_market_data')
        .select('*')
        .eq('is_active', true)
        .order('area_name');

      if (error) throw error;
      return (data || []) as AreaMarketData[];
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Fetch specific area market data
export function useAreaData(areaName: string) {
  return useQuery({
    queryKey: ['area-data', areaName],
    queryFn: async (): Promise<AreaMarketData | null> => {
      const { data, error } = await supabase
        .from('area_market_data')
        .select('*')
        .ilike('area_name', areaName)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data as AreaMarketData;
    },
    staleTime: 1000 * 60 * 10,
  });
}

// Fetch verification logs for a data entry
export function useVerificationLogs(dataRegistryId: string) {
  return useQuery({
    queryKey: ['verification-logs', dataRegistryId],
    queryFn: async (): Promise<DataVerificationLog[]> => {
      const { data, error } = await supabase
        .from('data_verification_logs')
        .select('*')
        .eq('data_registry_id', dataRegistryId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as DataVerificationLog[];
    },
  });
}

// Hook for DLD fees with fallback
export function useDLDFees() {
  const { data, isLoading, error } = useDataRegistry('dld_fees');

  const fees = data?.reduce((acc, entry) => {
    acc[entry.data_key] = {
      value: extractValue(entry.value_json as Record<string, unknown>),
      unit: entry.unit,
      source: entry.source_name,
      sourceUrl: entry.source_url,
      confidence: entry.confidence_level,
      verifiedAt: entry.verified_at,
      isStale: isDataStale(entry.expires_at),
    };
    return acc;
  }, {} as Record<string, { value: number; unit: string | null; source: string | null; sourceUrl: string | null; confidence: DataConfidenceLevel; verifiedAt: string | null; isStale: boolean }>);

  return {
    fees: fees || Object.entries(DEFAULT_DLD_FEES).reduce((acc, [key, val]) => {
      acc[key] = { ...val, source: 'Fallback', sourceUrl: null, confidence: 'estimated' as const, verifiedAt: null, isStale: true };
      return acc;
    }, {} as typeof fees),
    isLoading,
    error,
    usingFallback: !data || data.length === 0,
  };
}

// Hook for mortgage fees with fallback
export function useMortgageFees() {
  const { data, isLoading, error } = useDataRegistry('mortgage_fees');

  const fees = data?.reduce((acc, entry) => {
    acc[entry.data_key] = {
      value: extractValue(entry.value_json as Record<string, unknown>),
      unit: entry.unit,
      source: entry.source_name,
      sourceUrl: entry.source_url,
      confidence: entry.confidence_level,
      verifiedAt: entry.verified_at,
      isStale: isDataStale(entry.expires_at),
    };
    return acc;
  }, {} as Record<string, { value: number; unit: string | null; source: string | null; sourceUrl: string | null; confidence: DataConfidenceLevel; verifiedAt: string | null; isStale: boolean }>);

  return {
    fees: fees || Object.entries(DEFAULT_MORTGAGE_FEES).reduce((acc, [key, val]) => {
      acc[key] = { ...val, source: 'Fallback', sourceUrl: null, confidence: 'estimated' as const, verifiedAt: null, isStale: true };
      return acc;
    }, {} as typeof fees),
    isLoading,
    error,
    usingFallback: !data || data.length === 0,
  };
}

// Hook for Golden Visa rules with fallback
export function useGoldenVisaRules() {
  const { data, isLoading, error } = useDataRegistry('golden_visa');

  const rules = data?.reduce((acc, entry) => {
    const valueJson = entry.value_json as Record<string, unknown>;
    acc[entry.data_key] = {
      value: valueJson.value,
      note: valueJson.note as string | undefined,
      source: entry.source_name,
      sourceUrl: entry.source_url,
      confidence: entry.confidence_level,
      verifiedAt: entry.verified_at,
      isStale: isDataStale(entry.expires_at),
      isCritical: entry.is_critical,
    };
    return acc;
  }, {} as Record<string, { value: unknown; note?: string; source: string | null; sourceUrl: string | null; confidence: DataConfidenceLevel; verifiedAt: string | null; isStale: boolean; isCritical: boolean }>);

  const threshold = rules?.golden_visa_property_threshold?.value as number || DEFAULT_GOLDEN_VISA.golden_visa_property_threshold.value;

  return {
    rules,
    threshold,
    isLoading,
    error,
    usingFallback: !data || data.length === 0,
  };
}

// Hook for exit costs with fallback
export function useExitCosts() {
  const { data, isLoading, error } = useDataRegistry('exit_costs');

  const costs = data?.reduce((acc, entry) => {
    acc[entry.data_key] = {
      value: extractValue(entry.value_json as Record<string, unknown>),
      unit: entry.unit,
      source: entry.source_name,
      sourceUrl: entry.source_url,
      confidence: entry.confidence_level,
      verifiedAt: entry.verified_at,
      isStale: isDataStale(entry.expires_at),
    };
    return acc;
  }, {} as Record<string, { value: number; unit: string | null; source: string | null; sourceUrl: string | null; confidence: DataConfidenceLevel; verifiedAt: string | null; isStale: boolean }>);

  return {
    costs: costs || Object.entries(DEFAULT_EXIT_COSTS).reduce((acc, [key, val]) => {
      acc[key] = { ...val, source: 'Fallback', sourceUrl: null, confidence: 'estimated' as const, verifiedAt: null, isStale: true };
      return acc;
    }, {} as typeof costs),
    isLoading,
    error,
    usingFallback: !data || data.length === 0,
  };
}

// Hook for rental costs with fallback
export function useRentalCosts() {
  const { data, isLoading, error } = useDataRegistry('rental_costs');

  const costs = data?.reduce((acc, entry) => {
    acc[entry.data_key] = {
      value: extractValue(entry.value_json as Record<string, unknown>),
      unit: entry.unit,
      source: entry.source_name,
      sourceUrl: entry.source_url,
      confidence: entry.confidence_level,
      verifiedAt: entry.verified_at,
      isStale: isDataStale(entry.expires_at),
    };
    return acc;
  }, {} as Record<string, { value: number; unit: string | null; source: string | null; sourceUrl: string | null; confidence: DataConfidenceLevel; verifiedAt: string | null; isStale: boolean }>);

  return {
    costs: costs || Object.entries(DEFAULT_RENTAL_COSTS).reduce((acc, [key, val]) => {
      acc[key] = { ...val, source: 'Fallback', sourceUrl: null, confidence: 'estimated' as const, verifiedAt: null, isStale: true };
      return acc;
    }, {} as typeof costs),
    isLoading,
    error,
    usingFallback: !data || data.length === 0,
  };
}

// Hook for short-term rental costs with fallback
export function useSTRCosts() {
  const { data, isLoading, error } = useDataRegistry('str_costs');

  const costs = data?.reduce((acc, entry) => {
    acc[entry.data_key] = {
      value: extractValue(entry.value_json as Record<string, unknown>),
      unit: entry.unit,
      source: entry.source_name,
      sourceUrl: entry.source_url,
      confidence: entry.confidence_level,
      verifiedAt: entry.verified_at,
      isStale: isDataStale(entry.expires_at),
    };
    return acc;
  }, {} as Record<string, { value: number; unit: string | null; source: string | null; sourceUrl: string | null; confidence: DataConfidenceLevel; verifiedAt: string | null; isStale: boolean }>);

  return {
    costs: costs || Object.entries(DEFAULT_STR_COSTS).reduce((acc, [key, val]) => {
      acc[key] = { ...val, source: 'Fallback', sourceUrl: null, confidence: 'estimated' as const, verifiedAt: null, isStale: true };
      return acc;
    }, {} as typeof costs),
    isLoading,
    error,
    usingFallback: !data || data.length === 0,
  };
}

// Admin: Update data entry
export function useUpdateDataEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      updates, 
      verificationMethod,
      notes 
    }: { 
      id: string; 
      updates: {
        value_json?: Record<string, unknown>;
        source_name?: string;
        source_url?: string;
        confidence_level?: DataConfidenceLevel;
        verified_at?: string;
        expires_at?: string;
      };
      verificationMethod?: string;
      notes?: string;
    }) => {
      // Get current entry for logging
      const { data: currentEntry } = await supabase
        .from('dubai_data_registry')
        .select('*')
        .eq('id', id)
        .single();

      // Prepare update payload - only include defined fields
      const updatePayload: Record<string, unknown> = {};
      if (updates.value_json !== undefined) updatePayload.value_json = updates.value_json;
      if (updates.source_name !== undefined) updatePayload.source_name = updates.source_name;
      if (updates.source_url !== undefined) updatePayload.source_url = updates.source_url;
      if (updates.confidence_level !== undefined) updatePayload.confidence_level = updates.confidence_level;
      if (updates.verified_at !== undefined) updatePayload.verified_at = updates.verified_at;
      if (updates.expires_at !== undefined) updatePayload.expires_at = updates.expires_at;
      updatePayload.version = (currentEntry?.version || 0) + 1;

      // Update the entry
      const { data, error } = await supabase
        .from('dubai_data_registry')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Create verification log
      if (currentEntry) {
        await supabase.from('data_verification_logs').insert([{
          data_registry_id: id,
          action: 'update',
          old_value: currentEntry.value_json as Json,
          new_value: (updates.value_json || currentEntry.value_json) as Json,
          verification_method: verificationMethod,
          notes,
        }]);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-registry'] });
      queryClient.invalidateQueries({ queryKey: ['data-entry'] });
    },
  });
}

// Admin: Update area market data
export function useUpdateAreaData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string; 
      updates: {
        avg_price_sqft?: number;
        avg_yield?: number;
        service_charge_sqft?: number;
        chiller_monthly?: number;
        has_district_cooling?: boolean;
        confidence_level?: DataConfidenceLevel;
        verified_at?: string;
        expires_at?: string;
      };
    }) => {
      const { data, error } = await supabase
        .from('area_market_data')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['area-market-data'] });
      queryClient.invalidateQueries({ queryKey: ['area-data'] });
    },
  });
}

// Get expiring data (for admin alerts)
export function useExpiringData(daysThreshold: number = 14) {
  return useQuery({
    queryKey: ['expiring-data', daysThreshold],
    queryFn: async () => {
      const thresholdDate = new Date();
      thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

      const { data, error } = await supabase
        .from('dubai_data_registry')
        .select('*')
        .eq('is_active', true)
        .lte('expires_at', thresholdDate.toISOString())
        .order('expires_at');

      if (error) throw error;
      return (data || []) as DataRegistryEntry[];
    },
    staleTime: 1000 * 60 * 5,
  });
}

// Get stale data (expired)
export function useStaleData() {
  return useQuery({
    queryKey: ['stale-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dubai_data_registry')
        .select('*')
        .eq('is_active', true)
        .lt('expires_at', new Date().toISOString())
        .order('expires_at');

      if (error) throw error;
      return (data || []) as DataRegistryEntry[];
    },
    staleTime: 1000 * 60 * 5,
  });
}
