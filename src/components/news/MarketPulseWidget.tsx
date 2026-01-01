import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Activity, Flame, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarketPulseData {
  sentiment: 'bullish' | 'bearish' | 'neutral' | 'mixed';
  trendingTopics: string[];
  hotAreas: Array<{ name: string; trend: 'up' | 'down' | 'stable' }>;
  lastUpdated: string;
}

interface MarketPulseWidgetProps {
  data?: MarketPulseData;
  className?: string;
}

const DEFAULT_DATA: MarketPulseData = {
  sentiment: 'bullish',
  trendingTopics: ['Off-Plan Sales', 'Golden Visa', 'Emaar Launch', 'Rental Yields'],
  hotAreas: [
    { name: 'Downtown Dubai', trend: 'up' },
    { name: 'Dubai Marina', trend: 'stable' },
    { name: 'JVC', trend: 'up' },
    { name: 'Palm Jumeirah', trend: 'up' },
  ],
  lastUpdated: new Date().toISOString(),
};

const SENTIMENT_CONFIG = {
  bullish: { value: 75, color: 'text-emerald-500', bg: 'bg-emerald-500' },
  bearish: { value: 25, color: 'text-red-500', bg: 'bg-red-500' },
  neutral: { value: 50, color: 'text-muted-foreground', bg: 'bg-muted-foreground' },
  mixed: { value: 55, color: 'text-amber-500', bg: 'bg-amber-500' },
};

function TrendIcon({ trend }: { trend: 'up' | 'down' | 'stable' }) {
  if (trend === 'up') return <TrendingUp className="w-3 h-3 text-emerald-500" />;
  if (trend === 'down') return <TrendingDown className="w-3 h-3 text-red-500" />;
  return <Minus className="w-3 h-3 text-muted-foreground" />;
}

export function MarketPulseWidget({ data = DEFAULT_DATA, className }: MarketPulseWidgetProps) {
  const sentimentConfig = SENTIMENT_CONFIG[data.sentiment];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        'rounded-xl border border-border bg-card p-4 space-y-4',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          Market Pulse
        </h3>
        <span className="text-xs text-muted-foreground">Live</span>
      </div>

      {/* Sentiment Gauge */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Market Sentiment</span>
          <span className={cn('font-medium capitalize', sentimentConfig.color)}>
            {data.sentiment}
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${sentimentConfig.value}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={cn('h-full rounded-full', sentimentConfig.bg)}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Bearish</span>
          <span>Bullish</span>
        </div>
      </div>

      {/* Trending Topics */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <Flame className="w-3 h-3 text-orange-500" />
          Trending Now
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {data.trendingTopics.map((topic, i) => (
            <span
              key={topic}
              className={cn(
                'text-xs px-2 py-1 rounded-full',
                i === 0 
                  ? 'bg-primary/20 text-primary font-medium' 
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {topic}
            </span>
          ))}
        </div>
      </div>

      {/* Hot Areas */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <MapPin className="w-3 h-3 text-primary" />
          Hot Areas
        </h4>
        <div className="space-y-1.5">
          {data.hotAreas.slice(0, 4).map((area) => (
            <div
              key={area.name}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-foreground">{area.name}</span>
              <TrendIcon trend={area.trend} />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
