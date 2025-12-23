import { Building2, MapPin, Image, Eye, RefreshCw, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { PropertyStats } from '@/hooks/useAdminProperties';

interface PropertyStatsCardsProps {
  stats: PropertyStats | undefined;
  isLoading: boolean;
}

export function PropertyStatsCards({ stats, isLoading }: PropertyStatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="border-border">
            <CardContent className="p-4">
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-8 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    {
      label: 'Total',
      value: stats.total,
      icon: Building2,
      color: 'text-foreground',
      subtext: `${stats.forSale} sale · ${stats.forRent} rent`,
    },
    {
      label: 'Published',
      value: stats.published,
      icon: Eye,
      color: 'text-emerald-500',
      subtext: `${stats.unpublished} unpublished`,
    },
    {
      label: 'With Images',
      value: stats.withImages,
      icon: Image,
      color: 'text-blue-500',
      subtext: `${stats.withoutImages} missing`,
    },
    {
      label: 'Mapped',
      value: stats.withCoords,
      icon: MapPin,
      color: 'text-purple-500',
      subtext: `${stats.withoutCoords} unmapped`,
    },
    {
      label: 'Bayut Synced',
      value: stats.bayutSynced,
      icon: RefreshCw,
      color: 'text-orange-500',
      subtext: `${stats.manual} manual`,
    },
    {
      label: 'Issues',
      value: stats.withoutImages + stats.withoutCoords,
      icon: AlertTriangle,
      color: 'text-red-500',
      subtext: 'Needs attention',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {cards.map((card) => (
        <Card key={card.label} className="border-border hover:border-gold/50 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">{card.label}</span>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
            <div className={`text-2xl font-bold ${card.color}`}>
              {card.value.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1">{card.subtext}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
