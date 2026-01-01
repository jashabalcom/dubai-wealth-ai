import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Users, Info, LogOut, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useEventRoom } from '@/hooks/useEventRoom';
import { useProfile } from '@/hooks/useProfile';
import { EventLobby } from '@/components/events/EventLobby';
import { MeetingRoomWrapper } from '@/components/events/MeetingRoomWrapper';
import { AttendeeSidebar } from '@/components/events/AttendeeSidebar';
import { EventInfoPanel } from '@/components/events/EventInfoPanel';
import { LazyLoadFallback } from '@/components/LazyLoadFallback';

export default function EventRoom() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { profile } = useProfile();
  
  const {
    event,
    isLoading,
    error,
    roomState,
    isHost,
    generateRoomName,
    joinMeeting,
    leaveMeeting,
  } = useEventRoom(eventId || '');

  const [showAttendeeSidebar, setShowAttendeeSidebar] = useState(true);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);

  const displayName = profile?.full_name || 'Guest';
  const avatarUrl = profile?.avatar_url || undefined;

  const handleBack = () => {
    navigate('/community/events');
  };

  const handleLeave = () => {
    setShowLeaveDialog(true);
  };

  const confirmLeave = () => {
    leaveMeeting();
    navigate('/community/events');
  };

  const handleMeetingEnd = () => {
    leaveMeeting();
    navigate('/community/events');
  };

  if (isLoading) {
    return <LazyLoadFallback />;
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-pearl text-lg">{error || 'Event not found'}</p>
          <Button onClick={handleBack} variant="outline" className="border-gold text-gold">
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

  // Show lobby if user hasn't joined yet
  if (roomState.isInLobby) {
    return (
      <EventLobby
        event={event}
        userDisplayName={displayName}
        userAvatarUrl={avatarUrl}
        isHost={isHost}
        onJoin={joinMeeting}
        onBack={handleBack}
      />
    );
  }

  const roomName = generateRoomName(event);

  return (
    <>
      <div className="h-screen bg-gradient-hero flex flex-col overflow-hidden">
        {/* Header */}
        <motion.header
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex-shrink-0 h-16 glass-dark border-b border-gold/10 flex items-center justify-between px-4 lg:px-6"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLeave}
              className="text-pearl hover:text-gold hover:bg-transparent gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Leave</span>
            </Button>
            
            <div className="flex items-center gap-3">
              {event.is_live && (
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: [0.9, 1.05, 0.9] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Badge className="bg-red-500 text-white gap-1">
                    <Radio className="h-3 w-3" />
                    LIVE
                  </Badge>
                </motion.div>
              )}
              <h1 className="font-serif text-lg text-pearl truncate max-w-[200px] sm:max-w-none">
                {event.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowAttendeeSidebar(!showAttendeeSidebar)}
              className={`text-pearl hover:text-gold hover:bg-transparent ${
                showAttendeeSidebar ? 'text-gold' : ''
              }`}
            >
              <Users className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowInfoPanel(!showInfoPanel)}
              className={`text-pearl hover:text-gold hover:bg-transparent ${
                showInfoPanel ? 'text-gold' : ''
              }`}
            >
              <Info className="h-5 w-5" />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleLeave}
              className="hidden sm:flex gap-2"
            >
              <LogOut className="h-4 w-4" />
              Leave Event
            </Button>
          </div>
        </motion.header>

        {/* Main content area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Attendee Sidebar - Desktop */}
          <div className="hidden lg:block">
            <AttendeeSidebar
              eventId={event.id}
              isOpen={showAttendeeSidebar}
              onClose={() => setShowAttendeeSidebar(false)}
              hostId={event.created_by}
            />
          </div>

          {/* Meeting area */}
          <motion.div 
            layout
            className="flex-1 p-4 lg:p-6"
          >
            <AnimatePresence mode="wait">
              <MeetingRoomWrapper
                event={event}
                roomName={roomName}
                displayName={displayName}
                email={profile?.email}
                avatarUrl={avatarUrl}
                isHost={isHost}
                onReadyToClose={handleMeetingEnd}
              />
            </AnimatePresence>
          </motion.div>

          {/* Info Panel - Desktop */}
          <div className="hidden lg:block">
            <EventInfoPanel
              event={event}
              isOpen={showInfoPanel}
              onClose={() => setShowInfoPanel(false)}
            />
          </div>
        </div>
      </div>

      {/* Leave confirmation dialog */}
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent className="bg-card border-gold/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif">Leave Event?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to leave this event? You can rejoin anytime while the event is active.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gold/20">Stay</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmLeave}
              className="bg-destructive hover:bg-destructive/90"
            >
              Leave Event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
