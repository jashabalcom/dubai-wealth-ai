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

export function BloombergBriefing({ 
  date, 
  generatedAt,
  children, 
  className,
  hasHistoricalAccess = false,
  selectedDate,
  onDateChange
}: BloombergBriefingProps) {
  const formattedDate = format(new Date(date), "EEEE, MMMM d, yyyy");
  const generatedTime = generatedAt 
    ? format(new Date(generatedAt), "HH:mm") 
    : format(new Date(), "HH:mm");
  
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
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Left: Branding */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded bg-primary/10 border border-primary/20">
                <Radio className="w-3 h-3 text-primary animate-pulse" />
                <span className="text-[10px] uppercase tracking-widest text-primary font-mono font-medium">
                  Live
                </span>
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-semibold text-foreground tracking-tight">
                  Dubai Market Intelligence
                </h1>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-mono uppercase tracking-wider">
                  Daily Investor Briefing
                </p>
              </div>
            </div>

            {/* Center: Date & Time + Historical Access */}
            <div className="hidden md:flex items-center gap-6 text-xs text-muted-foreground">
              {hasHistoricalAccess ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-3 text-muted-foreground hover:text-foreground gap-2"
                    >
                      <CalendarDays className="w-3.5 h-3.5" />
                      <span className="font-mono">{formattedDate}</span>
                      <Badge variant="outline" className="ml-1 h-4 px-1.5 text-[9px] border-primary/30 text-primary">
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
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="font-mono">{formattedDate}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                <span className="font-mono">As of {generatedTime} GST</span>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="hidden sm:flex h-8 px-2 text-muted-foreground hover:text-foreground"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="hidden sm:flex h-8 px-2 text-muted-foreground hover:text-foreground"
                onClick={handlePrint}
              >
                <Printer className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2 text-muted-foreground hover:text-foreground"
              >
                <Bookmark className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Date Display */}
      <div className="md:hidden border-b border-border/30 bg-muted/30 py-2">
        <div className="container mx-auto px-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3" />
            <span className="font-mono">{format(new Date(date), "MMM d, yyyy")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            <span className="font-mono">{generatedTime} GST</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {children}
      </main>
    </div>
  );
}
