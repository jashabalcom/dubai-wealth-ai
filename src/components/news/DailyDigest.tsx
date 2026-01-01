import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Calendar, ArrowRight, Building, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface KeyMetric {
  label: string;
  value: string;
  change?: string;
}

interface DailyDigestData {
  id: string;
  digest_date: string;
  headline: string;
  executive_summary: string;
  market_sentiment: 'bullish' | 'bearish' | 'neutral' | 'mixed';
  key_metrics: KeyMetric[] | Record<string, string>;
  sector_highlights: any[] | Record<string, string>;
  area_highlights: any[] | Record<string, string>;
  top_article_ids: string[];
  is_published: boolean;
}

interface DailyDigestProps {
  digest: DailyDigestData;
  compact?: boolean;
}

const SENTIMENT_CONFIG = {
  bullish: {
    icon: TrendingUp,
    label: 'Bullish',
    className: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30',
    gradient: 'from-emerald-500/10 to-transparent',
  },
  bearish: {
    icon: TrendingDown,
    label: 'Bearish',
    className: 'bg-red-500/20 text-red-500 border-red-500/30',
    gradient: 'from-red-500/10 to-transparent',
  },
  neutral: {
    icon: Minus,
    label: 'Neutral',
    className: 'bg-muted text-muted-foreground border-border',
    gradient: 'from-muted/50 to-transparent',
  },
  mixed: {
    icon: TrendingUp,
    label: 'Mixed Signals',
    className: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
    gradient: 'from-amber-500/10 to-transparent',
  },
};

function formatDigestDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

export function DailyDigest({ digest, compact = false }: DailyDigestProps) {
  const sentiment = SENTIMENT_CONFIG[digest.market_sentiment] || SENTIMENT_CONFIG.neutral;
  const SentimentIcon = sentiment.icon;

  if (compact) {
    return (
      <Link to={`/briefing/${digest.digest_date}`}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'group p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-all',
            'bg-gradient-to-r',
            sentiment.gradient
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={cn('text-xs', sentiment.className)}>
                  <SentimentIcon className="w-3 h-3 mr-1" />
                  {sentiment.label}
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDigestDate(digest.digest_date)}
                </span>
              </div>
              <h3 className="font-display font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {digest.headline}
              </h3>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
          </div>
        </motion.div>
      </Link>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-2xl border border-border overflow-hidden',
        'bg-gradient-to-br from-card via-card to-primary/5'
      )}
    >
      {/* Header */}
      <div className={cn(
        'p-6 border-b border-border',
        'bg-gradient-to-r',
        sentiment.gradient
      )}>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Badge className={cn('text-sm px-3 py-1', sentiment.className)}>
            <SentimentIcon className="w-4 h-4 mr-1.5" />
            Market {sentiment.label}
          </Badge>
          <span className="text-sm text-muted-foreground flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {formatDigestDate(digest.digest_date)}
          </span>
        </div>
        
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
          {digest.headline}
        </h2>
        
        <p className="text-sm text-muted-foreground">
          Daily Market Intelligence Briefing • Dubai Real Estate
        </p>
      </div>

      {/* Executive Summary */}
      <div className="p-6 border-b border-border">
        <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
          <span className="w-1 h-5 bg-primary rounded-full" />
          Executive Summary
        </h3>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="text-muted-foreground whitespace-pre-wrap">
            {digest.executive_summary}
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      {digest.key_metrics && (Array.isArray(digest.key_metrics) ? digest.key_metrics.length > 0 : Object.keys(digest.key_metrics).length > 0) && (
        <div className="p-6 border-b border-border bg-muted/30">
          <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Key Metrics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.isArray(digest.key_metrics) 
              ? digest.key_metrics.slice(0, 4).map((metric, idx) => (
                  <div key={idx} className="text-center p-3 rounded-lg bg-background border border-border">
                    <div className="text-lg font-bold text-foreground">{metric.value}</div>
                    <div className="text-xs text-muted-foreground">{metric.label}</div>
                  </div>
                ))
              : Object.entries(digest.key_metrics).slice(0, 4).map(([key, value]) => (
                  <div key={key} className="text-center p-3 rounded-lg bg-background border border-border">
                    <div className="text-lg font-bold text-foreground">{value}</div>
                    <div className="text-xs text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</div>
                  </div>
                ))
            }
          </div>
        </div>
      )}

      {/* Sector & Area Highlights */}
      <div className="p-6 grid md:grid-cols-2 gap-6">
        {/* Sector Highlights */}
        {digest.sector_highlights && (Array.isArray(digest.sector_highlights) ? digest.sector_highlights.length > 0 : Object.keys(digest.sector_highlights).length > 0) && (
          <div>
            <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
              <Building className="w-4 h-4 text-primary" />
              Sector Highlights
            </h3>
            <ul className="space-y-2">
              {Array.isArray(digest.sector_highlights)
                ? digest.sector_highlights.slice(0, 4).map((s: any, idx) => (
                    <li key={idx} className="text-sm">
                      <span className="font-medium text-foreground">{s.sector}:</span>
                      <span className="text-muted-foreground ml-1">{s.summary}</span>
                    </li>
                  ))
                : Object.entries(digest.sector_highlights).slice(0, 4).map(([sector, insight]) => (
                    <li key={sector} className="text-sm">
                      <span className="font-medium text-foreground capitalize">{sector.replace(/_/g, ' ')}:</span>
                      <span className="text-muted-foreground ml-1">{insight}</span>
                    </li>
                  ))
              }
            </ul>
          </div>
        )}

        {/* Area Highlights */}
        {digest.area_highlights && (Array.isArray(digest.area_highlights) ? digest.area_highlights.length > 0 : Object.keys(digest.area_highlights).length > 0) && (
          <div>
            <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Area Highlights
            </h3>
            <ul className="space-y-2">
              {Array.isArray(digest.area_highlights)
                ? digest.area_highlights.slice(0, 4).map((a: any, idx) => (
                    <li key={idx} className="text-sm">
                      <span className="font-medium text-foreground">{a.area}:</span>
                      <span className="text-muted-foreground ml-1">+{a.change}% YoY</span>
                    </li>
                  ))
                : Object.entries(digest.area_highlights).slice(0, 4).map(([area, insight]) => (
                    <li key={area} className="text-sm">
                      <span className="font-medium text-foreground">{area}:</span>
                      <span className="text-muted-foreground ml-1">{insight}</span>
                    </li>
                  ))
              }
            </ul>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="p-6 border-t border-border bg-gradient-to-r from-primary/5 to-gold/5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-foreground font-medium">
              {digest.top_article_ids?.length || 0} articles analyzed
            </p>
            <p className="text-xs text-muted-foreground">
              Get the full Bloomberg-style briefing with metrics & sector analysis
            </p>
          </div>
          <Button asChild size="default" className="gap-2">
            <Link to={`/briefing/${digest.digest_date}`}>
              View Full Briefing
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export function DailyDigestSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden animate-pulse">
      <div className="p-6 border-b border-border">
        <div className="flex gap-3 mb-4">
          <div className="h-6 w-24 bg-muted rounded-full" />
          <div className="h-6 w-32 bg-muted rounded" />
        </div>
        <div className="h-8 w-3/4 bg-muted rounded mb-2" />
        <div className="h-4 w-1/2 bg-muted rounded" />
      </div>
      <div className="p-6">
        <div className="h-4 w-full bg-muted rounded mb-2" />
        <div className="h-4 w-5/6 bg-muted rounded mb-2" />
        <div className="h-4 w-4/6 bg-muted rounded" />
      </div>
    </div>
  );
}
