import { ExternalLink, Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DataConfidenceLevel, formatVerificationDate, CONFIDENCE_LEVEL_INFO } from '@/lib/dataRegistry';
import { cn } from '@/lib/utils';

interface DataSourceAttributionProps {
  sourceName: string | null;
  sourceUrl?: string | null;
  confidence: DataConfidenceLevel;
  verifiedAt?: string | null;
  isStale?: boolean;
  variant?: 'inline' | 'compact' | 'full';
  className?: string;
}

export function DataSourceAttribution({
  sourceName,
  sourceUrl,
  confidence,
  verifiedAt,
  isStale = false,
  variant = 'inline',
  className,
}: DataSourceAttributionProps) {
  const confidenceInfo = CONFIDENCE_LEVEL_INFO[confidence];

  if (variant === 'inline') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={cn(
              "inline-flex items-center gap-1 text-xs text-muted-foreground cursor-help",
              className
            )}>
              {isStale ? (
                <AlertTriangle className="h-3 w-3 text-amber-500" />
              ) : confidence === 'official' || confidence === 'verified' ? (
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              ) : (
                <Info className="h-3 w-3" />
              )}
              <span className="underline decoration-dotted">
                {sourceName || 'Unknown source'}
              </span>
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-1">
              <p className="font-medium">{sourceName}</p>
              <p className="text-xs text-muted-foreground">
                {confidenceInfo.description}
              </p>
              {verifiedAt && (
                <p className="text-xs">
                  Verified: {formatVerificationDate(verifiedAt)}
                </p>
              )}
              {isStale && (
                <p className="text-xs text-amber-500 font-medium">
                  ⚠️ This data may be outdated
                </p>
              )}
              {sourceUrl && (
                <a 
                  href={sourceUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  View source <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center gap-2 text-xs text-muted-foreground", className)}>
        {isStale ? (
          <AlertTriangle className="h-3 w-3 text-amber-500" />
        ) : (
          <CheckCircle2 className={cn(
            "h-3 w-3",
            confidence === 'official' && "text-emerald-500",
            confidence === 'verified' && "text-blue-500",
            confidence === 'industry' && "text-violet-500",
            confidence === 'estimated' && "text-amber-500",
          )} />
        )}
        <span>{sourceName || 'Unknown'}</span>
        {sourceUrl && (
          <a 
            href={sourceUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-primary"
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    );
  }

  // Full variant
  return (
    <div className={cn(
      "rounded-lg border p-3 bg-muted/30",
      isStale && "border-amber-500/30 bg-amber-500/5",
      className
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {isStale ? (
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            ) : (
              <CheckCircle2 className={cn(
                "h-4 w-4",
                confidence === 'official' && "text-emerald-500",
                confidence === 'verified' && "text-blue-500",
                confidence === 'industry' && "text-violet-500",
                confidence === 'estimated' && "text-amber-500",
              )} />
            )}
            <span className="font-medium text-sm">{sourceName || 'Unknown source'}</span>
            <span className={cn(
              "text-xs px-1.5 py-0.5 rounded-full",
              `bg-${confidenceInfo.color}-500/10 text-${confidenceInfo.color}-500`
            )}>
              {confidenceInfo.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {confidenceInfo.description}
          </p>
          {verifiedAt && (
            <p className="text-xs text-muted-foreground">
              Last verified: {formatVerificationDate(verifiedAt)}
            </p>
          )}
          {isStale && (
            <p className="text-xs text-amber-500 font-medium">
              ⚠️ This data has expired and may be outdated
            </p>
          )}
        </div>
        {sourceUrl && (
          <a 
            href={sourceUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline text-xs flex items-center gap-1 shrink-0"
          >
            View source <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
}
