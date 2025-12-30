import { useUpcomingEvents } from "@/hooks/useCalendarEvents";
import { CalendarEventDot, eventTypeLabels } from "./CalendarEventDot";
import { format, parseISO, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

interface UpcomingEventsTickerProps {
  className?: string;
}

export function UpcomingEventsTicker({ className }: UpcomingEventsTickerProps) {
  const { data: events, isLoading } = useUpcomingEvents(60);

  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-4 overflow-hidden py-2", className)}>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-8 w-48 flex-shrink-0" />
        ))}
      </div>
    );
  }

  if (!events?.length) {
    return null;
  }

  const today = new Date();

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Gradient overlays */}
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      
      {/* Scrolling ticker */}
      <motion.div
        className="flex items-center gap-6 py-2"
        animate={{
          x: [0, -50 * events.length],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: events.length * 5,
            ease: "linear",
          },
        }}
      >
        {/* Duplicate events for seamless loop */}
        {[...events, ...events].map((event, index) => {
          const eventDate = parseISO(event.event_date);
          const daysUntil = differenceInDays(eventDate, today);
          
          return (
            <div
              key={`${event.id}-${index}`}
              className="flex items-center gap-2 flex-shrink-0 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50"
            >
              <CalendarEventDot eventType={event.event_type} importance={event.importance} />
              <span className="text-xs font-medium whitespace-nowrap">{event.title}</span>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `in ${daysUntil}d`}
              </span>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}

// Static version without animation for reduced motion users
export function UpcomingEventsStrip({ className }: UpcomingEventsTickerProps) {
  const { data: events, isLoading } = useUpcomingEvents(30);

  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-3 overflow-x-auto py-2 scrollbar-hide", className)}>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-8 w-40 flex-shrink-0" />
        ))}
      </div>
    );
  }

  if (!events?.length) {
    return null;
  }

  const today = new Date();

  return (
    <div className={cn("flex items-center gap-3 overflow-x-auto py-2 scrollbar-hide", className)}>
      {events.slice(0, 5).map((event) => {
        const eventDate = parseISO(event.event_date);
        const daysUntil = differenceInDays(eventDate, today);

        return (
          <div
            key={event.id}
            className="flex items-center gap-2 flex-shrink-0 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50 hover:bg-muted transition-colors cursor-pointer"
          >
            <CalendarEventDot eventType={event.event_type} importance={event.importance} />
            <span className="text-xs font-medium whitespace-nowrap max-w-[150px] truncate">
              {event.title}
            </span>
            <span className={cn(
              "text-[10px] font-medium whitespace-nowrap px-1.5 py-0.5 rounded",
              daysUntil <= 7 ? "bg-amber-500/10 text-amber-500" : "bg-muted text-muted-foreground"
            )}>
              {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : format(eventDate, 'MMM d')}
            </span>
          </div>
        );
      })}
    </div>
  );
}
