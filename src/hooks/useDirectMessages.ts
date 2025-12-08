import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface Conversation {
  user_id: string;
  profile: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    membership_tier: string;
  };
  last_message: Message;
  unread_count: number;
}

export function useDirectMessages(conversationUserId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [realtimeEnabled, setRealtimeEnabled] = useState(false);

  // Fetch all conversations with last message
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get all messages involving current user
      const { data: messages, error } = await supabase
        .from('direct_messages')
        .select('*')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by conversation partner
      const conversationMap = new Map<string, { messages: Message[]; unread: number }>();
      
      messages?.forEach((msg) => {
        const partnerId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;
        
        if (!conversationMap.has(partnerId)) {
          conversationMap.set(partnerId, { messages: [], unread: 0 });
        }
        
        const conv = conversationMap.get(partnerId)!;
        conv.messages.push(msg);
        
        if (!msg.is_read && msg.recipient_id === user.id) {
          conv.unread++;
        }
      });

      // Get profiles for all conversation partners
      const partnerIds = Array.from(conversationMap.keys());
      if (partnerIds.length === 0) return [];

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, membership_tier')
        .in('id', partnerIds);

      if (profilesError) throw profilesError;

      // Build conversation list
      const conversationList: Conversation[] = [];
      
      conversationMap.forEach((data, partnerId) => {
        const profile = profiles?.find(p => p.id === partnerId);
        if (profile) {
          conversationList.push({
            user_id: partnerId,
            profile,
            last_message: data.messages[0],
            unread_count: data.unread,
          });
        }
      });

      // Sort by last message date
      conversationList.sort((a, b) => 
        new Date(b.last_message.created_at).getTime() - new Date(a.last_message.created_at).getTime()
      );

      return conversationList;
    },
    enabled: !!user?.id,
  });

  // Fetch messages for specific conversation
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', user?.id, conversationUserId],
    queryFn: async () => {
      if (!user?.id || !conversationUserId) return [];

      const { data, error } = await supabase
        .from('direct_messages')
        .select('*')
        .or(
          `and(sender_id.eq.${user.id},recipient_id.eq.${conversationUserId}),and(sender_id.eq.${conversationUserId},recipient_id.eq.${user.id})`
        )
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Message[];
    },
    enabled: !!user?.id && !!conversationUserId,
  });

  // Get conversation partner profile
  const { data: conversationPartner } = useQuery({
    queryKey: ['conversation-partner', conversationUserId],
    queryFn: async () => {
      if (!conversationUserId) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, membership_tier')
        .eq('id', conversationUserId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!conversationUserId,
  });

  // Calculate total unread count
  const unreadCount = conversations.reduce((sum, conv) => sum + conv.unread_count, 0);

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async ({ recipientId, content }: { recipientId: string; content: string }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('direct_messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          content: content.trim(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to send message',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mark messages as read
  const markAsRead = useMutation({
    mutationFn: async (messageIds: string[]) => {
      if (!user?.id || messageIds.length === 0) return;

      const { error } = await supabase
        .from('direct_messages')
        .update({ is_read: true })
        .in('id', messageIds)
        .eq('recipient_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });

  // Set up realtime subscription
  useEffect(() => {
    if (!user?.id || realtimeEnabled) return;

    const channel = supabase
      .channel('direct-messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'direct_messages',
          filter: `recipient_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['messages'] });
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'direct_messages',
          filter: `sender_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['messages'] });
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
      )
      .subscribe();

    setRealtimeEnabled(true);

    return () => {
      supabase.removeChannel(channel);
      setRealtimeEnabled(false);
    };
  }, [user?.id, queryClient, realtimeEnabled]);

  return {
    conversations,
    conversationsLoading,
    messages,
    messagesLoading,
    conversationPartner,
    unreadCount,
    sendMessage,
    markAsRead,
  };
}
