import { TrendingUp, TrendingDown, DollarSign, Home, PiggyBank, Wallet } from 'lucide-react';
import { PortfolioMetrics } from '@/hooks/usePortfolio';

interface PortfolioMetricsCardsProps {
  metrics: PortfolioMetrics;
  propertyCount: number;
}

export function PortfolioMetricsCards({ metrics, propertyCount }: PortfolioMetricsCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const cards = [
    {
      label: 'Total Portfolio Value',
      value: formatCurrency(metrics.totalValue),
      icon: Home,
      subtext: `${propertyCount} ${propertyCount === 1 ? 'property' : 'properties'}`,
      color: 'text-gold',
    },
    {
      label: 'Total Equity',
      value: formatCurrency(metrics.totalEquity),
      icon: Wallet,
      subtext: `${((metrics.totalEquity / metrics.totalValue) * 100 || 0).toFixed(1)}% equity ratio`,
      color: 'text-emerald-500',
    },
    {
      label: 'Monthly Cash Flow',
      value: formatCurrency(metrics.monthlyCashFlow),
      icon: metrics.monthlyCashFlow >= 0 ? TrendingUp : TrendingDown,
      subtext: `${formatCurrency(metrics.annualCashFlow)}/year`,
      color: metrics.monthlyCashFlow >= 0 ? 'text-emerald-500' : 'text-red-500',
    },
    {
      label: 'Average ROI',
      value: `${metrics.averageROI.toFixed(1)}%`,
      icon: DollarSign,
      subtext: 'Annual return on investment',
      color: 'text-gold',
    },
    {
      label: 'Total Appreciation',
      value: formatCurrency(metrics.totalAppreciation),
      icon: TrendingUp,
      subtext: `${metrics.appreciationPercentage.toFixed(1)}% gain`,
      color: metrics.totalAppreciation >= 0 ? 'text-emerald-500' : 'text-red-500',
    },
    {
      label: 'Monthly Rental Income',
      value: formatCurrency(metrics.monthlyRentalIncome),
      icon: PiggyBank,
      subtext: `${formatCurrency(metrics.monthlyExpenses)} expenses`,
      color: 'text-gold',
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
          <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
          <div className="text-xs text-muted-foreground mt-1">{card.subtext}</div>
        </div>
      ))}
    </div>
  );
}
