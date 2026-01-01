import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DataBadge } from "@/components/ui/data-display";
import { 
  Building2, 
  Home, 
  KeyRound, 
  Briefcase,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface SectorHighlight {
  sector: string;
  insights: string[];
  sentiment?: 'positive' | 'negative' | 'neutral';
}

interface SectorAnalysisProps {
  sectorHighlights?: SectorHighlight[];
  className?: string;
}

const sectorConfig = {
  "off-plan": {
    icon: Building2,
    title: "Off-Plan Market",
    description: "New launches & developer activity",
    color: "text-blue-400"
  },
  "ready": {
    icon: Home,
    title: "Ready Properties",
    description: "Secondary market & resales",
    color: "text-emerald-400"
  },
  "rental": {
    icon: KeyRound,
    title: "Rental Market",
    description: "Yields & occupancy trends",
    color: "text-amber-400"
  },
  "commercial": {
    icon: Briefcase,
    title: "Commercial",
    description: "Office & retail sectors",
    color: "text-purple-400"
  }
};

const getSentimentIcon = (sentiment?: string) => {
  switch (sentiment) {
    case 'positive': return TrendingUp;
    case 'negative': return TrendingDown;
    default: return Minus;
  }
};

const getSentimentBadge = (sentiment?: string) => {
  switch (sentiment) {
    case 'positive': return { variant: 'success' as const, label: 'Positive' };
    case 'negative': return { variant: 'error' as const, label: 'Negative' };
    default: return { variant: 'outline' as const, label: 'Neutral' };
  }
};

export function SectorAnalysis({ 
  sectorHighlights = [],
  className 
}: SectorAnalysisProps) {
  // Default sector data if not provided
  const defaultSectors: SectorHighlight[] = [
    {
      sector: "off-plan",
      sentiment: "positive",
      insights: [
        "23 new project launches this week across Dubai",
        "Emaar announces 2 premium towers in Dubai Creek Harbour",
        "Payment plans extending to 7-year post-handover"
      ]
    },
    {
      sector: "ready",
      sentiment: "neutral",
      insights: [
        "Secondary market transactions up 8% month-over-month",
        "Palm Jumeirah villas seeing 12% price appreciation",
        "Inventory levels stable across major communities"
      ]
    },
    {
      sector: "rental",
      sentiment: "positive",
      insights: [
        "Average yields holding steady at 6.8% across Dubai",
        "Studio apartments in JVC reaching 9% gross yields",
        "Corporate leasing demand driving Business Bay rents up 15%"
      ]
    },
    {
      sector: "commercial",
      sentiment: "neutral",
      insights: [
        "Office occupancy in DIFC reaches 94%",
        "Retail sector showing recovery with 5% footfall increase",
        "Grade A office rents stabilizing after 2-year growth"
      ]
    }
  ];

  const sectors = sectorHighlights.length > 0 ? sectorHighlights : defaultSectors;

  return (
    <section className={cn("space-y-4", className)}>
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-2">
          <Building2 className="w-3.5 h-3.5" />
          Sector Analysis
        </h3>
      </div>

      {/* Accordion Panels */}
      <Accordion type="multiple" className="space-y-2" defaultValue={["off-plan"]}>
        {sectors.map((sector) => {
          const config = sectorConfig[sector.sector as keyof typeof sectorConfig] || sectorConfig["off-plan"];
          const Icon = config.icon;
          const SentimentIcon = getSentimentIcon(sector.sentiment);
          const badge = getSentimentBadge(sector.sentiment);

          return (
            <AccordionItem
              key={sector.sector}
              value={sector.sector}
              className="border border-border/50 rounded-lg bg-card/50 overflow-hidden"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3 w-full">
                  <div className={cn("p-2 rounded-lg bg-muted/50", config.color)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">
                        {config.title}
                      </span>
                      <DataBadge variant={badge.variant}>
                        <SentimentIcon className="w-3 h-3 mr-1" />
                        {badge.label}
                      </DataBadge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {config.description}
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="pt-2 space-y-3">
                  {/* Insights List */}
                  <ul className="space-y-2">
                    {sector.insights.map((insight, idx) => (
                      <li 
                        key={idx}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:text-primary/80 p-0 h-auto font-medium"
                    asChild
                  >
                    <Link to={`/properties?status=${sector.sector === 'off-plan' ? 'offplan' : 'ready'}`}>
                      View Properties
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </section>
  );
}
