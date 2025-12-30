import { eventTypeColors, eventTypeLabels } from "./CalendarEventDot";
import { cn } from "@/lib/utils";

interface CalendarLegendProps {
  showUserEvents?: boolean;
  className?: string;
}

const marketEventTypes = ['launch', 'handover', 'conference', 'report', 'economic'];
const userEventTypes = ['service_charge', 'rental_renewal', 'mortgage_payment', 'inspection', 'visa_renewal'];

export function CalendarLegend({ showUserEvents = true, className }: CalendarLegendProps) {
  const eventTypes = showUserEvents 
    ? [...marketEventTypes, ...userEventTypes]
    : marketEventTypes;

  return (
    <div className={cn("flex flex-wrap gap-3 text-xs", className)}>
      {eventTypes.map((type) => {
        const colors = eventTypeColors[type];
        return (
          <div key={type} className="flex items-center gap-1.5">
            <div className={cn("w-2 h-2 rounded-full", colors.bg)} />
            <span className="text-muted-foreground">{eventTypeLabels[type]}</span>
          </div>
        );
      })}
    </div>
  );
}
