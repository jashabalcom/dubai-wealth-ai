import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import React from "react";

export interface ABExperiment {
  id: string;
  name: string;
  description: string | null;
  variants: { name: string; weight: number }[];
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface ABAssignment {
  id: string;
  experiment_id: string;
  user_id: string | null;
  session_id: string | null;
  variant: string;
  created_at: string;
}

// Get or create session ID for anonymous users
function getSessionId(): string {
  const key = "ab_session_id";
  let sessionId = sessionStorage.getItem(key);
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem(key, sessionId);
  }
  return sessionId;
}

// Select a variant based on weights
function selectVariant(variants: { name: string; weight: number }[]): string {
  const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
  const random = Math.random() * totalWeight;
  let cumulative = 0;
  
  for (const variant of variants) {
    cumulative += variant.weight;
    if (random <= cumulative) {
      return variant.name;
    }
  }
  
  return variants[0]?.name || "control";
}

export function useABExperiments() {
  return useQuery({
    queryKey: ["ab-experiments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ab_experiments")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data as ABExperiment[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useABTest(experimentName: string): {
  variant: string | null;
  isLoading: boolean;
  trackEvent: (eventName: string, eventData?: Record<string, unknown>) => void;
} {
  const { user } = useAuth();
  const { data: experiments, isLoading: experimentsLoading } = useABExperiments();
  const queryClient = useQueryClient();
  
  const experiment = experiments?.find((e) => e.name === experimentName);
  const sessionId = getSessionId();

  // Query for existing assignment
  const { data: assignment, isLoading: assignmentLoading } = useQuery({
    queryKey: ["ab-assignment", experimentName, user?.id, sessionId],
    queryFn: async () => {
      if (!experiment) return null;

      // First check if assignment exists
      const { data: existing, error: checkError } = await supabase
        .from("ab_assignments")
        .select("*")
        .eq("experiment_id", experiment.id)
        .or(user?.id ? `user_id.eq.${user.id}` : `session_id.eq.${sessionId}`)
        .maybeSingle();

      if (checkError) throw checkError;
      if (existing) return existing as ABAssignment;

      // Create new assignment
      const variant = selectVariant(experiment.variants as { name: string; weight: number }[]);
      const { data: newAssignment, error: insertError } = await supabase
        .from("ab_assignments")
        .insert({
          experiment_id: experiment.id,
          user_id: user?.id || null,
          session_id: user?.id ? null : sessionId,
          variant,
        })
        .select()
        .single();

      if (insertError) {
        // If insert fails (race condition), try to get existing
        const { data: retryExisting } = await supabase
          .from("ab_assignments")
          .select("*")
          .eq("experiment_id", experiment.id)
          .or(user?.id ? `user_id.eq.${user.id}` : `session_id.eq.${sessionId}`)
          .maybeSingle();
        return retryExisting as ABAssignment | null;
      }

      return newAssignment as ABAssignment;
    },
    enabled: !!experiment,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  // Track conversion or other events
  const trackEvent = async (eventName: string, eventData?: Record<string, unknown>) => {
    if (!experiment || !assignment) return;

    try {
      await supabase.from("ab_events").insert({
        experiment_id: experiment.id,
        assignment_id: assignment.id,
        event_name: eventName,
        event_data: eventData as Record<string, never> || {},
      });
    } catch (error) {
      console.error("Failed to track A/B event:", error);
    }
  };

  return {
    variant: assignment?.variant || null,
    isLoading: experimentsLoading || assignmentLoading,
    trackEvent,
  };
}

// Component for A/B testing
interface ABTestProps {
  experiment: string;
  children: React.ReactNode;
  variants: Record<string, React.ReactNode>;
  fallback?: React.ReactNode;
}

export function ABTest({ experiment, variants, fallback = null }: ABTestProps) {
  const { variant, isLoading } = useABTest(experiment);

  if (isLoading) {
    return <>{fallback}</>;
  }

  if (!variant || !variants[variant]) {
    return <>{variants.control || fallback}</>;
  }

  return <>{variants[variant]}</>;
}

// Admin hooks
export function useCreateExperiment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      experiment: Pick<ABExperiment, "name" | "description" | "variants">
    ) => {
      const { data, error } = await supabase
        .from("ab_experiments")
        .insert(experiment)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ab-experiments"] });
    },
  });
}

export function useUpdateExperiment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (experiment: Partial<ABExperiment> & { id: string }) => {
      const { data, error } = await supabase
        .from("ab_experiments")
        .update({
          description: experiment.description,
          is_active: experiment.is_active,
          variants: experiment.variants,
          end_date: experiment.end_date,
        })
        .eq("id", experiment.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ab-experiments"] });
    },
  });
}
