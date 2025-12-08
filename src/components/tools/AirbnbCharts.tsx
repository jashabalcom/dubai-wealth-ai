import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface AirbnbChartsProps {
  peakRevenue: number;
  midRevenue: number;
  lowRevenue: number;
  totalExpenses: number;
  netAnnualIncome: number;
  grossRevenue: number;
  platformFees: number;
  managementFees: number;
  annualUtilities: number;
  annualMaintenance: number;
  serviceCharges: number;
  licenseFee: number;
  formatAED: (value: number) => string;
}

const REVENUE_COLORS = ['hsl(var(--gold))', 'hsl(25, 95%, 53%)', 'hsl(200, 80%, 50%)'];
const EXPENSE_COLORS = ['hsl(280, 60%, 50%)', 'hsl(320, 70%, 50%)', 'hsl(350, 80%, 50%)', 'hsl(20, 90%, 50%)', 'hsl(50, 90%, 45%)', 'hsl(80, 70%, 40%)'];

export function AirbnbCharts({
  peakRevenue,
  midRevenue,
  lowRevenue,
  platformFees,
  managementFees,
  annualUtilities,
  annualMaintenance,
  serviceCharges,
  licenseFee,
  formatAED,
}: AirbnbChartsProps) {
  // Seasonal revenue comparison
  const seasonalData = [
    { season: 'Peak (Nov-Feb)', revenue: Math.round(peakRevenue), fill: 'hsl(var(--gold))' },
    { season: 'Mid (Mar-Apr, Oct)', revenue: Math.round(midRevenue), fill: 'hsl(25, 95%, 53%)' },
    { season: 'Low (May-Sep)', revenue: Math.round(lowRevenue), fill: 'hsl(200, 80%, 50%)' },
  ];

  // Expense breakdown
  const expenseData = [
    { name: 'Platform Fees', value: Math.round(platformFees) },
    { name: 'Management', value: Math.round(managementFees) },
    { name: 'Utilities', value: Math.round(annualUtilities) },
    { name: 'Maintenance', value: Math.round(annualMaintenance) },
    { name: 'Service Charges', value: Math.round(serviceCharges) },
    { name: 'License', value: Math.round(licenseFee) },
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      {/* Seasonal Revenue Bar Chart */}
      <div className="p-6 rounded-2xl bg-card border border-border">
        <h3 className="font-heading text-lg text-foreground mb-4">Revenue by Season</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={seasonalData} layout="vertical">
              <XAxis type="number" tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} stroke="hsl(var(--muted-foreground))" />
              <YAxis type="category" dataKey="season" width={100} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                formatter={(value: number) => formatAED(value)}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="revenue" radius={[0, 6, 6, 0]}>
                {seasonalData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={REVENUE_COLORS[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expense Breakdown Pie */}
      <div className="p-6 rounded-2xl bg-card border border-border">
        <h3 className="font-heading text-lg text-foreground mb-4">Annual Expenses Breakdown</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={expenseData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {expenseData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
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
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
