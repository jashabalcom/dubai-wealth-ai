import { useState, useMemo, useCallback } from "react";
import { useCalendarEventsByMonth, CalendarEvent } from "@/hooks/useCalendarEvents";
import { useUserPropertyEvents, UserPropertyEvent } from "@/hooks/useUserPropertyEvents";
import { CalendarEventDot } from "./CalendarEventDot";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths } from "date-fns";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, PanInfo } from "framer-motion";

interface CalendarGridProps {
  onSelectDate?: (date: Date, events: (CalendarEvent | UserPropertyEvent)[]) => void;
  selectedDate?: Date | null;
  showUserEvents?: boolean;
  className?: string;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

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

  const goToPrevMonth = useCallback(() => {
    setDirection(-1);
    setCurrentMonth(prev => subMonths(prev, 1));
  }, []);

  const goToNextMonth = useCallback(() => {
    setDirection(1);
    setCurrentMonth(prev => addMonths(prev, 1));
  }, []);

  const goToToday = () => {
    setDirection(0);
    setCurrentMonth(new Date());
  };

  const handleDateClick = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const events = eventsByDate.get(dateKey) || [];
    onSelectDate?.(date, events);
  };

  // Swipe gesture handler for mobile
  const handleDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x > threshold) {
      goToPrevMonth();
    } else if (info.offset.x < -threshold) {
      goToNextMonth();
    }
  }, [goToPrevMonth, goToNextMonth]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 sm:gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={goToPrevMonth}
            className="h-10 w-10 sm:h-9 sm:w-9 touch-target"
          >
            <ChevronLeft className="w-5 h-5 sm:w-4 sm:h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={goToNextMonth}
            className="h-10 w-10 sm:h-9 sm:w-9 touch-target"
          >
            <ChevronRight className="w-5 h-5 sm:w-4 sm:h-4" />
          </Button>
          <h2 className="text-base sm:text-lg font-semibold ml-1 sm:ml-2">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={goToToday}
          className="h-9 px-3 text-sm"
        >
          Today
        </Button>
      </div>

      {/* Weekday headers - shorter on mobile */}
      <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
        {WEEKDAYS.map((day, i) => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{WEEKDAYS_SHORT[i]}</span>
          </div>
        ))}
      </div>

      {/* Calendar grid with swipe support */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${year}-${month}`}
          initial={{ opacity: 0, x: direction * 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -20 }}
          transition={{ duration: 0.2 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
          className="grid grid-cols-7 gap-0.5 sm:gap-1 touch-action-pan-y"
        >
          {calendarDays.map((day, index) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayEvents = eventsByDate.get(dateKey) || [];
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
            const isTodayDate = isToday(day);
            const hasHighImportance = dayEvents.some((e) => 'importance' in e && e.importance === 'high');

            return (
              <motion.button
                key={index}
                onClick={() => handleDateClick(day)}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "relative flex flex-col items-center justify-center rounded-lg transition-all duration-200",
                  "min-h-[44px] sm:min-h-[52px] p-1",
                  "hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  "active:bg-muted/80",
                  !isCurrentMonth && "opacity-40",
                  isSelected && "bg-primary/10 ring-2 ring-primary shadow-sm",
                  isTodayDate && !isSelected && "ring-1 ring-amber-500/50 bg-amber-500/5",
                  hasHighImportance && !isSelected && "bg-amber-500/10"
                )}
              >
                <span className={cn(
                  "text-sm sm:text-base font-medium leading-none",
                  isTodayDate && "text-amber-600 dark:text-amber-400 font-semibold",
                  isSelected && "text-primary font-semibold"
                )}>
                  {format(day, 'd')}
                </span>

                {/* Event dots - larger on mobile for visibility */}
                {dayEvents.length > 0 && (
                  <div className="flex gap-0.5 mt-1">
                    {dayEvents.slice(0, 3).map((event, i) => (
                      <CalendarEventDot
                        key={i}
                        eventType={event.event_type}
                        importance={'importance' in event ? event.importance : undefined}
                        className="w-1.5 h-1.5 sm:w-2 sm:h-2"
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-[8px] sm:text-[10px] text-muted-foreground ml-0.5">
                        +{dayEvents.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </motion.button>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Swipe hint for mobile - only shown briefly */}
      <p className="text-center text-xs text-muted-foreground sm:hidden animate-fade-in">
        Swipe to change month
      </p>
    </div>
  );
}
