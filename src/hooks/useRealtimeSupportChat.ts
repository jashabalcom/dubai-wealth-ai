import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_type: 'user' | 'admin' | 'ai';
  content: string;
  created_at: string;
}

interface RealtimeSupportChatState {
  ticketId: string | null;
  messages: SupportMessage[];
  isLoading: boolean;
  error: string | null;
  isEscalated: boolean;
  adminJoined: boolean;
  category: string | null;
}

const STORAGE_KEY = 'dubai_wealth_support_ticket';

export function useRealtimeSupportChat() {
  const { user } = useAuth();
  const [state, setState] = useState<RealtimeSupportChatState>({
    ticketId: null,
    messages: [],
    isLoading: false,
    error: null,
    isEscalated: false,
    adminJoined: false,
    category: null,
  });
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Subscribe to realtime messages when ticket exists
  useEffect(() => {
    if (!state.ticketId) return;

    const channel = supabase
      .channel(`support-messages-${state.ticketId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages',
          filter: `ticket_id=eq.${state.ticketId}`,
        },
        (payload) => {
          const newMessage = payload.new as SupportMessage;
          setState(prev => {
            // Avoid duplicates
            if (prev.messages.some(m => m.id === newMessage.id)) {
              return prev;
            }
            return {
              ...prev,
              messages: [...prev.messages, newMessage],
              adminJoined: newMessage.sender_type === 'admin' ? true : prev.adminJoined,
            };
          });
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [state.ticketId]);

  // Load existing ticket from localStorage
  useEffect(() => {
    const storedTicketId = localStorage.getItem(STORAGE_KEY);
    if (storedTicketId) {
      loadConversation(storedTicketId);
    }
  }, []);

  const loadConversation = async (ticketId: string) => {
    try {
      // Load ticket info
      const { data: ticket, error: ticketError } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('id', ticketId)
        .single();

      if (ticketError || !ticket) {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }

      // Only load if ticket is still active
      if (!['ai_handling', 'escalated', 'human_handling'].includes(ticket.status)) {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }

      // Load messages
      const { data: messages, error: messagesError } = await supabase
        .from('support_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      setState(prev => ({
        ...prev,
        ticketId: ticket.id,
        messages: (messages || []) as SupportMessage[],
        isEscalated: ticket.status === 'escalated' || ticket.status === 'human_handling',
        adminJoined: !!ticket.admin_id,
        category: ticket.category,
      }));
    } catch (error) {
      console.error('Error loading conversation:', error);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || !user) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      let ticketId = state.ticketId;

      // Create ticket if not exists
      if (!ticketId) {
        const { data: newTicket, error: ticketError } = await supabase
          .from('support_tickets')
          .insert({
            user_id: user.id,
            initial_message: content,
            status: 'ai_handling',
            priority: 'normal',
          })
          .select()
          .single();

        if (ticketError) throw ticketError;
        ticketId = newTicket.id;
        localStorage.setItem(STORAGE_KEY, ticketId);
        setState(prev => ({ ...prev, ticketId }));
      }

      // Insert user message
      const { error: messageError } = await supabase
        .from('support_messages')
        .insert({
          ticket_id: ticketId,
          sender_id: user.id,
          sender_type: 'user',
          content,
        });

      if (messageError) throw messageError;

      // If no admin has joined, get AI response
      if (!state.adminJoined) {
        const { data: aiData, error: aiError } = await supabase.functions.invoke('ai-support-agent', {
          body: {
            ticketId,
            message: content,
            pageUrl: window.location.href,
            userAgent: navigator.userAgent,
          },
        });

        if (aiError) throw aiError;

        // AI response is handled by the edge function and stored in support_messages
        // The realtime subscription will pick it up
        setState(prev => ({
          ...prev,
          isEscalated: aiData?.isEscalated || prev.isEscalated,
          category: aiData?.category || prev.category,
        }));
      }

      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error: any) {
      console.error('Error sending message:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to send message',
      }));
    }
  }, [state.ticketId, state.adminJoined, user]);

  const requestEscalation = useCallback(async (reason: string) => {
    if (!state.ticketId) return;

    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({
          status: 'escalated',
          escalation_reason: reason,
        })
        .eq('id', state.ticketId);

      if (error) throw error;

      setState(prev => ({ ...prev, isEscalated: true }));
    } catch (error) {
      console.error('Error escalating:', error);
    }
  }, [state.ticketId]);

  const startNewConversation = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }
    localStorage.removeItem(STORAGE_KEY);
    setState({
      ticketId: null,
      messages: [],
      isLoading: false,
      error: null,
      isEscalated: false,
      adminJoined: false,
      category: null,
    });
  }, []);

  const resolveConversation = useCallback(async () => {
    if (!state.ticketId) return;

    try {
      await supabase
        .from('support_tickets')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
        })
        .eq('id', state.ticketId);

      startNewConversation();
    } catch (error) {
      console.error('Error resolving:', error);
    }
  }, [state.ticketId, startNewConversation]);

  return {
    ...state,
    sendMessage,
    requestEscalation,
    startNewConversation,
    resolveConversation,
  };
}
