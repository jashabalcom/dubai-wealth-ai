import { CalendarEvent } from "@/hooks/useCalendarEvents";
import { CalendarEventDot, eventTypeLabels } from "./CalendarEventDot";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, ExternalLink, Building2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

interface CalendarEventCardProps {
  event: CalendarEvent;
  variant?: 'default' | 'compact';
  className?: string;
}

export function CalendarEventCard({ event, variant = 'default', className }: CalendarEventCardProps) {
  const eventDate = parseISO(event.event_date);
  const isCompact = variant === 'compact';

  if (isCompact) {
    return (
      <div className={cn("flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors", className)}>
        <CalendarEventDot eventType={event.event_type} importance={event.importance} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{event.title}</p>
          <p className="text-xs text-muted-foreground">
            {format(eventDate, 'MMM d, yyyy')}
            {event.location_area && ` · ${event.location_area}`}
          </p>
        </div>
        {event.importance === 'high' && (
          <Badge variant="outline" className="text-amber-500 border-amber-500/30 text-[10px]">
            Important
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card className={cn("overflow-hidden hover:shadow-md transition-shadow", className)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Date badge */}
          <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-muted flex flex-col items-center justify-center text-center">
            <span className="text-[10px] uppercase text-muted-foreground font-medium">
              {format(eventDate, 'MMM')}
            </span>
            <span className="text-xl font-bold text-foreground leading-tight">
              {format(eventDate, 'd')}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CalendarEventDot eventType={event.event_type} importance={event.importance} />
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    {eventTypeLabels[event.event_type]}
                  </Badge>
                  {event.importance === 'high' && (
                    <Badge variant="outline" className="text-amber-500 border-amber-500/30 text-[10px] px-1.5 py-0">
                      Important
                    </Badge>
                  )}
                </div>
                <h4 className="font-semibold text-sm leading-tight">{event.title}</h4>
              </div>
            </div>

            {event.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {event.description}
              </p>
            )}

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {event.location_area && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{event.location_area}</span>
                </div>
              )}
              {event.project_name && (
                <div className="flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  <span>{event.project_name}</span>
                </div>
              )}
              {event.end_date && event.end_date !== event.event_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {format(eventDate, 'MMM d')} - {format(parseISO(event.end_date), 'MMM d')}
                  </span>
                </div>
              )}
            </div>

            {event.external_url && (
              <Button variant="link" size="sm" className="h-auto p-0 text-xs" asChild>
                <a href={event.external_url} target="_blank" rel="noopener noreferrer">
                  Learn more <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
