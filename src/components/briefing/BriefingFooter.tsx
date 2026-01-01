import { 
  Database, 
  Shield, 
  ExternalLink, 
  Info,
  Printer,
  Share2,
  Download,
  Mail
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link } from "react-router-dom";

interface BriefingFooterProps {
  dataSources?: string[];
  generatedAt?: string;
  className?: string;
}

export function BriefingFooter({ 
  dataSources = [],
  generatedAt,
  className 
}: BriefingFooterProps) {
  const defaultSources = [
    "Dubai Land Department (DLD)",
    "RERA",
    "Market Transaction Data",
    "Developer Announcements"
  ];

  const sources = dataSources.length > 0 ? dataSources : defaultSources;

  const handlePrint = () => window.print();
  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "Dubai Market Intelligence Briefing",
        url: window.location.href
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <footer className={cn(
      "border-t border-border/50 bg-muted/30 rounded-b-xl",
      className
    )}>
      <div className="p-5 sm:p-6 space-y-4">
        {/* Sources & Methodology Row */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          {/* Data Sources */}
          <div className="space-y-2">
            <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-1.5">
              <Database className="w-3 h-3" />
              Data Sources
            </h4>
            <div className="flex flex-wrap gap-2">
              {sources.map((source, idx) => (
                <span 
                  key={idx}
                  className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground"
                >
                  {source}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-2"
                    onClick={handleShare}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Share Briefing</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-2"
                    onClick={handlePrint}
                  >
                    <Printer className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Print Briefing</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-2"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Download PDF</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 gap-2"
              asChild
            >
              <Link to="/settings/notifications">
                <Mail className="w-3.5 h-3.5" />
                Subscribe
              </Link>
            </Button>
          </div>
        </div>

        {/* Methodology & Timestamp */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/30">
          {/* Methodology Link */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors">
                  <Shield className="w-3.5 h-3.5" />
                  Methodology
                  <Info className="w-3 h-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="text-xs">
                  Our daily briefings are generated using AI analysis of verified market data 
                  from official sources including DLD transactions, RERA records, and developer 
                  announcements. Investment ratings are based on historical performance patterns 
                  and current market indicators.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Timestamp */}
          {generatedAt && (
            <span className="text-[10px] text-muted-foreground font-mono">
              Generated: {new Date(generatedAt).toLocaleString('en-AE', { 
                timeZone: 'Asia/Dubai',
                dateStyle: 'medium',
                timeStyle: 'short'
              })} GST
            </span>
          )}
        </div>

        {/* Disclaimer */}
        <p className="text-[10px] text-muted-foreground/70 leading-relaxed">
          This briefing is for informational purposes only and does not constitute investment advice. 
          Past performance is not indicative of future results. Always conduct your own due diligence 
          before making investment decisions.{" "}
          <Link to="/legal/disclaimer" className="underline hover:text-muted-foreground">
            Full Disclaimer
          </Link>
        </p>
      </div>
    </footer>
  );
}
