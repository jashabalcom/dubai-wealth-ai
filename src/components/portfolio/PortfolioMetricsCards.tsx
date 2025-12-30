import { TrendingUp, TrendingDown, DollarSign, Home, PiggyBank, Wallet } from 'lucide-react';
import { PortfolioMetrics } from '@/hooks/usePortfolio';
import { MetricSparkline } from './MetricSparkline';
import { usePortfolioHistory } from '@/hooks/usePortfolioHistory';

interface PortfolioMetricsCardsProps {
  metrics: PortfolioMetrics;
  propertyCount: number;
  portfolioId?: string;
}

export function PortfolioMetricsCards({ metrics, propertyCount, portfolioId }: PortfolioMetricsCardsProps) {
  const { history } = usePortfolioHistory(portfolioId);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculate trend percentage from history
  const calculateTrend = (currentValue: number, historyKey: 'totalValue' | 'totalEquity') => {
    if (history.length < 2) return null;
    const oldestValue = history[0][historyKey];
    if (oldestValue === 0) return null;
    return ((currentValue - oldestValue) / oldestValue) * 100;
  };

  const valueTrend = calculateTrend(metrics.totalValue, 'totalValue');
  const equityTrend = calculateTrend(metrics.totalEquity, 'totalEquity');

  const cards = [
    {
      label: 'Total Portfolio Value',
      value: formatCurrency(metrics.totalValue),
      icon: Home,
      subtext: `${propertyCount} ${propertyCount === 1 ? 'property' : 'properties'}`,
      color: 'text-gold',
      sparklineData: history.map(h => h.totalValue),
      trend: valueTrend,
    },
    {
      label: 'Total Equity',
      value: formatCurrency(metrics.totalEquity),
      icon: Wallet,
      subtext: `${((metrics.totalEquity / metrics.totalValue) * 100 || 0).toFixed(1)}% equity ratio`,
      color: 'text-emerald-500',
      sparklineData: history.map(h => h.totalEquity),
      trend: equityTrend,
    },
    {
      label: 'Monthly Cash Flow',
      value: formatCurrency(metrics.monthlyCashFlow),
      icon: metrics.monthlyCashFlow >= 0 ? TrendingUp : TrendingDown,
      subtext: `${formatCurrency(metrics.annualCashFlow)}/year`,
      color: metrics.monthlyCashFlow >= 0 ? 'text-emerald-500' : 'text-red-500',
      sparklineData: [],
      trend: null,
    },
    {
      label: 'Average ROI',
      value: `${metrics.averageROI.toFixed(1)}%`,
      icon: DollarSign,
      subtext: 'Annual return on investment',
      color: 'text-gold',
      sparklineData: [],
      trend: null,
    },
    {
      label: 'Total Appreciation',
      value: formatCurrency(metrics.totalAppreciation),
      icon: TrendingUp,
      subtext: `${metrics.appreciationPercentage.toFixed(1)}% gain`,
      color: metrics.totalAppreciation >= 0 ? 'text-emerald-500' : 'text-red-500',
      sparklineData: [],
      trend: null,
    },
    {
      label: 'Monthly Rental Income',
      value: formatCurrency(metrics.monthlyRentalIncome),
      icon: PiggyBank,
      subtext: `${formatCurrency(metrics.monthlyExpenses)} expenses`,
      color: 'text-gold',
      sparklineData: [],
      trend: null,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-card border border-border rounded-xl p-5 hover:border-gold/30 transition-colors"
        >
          <div className="flex items-start justify-between mb-3">
            <span className="text-sm text-muted-foreground">{card.label}</span>
            <card.icon className={`h-5 w-5 ${card.color}`} />
          </div>
          <div className="flex items-center gap-3">
            <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
            {card.sparklineData.length > 1 && (
              <MetricSparkline 
                data={card.sparklineData} 
                color={card.trend && card.trend >= 0 ? '#10b981' : '#ef4444'} 
              />
            )}
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-muted-foreground">{card.subtext}</span>
            {card.trend !== null && (
              <span className={`text-xs font-medium flex items-center gap-0.5 ${card.trend >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {card.trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {Math.abs(card.trend).toFixed(1)}%
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
