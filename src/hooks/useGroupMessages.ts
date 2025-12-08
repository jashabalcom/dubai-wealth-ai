import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

export interface GroupChat {
  id: string;
  name: string;
  created_by: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  members?: GroupMember[];
  last_message?: GroupMessage | null;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  joined_at: string;
  profile?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    membership_tier: string;
  };
}

export interface GroupMessage {
  id: string;
  group_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export function useGroupMessages(groupId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all group chats the user is a member of
  const { data: groupChats = [], isLoading: groupsLoading } = useQuery({
    queryKey: ['group-chats', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data: groups, error } = await supabase
        .from('group_chats')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Fetch last message for each group
      const groupsWithLastMessage = await Promise.all(
        (groups || []).map(async (group) => {
          const { data: messages } = await supabase
            .from('group_messages')
            .select('*')
            .eq('group_id', group.id)
            .order('created_at', { ascending: false })
            .limit(1);

          return {
            ...group,
            last_message: messages?.[0] || null,
          };
        })
      );

      return groupsWithLastMessage as GroupChat[];
    },
    enabled: !!user,
  });

  // Fetch group details
  const { data: groupDetails } = useQuery({
    queryKey: ['group-chat', groupId],
    queryFn: async () => {
      if (!groupId) return null;
      
      const { data, error } = await supabase
        .from('group_chats')
        .select('*')
        .eq('id', groupId)
        .single();

      if (error) throw error;
      return data as GroupChat;
    },
    enabled: !!groupId && !!user,
  });

  // Fetch group members
  const { data: groupMembers = [] } = useQuery({
    queryKey: ['group-members', groupId],
    queryFn: async () => {
      if (!groupId) return [];
      
      const { data, error } = await supabase
        .from('group_chat_members')
        .select('*')
        .eq('group_id', groupId);

      if (error) throw error;

      // Fetch profiles for each member
      const memberIds = data.map((m) => m.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, membership_tier')
        .in('id', memberIds);

      return data.map((member) => ({
        ...member,
        profile: profiles?.find((p) => p.id === member.user_id),
      })) as GroupMember[];
    },
    enabled: !!groupId && !!user,
  });

  // Fetch messages for a group
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['group-messages', groupId],
    queryFn: async () => {
      if (!groupId) return [];
      
      const { data, error } = await supabase
        .from('group_messages')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch sender profiles
      const senderIds = [...new Set(data.map((m) => m.sender_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', senderIds);

      return data.map((message) => ({
        ...message,
        sender: profiles?.find((p) => p.id === message.sender_id),
      })) as GroupMessage[];
    },
    enabled: !!groupId && !!user,
  });

  // Create a new group chat
  const createGroup = useMutation({
    mutationFn: async ({ name, memberIds }: { name: string; memberIds: string[] }) => {
      if (!user) throw new Error('Not authenticated');

      // Create the group
      const { data: group, error: groupError } = await supabase
        .from('group_chats')
        .insert({ name, created_by: user.id })
        .select()
        .single();

      if (groupError) throw groupError;

      // Add creator as a member
      const membersToAdd = [user.id, ...memberIds].map((userId) => ({
        group_id: group.id,
        user_id: userId,
      }));

      const { error: membersError } = await supabase
        .from('group_chat_members')
        .insert(membersToAdd);

      if (membersError) throw membersError;

      return group;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-chats'] });
    },
  });

  // Send a message to the group
  const sendMessage = useMutation({
    mutationFn: async ({ content }: { content: string }) => {
      if (!user || !groupId) throw new Error('Missing user or group');

      const { data, error } = await supabase
        .from('group_messages')
        .insert({
          group_id: groupId,
          sender_id: user.id,
          content,
        })
        .select()
        .single();

      if (error) throw error;

      // Update group's updated_at
      await supabase
        .from('group_chats')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', groupId);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-messages', groupId] });
      queryClient.invalidateQueries({ queryKey: ['group-chats'] });
    },
  });

  // Real-time subscription for group messages
  useEffect(() => {
    if (!groupId || !user) return;

    const channel = supabase
      .channel(`group-messages-${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_messages',
          filter: `group_id=eq.${groupId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['group-messages', groupId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId, user, queryClient]);

  return {
    groupChats,
    groupsLoading,
    groupDetails,
    groupMembers,
    messages,
    messagesLoading,
    createGroup,
    sendMessage,
  };
}
