import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  ReferenceLine,
  Cell,
} from 'recharts';

interface DSCRChartsProps {
  dscr: number;
  noi: number;
  annualDebtService: number;
  loanAmount: number;
  interestRate: number;
  formatAED: (amount: number) => string;
}

const COLORS = ['hsl(142, 76%, 36%)', 'hsl(47, 96%, 53%)', 'hsl(0, 84%, 60%)'];

export function DSCRCharts({
  dscr,
  noi,
  annualDebtService,
  loanAmount,
  interestRate,
  formatAED,
}: DSCRChartsProps) {
  // Sensitivity analysis: DSCR at different interest rates
  const sensitivityData = [-1, -0.5, 0, 0.5, 1, 1.5, 2].map((rateChange) => {
    const newRate = interestRate + rateChange;
    const monthlyRate = newRate / 100 / 12;
    const months = 25 * 12; // Assume 25 year term
    const newMonthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    const newAnnualDebt = newMonthlyPayment * 12;
    const newDSCR = noi / newAnnualDebt;
    
    return {
      rate: `${newRate.toFixed(1)}%`,
      dscr: parseFloat(newDSCR.toFixed(2)),
      isCurrent: rateChange === 0,
    };
  });

  // UAE Lender comparison data
  const lenderData = [
    { name: 'Emirates NBD', minDSCR: 1.25, maxLTV: 75, rate: '5.49%', type: 'Commercial' },
    { name: 'ADCB', minDSCR: 1.20, maxLTV: 70, rate: '5.25%', type: 'Commercial' },
    { name: 'Mashreq', minDSCR: 1.30, maxLTV: 65, rate: '5.75%', type: 'Commercial' },
    { name: 'FAB', minDSCR: 1.25, maxLTV: 70, rate: '5.50%', type: 'Commercial' },
    { name: 'DIB', minDSCR: 1.15, maxLTV: 75, rate: '5.99%', type: 'Islamic' },
    { name: 'ADIB', minDSCR: 1.20, maxLTV: 70, rate: '5.75%', type: 'Islamic' },
  ];

  // Cash flow breakdown
  const cashFlowData = [
    { name: 'NOI', value: noi, fill: 'hsl(var(--primary))' },
    { name: 'Debt Service', value: annualDebtService, fill: 'hsl(var(--destructive))' },
    { name: 'Cash Flow', value: Math.max(0, noi - annualDebtService), fill: 'hsl(142, 76%, 36%)' },
  ];

  const getDSCRColor = (value: number) => {
    if (value >= 1.25) return COLORS[0];
    if (value >= 1.0) return COLORS[1];
    return COLORS[2];
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Sensitivity Analysis Chart */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">Interest Rate Sensitivity</CardTitle>
          <p className="text-sm text-muted-foreground">DSCR impact at different rates</p>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sensitivityData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="rate" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <YAxis 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  domain={[0, 'auto']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [value.toFixed(2), 'DSCR']}
                />
                <ReferenceLine y={1.25} stroke="hsl(142, 76%, 36%)" strokeDasharray="5 5" label={{ value: 'Min 1.25x', fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                <ReferenceLine y={1.0} stroke="hsl(0, 84%, 60%)" strokeDasharray="5 5" label={{ value: 'Break-even', fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                <Bar dataKey="dscr" radius={[4, 4, 0, 0]}>
                  {sensitivityData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.isCurrent ? 'hsl(var(--primary))' : getDSCRColor(entry.dscr)}
                      stroke={entry.isCurrent ? 'hsl(var(--primary))' : 'none'}
                      strokeWidth={entry.isCurrent ? 2 : 0}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Cash Flow Breakdown */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">Annual Cash Flow</CardTitle>
          <p className="text-sm text-muted-foreground">Income vs. debt obligations</p>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlowData} layout="vertical" margin={{ top: 20, right: 20, left: 80, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  type="number" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [formatAED(value), 'Amount']}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {cashFlowData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* UAE Lender Comparison Table */}
      <Card className="bg-card border-border lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">UAE Commercial Lender Requirements</CardTitle>
          <p className="text-sm text-muted-foreground">
            Your DSCR: <span className={`font-bold ${dscr >= 1.25 ? 'text-green-500' : dscr >= 1.0 ? 'text-yellow-500' : 'text-red-500'}`}>
              {dscr.toFixed(2)}x
            </span>
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Lender</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Type</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Min DSCR</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Max LTV</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Rate From</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Eligibility</th>
                </tr>
              </thead>
              <tbody>
                {lenderData.map((lender) => {
                  const isEligible = dscr >= lender.minDSCR;
                  return (
                    <tr key={lender.name} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-medium">{lender.name}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs ${lender.type === 'Islamic' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                          {lender.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono">{lender.minDSCR.toFixed(2)}x</td>
                      <td className="py-3 px-4 text-center">{lender.maxLTV}%</td>
                      <td className="py-3 px-4 text-center">{lender.rate}</td>
                      <td className="py-3 px-4 text-center">
                        {isEligible ? (
                          <span className="text-green-500 font-medium">✓ Eligible</span>
                        ) : (
                          <span className="text-red-400 font-medium">✗ Below min</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            * Rates and requirements are indicative and subject to change. Contact lenders directly for current terms.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
