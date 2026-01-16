import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface SupportChatState {
  ticketId: string | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  isEscalated: boolean;
  category: string | null;
}

const STORAGE_KEY = 'dubai_wealth_support_ticket';

export function useSupportChat() {
  const { user } = useAuth();
  const [state, setState] = useState<SupportChatState>({
    ticketId: null,
    messages: [],
    isLoading: false,
    error: null,
    isEscalated: false,
    category: null,
  });

  // Load existing ticket from localStorage
  useEffect(() => {
    const storedTicketId = localStorage.getItem(STORAGE_KEY);
    if (storedTicketId) {
      loadConversation(storedTicketId);
    }
  }, []);

  const loadConversation = async (ticketId: string) => {
    try {
      const { data: ticket, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('id', ticketId)
        .single();

      if (error || !ticket) {
        // Ticket not found, clear storage
        localStorage.removeItem(STORAGE_KEY);
        return;
      }

      // Only load if ticket is still active
      if (['ai_handling', 'escalated', 'human_handling'].includes(ticket.status)) {
        const history = Array.isArray(ticket.conversation_history) 
          ? ticket.conversation_history as unknown as Message[]
          : [];
        setState(prev => ({
          ...prev,
          ticketId: ticket.id,
          messages: history,
          isEscalated: ticket.status === 'escalated',
          category: ticket.category,
        }));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      messages: [
        ...prev.messages,
        { role: 'user', content, timestamp: new Date().toISOString() },
      ],
    }));

    try {
      const { data, error } = await supabase.functions.invoke('ai-support-agent', {
        body: {
          ticketId: state.ticketId,
          message: content,
          pageUrl: window.location.href,
          userAgent: navigator.userAgent,
        },
      });

      if (error) throw error;

      // Store ticket ID
      if (data.ticketId) {
        localStorage.setItem(STORAGE_KEY, data.ticketId);
      }

      setState(prev => ({
        ...prev,
        ticketId: data.ticketId,
        messages: data.conversationHistory || prev.messages,
        isEscalated: data.isEscalated,
        category: data.category,
        isLoading: false,
      }));
    } catch (error: any) {
      console.error('Error sending message:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to send message',
        // Remove the optimistic user message on error
        messages: prev.messages.slice(0, -1),
      }));
    }
  }, [state.ticketId]);

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

      setState(prev => ({
        ...prev,
        isEscalated: true,
        messages: [
          ...prev.messages,
          {
            role: 'assistant',
            content: "I've escalated your request to our support team. A team member will review your case and get back to you soon. Thank you for your patience!",
            timestamp: new Date().toISOString(),
          },
        ],
      }));
    } catch (error) {
      console.error('Error escalating:', error);
    }
  }, [state.ticketId]);

  const startNewConversation = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      ticketId: null,
      messages: [],
      isLoading: false,
      error: null,
      isEscalated: false,
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
