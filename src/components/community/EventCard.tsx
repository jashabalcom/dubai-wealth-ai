import { format } from 'date-fns';
import { Calendar, Clock, Users, Video, ExternalLink, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CommunityEvent } from '@/hooks/useCommunityEvents';

interface EventCardProps {
  event: CommunityEvent;
  onRegister: (eventId: string) => void;
  onUnregister: (eventId: string) => void;
  isRegistering?: boolean;
}

export function EventCard({ event, onRegister, onUnregister, isRegistering }: EventCardProps) {
  const eventDate = new Date(event.event_date);
  const isPast = eventDate < new Date();
  const isUpcoming = eventDate > new Date() && eventDate < new Date(Date.now() + 24 * 60 * 60 * 1000);

  const getPlatformIcon = () => {
    switch (event.meeting_platform) {
      case 'zoom':
        return <span className="text-blue-500 font-semibold text-xs">Zoom</span>;
      case 'google_meet':
        return <span className="text-green-500 font-semibold text-xs">Meet</span>;
      default:
        return <Video className="h-3 w-3" />;
    }
  };

  const getEventTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      webinar: 'Webinar',
      meetup: 'Meetup',
      workshop: 'Workshop',
      ama: 'AMA',
    };
    return labels[type] || type;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className={`group bg-card border rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-gold/10 ${
        event.visibility === 'elite_only' ? 'border-gold/30 hover:border-gold/50' : 'border-border/50 hover:border-gold/30'
      } ${isPast ? 'opacity-60' : ''}`}
    >
      {/* Cover Image */}
      {event.cover_image_url && (
        <div className="aspect-video relative overflow-hidden">
          <img
            src={event.cover_image_url}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {event.visibility === 'elite_only' && (
            <motion.div 
              className="absolute top-3 right-3"
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Badge className="bg-gold text-background gap-1">
                <Crown className="h-3 w-3" />
                Elite
              </Badge>
            </motion.div>
          )}
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs transition-colors group-hover:bg-primary/10">
                {getEventTypeLabel(event.event_type)}
              </Badge>
              {isUpcoming && (
                <Badge className="bg-green-500/20 text-green-500 text-xs animate-pulse-soft">
                  Starting Soon
                </Badge>
              )}
              {!event.cover_image_url && event.visibility === 'elite_only' && (
                <Badge className="bg-gold/20 text-gold gap-1 text-xs">
                  <Crown className="h-3 w-3" />
                  Elite
                </Badge>
              )}
            </div>
            <h3 className="font-serif text-lg font-semibold line-clamp-2 transition-colors group-hover:text-gold">
              {event.title}
            </h3>
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {event.description}
          </p>
        )}

        {/* Event Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground transition-colors group-hover:text-foreground">
            <Calendar className="h-4 w-4 text-gold" />
            <span>{format(eventDate, 'EEEE, MMMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground transition-colors group-hover:text-foreground">
            <Clock className="h-4 w-4 text-gold" />
            <span>
              {format(eventDate, 'h:mm a')} · {event.duration_minutes} min
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 transition-colors group-hover:text-foreground">
              <Users className="h-4 w-4 text-gold" />
              <span>
                {event.registrations_count} registered
                {event.max_attendees && ` / ${event.max_attendees}`}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {getPlatformIcon()}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {isPast ? (
            <Button variant="outline" disabled className="flex-1">
              Event Ended
            </Button>
          ) : event.is_registered ? (
            <>
              {event.meeting_url && (
                <Button
                  variant="default"
                  className="flex-1 bg-gold hover:bg-gold/90 text-background transition-transform hover:scale-[1.02]"
                  onClick={() => window.open(event.meeting_url!, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Join Meeting
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => onUnregister(event.id)}
                disabled={isRegistering}
                className="transition-colors hover:border-destructive hover:text-destructive"
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button
              variant="default"
              className="flex-1 bg-gold hover:bg-gold/90 text-background transition-transform hover:scale-[1.02]"
              onClick={() => onRegister(event.id)}
              disabled={isRegistering || (event.max_attendees !== null && event.registrations_count! >= event.max_attendees)}
            >
              {event.max_attendees !== null && event.registrations_count! >= event.max_attendees
                ? 'Event Full'
                : 'Register'}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
