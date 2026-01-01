import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { CommunityEvent } from '@/hooks/useCommunityEvents';

interface EventRoomState {
  isInLobby: boolean;
  isConnected: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  participantCount: number;
}

export function useEventRoom(eventId: string) {
  const { user } = useAuth();
  const [event, setEvent] = useState<CommunityEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roomState, setRoomState] = useState<EventRoomState>({
    isInLobby: true,
    isConnected: false,
    isMuted: true,
    isVideoOff: false,
    participantCount: 0,
  });

  useEffect(() => {
    async function fetchEvent() {
      if (!eventId) return;

      try {
        const { data, error: fetchError } = await supabase
          .from('community_events')
          .select('*')
          .eq('id', eventId)
          .single();

        if (fetchError) throw fetchError;
        
        setEvent(data as CommunityEvent);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load event');
      } finally {
        setIsLoading(false);
      }
    }

    fetchEvent();
  }, [eventId]);

  const generateRoomName = (event: CommunityEvent): string => {
    // Use stored jitsi_room_name or generate from event ID
    if (event.jitsi_room_name) {
      return event.jitsi_room_name;
    }
    return `dwh-${eventId.slice(0, 8)}`;
  };

  const joinMeeting = () => {
    setRoomState(prev => ({ ...prev, isInLobby: false, isConnected: true }));
  };

  const leaveMeeting = () => {
    setRoomState(prev => ({ ...prev, isInLobby: true, isConnected: false }));
  };

  const toggleMute = () => {
    setRoomState(prev => ({ ...prev, isMuted: !prev.isMuted }));
  };

  const toggleVideo = () => {
    setRoomState(prev => ({ ...prev, isVideoOff: !prev.isVideoOff }));
  };

  return {
    event,
    isLoading,
    error,
    roomState,
    generateRoomName,
    joinMeeting,
    leaveMeeting,
    toggleMute,
    toggleVideo,
    user,
  };
}
