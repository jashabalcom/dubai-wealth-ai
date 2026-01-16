import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { SupportMessage } from './useRealtimeSupportChat';

interface AdminTicket {
  id: string;
  user_id: string | null;
  initial_message: string;
  status: string;
  category: string | null;
  priority: string;
  ai_confidence_score: number | null;
  escalation_reason: string | null;
  admin_id: string | null;
  admin_joined_at: string | null;
  created_at: string;
  last_message_at: string | null;
  profiles?: {
    full_name: string | null;
    email: string | null;
    membership_tier: string | null;
  } | null;
}

interface AdminChatState {
  activeTicket: AdminTicket | null;
  messages: SupportMessage[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
}

export function useAdminSupportChat() {
  const { user } = useAuth();
  const [state, setState] = useState<AdminChatState>({
    activeTicket: null,
    messages: [],
    isLoading: false,
    isSending: false,
    error: null,
  });
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Subscribe to realtime messages when viewing a ticket
  useEffect(() => {
    if (!state.activeTicket?.id) return;

    const channel = supabase
      .channel(`admin-support-${state.activeTicket.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages',
          filter: `ticket_id=eq.${state.activeTicket.id}`,
        },
        (payload) => {
          const newMessage = payload.new as SupportMessage;
          setState(prev => {
            if (prev.messages.some(m => m.id === newMessage.id)) {
              return prev;
            }
            return {
              ...prev,
              messages: [...prev.messages, newMessage],
            };
          });
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [state.activeTicket?.id]);

  const selectTicket = useCallback(async (ticket: AdminTicket) => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    setState(prev => ({ ...prev, isLoading: true, activeTicket: ticket }));

    try {
      // Load messages
      const { data: messages, error } = await supabase
        .from('support_messages')
        .select('*')
        .eq('ticket_id', ticket.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setState(prev => ({
        ...prev,
        messages: (messages || []) as SupportMessage[],
        isLoading: false,
      }));
    } catch (error: any) {
      console.error('Error loading messages:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
    }
  }, []);

  const joinConversation = useCallback(async () => {
    if (!state.activeTicket || !user) return;

    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({
          status: 'human_handling',
          admin_id: user.id,
          admin_joined_at: new Date().toISOString(),
        })
        .eq('id', state.activeTicket.id);

      if (error) throw error;

      setState(prev => ({
        ...prev,
        activeTicket: prev.activeTicket ? {
          ...prev.activeTicket,
          status: 'human_handling',
          admin_id: user.id,
          admin_joined_at: new Date().toISOString(),
        } : null,
      }));

      // Send system message that admin joined
      await supabase.from('support_messages').insert({
        ticket_id: state.activeTicket.id,
        sender_id: user.id,
        sender_type: 'admin',
        content: '🎯 A support team member has joined the conversation. How can I help you?',
      });
    } catch (error) {
      console.error('Error joining conversation:', error);
    }
  }, [state.activeTicket, user]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || !state.activeTicket || !user) return;

    setState(prev => ({ ...prev, isSending: true }));

    try {
      const { error } = await supabase.from('support_messages').insert({
        ticket_id: state.activeTicket.id,
        sender_id: user.id,
        sender_type: 'admin',
        content,
      });

      if (error) throw error;

      // Update last_message_at
      await supabase
        .from('support_tickets')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', state.activeTicket.id);

      setState(prev => ({ ...prev, isSending: false }));
    } catch (error: any) {
      console.error('Error sending message:', error);
      setState(prev => ({
        ...prev,
        isSending: false,
        error: error.message,
      }));
    }
  }, [state.activeTicket, user]);

  const resolveTicket = useCallback(async () => {
    if (!state.activeTicket) return;

    try {
      // Send resolution message
      if (user) {
        await supabase.from('support_messages').insert({
          ticket_id: state.activeTicket.id,
          sender_id: user.id,
          sender_type: 'admin',
          content: '✅ This conversation has been marked as resolved. Thank you for contacting support!',
        });
      }

      const { error } = await supabase
        .from('support_tickets')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
        })
        .eq('id', state.activeTicket.id);

      if (error) throw error;

      closeTicket();
    } catch (error) {
      console.error('Error resolving ticket:', error);
    }
  }, [state.activeTicket, user]);

  const closeTicket = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }
    setState({
      activeTicket: null,
      messages: [],
      isLoading: false,
      isSending: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    selectTicket,
    joinConversation,
    sendMessage,
    resolveTicket,
    closeTicket,
  };
}
