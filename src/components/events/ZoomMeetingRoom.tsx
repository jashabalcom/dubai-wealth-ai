import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, LogOut, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useZoomMeeting } from '@/hooks/useZoomMeeting';

interface ZoomMeetingRoomProps {
  meetingNumber: string;
  password?: string;
  displayName: string;
  email?: string;
  isHost?: boolean;
  onReadyToClose: () => void;
}

export function ZoomMeetingRoom({
  meetingNumber,
  password,
  displayName,
  email,
  isHost = false,
  onReadyToClose,
}: ZoomMeetingRoomProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const {
    setContainer,
    isLoading,
    error,
    isConnected,
    leaveMeeting,
    endMeetingForAll,
  } = useZoomMeeting({
    meetingNumber,
    password,
    userName: displayName,
    userEmail: email,
    isHost,
    onMeetingEnd: onReadyToClose,
  });

  // Set container when ref is available
  useEffect(() => {
    if (containerRef.current) {
      setContainer(containerRef.current);
    }
  }, [setContainer]);

  const handleLeave = async () => {
    await leaveMeeting();
    onReadyToClose();
  };

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-secondary rounded-xl">
        <div className="text-center space-y-4 p-8">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
          <h3 className="font-medium text-lg">Unable to Join Meeting</h3>
          <p className="text-muted-foreground text-sm max-w-md">{error}</p>
          <Button variant="outline" onClick={onReadyToClose}>
            <X className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className="relative w-full h-full rounded-xl overflow-hidden bg-secondary"
    >
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-secondary">
          <div className="text-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-gold mx-auto" />
            <p className="text-muted-foreground">Connecting to Zoom meeting...</p>
          </div>
        </div>
      )}

      {/* Zoom meeting container */}
      <div
        ref={containerRef}
        id="zoom-meeting-root"
        className="w-full h-full"
        style={{ minHeight: '500px' }}
      />

      {/* Custom controls overlay */}
      {isConnected && isHost && (
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={endMeetingForAll}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            End for All
          </Button>
        </div>
      )}

      {isConnected && (
        <div className="absolute bottom-4 right-4 z-20">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLeave}
            className="gap-2 bg-background/80 backdrop-blur-sm"
          >
            <LogOut className="h-4 w-4" />
            Leave
          </Button>
        </div>
      )}
    </motion.div>
  );
}
