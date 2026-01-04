import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PlatformStats {
  properties: number;
  lessons: number;
  tools: number;
  neighborhoods: number;
}

// Default stats to show immediately while loading
const DEFAULT_STATS: PlatformStats = {
  properties: 700,
  lessons: 100,
  tools: 13,
  neighborhoods: 100,
};

export function usePlatformStats() {
  return useQuery({
    queryKey: ["platform-stats"],
    queryFn: async (): Promise<PlatformStats> => {
      const [propertiesRes, lessonsRes, neighborhoodsRes] = await Promise.all([
        supabase.from("properties").select("id", { count: "exact", head: true }).eq("is_published", true),
        supabase.from("lessons").select("id", { count: "exact", head: true }),
        supabase.from("neighborhoods").select("id", { count: "exact", head: true }).eq("is_published", true),
      ]);

      return {
        properties: propertiesRes.count ?? DEFAULT_STATS.properties,
        lessons: lessonsRes.count ?? DEFAULT_STATS.lessons,
        tools: 13, // Static - number of calculator tools
        neighborhoods: neighborhoodsRes.count ?? DEFAULT_STATS.neighborhoods,
      };
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    placeholderData: DEFAULT_STATS, // Show default stats immediately
  });
}
