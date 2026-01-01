import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  logo_url: string | null;
  settings: Record<string, unknown>;
  max_members: number;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  invited_at: string;
  joined_at: string | null;
  invited_by: string | null;
}

export function useWorkspaces() {
  const { user } = useAuth();

  const { data: workspaces, isLoading, refetch } = useQuery({
    queryKey: ["workspaces", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workspaces")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Workspace[];
    },
    enabled: !!user,
  });

  return { workspaces, isLoading, refetch };
}

export function useWorkspace(workspaceId: string | null) {
  const { user } = useAuth();

  const { data: workspace, isLoading } = useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return null;
      const { data, error } = await supabase
        .from("workspaces")
        .select("*")
        .eq("id", workspaceId)
        .single();

      if (error) throw error;
      return data as Workspace;
    },
    enabled: !!user && !!workspaceId,
  });

  return { workspace, isLoading };
}

export function useWorkspaceMembers(workspaceId: string | null) {
  const { data: members, isLoading } = useQuery({
    queryKey: ["workspace-members", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      const { data, error } = await supabase
        .from("workspace_members")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("role");

      if (error) throw error;
      return data as WorkspaceMember[];
    },
    enabled: !!workspaceId,
  });

  return { members, isLoading };
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ name, slug }: { name: string; slug: string }) => {
      if (!user) throw new Error("Not authenticated");

      const { data: workspace, error: wsError } = await supabase
        .from("workspaces")
        .insert({
          name,
          slug,
          owner_id: user.id,
        })
        .select()
        .single();

      if (wsError) throw wsError;

      // Add owner as member
      const { error: memberError } = await supabase
        .from("workspace_members")
        .insert({
          workspace_id: workspace.id,
          user_id: user.id,
          role: "owner",
          joined_at: new Date().toISOString(),
        });

      if (memberError) throw memberError;

      return workspace;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      toast.success("Workspace created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create workspace: ${error.message}`);
    },
  });
}

export function useInviteMember() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      workspaceId,
      userId,
      role,
    }: {
      workspaceId: string;
      userId: string;
      role: WorkspaceMember["role"];
    }) => {
      const { data, error } = await supabase
        .from("workspace_members")
        .insert({
          workspace_id: workspaceId,
          user_id: userId,
          role,
          invited_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: ["workspace-members", workspaceId] });
      toast.success("Member invited successfully");
    },
    onError: (error) => {
      toast.error(`Failed to invite member: ${error.message}`);
    },
  });
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      memberId,
      role,
    }: {
      memberId: string;
      role: WorkspaceMember["role"];
    }) => {
      const { error } = await supabase
        .from("workspace_members")
        .update({ role })
        .eq("id", memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace-members"] });
      toast.success("Role updated");
    },
    onError: (error) => {
      toast.error(`Failed to update role: ${error.message}`);
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from("workspace_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace-members"] });
      toast.success("Member removed");
    },
    onError: (error) => {
      toast.error(`Failed to remove member: ${error.message}`);
    },
  });
}
