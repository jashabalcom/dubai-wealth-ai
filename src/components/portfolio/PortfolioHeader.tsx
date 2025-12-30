import { motion } from 'framer-motion';
import { Briefcase, Crown, TrendingUp, TrendingDown } from 'lucide-react';
import { useCountUp } from '@/hooks/useCountUp';
import { DataConfidenceBadge, DataSource } from './DataConfidenceBadge';

interface PortfolioHeaderProps {
  totalValue: number;
  previousValue?: number;
  dataSource: DataSource;
  lastUpdated?: Date;
}

export function PortfolioHeader({ 
  totalValue, 
  previousValue, 
  dataSource = 'user',
  lastUpdated 
}: PortfolioHeaderProps) {
  const animatedValue = useCountUp({ end: totalValue, duration: 1500 });
  
  const changePercent = previousValue 
    ? ((totalValue - previousValue) / previousValue) * 100 
    : 0;
  const isPositive = changePercent >= 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-card via-card to-gold/5 border border-border rounded-2xl p-6 md:p-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="p-3 rounded-xl bg-gold/10 border border-gold/20"
          >
            <Briefcase className="h-8 w-8 text-gold" />
          </motion.div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl md:text-3xl font-bold">Portfolio Dashboard</h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold/20 text-gold text-xs">
                <Crown className="h-3 w-3" />
                Elite
              </span>
            </div>
            <p className="text-muted-foreground">Track your Dubai real estate investments</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <DataConfidenceBadge source={dataSource} lastUpdated={lastUpdated} />
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-border/50">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Portfolio Value</p>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex items-baseline gap-3"
            >
              <span className="text-4xl md:text-5xl font-bold text-gold">
                {formatCurrency(animatedValue)}
              </span>
              {previousValue && changePercent !== 0 && (
                <span className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                  {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  {isPositive ? '+' : ''}{changePercent.toFixed(1)}%
                </span>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
