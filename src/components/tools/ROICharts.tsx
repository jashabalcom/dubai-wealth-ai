import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, AreaChart, Area } from 'recharts';

interface ROIChartsProps {
  purchasePrice: number;
  downPaymentAmount: number;
  closingCostsAmount: number;
  annualAppreciation: number;
  holdingPeriod: number;
  netRentalIncome: number;
  formatAED: (value: number) => string;
}

const COLORS = ['hsl(var(--gold))', 'hsl(var(--primary))', 'hsl(142, 76%, 36%)'];

export function ROICharts({
  purchasePrice,
  downPaymentAmount,
  closingCostsAmount,
  annualAppreciation,
  holdingPeriod,
  netRentalIncome,
  formatAED,
}: ROIChartsProps) {
  // Cost breakdown pie chart data
  const costBreakdown = [
    { name: 'Down Payment', value: downPaymentAmount },
    { name: 'Closing Costs', value: closingCostsAmount },
  ];

  // Wealth projection data
  const wealthProjection = Array.from({ length: holdingPeriod + 1 }, (_, year) => {
    const propertyValue = purchasePrice * Math.pow(1 + annualAppreciation / 100, year);
    const cumulativeRental = netRentalIncome * year;
    const totalWealth = propertyValue + cumulativeRental - purchasePrice;
    
    return {
      year: `Year ${year}`,
      propertyValue: Math.round(propertyValue),
      cumulativeRental: Math.round(cumulativeRental),
      totalWealth: Math.round(totalWealth),
    };
  });

  return (
    <div className="space-y-6">
      {/* Cost Breakdown Pie */}
      <div className="p-4 sm:p-6 rounded-2xl bg-card border border-border">
        <h3 className="font-heading text-base sm:text-lg text-foreground mb-4">Initial Investment Breakdown</h3>
        <div className="h-48 sm:h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={costBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={65}
                paddingAngle={5}
                dataKey="value"
              >
                {costBreakdown.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => formatAED(value)}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Legend 
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Wealth Projection */}
      <div className="p-4 sm:p-6 rounded-2xl bg-card border border-border">
        <h3 className="font-heading text-base sm:text-lg text-foreground mb-4">Wealth Projection Over Time</h3>
        <div className="h-56 sm:h-64 overflow-x-auto scrollbar-hide">
          <ResponsiveContainer width="100%" height="100%" minWidth={400}>
            <AreaChart data={wealthProjection}>
              <defs>
                <linearGradient id="colorWealth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--gold))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--gold))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="year" 
                tick={{ fontSize: 10 }} 
                stroke="hsl(var(--muted-foreground))"
                interval={holdingPeriod > 10 ? 1 : 0}
              />
              <YAxis 
                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} 
                tick={{ fontSize: 10 }}
                stroke="hsl(var(--muted-foreground))"
                width={45}
              />
              <Tooltip 
                formatter={(value: number) => formatAED(value)}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Legend 
                verticalAlign="bottom"
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              />
              <Area 
                type="monotone" 
                dataKey="propertyValue" 
                stroke="hsl(var(--gold))" 
                fill="url(#colorWealth)"
                name="Property Value"
              />
              <Line 
                type="monotone" 
                dataKey="cumulativeRental" 
                stroke="hsl(142, 76%, 36%)" 
                strokeWidth={2}
                dot={false}
                name="Cumulative Rental"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
