import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  AlertTriangle,
  CheckCircle2,
  Eye,
  ShieldAlert,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DataBadge } from "@/components/ui/data-display";

interface ExecutiveSummaryProps {
  headline: string;
  summary: string;
  sentiment?: 'bullish' | 'bearish' | 'neutral' | 'mixed';
  investmentAction?: 'buy' | 'hold' | 'watch' | 'caution';
  confidenceScore?: number;
  keyTakeaways?: string[];
  className?: string;
}

const sentimentConfig = {
  bullish: {
    icon: TrendingUp,
    label: "Bullish",
    className: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
  },
  bearish: {
    icon: TrendingDown,
    label: "Bearish",
    className: "text-rose-400 bg-rose-500/10 border-rose-500/30"
  },
  neutral: {
    icon: Minus,
    label: "Neutral",
    className: "text-slate-400 bg-slate-500/10 border-slate-500/30"
  },
  mixed: {
    icon: BarChart3,
    label: "Mixed",
    className: "text-amber-400 bg-amber-500/10 border-amber-500/30"
  }
};

const actionConfig = {
  buy: {
    icon: CheckCircle2,
    label: "BUY",
    className: "bg-emerald-500 text-white"
  },
  hold: {
    icon: Minus,
    label: "HOLD",
    className: "bg-blue-500 text-white"
  },
  watch: {
    icon: Eye,
    label: "WATCH",
    className: "bg-amber-500 text-black"
  },
  caution: {
    icon: ShieldAlert,
    label: "CAUTION",
    className: "bg-rose-500 text-white"
  }
};

export function ExecutiveSummary({
  headline,
  summary,
  sentiment = 'neutral',
  investmentAction = 'watch',
  confidenceScore = 3,
  keyTakeaways = [],
  className
}: ExecutiveSummaryProps) {
  const sentimentInfo = sentimentConfig[sentiment];
  const actionInfo = actionConfig[investmentAction];
  const SentimentIcon = sentimentInfo.icon;
  const ActionIcon = actionInfo.icon;

  // Generate gradient based on sentiment
  const gradientClass = sentiment === 'bullish' 
    ? 'from-emerald-950/40 via-transparent to-transparent'
    : sentiment === 'bearish'
    ? 'from-rose-950/40 via-transparent to-transparent'
    : sentiment === 'mixed'
    ? 'from-amber-950/30 via-transparent to-transparent'
    : 'from-slate-900/50 via-transparent to-transparent';

  return (
    <section className={cn(
      "relative overflow-hidden rounded-xl border border-border/50 bg-card",
      className
    )}>
      {/* Gradient overlay */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br pointer-events-none",
        gradientClass
      )} />

      {/* Accent line */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-1",
        sentiment === 'bullish' ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' :
        sentiment === 'bearish' ? 'bg-gradient-to-r from-rose-500 to-rose-400' :
        sentiment === 'mixed' ? 'bg-gradient-to-r from-amber-500 to-amber-400' :
        'bg-gradient-to-r from-slate-500 to-slate-400'
      )} />

      <div className="relative p-5 sm:p-8">
        {/* Header Row */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          {/* Sentiment Badge */}
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium",
            sentimentInfo.className
          )}>
            <SentimentIcon className="w-4 h-4" />
            <span>{sentimentInfo.label}</span>
          </div>

          {/* Action & Confidence */}
          <div className="flex items-center gap-3">
            {/* Investment Action Badge */}
            <div className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-xs font-bold uppercase tracking-wider",
              actionInfo.className
            )}>
              <ActionIcon className="w-3.5 h-3.5" />
              <span>{actionInfo.label}</span>
            </div>

            {/* Confidence Indicator */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Confidence
              </span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={cn(
                      "w-2 h-4 rounded-sm transition-colors",
                      level <= confidenceScore 
                        ? "bg-primary" 
                        : "bg-muted"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Headline */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-foreground leading-tight mb-4">
          {headline}
        </h2>

        {/* Lead Paragraph */}
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-6">
          {summary}
        </p>

        {/* Key Takeaways */}
        {keyTakeaways.length > 0 && (
          <div className="pt-6 border-t border-border/50">
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5" />
              Key Takeaways
            </h3>
            <ol className="space-y-2">
              {keyTakeaways.slice(0, 4).map((takeaway, index) => (
                <li 
                  key={index}
                  className="flex items-start gap-3 text-sm text-foreground"
                >
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="leading-relaxed">{takeaway}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </section>
  );
}
