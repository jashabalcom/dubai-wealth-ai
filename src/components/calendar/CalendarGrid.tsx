import { useState, useMemo } from "react";
import { useCalendarEventsByMonth, CalendarEvent } from "@/hooks/useCalendarEvents";
import { useUserPropertyEvents, UserPropertyEvent } from "@/hooks/useUserPropertyEvents";
import { CalendarEventDot, eventTypeColors } from "./CalendarEventDot";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO, addMonths, subMonths } from "date-fns";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface CalendarGridProps {
  onSelectDate?: (date: Date, events: (CalendarEvent | UserPropertyEvent)[]) => void;
  selectedDate?: Date | null;
  showUserEvents?: boolean;
  className?: string;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CalendarGrid({ onSelectDate, selectedDate, showUserEvents = true, className }: CalendarGridProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [direction, setDirection] = useState(0);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const { data: marketEvents = [] } = useCalendarEventsByMonth(year, month);
  const { data: userEvents = [] } = useUserPropertyEvents();

  // Get days for the calendar grid
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });

    // Pad start with days from previous month
    const startDay = start.getDay();
    const prevMonthDays: Date[] = [];
    for (let i = startDay - 1; i >= 0; i--) {
      const d = new Date(start);
      d.setDate(-i);
      prevMonthDays.push(d);
    }

    // Pad end with days from next month
    const endDay = end.getDay();
    const nextMonthDays: Date[] = [];
    for (let i = 1; i < 7 - endDay; i++) {
      const d = new Date(end);
      d.setDate(end.getDate() + i);
      nextMonthDays.push(d);
    }

    return [...prevMonthDays, ...days, ...nextMonthDays];
  }, [currentMonth]);

  // Map events to dates
  const eventsByDate = useMemo(() => {
    const map = new Map<string, (CalendarEvent | UserPropertyEvent)[]>();

    marketEvents.forEach((event) => {
      const dateKey = event.event_date;
      if (!map.has(dateKey)) map.set(dateKey, []);
      map.get(dateKey)!.push(event);
    });

    if (showUserEvents) {
      userEvents.forEach((event) => {
        const dateKey = event.event_date;
        if (!map.has(dateKey)) map.set(dateKey, []);
        map.get(dateKey)!.push(event);
      });
    }

    return map;
  }, [marketEvents, userEvents, showUserEvents]);

  const goToPrevMonth = () => {
    setDirection(-1);
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setDirection(1);
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const goToToday = () => {
    setDirection(0);
    setCurrentMonth(new Date());
  };

  const handleDateClick = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const events = eventsByDate.get(dateKey) || [];
    onSelectDate?.(date, events);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={goToPrevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <h2 className="text-lg font-semibold">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
        </div>
        <Button variant="outline" size="sm" onClick={goToToday}>
          Today
        </Button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${year}-${month}`}
          initial={{ opacity: 0, x: direction * 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -20 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-7 gap-1"
        >
          {calendarDays.map((day, index) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayEvents = eventsByDate.get(dateKey) || [];
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
            const isTodayDate = isToday(day);
            const hasHighImportance = dayEvents.some((e) => 'importance' in e && e.importance === 'high');

            return (
              <button
                key={index}
                onClick={() => handleDateClick(day)}
                className={cn(
                  "relative aspect-square p-1 rounded-lg transition-all duration-200",
                  "hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/20",
                  !isCurrentMonth && "opacity-40",
                  isSelected && "bg-primary/10 ring-2 ring-primary",
                  isTodayDate && !isSelected && "ring-1 ring-amber-500/50",
                  hasHighImportance && "bg-amber-500/5"
                )}
              >
                <span className={cn(
                  "text-sm font-medium",
                  isTodayDate && "text-amber-500",
                  isSelected && "text-primary"
                )}>
                  {format(day, 'd')}
                </span>

                {/* Event dots */}
                {dayEvents.length > 0 && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                    {dayEvents.slice(0, 3).map((event, i) => (
                      <CalendarEventDot
                        key={i}
                        eventType={event.event_type}
                        importance={'importance' in event ? event.importance : undefined}
                        className="w-1.5 h-1.5"
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-[8px] text-muted-foreground ml-0.5">+{dayEvents.length - 3}</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
