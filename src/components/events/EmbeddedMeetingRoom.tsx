import { useEffect, useRef, useState } from 'react';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { motion } from 'framer-motion';
import { HostControlPanel } from './HostControlPanel';

interface Participant {
  id: string;
  displayName: string;
}

interface EmbeddedMeetingRoomProps {
  roomName: string;
  displayName: string;
  email?: string;
  avatarUrl?: string;
  isHost?: boolean;
  onReadyToClose: () => void;
  onParticipantJoined?: () => void;
  onParticipantLeft?: () => void;
}

export function EmbeddedMeetingRoom({
  roomName,
  displayName,
  email,
  avatarUrl,
  isHost = false,
  onReadyToClose,
  onParticipantJoined,
  onParticipantLeft,
}: EmbeddedMeetingRoomProps) {
  const apiRef = useRef<any>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [raisedHands, setRaisedHands] = useState<string[]>([]);

  // Inject custom CSS to match brand colors
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'jitsi-brand-override';
    style.textContent = `
      /* Override Jitsi iframe styles for brand consistency */
      #jitsi-meet-frame {
        border-radius: 1rem;
        overflow: hidden;
      }
    `;
    document.head.appendChild(style);

    return () => {
      const existingStyle = document.getElementById('jitsi-brand-override');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  const handleApiReady = (externalApi: any) => {
    apiRef.current = externalApi;

    // Listen for participant events
    externalApi.addEventListener('participantJoined', (event: any) => {
      setParticipants(prev => [...prev, { 
        id: event.id, 
        displayName: event.displayName || 'Guest' 
      }]);
      onParticipantJoined?.();
    });

    externalApi.addEventListener('participantLeft', (event: any) => {
      setParticipants(prev => prev.filter(p => p.id !== event.id));
      setRaisedHands(prev => prev.filter(id => id !== event.id));
      onParticipantLeft?.();
    });

    externalApi.addEventListener('readyToClose', () => {
      onReadyToClose();
    });

    // Track raised hands
    externalApi.addEventListener('raiseHandUpdated', (event: any) => {
      if (event.handRaised) {
        setRaisedHands(prev => [...prev, event.id]);
      } else {
        setRaisedHands(prev => prev.filter(id => id !== event.id));
      }
    });

    // Track moderator status
    externalApi.addEventListener('participantRoleChanged', (event: any) => {
      if (event.role === 'moderator' && isHost) {
        // Enable lobby for hosts by default
        externalApi.executeCommand('toggleLobby', true);
      }
    });
  };

  // Detect mobile for responsive toolbar
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Full toolbar for desktop, minimal for mobile
  const desktopToolbarButtons = [
    'microphone',
    'camera',
    'desktop',           // Screen sharing
    'chat',
    'raisehand',
    'reactions',         // Emoji reactions
    'participants-pane',
    'tileview',
    'recording',         // Local recording
    'videoquality',      // HD/SD quality control
    'select-background', // Virtual backgrounds/blur
    'closedcaptions',    // Live captions
    'whiteboard',        // Collaborative whiteboard
    'sharedvideo',       // Share YouTube videos
    'security',          // Security options (lobby, password)
    'settings',
    'shortcuts',         // Keyboard shortcuts help
    'stats',             // Connection stats
    'filmstrip',         // Toggle filmstrip
    'fullscreen',
    'hangup',
  ];

  const mobileToolbarButtons = [
    'microphone',
    'camera',
    'chat',
    'raisehand',
    'reactions',
    'participants-pane',
    'tileview',
    'select-background',
    'fullscreen',
    'hangup',
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className="relative w-full h-full rounded-xl overflow-hidden bg-secondary"
    >
      <JitsiMeeting
        domain="meet.jit.si"
        roomName={roomName}
        configOverwrite={{
          startWithAudioMuted: true,
          startWithVideoMuted: false,
          prejoinPageEnabled: false,
          disableDeepLinking: true,
          enableWelcomePage: false,
          enableClosePage: false,
          disableInviteFunctions: true,
          hideConferenceSubject: true,
          hideConferenceTimer: false,
          subject: ' ',
          defaultLanguage: 'en',
          toolbarButtons: isMobile ? mobileToolbarButtons : desktopToolbarButtons,
          
          // Moderator/Host controls
          enableLobby: true,
          lobbyModeEnabled: isHost,
          remoteVideoMenu: {
            disabled: false,
            disableKick: !isHost,
            disableGrantModerator: !isHost,
            disablePrivateChat: false,
          },
          
          // Breakout rooms (host only)
          breakoutRooms: {
            hideAddRoomButton: !isHost,
            hideAutoAssignButton: !isHost,
            hideJoinRoomButton: false,
          },
          
          // Recording
          localRecording: {
            enabled: true,
            format: 'webm'
          },
          
          // Virtual backgrounds
          backgroundAlpha: 0.5,
          disableVirtualBackground: false,
          
          // Reactions
          disableReactions: false,
          disableReactionsModeration: false,
          
          // Quality settings
          resolution: 720,
          constraints: {
            video: {
              height: { ideal: 720, max: 1080, min: 240 }
            }
          },
          
          // Security
          enableInsecureRoomNameWarning: false,
          
          // Custom branding
          brandingRoomAlias: 'Dubai Wealth Hub',
        }}
        interfaceConfigOverwrite={{
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_BRAND_WATERMARK: false,
          SHOW_POWERED_BY: false,
          MOBILE_APP_PROMO: false,
          DEFAULT_BACKGROUND: '#101827',
          DEFAULT_LOCAL_DISPLAY_NAME: displayName,
          DEFAULT_REMOTE_DISPLAY_NAME: 'Member',
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
          FILM_STRIP_MAX_HEIGHT: 150,
          VERTICAL_FILMSTRIP: true,
          TILE_VIEW_MAX_COLUMNS: 6,
          TOOLBAR_ALWAYS_VISIBLE: true,
          VIDEO_QUALITY_LABEL_DISABLED: false,
          DISABLE_FOCUS_INDICATOR: false,
          DISABLE_DOMINANT_SPEAKER_INDICATOR: false,
          DISABLE_TRANSCRIPTION_SUBTITLES: false,
          HIDE_KICK_BUTTON_FOR_GUESTS: true,
          SETTINGS_SECTIONS: ['devices', 'language', 'moderator', 'profile', 'sounds', 'more'],
        }}
        userInfo={{
          displayName: displayName,
          email: email || '',
        }}
        getIFrameRef={(iframeRef) => {
          if (iframeRef) {
            iframeRef.style.height = '100%';
            iframeRef.style.width = '100%';
            iframeRef.style.border = 'none';
            iframeRef.style.borderRadius = '0.75rem';
            iframeRef.setAttribute('allow', 'camera; microphone; autoplay; fullscreen; display-capture');
          }
        }}
        onApiReady={handleApiReady}
      />
      
      {/* Host Control Panel */}
      {isHost && (
        <HostControlPanel
          apiRef={apiRef}
          isHost={isHost}
          participants={participants}
          raisedHands={raisedHands}
          onEndMeetingForAll={onReadyToClose}
        />
      )}
    </motion.div>
  );
}
