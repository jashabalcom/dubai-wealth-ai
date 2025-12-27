import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PlatformStats {
  properties: number;
  lessons: number;
  tools: number;
  neighborhoods: number;
}

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
        properties: propertiesRes.count ?? 0,
        lessons: lessonsRes.count ?? 0,
        tools: 11, // Static - number of calculator tools
        neighborhoods: neighborhoodsRes.count ?? 0,
      };
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
}
