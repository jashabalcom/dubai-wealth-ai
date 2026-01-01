import { ReactNode } from "react";
import { format } from "date-fns";
import { 
  Calendar, 
  Clock, 
  Printer, 
  Share2, 
  Bookmark,
  Radio,
  CalendarDays
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface BloombergBriefingProps {
  date: string;
  generatedAt?: string;
  children: ReactNode;
  className?: string;
  hasHistoricalAccess?: boolean;
  selectedDate?: Date;
  onDateChange?: (date: Date | undefined) => void;
}

// Helper to safely format date with fallback
function safeFormatDate(dateStr: string | undefined, formatStr: string, fallback: string): string {
  if (!dateStr) return fallback;
  try {
    const parsed = new Date(dateStr);
    if (isNaN(parsed.getTime())) return fallback;
    return format(parsed, formatStr);
  } catch {
    return fallback;
  }
}

export function BloombergBriefing({ 
  date, 
  generatedAt,
  children, 
  className,
  hasHistoricalAccess = false,
  selectedDate,
  onDateChange
}: BloombergBriefingProps) {
  const formattedDate = safeFormatDate(date, "EEEE, MMMM d, yyyy", "Today");
  const shortDate = safeFormatDate(date, "MMM d, yyyy", "Today");
  const generatedTime = safeFormatDate(generatedAt, "HH:mm", format(new Date(), "HH:mm"));
  
  const handlePrint = () => window.print();
  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `Dubai Market Intelligence - ${formattedDate}`,
        url: window.location.href
      });
    }
  };

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {/* Terminal-Style Header Bar */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-secondary/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Left: Branding */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded bg-primary/10 border border-primary/20">
                <Radio className="w-3 h-3 text-primary animate-pulse" />
                <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-primary font-mono font-medium">
                  Live
                </span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-sm sm:text-base font-semibold text-foreground tracking-tight">
                  Dubai Market Intelligence
                </h1>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-mono uppercase tracking-wider">
                  Daily Investor Briefing
                </p>
              </div>
            </div>

            {/* Center: Date & Time + Historical Access */}
            <div className="hidden lg:flex items-center gap-6 text-xs text-muted-foreground">
              {hasHistoricalAccess ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-9 px-3 text-muted-foreground hover:text-foreground gap-2"
                    >
                      <CalendarDays className="w-4 h-4" />
                      <span className="font-mono text-sm">{formattedDate}</span>
                      <Badge variant="outline" className="ml-1 h-5 px-2 text-[10px] border-primary/30 text-primary">
                        Elite
                      </Badge>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={onDateChange}
                      disabled={(d) => d > new Date()}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              ) : (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="font-mono text-sm">{formattedDate}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="font-mono text-sm">As of {generatedTime} GST</span>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="hidden sm:flex h-9 w-9 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="hidden sm:flex h-9 w-9 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                onClick={handlePrint}
              >
                <Printer className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-9 w-9 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <Bookmark className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Date Display */}
      <div className="lg:hidden border-b border-border/30 bg-muted/30 py-3">
        <div className="container mx-auto px-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="font-mono text-sm text-foreground">{shortDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="font-mono text-sm text-foreground">{generatedTime} GST</span>
          </div>
          {hasHistoricalAccess && (
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 px-3 gap-2 text-xs border-primary/30"
                >
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span>View History</span>
                  <Badge variant="default" className="ml-0.5 h-4 px-1.5 text-[9px] bg-primary/20 text-primary">
                    Elite
                  </Badge>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={onDateChange}
                  disabled={(d) => d > new Date()}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 sm:space-y-10">
        {children}
      </main>
    </div>
  );
}
