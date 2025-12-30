import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { PortfolioProperty } from '@/hooks/usePortfolio';

interface WealthGrowthChartProps {
  properties: PortfolioProperty[];
}

export function WealthGrowthChart({ properties }: WealthGrowthChartProps) {
  const chartData = useMemo(() => {
    if (properties.length === 0) return [];
    
    // Sort properties by purchase date
    const sorted = [...properties].sort(
      (a, b) => new Date(a.purchase_date).getTime() - new Date(b.purchase_date).getTime()
    );
    
    // Generate monthly data points from first purchase to now
    const firstDate = new Date(sorted[0].purchase_date);
    const now = new Date();
    const data: Array<{
      date: string;
      month: string;
      totalValue: number;
      totalEquity: number;
      totalPurchase: number;
    }> = [];
    
    let currentDate = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1);
    
    while (currentDate <= now) {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Calculate portfolio state at this date
      const activeProperties = sorted.filter(
        p => new Date(p.purchase_date) <= currentDate
      );
      
      if (activeProperties.length > 0) {
        const totalPurchase = activeProperties.reduce((sum, p) => sum + Number(p.purchase_price), 0);
        const totalValue = activeProperties.reduce((sum, p) => sum + Number(p.current_value), 0);
        const totalMortgage = activeProperties.reduce((sum, p) => sum + Number(p.mortgage_balance), 0);
        const totalEquity = totalValue - totalMortgage;
        
        data.push({
          date: dateStr,
          month: currentDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          totalValue,
          totalEquity,
          totalPurchase,
        });
      }
      
      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return data;
  }, [properties]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  if (chartData.length === 0) {
    return null;
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4">Wealth Growth Over Time</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--gold))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--gold))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickFormatter={formatCurrency}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number, name: string) => [
                new Intl.NumberFormat('en-AE', {
                  style: 'currency',
                  currency: 'AED',
                  minimumFractionDigits: 0,
                }).format(value),
                name === 'totalValue' ? 'Total Value' : 'Total Equity'
              ]}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Legend 
              formatter={(value) => value === 'totalValue' ? 'Total Value' : 'Total Equity'}
            />
            <Area
              type="monotone"
              dataKey="totalValue"
              stroke="hsl(var(--gold))"
              strokeWidth={2}
              fill="url(#valueGradient)"
            />
            <Area
              type="monotone"
              dataKey="totalEquity"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#equityGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
