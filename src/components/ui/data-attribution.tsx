import * as React from "react";
import { cn } from "@/lib/utils";
import { Info, ExternalLink, Calendar, Database } from "lucide-react";
import { format } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DataAttributionProps {
  source: string;
  sourceUrl?: string;
  dataAsOf?: Date | string;
  className?: string;
  variant?: "inline" | "compact" | "detailed";
  showIcon?: boolean;
}

export function DataAttribution({
  source,
  sourceUrl,
  dataAsOf,
  className,
  variant = "inline",
  showIcon = true,
}: DataAttributionProps) {
  const formattedDate = dataAsOf
    ? typeof dataAsOf === "string"
      ? dataAsOf
      : format(dataAsOf, "MMM d, yyyy")
    : null;

  if (variant === "compact") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className={cn(
                "inline-flex items-center gap-1 text-xs text-muted-foreground cursor-help",
                className
              )}
            >
              <Info className="w-3 h-3" />
              {formattedDate ? `As of ${formattedDate}` : source}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs">
              <p className="font-medium">Data Source: {source}</p>
              {formattedDate && <p>Last updated: {formattedDate}</p>}
              {sourceUrl && (
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1 mt-1"
                >
                  View source <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === "detailed") {
    return (
      <div
        className={cn(
          "flex flex-col gap-1 p-3 rounded-lg bg-muted/50 border border-border/50",
          className
        )}
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Database className="w-4 h-4" />
          <span className="font-medium">Data Source:</span>
          {sourceUrl ? (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center gap-1"
            >
              {source}
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <span>{source}</span>
          )}
        </div>
        {formattedDate && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Data as of {formattedDate}</span>
          </div>
        )}
      </div>
    );
  }

  // Inline variant (default)
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs text-muted-foreground",
        className
      )}
    >
      {showIcon && <Info className="w-3 h-3" />}
      <span>
        {formattedDate && `Data as of ${formattedDate}`}
        {formattedDate && source && " | "}
        {sourceUrl ? (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center gap-0.5"
          >
            {source}
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        ) : (
          source
        )}
      </span>
    </span>
  );
}

// Pre-configured attribution components for common sources
export function DLDAttribution({
  dataAsOf,
  className,
  variant = "inline",
}: {
  dataAsOf?: Date | string;
  className?: string;
  variant?: "inline" | "compact" | "detailed";
}) {
  return (
    <DataAttribution
      source="Dubai Land Department"
      sourceUrl="https://dubailand.gov.ae"
      dataAsOf={dataAsOf}
      className={className}
      variant={variant}
    />
  );
}

export function RERAAttribution({
  dataAsOf,
  className,
  variant = "inline",
}: {
  dataAsOf?: Date | string;
  className?: string;
  variant?: "inline" | "compact" | "detailed";
}) {
  return (
    <DataAttribution
      source="RERA Dubai"
      sourceUrl="https://www.rera.gov.ae"
      dataAsOf={dataAsOf}
      className={className}
      variant={variant}
    />
  );
}

export function MarketDataAttribution({
  dataAsOf,
  className,
  variant = "inline",
}: {
  dataAsOf?: Date | string;
  className?: string;
  variant?: "inline" | "compact" | "detailed";
}) {
  return (
    <DataAttribution
      source="DLD Transaction Data"
      dataAsOf={dataAsOf}
      className={className}
      variant={variant}
    />
  );
}
