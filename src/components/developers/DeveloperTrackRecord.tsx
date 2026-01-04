import { motion } from 'framer-motion';
import { Building2, TrendingUp, Clock, CheckCircle2, Target, Banknote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { Developer } from '@/hooks/useDevelopers';

interface DeveloperTrackRecordProps {
  developer: Developer;
}

const reputationLabels: Record<string, { label: string; color: string }> = {
  ultra_luxury: { label: 'Ultra Luxury', color: 'bg-violet-500/10 text-violet-600 border-violet-500/20' },
  premium: { label: 'Premium', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  value: { label: 'Value', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  mass_market: { label: 'Mass Market', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
};

export function DeveloperTrackRecord({ developer }: DeveloperTrackRecordProps) {
  const hasTrackRecord = developer.total_value_delivered || developer.on_time_delivery_rate || developer.market_share_percent;

  if (!hasTrackRecord) {
    return null;
  }

  const formatValue = (value: number) => {
    if (value >= 1e9) return `AED ${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `AED ${(value / 1e6).toFixed(0)}M`;
    return `AED ${value.toLocaleString()}`;
  };

  const reputation = reputationLabels[developer.investment_reputation || ''] || reputationLabels.premium;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl font-bold text-foreground">
          Investment Track Record
        </h2>
        {developer.investment_reputation && (
          <Badge variant="outline" className={reputation.color}>
            {reputation.label}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Value Delivered */}
        {developer.total_value_delivered && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Value Delivered</p>
                  <p className="text-2xl font-bold mt-1">
                    {formatValue(developer.total_value_delivered)}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-primary/10">
                  <Banknote className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Market Share */}
        {developer.market_share_percent && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Dubai Market Share</p>
                  <p className="text-2xl font-bold mt-1">
                    {developer.market_share_percent.toFixed(1)}%
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-primary/10">
                  <Target className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Avg Delivery Time */}
        {developer.avg_delivery_months && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Delivery Time</p>
                  <p className="text-2xl font-bold mt-1">
                    {developer.avg_delivery_months} months
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* On-Time Delivery Rate */}
      {developer.on_time_delivery_rate && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <span className="font-medium">On-Time Delivery Rate</span>
              </div>
              <span className="text-2xl font-bold">{developer.on_time_delivery_rate}%</span>
            </div>
            <Progress value={developer.on_time_delivery_rate} className="h-2" />
          </CardContent>
        </Card>
      )}

      {/* Target Buyer Profile */}
      {developer.target_buyer_profile && (
        <Card className="border-dashed">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-muted shrink-0">
                <Building2 className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Target Buyer Profile</p>
                <p className="text-foreground">{developer.target_buyer_profile}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}