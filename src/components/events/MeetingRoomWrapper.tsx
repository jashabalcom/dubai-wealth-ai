import { CommunityEvent } from '@/hooks/useCommunityEvents';
import { EmbeddedMeetingRoom } from './EmbeddedMeetingRoom';
import { ZoomMeetingRoom } from './ZoomMeetingRoom';

interface MeetingRoomWrapperProps {
  event: CommunityEvent;
  roomName: string;
  displayName: string;
  email?: string;
  avatarUrl?: string;
  isHost?: boolean;
  onReadyToClose: () => void;
}

export function MeetingRoomWrapper({
  event,
  roomName,
  displayName,
  email,
  avatarUrl,
  isHost = false,
  onReadyToClose,
}: MeetingRoomWrapperProps) {
  // Determine which platform to use based on meeting_platform
  const isZoomEmbedded = event.meeting_platform === 'zoom_embedded';
  const hasZoomMeetingNumber = Boolean(event.zoom_meeting_number);

  // Use Zoom embedded if platform is zoom_embedded AND we have a meeting number
  if (isZoomEmbedded && hasZoomMeetingNumber) {
    return (
      <ZoomMeetingRoom
        meetingNumber={event.zoom_meeting_number!}
        password={event.zoom_password || undefined}
        displayName={displayName}
        email={email}
        isHost={isHost}
        onReadyToClose={onReadyToClose}
      />
    );
  }

  // Default to Jitsi embedded meeting
  return (
    <EmbeddedMeetingRoom
      roomName={roomName}
      displayName={displayName}
      email={email}
      avatarUrl={avatarUrl}
      isHost={isHost}
      onReadyToClose={onReadyToClose}
    />
  );
}
