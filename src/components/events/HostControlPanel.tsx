import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  MicOff, 
  Hand, 
  Users, 
  DoorOpen,
  X,
  ChevronDown,
  ChevronUp,
  UserMinus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { toast } from 'sonner';

interface Participant {
  id: string;
  displayName: string;
  isHandRaised?: boolean;
}

interface HostControlPanelProps {
  apiRef: React.MutableRefObject<any>;
  isHost: boolean;
  participants?: Participant[];
  raisedHands?: string[];
  onEndMeetingForAll?: () => void;
}

export function HostControlPanel({
  apiRef,
  isHost,
  participants = [],
  raisedHands = [],
  onEndMeetingForAll,
}: HostControlPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [lobbyEnabled, setLobbyEnabled] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isHost) return null;

  const handleMuteAll = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand('muteEveryone');
      toast.success('All participants muted');
    }
  };

  const handleToggleLobby = (enabled: boolean) => {
    if (apiRef.current) {
      apiRef.current.executeCommand('toggleLobby', enabled);
      setLobbyEnabled(enabled);
      toast.success(enabled ? 'Waiting room enabled' : 'Waiting room disabled');
    }
  };

  const handleKickParticipant = (participantId: string, name: string) => {
    if (apiRef.current) {
      apiRef.current.executeCommand('kickParticipant', participantId);
      toast.success(`${name} has been removed`);
    }
  };

  const handleEndMeetingForAll = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand('endConference');
      onEndMeetingForAll?.();
      toast.success('Meeting ended for all participants');
    }
  };

  const handleLowerHand = (participantId: string) => {
    if (apiRef.current) {
      // Lower hand for specific participant (if supported)
      apiRef.current.executeCommand('setParticipantRaisedHand', participantId, false);
    }
  };

  const participantsWithRaisedHands = participants.filter(
    p => raisedHands.includes(p.id)
  );

  if (isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-4 left-4 z-50"
      >
        <Button
          onClick={() => setIsMinimized(false)}
          className="bg-gold hover:bg-gold-light text-navy gap-2 shadow-lg"
        >
          <Shield className="h-4 w-4" />
          Host Controls
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="absolute bottom-4 left-4 z-50 w-72 glass-dark rounded-xl border border-gold/20 shadow-xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gold/10">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-gold" />
          <span className="font-medium text-pearl text-sm">Host Controls</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMinimized(true)}
          className="h-6 w-6 text-pearl/60 hover:text-pearl hover:bg-transparent"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="max-h-80">
        <div className="p-3 space-y-3">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleMuteAll}
              className="border-gold/20 text-pearl hover:bg-gold/10 hover:text-gold gap-1.5"
            >
              <MicOff className="h-3.5 w-3.5" />
              Mute All
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleEndMeetingForAll}
              className="gap-1.5"
            >
              <DoorOpen className="h-3.5 w-3.5" />
              End All
            </Button>
          </div>

          {/* Waiting Room Toggle */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-pearl/60" />
              <Label htmlFor="lobby-toggle" className="text-sm text-pearl">
                Waiting Room
              </Label>
            </div>
            <Switch
              id="lobby-toggle"
              checked={lobbyEnabled}
              onCheckedChange={handleToggleLobby}
              className="data-[state=checked]:bg-gold"
            />
          </div>

          {/* Raised Hands */}
          {participantsWithRaisedHands.length > 0 && (
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-2 h-auto text-pearl hover:bg-gold/10"
                >
                  <div className="flex items-center gap-2">
                    <Hand className="h-4 w-4 text-amber-400" />
                    <span className="text-sm">Raised Hands</span>
                    <Badge variant="secondary" className="bg-amber-400/20 text-amber-400">
                      {participantsWithRaisedHands.length}
                    </Badge>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-1 pt-1">
                  {participantsWithRaisedHands.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-secondary/30"
                    >
                      <span className="text-sm text-pearl truncate">
                        {participant.displayName}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLowerHand(participant.id)}
                        className="h-7 px-2 text-pearl/60 hover:text-pearl"
                      >
                        Lower
                      </Button>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Participant Management */}
          {participants.length > 0 && (
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-2 h-auto text-pearl hover:bg-gold/10"
                >
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-pearl/60" />
                    <span className="text-sm">Participants</span>
                    <Badge variant="secondary" className="bg-secondary">
                      {participants.length}
                    </Badge>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-1 pt-1 max-h-32 overflow-y-auto">
                  {participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-secondary/30"
                    >
                      <span className="text-sm text-pearl truncate flex-1">
                        {participant.displayName}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleKickParticipant(participant.id, participant.displayName)}
                        className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <UserMinus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </ScrollArea>
    </motion.div>
  );
}
