import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface CalendarEventDotProps {
  eventType: string;
  title?: string;
  importance?: string;
  className?: string;
}

export const eventTypeColors: Record<string, { bg: string; border: string; text: string }> = {
  launch: { bg: 'bg-amber-500', border: 'border-amber-500', text: 'text-amber-500' },
  handover: { bg: 'bg-emerald-500', border: 'border-emerald-500', text: 'text-emerald-500' },
  conference: { bg: 'bg-blue-500', border: 'border-blue-500', text: 'text-blue-500' },
  report: { bg: 'bg-purple-500', border: 'border-purple-500', text: 'text-purple-500' },
  regulatory: { bg: 'bg-purple-400', border: 'border-purple-400', text: 'text-purple-400' },
  economic: { bg: 'bg-indigo-500', border: 'border-indigo-500', text: 'text-indigo-500' },
  // User event types
  service_charge: { bg: 'bg-red-500', border: 'border-red-500', text: 'text-red-500' },
  rental_renewal: { bg: 'bg-orange-500', border: 'border-orange-500', text: 'text-orange-500' },
  mortgage_payment: { bg: 'bg-red-400', border: 'border-red-400', text: 'text-red-400' },
  inspection: { bg: 'bg-cyan-500', border: 'border-cyan-500', text: 'text-cyan-500' },
  visa_renewal: { bg: 'bg-teal-500', border: 'border-teal-500', text: 'text-teal-500' },
  custom: { bg: 'bg-gray-400', border: 'border-gray-400', text: 'text-gray-400' },
};

export const eventTypeLabels: Record<string, string> = {
  launch: 'Developer Launch',
  handover: 'Project Handover',
  conference: 'Conference',
  report: 'Market Report',
  regulatory: 'Regulatory',
  economic: 'Economic Event',
  service_charge: 'Service Charge',
  rental_renewal: 'Rental Renewal',
  mortgage_payment: 'Mortgage Payment',
  inspection: 'Inspection',
  visa_renewal: 'Visa Renewal',
  custom: 'Custom',
};

export function CalendarEventDot({ eventType, title, importance, className }: CalendarEventDotProps) {
  const colors = eventTypeColors[eventType] || eventTypeColors.custom;
  const isHighImportance = importance === 'high';

  const dot = (
    <div
      className={cn(
        "rounded-full",
        colors.bg,
        isHighImportance ? "w-2.5 h-2.5 ring-2 ring-offset-1 ring-offset-background" : "w-2 h-2",
        isHighImportance && colors.border.replace('border-', 'ring-'),
        className
      )}
    />
  );

  if (title) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {dot}
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[200px]">
          <p className="text-xs font-medium">{title}</p>
          <p className={cn("text-xs", colors.text)}>{eventTypeLabels[eventType]}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return dot;
}
