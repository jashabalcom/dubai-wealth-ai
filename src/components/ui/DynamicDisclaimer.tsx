import { useState } from 'react';
import { AlertTriangle, Info, ChevronDown, ChevronUp, ExternalLink, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { DataConfidenceLevel, CONFIDENCE_LEVEL_INFO, formatVerificationDate } from '@/lib/dataRegistry';
import { cn } from '@/lib/utils';

interface DataSourceInfo {
  name: string;
  confidence: DataConfidenceLevel;
  verifiedAt?: string | null;
  sourceUrl?: string | null;
  isStale?: boolean;
}

interface DynamicDisclaimerProps {
  dataSources: DataSourceInfo[];
  calculationType?: string;
  className?: string;
}

export function DynamicDisclaimer({ 
  dataSources, 
  calculationType = 'calculation',
  className 
}: DynamicDisclaimerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const hasStaleData = dataSources.some(d => d.isStale);
  const hasUnverifiedData = dataSources.some(d => d.confidence === 'unverified');
  const hasEstimatedData = dataSources.some(d => d.confidence === 'estimated');
  const allOfficial = dataSources.every(d => d.confidence === 'official' || d.confidence === 'verified');

  const getSeverity = (): 'low' | 'medium' | 'high' => {
    if (hasStaleData || hasUnverifiedData) return 'high';
    if (hasEstimatedData) return 'medium';
    return 'low';
  };

  const severity = getSeverity();

  const getDisclaimerText = () => {
    if (hasStaleData) {
      return `Some data in this ${calculationType} may be outdated. Please verify critical figures with official sources before making decisions.`;
    }
    if (hasUnverifiedData) {
      return `This ${calculationType} includes unverified data. Results should be treated as estimates only.`;
    }
    if (hasEstimatedData) {
      return `This ${calculationType} uses estimated values where official data is unavailable. Actual costs may vary.`;
    }
    if (allOfficial) {
      return `This ${calculationType} uses officially verified data. However, fees and regulations can change - always confirm with relevant authorities.`;
    }
    return `This ${calculationType} is for informational purposes only. Please verify all figures before making financial decisions.`;
  };

  return (
    <div className={cn(
      "rounded-lg border p-4",
      severity === 'high' && "border-amber-500/50 bg-amber-500/5",
      severity === 'medium' && "border-blue-500/30 bg-blue-500/5",
      severity === 'low' && "border-border bg-muted/30",
      className
    )}>
      <div className="flex items-start gap-3">
        {severity === 'high' ? (
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
        ) : severity === 'medium' ? (
          <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
        ) : (
          <Shield className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
        )}
        
        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-sm",
            severity === 'high' && "text-amber-700 dark:text-amber-400",
            severity === 'medium' && "text-blue-700 dark:text-blue-400",
            severity === 'low' && "text-muted-foreground"
          )}>
            {getDisclaimerText()}
          </p>

          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-2 h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
              >
                {isOpen ? (
                  <>
                    <ChevronUp className="h-3 w-3 mr-1" />
                    Hide data sources
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1" />
                    View {dataSources.length} data source{dataSources.length !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-3">
              <div className="space-y-2">
                {dataSources.map((source, index) => {
                  const confidenceInfo = CONFIDENCE_LEVEL_INFO[source.confidence];
                  return (
                    <div 
                      key={index}
                      className={cn(
                        "flex items-center justify-between text-xs p-2 rounded-md",
                        source.isStale && "bg-amber-500/10",
                        !source.isStale && "bg-muted/50"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "w-2 h-2 rounded-full",
                          source.isStale && "bg-amber-500",
                          !source.isStale && source.confidence === 'official' && "bg-emerald-500",
                          !source.isStale && source.confidence === 'verified' && "bg-blue-500",
                          !source.isStale && source.confidence === 'industry' && "bg-violet-500",
                          !source.isStale && source.confidence === 'estimated' && "bg-amber-500",
                          !source.isStale && source.confidence === 'unverified' && "bg-red-500",
                        )} />
                        <span className="font-medium">{source.name}</span>
                        <span className="text-muted-foreground">
                          ({confidenceInfo.label})
                        </span>
                        {source.isStale && (
                          <span className="text-amber-500">• Stale</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        {source.verifiedAt && (
                          <span>{formatVerificationDate(source.verifiedAt)}</span>
                        )}
                        {source.sourceUrl && (
                          <a 
                            href={source.sourceUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-primary"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-xs text-muted-foreground mt-3 pt-3 border-t">
                Dubai Wealth Hub strives to maintain accurate data from official sources. 
                This platform is for educational purposes only and does not constitute financial, 
                legal, or investment advice. Always consult qualified professionals before 
                making investment decisions.
              </p>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </div>
  );
}
