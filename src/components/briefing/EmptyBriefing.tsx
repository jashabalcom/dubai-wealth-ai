import { 
  CalendarClock, 
  Bell, 
  FileText, 
  ChevronRight,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface EmptyBriefingProps {
  date?: string;
  className?: string;
}

export function EmptyBriefing({ date, className }: EmptyBriefingProps) {
  const formattedDate = date 
    ? new Date(date).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : 'today';

  // Estimate next briefing time (9 AM GST next day)
  const now = new Date();
  const nextBriefing = new Date(now);
  nextBriefing.setDate(nextBriefing.getDate() + 1);
  nextBriefing.setHours(9, 0, 0, 0);

  const hoursUntilNext = Math.ceil((nextBriefing.getTime() - now.getTime()) / (1000 * 60 * 60));

  return (
    <section className={cn(
      "flex flex-col items-center justify-center text-center py-16 px-4",
      className
    )}>
      {/* Icon */}
      <div className="w-20 h-20 rounded-2xl bg-muted/50 border border-border/50 flex items-center justify-center mb-6">
        <CalendarClock className="w-10 h-10 text-muted-foreground" />
      </div>

      {/* Title */}
      <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
        No Briefing Available
      </h2>

      {/* Description */}
      <p className="text-muted-foreground max-w-md mb-6">
        The market intelligence briefing for {formattedDate} hasn't been generated yet. 
        Check back soon or subscribe to get notified when it's ready.
      </p>

      {/* Next Briefing Estimate */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-8">
        <Clock className="w-4 h-4" />
        <span>Next briefing expected in ~{hoursUntilNext} hours</span>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button variant="premium" asChild>
          <Link to="/settings/notifications">
            <Bell className="w-4 h-4 mr-2" />
            Subscribe to Alerts
          </Link>
        </Button>

        <Button variant="outline" asChild>
          <Link to="/briefing">
            <FileText className="w-4 h-4 mr-2" />
            View Latest Briefing
          </Link>
        </Button>
      </div>

      {/* Divider */}
      <div className="w-full max-w-xs h-px bg-border/50 my-10" />

      {/* What's in a briefing preview */}
      <div className="text-left max-w-md">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          What's in a Daily Briefing?
        </h3>
        <ul className="space-y-2">
          {[
            "Executive summary with investment action recommendation",
            "Real-time market metrics and performance indicators",
            "Sector-by-sector analysis (off-plan, ready, rental, commercial)",
            "Top performing areas with price movements",
            "Featured intelligence articles with investment ratings"
          ].map((item, idx) => (
            <li 
              key={idx} 
              className="flex items-start gap-2 text-sm text-muted-foreground"
            >
              <ChevronRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
