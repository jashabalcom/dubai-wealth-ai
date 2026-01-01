import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseZoomMeetingProps {
  meetingNumber: string;
  password?: string;
  userName: string;
  userEmail?: string;
  isHost?: boolean;
  onMeetingEnd?: () => void;
}

export function useZoomMeeting({
  meetingNumber,
  password = '',
  userName,
  userEmail,
  isHost = false,
  onMeetingEnd,
}: UseZoomMeetingProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clientRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Get Zoom signature from edge function
  const getSignature = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-zoom-signature', {
        body: {
          meetingNumber,
          role: isHost ? 1 : 0,
        },
      });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error getting Zoom signature:', err);
      throw new Error('Failed to get meeting credentials');
    }
  }, [meetingNumber, isHost]);

  // Initialize and join meeting
  const initializeMeeting = useCallback(async (container: HTMLDivElement) => {
    if (!meetingNumber) {
      setError('No meeting number provided');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Dynamically import Zoom SDK
      const ZoomMtgEmbedded = (await import('@zoom/meetingsdk/embedded')).default;
      
      const client = ZoomMtgEmbedded.createClient();
      clientRef.current = client;

      // Initialize the client
      await client.init({
        zoomAppRoot: container,
        language: 'en-US',
      });

      // Get signature from backend
      const { signature, sdkKey } = await getSignature();

      // Join the meeting
      await client.join({
        signature,
        sdkKey,
        meetingNumber: meetingNumber.replace(/[\s-]/g, ''),
        password,
        userName,
        userEmail,
      });

      setIsConnected(true);
      setIsLoading(false);

    } catch (err) {
      console.error('Zoom meeting error:', err);
      setError(err instanceof Error ? err.message : 'Failed to join meeting');
      setIsLoading(false);
    }
  }, [meetingNumber, password, userName, userEmail, getSignature]);

  // Leave meeting
  const leaveMeeting = useCallback(async () => {
    try {
      if (clientRef.current) {
        await clientRef.current.leave();
        setIsConnected(false);
        onMeetingEnd?.();
      }
    } catch (err) {
      console.error('Error leaving meeting:', err);
    }
  }, [onMeetingEnd]);

  // End meeting for all (host only)
  const endMeetingForAll = useCallback(async () => {
    try {
      if (clientRef.current && isHost) {
        await clientRef.current.endMeeting();
        setIsConnected(false);
        onMeetingEnd?.();
        toast.success('Meeting ended for all participants');
      }
    } catch (err) {
      console.error('Error ending meeting:', err);
      toast.error('Failed to end meeting');
    }
  }, [isHost, onMeetingEnd]);

  // Set container ref
  const setContainer = useCallback((container: HTMLDivElement | null) => {
    containerRef.current = container;
    if (container && !isConnected && !error) {
      initializeMeeting(container);
    }
  }, [isConnected, error, initializeMeeting]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (clientRef.current && isConnected) {
        clientRef.current.leave().catch(console.error);
      }
    };
  }, [isConnected]);

  return {
    setContainer,
    isLoading,
    error,
    isConnected,
    isMuted,
    isVideoOn,
    leaveMeeting,
    endMeetingForAll,
    isHost,
  };
}
