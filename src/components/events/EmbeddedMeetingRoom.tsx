import { useEffect, useRef } from 'react';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { motion } from 'framer-motion';

interface EmbeddedMeetingRoomProps {
  roomName: string;
  displayName: string;
  email?: string;
  avatarUrl?: string;
  onReadyToClose: () => void;
  onParticipantJoined?: () => void;
  onParticipantLeft?: () => void;
}

export function EmbeddedMeetingRoom({
  roomName,
  displayName,
  email,
  avatarUrl,
  onReadyToClose,
  onParticipantJoined,
  onParticipantLeft,
}: EmbeddedMeetingRoomProps) {
  const apiRef = useRef<any>(null);

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

    // Listen for events
    externalApi.addEventListener('participantJoined', () => {
      onParticipantJoined?.();
    });

    externalApi.addEventListener('participantLeft', () => {
      onParticipantLeft?.();
    });

    externalApi.addEventListener('readyToClose', () => {
      onReadyToClose();
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className="w-full h-full rounded-xl overflow-hidden bg-secondary"
    >
      <JitsiMeeting
        domain="meet.jit.si"
        roomName={roomName}
        configOverwrite={{
          startWithAudioMuted: true,
          startWithVideoMuted: false,
          prejoinPageEnabled: false, // We have our own lobby
          disableDeepLinking: true,
          enableWelcomePage: false,
          enableClosePage: false,
          disableInviteFunctions: true,
          hideConferenceSubject: true,
          hideConferenceTimer: false,
          subject: ' ', // Empty to hide default subject
          defaultLanguage: 'en',
          toolbarButtons: [
            'microphone',
            'camera',
            'desktop',
            'chat',
            'raisehand',
            'participants-pane',
            'tileview',
            'settings',
            'fullscreen',
            'hangup',
          ],
          // Custom branding colors
          brandingRoomAlias: 'Dubai Wealth Hub',
        }}
        interfaceConfigOverwrite={{
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_BRAND_WATERMARK: false,
          SHOW_POWERED_BY: false,
          MOBILE_APP_PROMO: false,
          DEFAULT_BACKGROUND: '#101827', // Deep navy
          DEFAULT_LOCAL_DISPLAY_NAME: displayName,
          DEFAULT_REMOTE_DISPLAY_NAME: 'Member',
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
          FILM_STRIP_MAX_HEIGHT: 120,
          TILE_VIEW_MAX_COLUMNS: 5,
          TOOLBAR_ALWAYS_VISIBLE: true,
          VIDEO_QUALITY_LABEL_DISABLED: true,
          DISABLE_FOCUS_INDICATOR: true,
          DISABLE_DOMINANT_SPEAKER_INDICATOR: false,
          DISABLE_TRANSCRIPTION_SUBTITLES: true,
          HIDE_KICK_BUTTON_FOR_GUESTS: true,
          SETTINGS_SECTIONS: ['devices', 'language'],
          TOOLBAR_BUTTONS: [
            'microphone',
            'camera',
            'desktop',
            'chat',
            'raisehand',
            'participants-pane',
            'tileview',
            'settings',
            'fullscreen',
            'hangup',
          ],
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
          }
        }}
        onApiReady={handleApiReady}
      />
    </motion.div>
  );
}
