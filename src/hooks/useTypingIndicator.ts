import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TypingState {
  isTyping: boolean;
  userId: string;
}

export function useTypingIndicator(conversationUserId: string | null, currentUserId: string | null) {
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const stopTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Create a consistent channel name based on sorted user IDs
  const getChannelName = useCallback(() => {
    if (!conversationUserId || !currentUserId) return null;
    const sortedIds = [conversationUserId, currentUserId].sort();
    return `typing:${sortedIds[0]}-${sortedIds[1]}`;
  }, [conversationUserId, currentUserId]);

  useEffect(() => {
    const channelName = getChannelName();
    if (!channelName || !currentUserId || !conversationUserId) return;

    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: currentUserId,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<TypingState>();
        // Check if partner is typing
        const partnerState = state[conversationUserId];
        if (partnerState && partnerState.length > 0) {
          setIsPartnerTyping(partnerState[0].isTyping);
        } else {
          setIsPartnerTyping(false);
        }
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        if (key === conversationUserId && newPresences.length > 0) {
          const typingState = newPresences[0] as unknown as TypingState;
          setIsPartnerTyping(typingState.isTyping);
        }
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        if (key === conversationUserId) {
          setIsPartnerTyping(false);
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (stopTypingTimeoutRef.current) {
        clearTimeout(stopTypingTimeoutRef.current);
      }
      supabase.removeChannel(channel);
    };
  }, [getChannelName, currentUserId, conversationUserId]);

  const setTyping = useCallback((isTyping: boolean) => {
    if (!channelRef.current || !currentUserId) return;

    // Clear any existing stop-typing timeout
    if (stopTypingTimeoutRef.current) {
      clearTimeout(stopTypingTimeoutRef.current);
      stopTypingTimeoutRef.current = null;
    }

    // Track the typing state
    channelRef.current.track({
      isTyping,
      userId: currentUserId,
    });

    // Auto-stop typing after 3 seconds of inactivity
    if (isTyping) {
      stopTypingTimeoutRef.current = setTimeout(() => {
        if (channelRef.current) {
          channelRef.current.track({
            isTyping: false,
            userId: currentUserId,
          });
        }
      }, 3000);
    }
  }, [currentUserId]);

  return {
    isPartnerTyping,
    setTyping,
  };
}
