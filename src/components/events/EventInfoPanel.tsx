import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ChevronRight, Calendar, Clock, Users, FileText, Link2, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { CommunityEvent } from '@/hooks/useCommunityEvents';
import { toast } from 'sonner';

interface EventInfoPanelProps {
  event: CommunityEvent;
  isOpen: boolean;
  onClose: () => void;
}

export function EventInfoPanel({ event, isOpen, onClose }: EventInfoPanelProps) {
  const [copied, setCopied] = useState(false);
  const eventDate = new Date(event.event_date);

  const handleCopyLink = async () => {
    const eventUrl = `${window.location.origin}/community/events?event=${event.id}`;
    await navigator.clipboard.writeText(eventUrl);
    setCopied(true);
    toast.success('Event link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const getEventTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      webinar: 'Webinar',
      meetup: 'Meetup',
      workshop: 'Workshop',
      ama: 'AMA Session',
    };
    return labels[type] || type;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-80 h-full glass-dark border-l border-gold/10 flex flex-col"
        >
          {/* Header */}
          <div className="p-4 border-b border-gold/10 flex items-center justify-between">
            <span className="font-medium text-pearl">Event Details</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-pearl hover:text-gold hover:bg-transparent"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
              {/* Event cover */}
              {event.cover_image_url && (
                <div className="rounded-xl overflow-hidden border border-gold/10">
                  <img
                    src={event.cover_image_url}
                    alt={event.title}
                    className="w-full aspect-video object-cover"
                  />
                </div>
              )}

              {/* Title and type */}
              <div className="space-y-2">
                <Badge variant="secondary" className="bg-gold/20 text-gold">
                  {getEventTypeLabel(event.event_type)}
                </Badge>
                <h3 className="font-serif text-xl text-pearl">
                  {event.title}
                </h3>
              </div>

              {/* Date and time */}
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 text-pearl/80">
                  <Calendar className="h-4 w-4 text-gold" />
                  <span>{format(eventDate, 'EEEE, MMMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-3 text-pearl/80">
                  <Clock className="h-4 w-4 text-gold" />
                  <span>{format(eventDate, 'h:mm a')} · {event.duration_minutes} minutes</span>
                </div>
                <div className="flex items-center gap-3 text-pearl/80">
                  <Users className="h-4 w-4 text-gold" />
                  <span>
                    {event.registrations_count || 0} attendees
                    {event.max_attendees && ` / ${event.max_attendees} max`}
                  </span>
                </div>
              </div>

              <Separator className="bg-gold/10" />

              {/* Description */}
              {event.description && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-pearl">
                    <FileText className="h-4 w-4 text-gold" />
                    About this event
                  </div>
                  <p className="text-sm text-pearl/70 leading-relaxed">
                    {event.description}
                  </p>
                </div>
              )}

              <Separator className="bg-gold/10" />

              {/* Share event */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-pearl">
                  <Link2 className="h-4 w-4 text-gold" />
                  Share this event
                </div>
                <Button
                  variant="outline"
                  className="w-full border-gold/20 text-pearl hover:bg-gold/10 hover:text-gold gap-2"
                  onClick={handleCopyLink}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy Event Link
                    </>
                  )}
                </Button>
              </div>
            </div>
          </ScrollArea>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
