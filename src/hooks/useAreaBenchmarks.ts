import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AreaBenchmark {
  id: string;
  area_name: string;
  avg_price_sqft: number;
  avg_yield: number;
  data_source: string;
  source_url: string | null;
  data_as_of: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

// Default fallback for areas not in database
const DEFAULT_BENCHMARK = { avgPriceSqft: 1200, avgYield: 6.5 };

export function useAreaBenchmarks() {
  return useQuery({
    queryKey: ["area-benchmarks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("area_benchmarks")
        .select("*")
        .order("area_name");

      if (error) throw error;
      return data as AreaBenchmark[];
    },
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
  });
}

export function useAreaBenchmark(areaName: string) {
  const { data: benchmarks, isLoading } = useAreaBenchmarks();

  const benchmark = benchmarks?.find(
    (b) => b.area_name.toLowerCase() === areaName.toLowerCase()
  );

  return {
    benchmark: benchmark
      ? {
          avgPriceSqft: Number(benchmark.avg_price_sqft),
          avgYield: Number(benchmark.avg_yield),
          dataSource: benchmark.data_source,
          sourceUrl: benchmark.source_url,
          dataAsOf: benchmark.data_as_of,
          isVerified: benchmark.is_verified,
        }
      : DEFAULT_BENCHMARK,
    isLoading,
    isFromDatabase: !!benchmark,
  };
}

// Create a lookup map for efficient access
export function useBenchmarkMap() {
  const { data: benchmarks, isLoading } = useAreaBenchmarks();

  const benchmarkMap = benchmarks?.reduce(
    (acc, b) => {
      acc[b.area_name] = {
        avgPriceSqft: Number(b.avg_price_sqft),
        avgYield: Number(b.avg_yield),
      };
      return acc;
    },
    {} as Record<string, { avgPriceSqft: number; avgYield: number }>
  );

  return {
    benchmarkMap: benchmarkMap || {},
    isLoading,
    getBenchmark: (areaName: string) =>
      benchmarkMap?.[areaName] || DEFAULT_BENCHMARK,
  };
}

// Admin mutations
export function useUpdateAreaBenchmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      benchmark: Partial<AreaBenchmark> & { id: string }
    ) => {
      const { data, error } = await supabase
        .from("area_benchmarks")
        .update({
          avg_price_sqft: benchmark.avg_price_sqft,
          avg_yield: benchmark.avg_yield,
          data_source: benchmark.data_source,
          source_url: benchmark.source_url,
          data_as_of: benchmark.data_as_of,
          is_verified: benchmark.is_verified,
        })
        .eq("id", benchmark.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["area-benchmarks"] });
    },
  });
}

export function useCreateAreaBenchmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      benchmark: Omit<AreaBenchmark, "id" | "created_at" | "updated_at">
    ) => {
      const { data, error } = await supabase
        .from("area_benchmarks")
        .insert(benchmark)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["area-benchmarks"] });
    },
  });
}

export function useDeleteAreaBenchmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("area_benchmarks")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["area-benchmarks"] });
    },
  });
}
