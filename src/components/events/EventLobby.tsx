import { useState, useEffect, useRef } from 'react';
import { format, formatDistanceToNow, isPast, isFuture, differenceInSeconds } from 'date-fns';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, Mic, MicOff, Video, VideoOff, ArrowLeft, Loader2, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CommunityEvent } from '@/hooks/useCommunityEvents';
import { fadeUpVariants, staggerContainerVariants } from '@/lib/motion';
import { getEventEndTime, hasEventEnded } from '@/lib/eventUtils';

interface EventLobbyProps {
  event: CommunityEvent;
  userDisplayName: string;
  userAvatarUrl?: string;
  isHost?: boolean;
  onJoin: () => void;
  onBack: () => void;
}

export function EventLobby({ event, userDisplayName, userAvatarUrl, isHost = false, onJoin, onBack }: EventLobbyProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [countdown, setCountdown] = useState<string | null>(null);
  const [canJoin, setCanJoin] = useState(false);
  
  // Camera preview state
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);

  const eventDate = new Date(event.event_date);
  const endTime = getEventEndTime(eventDate, event.duration_minutes);
  const eventEnded = hasEventEnded(eventDate, event.duration_minutes);
  const isLive = event.is_live;
  const hasStarted = isPast(eventDate);
  const isStartingSoon = isFuture(eventDate) && differenceInSeconds(eventDate, new Date()) < 600; // 10 minutes

  // If event has ended, show ended message
  if (eventEnded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-serif font-bold">Event Has Ended</h2>
          <p className="text-muted-foreground">
            This event ended on {format(endTime, 'MMMM d, yyyy')} at {format(endTime, 'h:mm a')}.
          </p>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const updateCountdown = () => {
      if (isPast(eventDate)) {
        setCountdown(null);
        setCanJoin(true);
      } else {
        const seconds = differenceInSeconds(eventDate, new Date());
        if (seconds < 600) { // Allow join 10 minutes before
          setCanJoin(true);
        }
        if (seconds > 0) {
          const hours = Math.floor(seconds / 3600);
          const minutes = Math.floor((seconds % 3600) / 60);
          const secs = seconds % 60;
          if (hours > 0) {
            setCountdown(`${hours}h ${minutes}m ${secs}s`);
          } else if (minutes > 0) {
            setCountdown(`${minutes}m ${secs}s`);
          } else {
            setCountdown(`${secs}s`);
          }
        }
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [eventDate]);

  // Camera preview effect - request stream
  useEffect(() => {
    const startCamera = async () => {
      if (isVideoOff) {
        // Stop stream if video is turned off
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
          setPreviewStream(null);
        }
        return;
      }

      // Check for secure context
      if (!window.isSecureContext) {
        setCameraError('Camera requires HTTPS. Please use a secure connection.');
        return;
      }

      try {
        setIsLoadingCamera(true);
        setCameraError(null);
        
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false
        });
        
        streamRef.current = mediaStream;
        setPreviewStream(mediaStream);
      } catch (err) {
        console.error('Camera access error:', err);
        if (err instanceof Error) {
          if (err.name === 'NotAllowedError') {
            setCameraError('Camera access denied. Please allow camera access in your browser.');
          } else if (err.name === 'NotFoundError') {
            setCameraError('No camera found on this device.');
          } else {
            setCameraError('Unable to access camera.');
          }
        }
      } finally {
        setIsLoadingCamera(false);
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [isVideoOff]);

  // Attach stream to video element after it's mounted
  useEffect(() => {
    if (videoRef.current && previewStream) {
      videoRef.current.srcObject = previewStream;
      videoRef.current.play().catch(() => {});
    }
  }, [previewStream]);

  const handleJoin = () => {
    // Stop camera stream before joining (Jitsi will request its own)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setPreviewStream(null);
    }
    onJoin();
  };

  const retryCamera = () => {
    setCameraError(null);
    setIsVideoOff(true);
    setTimeout(() => setIsVideoOff(false), 100);
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background with event cover */}
      {event.cover_image_url && (
        <div 
          className="absolute inset-0 opacity-20 blur-3xl"
          style={{ 
            backgroundImage: `url(${event.cover_image_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}
      
      <motion.div
        variants={staggerContainerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-2xl"
      >
        {/* Back button */}
        <motion.div variants={fadeUpVariants} className="mb-6">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="text-pearl hover:text-gold hover:bg-transparent gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Events
          </Button>
        </motion.div>

        {/* Main lobby card */}
        <motion.div 
          variants={fadeUpVariants}
          className="glass-dark rounded-3xl p-8 space-y-8"
        >
          {/* Event header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              {isHost && (
                <Badge className="bg-gold/20 text-gold border border-gold/30 gap-1.5 px-3 py-1">
                  <Crown className="h-3.5 w-3.5" />
                  Host
                </Badge>
              )}
              {isLive && (
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: [0.9, 1.1, 0.9] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Badge className="bg-red-500 text-white gap-1.5 px-4 py-1.5 text-sm">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                    </span>
                    LIVE NOW
                  </Badge>
                </motion.div>
              )}
            </div>
            
            <h1 className="font-serif text-3xl md:text-4xl text-pearl">
              {event.title}
            </h1>
            
            {event.description && (
              <p className="text-muted-foreground max-w-lg mx-auto">
                {event.description}
              </p>
            )}
          </div>

          {/* Event details */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-pearl/80">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gold" />
              <span>{format(eventDate, 'MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gold" />
              <span>{format(eventDate, 'h:mm a')} - {format(endTime, 'h:mm a')} ({event.duration_minutes}min)</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gold" />
              <span>{event.registrations_count || 0} registered</span>
            </div>
          </div>

          {/* Camera preview */}
          <div className="relative aspect-video max-w-md mx-auto rounded-2xl overflow-hidden bg-secondary/50 border-2 border-gold/20">
            {isVideoOff ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-3">
                  <Avatar className="h-24 w-24 mx-auto border-2 border-gold">
                    <AvatarImage src={userAvatarUrl} />
                    <AvatarFallback className="text-2xl bg-gold text-secondary">
                      {userDisplayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-pearl font-medium">{userDisplayName}</p>
                </div>
              </div>
            ) : isLoadingCamera ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gold" />
              </div>
            ) : cameraError ? (
              <div className="absolute inset-0 flex items-center justify-center text-center p-4">
                <div className="space-y-3">
                  <VideoOff className="h-12 w-12 mx-auto text-destructive" />
                  <p className="text-destructive text-sm">{cameraError}</p>
                  <Button variant="outline" size="sm" onClick={retryCamera}>
                    Try Again
                  </Button>
                </div>
              </div>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover [transform:scaleX(-1)]"
              />
            )}

            {/* Control overlay */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
              <Button
                variant={isMuted ? "destructive" : "secondary"}
                size="icon"
                className="rounded-full h-12 w-12"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
              <Button
                variant={isVideoOff ? "destructive" : "secondary"}
                size="icon"
                className="rounded-full h-12 w-12"
                onClick={() => setIsVideoOff(!isVideoOff)}
              >
                {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Host info message */}
          {isHost && (
            <div className="text-center bg-gold/10 border border-gold/20 rounded-xl p-4">
              <p className="text-pearl/80 text-sm">
                You are the organizer. Joining will start the room and give you host controls.
              </p>
            </div>
          )}

          {/* Countdown or Join button */}
          <div className="text-center space-y-4">
            {countdown && !canJoin ? (
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">Event starts in</p>
                <p className="font-mono text-4xl text-gold">{countdown}</p>
              </div>
            ) : countdown ? (
              <div className="space-y-3">
                <p className="text-sm text-green-400">Event starting in {countdown}</p>
                <Button
                  size="lg"
                  onClick={handleJoin}
                  className="bg-gold hover:bg-gold/90 text-secondary px-12 py-6 text-lg font-medium shimmer-button-gold"
                >
                  {isHost ? 'Start Meeting' : 'Join Now'}
                </Button>
              </div>
            ) : (
              <Button
                size="lg"
                onClick={handleJoin}
                className="bg-gold hover:bg-gold/90 text-secondary px-12 py-6 text-lg font-medium shimmer-button-gold"
              >
                {isHost ? 'Start Meeting' : isLive ? 'Join Live Event' : 'Enter Meeting Room'}
              </Button>
            )}
          </div>
        </motion.div>

        {/* Waiting attendees */}
        <motion.div variants={fadeUpVariants} className="mt-6 text-center">
          <p className="text-pearl/60 text-sm">
            {isLive || hasStarted 
              ? 'Others are already in the meeting' 
              : isStartingSoon 
                ? 'Other members are waiting in the lobby'
                : `Event starts ${formatDistanceToNow(eventDate, { addSuffix: true })}`
            }
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
