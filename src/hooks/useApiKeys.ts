import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface ApiKey {
  id: string;
  workspace_id: string | null;
  user_id: string;
  name: string;
  key_prefix: string;
  scopes: string[];
  rate_limit: number;
  is_active: boolean;
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiUsageLog {
  id: string;
  api_key_id: string;
  endpoint: string;
  method: string;
  status_code: number | null;
  response_time_ms: number | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// Generate a random API key
function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const keyLength = 32;
  let key = 'dri_'; // Dubai REI prefix
  for (let i = 0; i < keyLength; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

// Simple hash for API key storage (in production, use proper crypto)
async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function useApiKeys() {
  const { user } = useAuth();

  const { data: apiKeys, isLoading, refetch } = useQuery({
    queryKey: ["api-keys", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("api_keys")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ApiKey[];
    },
    enabled: !!user,
  });

  return { apiKeys, isLoading, refetch };
}

export function useApiKeyUsage(apiKeyId: string | null) {
  const { data: usageLogs, isLoading } = useQuery({
    queryKey: ["api-key-usage", apiKeyId],
    queryFn: async () => {
      if (!apiKeyId) return [];
      const { data, error } = await supabase
        .from("api_usage_logs")
        .select("*")
        .eq("api_key_id", apiKeyId)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as ApiUsageLog[];
    },
    enabled: !!apiKeyId,
  });

  return { usageLogs, isLoading };
}

export function useCreateApiKey() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      name,
      scopes = ['read'],
      workspaceId,
      expiresAt,
    }: {
      name: string;
      scopes?: string[];
      workspaceId?: string;
      expiresAt?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const rawKey = generateApiKey();
      const keyHash = await hashApiKey(rawKey);
      const keyPrefix = rawKey.slice(0, 12) + '...';

      const { data, error } = await supabase
        .from("api_keys")
        .insert({
          user_id: user.id,
          workspace_id: workspaceId || null,
          name,
          key_hash: keyHash,
          key_prefix: keyPrefix,
          scopes,
          expires_at: expiresAt || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Return both the stored data and the raw key (only shown once)
      return { apiKey: data as ApiKey, rawKey };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast.success("API key created. Copy it now - it won't be shown again!");
    },
    onError: (error) => {
      toast.error(`Failed to create API key: ${error.message}`);
    },
  });
}

export function useRevokeApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (keyId: string) => {
      const { error } = await supabase
        .from("api_keys")
        .update({ is_active: false })
        .eq("id", keyId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast.success("API key revoked");
    },
    onError: (error) => {
      toast.error(`Failed to revoke API key: ${error.message}`);
    },
  });
}

export function useDeleteApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (keyId: string) => {
      const { error } = await supabase
        .from("api_keys")
        .delete()
        .eq("id", keyId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast.success("API key deleted");
    },
    onError: (error) => {
      toast.error(`Failed to delete API key: ${error.message}`);
    },
  });
}

// Get API usage stats for a key
export function useApiKeyStats(apiKeyId: string | null) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["api-key-stats", apiKeyId],
    queryFn: async () => {
      if (!apiKeyId) return null;

      const { data, error } = await supabase
        .from("api_usage_logs")
        .select("*")
        .eq("api_key_id", apiKeyId)
        .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      const logs = data as ApiUsageLog[];
      
      return {
        totalRequests: logs.length,
        successfulRequests: logs.filter(l => l.status_code && l.status_code < 400).length,
        failedRequests: logs.filter(l => l.status_code && l.status_code >= 400).length,
        avgResponseTime: logs.length > 0 
          ? Math.round(logs.reduce((acc, l) => acc + (l.response_time_ms || 0), 0) / logs.length)
          : 0,
        requestsByEndpoint: logs.reduce((acc, l) => {
          acc[l.endpoint] = (acc[l.endpoint] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      };
    },
    enabled: !!apiKeyId,
  });

  return { stats, isLoading };
}
