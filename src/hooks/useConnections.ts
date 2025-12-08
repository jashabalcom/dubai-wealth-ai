import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Connection {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  message: string | null;
  created_at: string;
  updated_at: string;
  requester?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    membership_tier: string;
  };
  recipient?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    membership_tier: string;
  };
}

export function useConnections() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all connections for the current user
  const { data: connections = [], isLoading: connectionsLoading } = useQuery({
    queryKey: ['connections', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('connections')
        .select('*')
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Connection[];
    },
    enabled: !!user?.id,
  });

  // Fetch accepted connections with the other user's profile
  const { data: acceptedConnections = [], isLoading: acceptedLoading } = useQuery({
    queryKey: ['accepted-connections', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('connections')
        .select('*')
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .eq('status', 'accepted')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      if (data.length === 0) return [];

      // Get the OTHER user's ID for each connection
      const otherUserIds = data.map(c => 
        c.requester_id === user.id ? c.recipient_id : c.requester_id
      );

      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, membership_tier, country, bio')
        .in('id', otherUserIds);

      if (profileError) throw profileError;

      return data.map(connection => ({
        ...connection,
        profile: profiles?.find(p => 
          p.id === (connection.requester_id === user.id ? connection.recipient_id : connection.requester_id)
        ),
      }));
    },
    enabled: !!user?.id,
  });

  // Fetch pending requests received by the current user
  const { data: pendingRequests = [], isLoading: pendingLoading } = useQuery({
    queryKey: ['pending-connections', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('connections')
        .select('*')
        .eq('recipient_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch requester profiles
      const requesterIds = data.map(c => c.requester_id);
      if (requesterIds.length === 0) return [];

      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, membership_tier, country, bio')
        .in('id', requesterIds);

      if (profileError) throw profileError;

      return data.map(connection => ({
        ...connection,
        requester: profiles?.find(p => p.id === connection.requester_id),
      })) as Connection[];
    },
    enabled: !!user?.id,
  });

  // Fetch pending requests sent by the current user
  const { data: sentRequests = [], isLoading: sentLoading } = useQuery({
    queryKey: ['sent-connections', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('connections')
        .select('*')
        .eq('requester_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch recipient profiles
      const recipientIds = data.map(c => c.recipient_id);
      if (recipientIds.length === 0) return [];

      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, membership_tier, country, bio')
        .in('id', recipientIds);

      if (profileError) throw profileError;

      return data.map(connection => ({
        ...connection,
        recipient: profiles?.find(p => p.id === connection.recipient_id),
      })) as Connection[];
    },
    enabled: !!user?.id,
  });

  // Get connection status with a specific user
  const getConnectionStatus = (userId: string) => {
    if (!user?.id) return null;
    
    const connection = connections.find(
      c => (c.requester_id === userId && c.recipient_id === user.id) ||
           (c.recipient_id === userId && c.requester_id === user.id)
    );
    
    if (!connection) return null;
    
    return {
      ...connection,
      isSender: connection.requester_id === user.id,
      isReceiver: connection.recipient_id === user.id,
    };
  };

  // Send connection request
  const sendRequest = useMutation({
    mutationFn: async ({ recipientId, message }: { recipientId: string; message?: string }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('connections')
        .insert({
          requester_id: user.id,
          recipient_id: recipientId,
          message: message || null,
        });

      if (error) {
        if (error.code === '23505') {
          throw new Error('Connection request already exists');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      toast.success('Connection request sent!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send request');
    },
  });

  // Accept connection request
  const acceptRequest = useMutation({
    mutationFn: async (connectionId: string) => {
      const { error } = await supabase
        .from('connections')
        .update({ status: 'accepted' })
        .eq('id', connectionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      queryClient.invalidateQueries({ queryKey: ['pending-connections'] });
      toast.success('Connection accepted!');
    },
    onError: () => {
      toast.error('Failed to accept request');
    },
  });

  // Reject connection request
  const rejectRequest = useMutation({
    mutationFn: async (connectionId: string) => {
      const { error } = await supabase
        .from('connections')
        .update({ status: 'rejected' })
        .eq('id', connectionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      queryClient.invalidateQueries({ queryKey: ['pending-connections'] });
      toast.success('Request declined');
    },
    onError: () => {
      toast.error('Failed to decline request');
    },
  });

  // Cancel/withdraw connection request
  const cancelRequest = useMutation({
    mutationFn: async (connectionId: string) => {
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      toast.success('Request cancelled');
    },
    onError: () => {
      toast.error('Failed to cancel request');
    },
  });

  // Remove connection
  const removeConnection = useMutation({
    mutationFn: async (connectionId: string) => {
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      toast.success('Connection removed');
    },
    onError: () => {
      toast.error('Failed to remove connection');
    },
  });

  return {
    connections,
    connectionsLoading,
    acceptedConnections,
    acceptedLoading,
    pendingRequests,
    pendingLoading,
    sentRequests,
    sentLoading,
    pendingCount: pendingRequests.length,
    getConnectionStatus,
    sendRequest,
    acceptRequest,
    rejectRequest,
    cancelRequest,
    removeConnection,
  };
}
