import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  ArrowRight, 
  Radio,
  Sparkles,
  Shield
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useLatestDigest } from '@/hooks/useDailyDigest';
import { cn } from '@/lib/utils';

const SENTIMENT_CONFIG = {
  bullish: {
    icon: TrendingUp,
    label: 'Bullish',
    className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  bearish: {
    icon: TrendingDown,
    label: 'Bearish',
    className: 'bg-red-500/20 text-red-400 border-red-500/30',
  },
  neutral: {
    icon: Minus,
    label: 'Neutral',
    className: 'bg-muted text-muted-foreground border-border',
  },
  mixed: {
    icon: TrendingUp,
    label: 'Mixed',
    className: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  },
};

const ACTION_CONFIG: Record<string, { label: string; icon: typeof Sparkles; className: string }> = {
  buy: {
    label: 'Strong Buy',
    icon: TrendingUp,
    className: 'text-emerald-400',
  },
  accumulate: {
    label: 'Accumulate',
    icon: TrendingUp,
    className: 'text-green-400',
  },
  hold: {
    label: 'Hold',
    icon: Minus,
    className: 'text-amber-400',
  },
  watch: {
    label: 'Watch',
    icon: Shield,
    className: 'text-muted-foreground',
  },
  reduce: {
    label: 'Reduce',
    icon: TrendingDown,
    className: 'text-orange-400',
  },
  sell: {
    label: 'Sell',
    icon: TrendingDown,
    className: 'text-red-400',
  },
};

export function MarketBriefingWidget() {
  const { digest, isLoading } = useLatestDigest();

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-4" />
        <div className="flex gap-3">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      </div>
    );
  }

  if (!digest) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Radio className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm text-foreground">Market Intelligence</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          No briefing available today. Check back soon for the latest market intelligence.
        </p>
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link to="/briefing">View Briefings</Link>
        </Button>
      </div>
    );
  }

  const sentiment = SENTIMENT_CONFIG[digest.market_sentiment as keyof typeof SENTIMENT_CONFIG] || SENTIMENT_CONFIG.neutral;
  const SentimentIcon = sentiment.icon;
  const action = ACTION_CONFIG[digest.investment_action as keyof typeof ACTION_CONFIG] || ACTION_CONFIG.watch;
  const ActionIcon = action.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card overflow-hidden group hover:border-primary/30 transition-all"
    >
      {/* Header */}
      <div className="p-4 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
              <Radio className="w-2.5 h-2.5 text-primary animate-pulse" />
              <span className="text-[9px] uppercase tracking-widest text-primary font-mono font-medium">
                Live
              </span>
            </div>
            <span className="text-xs text-muted-foreground font-medium">Market Intelligence</span>
          </div>
          <Badge className={cn('text-[10px] px-2 py-0.5', sentiment.className)}>
            <SentimentIcon className="w-3 h-3 mr-1" />
            {sentiment.label}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-foreground line-clamp-2 text-sm leading-snug">
          {digest.headline}
        </h3>

        {/* Confidence & Action */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <ActionIcon className={cn("w-3.5 h-3.5", action.className)} />
            <span className={cn("font-medium", action.className)}>{action.label}</span>
          </div>
          {digest.confidence_score && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Sparkles className="w-3 h-3" />
              <span>{digest.confidence_score}/5 Confidence</span>
            </div>
          )}
        </div>

        {/* CTA */}
        <Button asChild variant="ghost" size="sm" className="w-full justify-between group-hover:bg-muted/50">
          <Link to="/briefing">
            <span>View Full Briefing</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}
