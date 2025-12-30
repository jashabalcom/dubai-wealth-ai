import { Link } from 'react-router-dom';
import { format, differenceInDays, isToday, isTomorrow } from 'date-fns';
import { CalendarDays, ArrowRight, Rocket, Home, Users, FileText, Scale, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useUpcomingEvents, CalendarEvent } from '@/hooks/useCalendarEvents';
import { cn } from '@/lib/utils';

const eventTypeConfig: Record<string, { icon: typeof Rocket; color: string; label: string }> = {
  launch: { icon: Rocket, color: 'bg-blue-500', label: 'Launch' },
  handover: { icon: Home, color: 'bg-emerald-500', label: 'Handover' },
  conference: { icon: Users, color: 'bg-purple-500', label: 'Conference' },
  report: { icon: FileText, color: 'bg-orange-500', label: 'Report' },
  regulatory: { icon: Scale, color: 'bg-red-500', label: 'Regulatory' },
  economic: { icon: TrendingUp, color: 'bg-gold', label: 'Economic' },
};

function getCountdownLabel(dateStr: string): string {
  const eventDate = new Date(dateStr);
  
  if (isToday(eventDate)) return 'Today';
  if (isTomorrow(eventDate)) return 'Tomorrow';
  
  const days = differenceInDays(eventDate, new Date());
  if (days < 7) return `${days}d`;
  if (days < 30) return `${Math.floor(days / 7)}w`;
  return `${Math.floor(days / 30)}mo`;
}

function EventItem({ event }: { event: CalendarEvent }) {
  const config = eventTypeConfig[event.event_type] || eventTypeConfig.launch;
  const Icon = config.icon;
  const countdown = getCountdownLabel(event.event_date);
  const isHighImportance = event.importance === 'high';

  return (
    <div className={cn(
      "flex items-start gap-3 p-3 rounded-lg transition-colors hover:bg-muted/50",
      isHighImportance && "bg-gold/5 border border-gold/20"
    )}>
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", config.color)}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm font-medium text-foreground truncate",
          isHighImportance && "text-gold"
        )}>
          {event.title}
        </p>
        <p className="text-xs text-muted-foreground">
          {format(new Date(event.event_date), 'MMM d')}
          {event.location_area && ` • ${event.location_area}`}
        </p>
      </div>
      <span className={cn(
        "text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0",
        isHighImportance 
          ? "bg-gold/20 text-gold" 
          : "bg-muted text-muted-foreground"
      )}>
        {countdown}
      </span>
    </div>
  );
}

export function UpcomingEventsWidget() {
  const { data: events, isLoading, error } = useUpcomingEvents(60);

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-card border border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-gold" />
          </div>
          <h3 className="font-heading text-lg text-foreground">Upcoming Events</h3>
        </div>
        <p className="text-sm text-muted-foreground">Unable to load events</p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-card border border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-gold" />
          </div>
          <div>
            <h3 className="font-heading text-lg text-foreground">Upcoming Events</h3>
            <p className="text-xs text-muted-foreground">Market launches & key dates</p>
          </div>
        </div>
      </div>

      <div className="space-y-1 mb-4">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-4 w-3/4 mb-1" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
          ))
        ) : events && events.length > 0 ? (
          events.slice(0, 5).map((event) => (
            <EventItem key={event.id} event={event} />
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-6">
            No upcoming events in the next 60 days
          </p>
        )}
      </div>

      <Button variant="outline" size="sm" className="w-full" asChild>
        <Link to="/calendar">
          View Full Calendar
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </Button>
    </div>
  );
}
