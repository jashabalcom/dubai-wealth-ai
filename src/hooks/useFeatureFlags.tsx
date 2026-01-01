import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import React from "react";

export interface FeatureFlag {
  id: string;
  name: string;
  description: string | null;
  is_enabled: boolean;
  enabled_for_users: string[];
  enabled_for_roles: string[];
  percentage_rollout: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// Cache feature flags in memory
let cachedFlags: Record<string, boolean> = {};
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useFeatureFlags() {
  return useQuery({
    queryKey: ["feature-flags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feature_flags")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as FeatureFlag[];
    },
    staleTime: CACHE_DURATION,
  });
}

export function useFeatureFlag(flagName: string): {
  isEnabled: boolean;
  isLoading: boolean;
} {
  const { user } = useAuth();
  const { data: flags, isLoading } = useFeatureFlags();

  const flag = flags?.find((f) => f.name === flagName);

  if (!flag) {
    return { isEnabled: false, isLoading };
  }

  // Check if globally enabled
  if (flag.is_enabled) {
    return { isEnabled: true, isLoading };
  }

  // Check if enabled for specific user
  if (user?.id && flag.enabled_for_users?.includes(user.id)) {
    return { isEnabled: true, isLoading };
  }

  // Check percentage rollout
  if (flag.percentage_rollout > 0 && user?.id) {
    // Generate a consistent hash for the user
    const hash = simpleHash(user.id + flagName);
    const percentage = hash % 100;
    if (percentage < flag.percentage_rollout) {
      return { isEnabled: true, isLoading };
    }
  }

  return { isEnabled: false, isLoading };
}

// Simple hash function for consistent user bucketing
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// Feature flag component wrapper
interface FeatureFlagProps {
  flag: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureFlag({ flag, children, fallback = null }: FeatureFlagProps) {
  const { isEnabled, isLoading } = useFeatureFlag(flag);

  if (isLoading) {
    return null;
  }

  return isEnabled ? <>{children}</> : <>{fallback}</>;
}

// Admin mutations
export function useUpdateFeatureFlag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (flag: Partial<FeatureFlag> & { id: string }) => {
      const { data, error } = await supabase
        .from("feature_flags")
        .update({
          is_enabled: flag.is_enabled,
          description: flag.description,
          percentage_rollout: flag.percentage_rollout,
          enabled_for_users: flag.enabled_for_users,
          metadata: flag.metadata as Record<string, never>,
        })
        .eq("id", flag.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feature-flags"] });
    },
  });
}

export function useCreateFeatureFlag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      flag: Pick<FeatureFlag, "name" | "description" | "is_enabled" | "percentage_rollout">
    ) => {
      const { data, error } = await supabase
        .from("feature_flags")
        .insert(flag)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feature-flags"] });
    },
  });
}

export function useDeleteFeatureFlag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("feature_flags")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feature-flags"] });
    },
  });
}
