import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis } from 'recharts';

interface MortgageChartsProps {
  loanAmount: number;
  totalInterest: number;
  downPaymentAmount: number;
  schedule: Array<{ month: number; principal: number; interest: number; balance: number }>;
  formatAED: (value: number) => string;
}

const COLORS = ['hsl(142, 76%, 36%)', 'hsl(25, 95%, 53%)', 'hsl(var(--gold))'];

export function MortgageCharts({
  loanAmount,
  totalInterest,
  downPaymentAmount,
  schedule,
  formatAED,
}: MortgageChartsProps) {
  // Payment breakdown pie
  const paymentBreakdown = [
    { name: 'Principal', value: loanAmount },
    { name: 'Total Interest', value: totalInterest },
    { name: 'Down Payment', value: downPaymentAmount },
  ];

  // Monthly breakdown for first year
  const monthlyBreakdown = schedule.map((row) => ({
    month: `M${row.month}`,
    Principal: Math.round(row.principal),
    Interest: Math.round(row.interest),
  }));

  return (
    <div className="space-y-6">
      {/* Payment Distribution Pie */}
      <div className="p-6 rounded-2xl bg-card border border-border">
        <h3 className="font-heading text-lg text-foreground mb-4">Total Cost Distribution</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={paymentBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {paymentBreakdown.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => formatAED(value)}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Principal vs Interest */}
      <div className="p-6 rounded-2xl bg-card border border-border">
        <h3 className="font-heading text-lg text-foreground mb-4">First Year: Principal vs Interest</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyBreakdown}>
              <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                formatter={(value: number) => formatAED(value)}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="Principal" stackId="a" fill="hsl(142, 76%, 36%)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Interest" stackId="a" fill="hsl(25, 95%, 53%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
