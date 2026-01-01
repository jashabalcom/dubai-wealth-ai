import { TrendingUp, AlertTriangle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RiskOpportunityGaugeProps {
  opportunityScore?: number;
  riskLevel?: 'low' | 'medium' | 'high';
  timeSensitivity?: 'immediate' | '2_weeks' | '1_month' | 'evergreen';
  className?: string;
}

const RISK_CONFIG = {
  low: { label: 'Low Risk', color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/30' },
  medium: { label: 'Medium Risk', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  high: { label: 'High Risk', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30' },
};

const TIME_CONFIG = {
  immediate: { label: 'Act Now', color: 'text-red-500', icon: '🔥' },
  '2_weeks': { label: 'This Week', color: 'text-amber-500', icon: '⏰' },
  '1_month': { label: 'This Month', color: 'text-blue-500', icon: '📅' },
  evergreen: { label: 'Monitor', color: 'text-green-500', icon: '🌿' },
};

export function RiskOpportunityGauge({ 
  opportunityScore, 
  riskLevel, 
  timeSensitivity,
  className 
}: RiskOpportunityGaugeProps) {
  const riskConfig = riskLevel ? RISK_CONFIG[riskLevel] : null;
  const timeConfig = timeSensitivity ? TIME_CONFIG[timeSensitivity] : null;

  return (
    <div className={cn("grid grid-cols-3 gap-4", className)}>
      {/* Opportunity Score */}
      {opportunityScore && (
        <div className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-gold/10 to-transparent border border-gold/20">
          <TrendingUp className="h-5 w-5 text-gold mb-2" />
          <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Opportunity</span>
          <div className="flex items-baseline gap-0.5">
            <span className="text-2xl font-bold text-gold">{opportunityScore}</span>
            <span className="text-sm text-muted-foreground">/10</span>
          </div>
          {/* Score bar */}
          <div className="w-full h-2 bg-muted rounded-full mt-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-gold/60 to-gold rounded-full transition-all"
              style={{ width: `${opportunityScore * 10}%` }}
            />
          </div>
        </div>
      )}

      {/* Risk Level */}
      {riskConfig && (
        <div className={cn(
          "flex flex-col items-center p-4 rounded-xl border",
          riskConfig.bg,
          riskConfig.border
        )}>
          <AlertTriangle className={cn("h-5 w-5 mb-2", riskConfig.color)} />
          <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Risk</span>
          <span className={cn("text-lg font-semibold", riskConfig.color)}>
            {riskConfig.label.replace(' Risk', '')}
          </span>
        </div>
      )}

      {/* Time Sensitivity */}
      {timeConfig && (
        <div className="flex flex-col items-center p-4 rounded-xl bg-muted/50 border border-border">
          <Clock className={cn("h-5 w-5 mb-2", timeConfig.color)} />
          <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Timing</span>
          <span className={cn("text-lg font-semibold flex items-center gap-1", timeConfig.color)}>
            <span>{timeConfig.icon}</span>
            <span className="text-sm">{timeConfig.label}</span>
          </span>
        </div>
      )}
    </div>
  );
}
