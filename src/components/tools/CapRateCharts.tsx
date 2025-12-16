import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { CommercialBenchmark } from '@/lib/commercialRealEstateFees';

interface CapRateChartsProps {
  noi: number;
  capRate: number;
  benchmark: CommercialBenchmark;
  operatingExpenses: {
    propertyManagement: number;
    insurance: number;
    utilities: number;
    repairs: number;
    serviceCharges: number;
    marketing: number;
    other: number;
  };
  effectiveGrossIncome: number;
  formatAED: (amount: number) => string;
}

const COLORS = ['#64748b', '#94a3b8', '#475569', '#334155', '#1e293b', '#0f172a', '#cbd5e1'];

export function CapRateCharts({ 
  noi, 
  capRate, 
  benchmark, 
  operatingExpenses,
  effectiveGrossIncome,
  formatAED,
}: CapRateChartsProps) {
  // NOI Breakdown Pie Chart Data
  const expenseData = [
    { name: 'Property Mgmt', value: operatingExpenses.propertyManagement, color: COLORS[0] },
    { name: 'Insurance', value: operatingExpenses.insurance, color: COLORS[1] },
    { name: 'Utilities', value: operatingExpenses.utilities, color: COLORS[2] },
    { name: 'Repairs', value: operatingExpenses.repairs, color: COLORS[3] },
    { name: 'Service Charges', value: operatingExpenses.serviceCharges, color: COLORS[4] },
    { name: 'Marketing', value: operatingExpenses.marketing, color: COLORS[5] },
    { name: 'Other', value: operatingExpenses.other, color: COLORS[6] },
  ].filter(item => item.value > 0);

  const totalExpenses = Object.values(operatingExpenses).reduce((sum, v) => sum + v, 0);

  const noiBreakdownData = [
    { name: 'NOI', value: noi, color: '#22c55e' },
    { name: 'Expenses', value: totalExpenses, color: '#ef4444' },
  ];

  // Cap Rate Comparison Bar Chart Data
  const capRateComparisonData = [
    { 
      name: 'Your Property', 
      capRate: capRate,
      fill: capRate >= benchmark.typicalCapRate.avg ? '#22c55e' : capRate >= benchmark.typicalCapRate.min ? '#f59e0b' : '#ef4444',
    },
    { 
      name: 'Market Min', 
      capRate: benchmark.typicalCapRate.min,
      fill: '#64748b',
    },
    { 
      name: 'Market Avg', 
      capRate: benchmark.typicalCapRate.avg,
      fill: '#94a3b8',
    },
    { 
      name: 'Market Max', 
      capRate: benchmark.typicalCapRate.max,
      fill: '#cbd5e1',
    },
  ];

  return (
    <Card className="bg-card border-border">
      <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-2">
        <CardTitle className="font-heading text-lg sm:text-xl">Analysis Charts</CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
        <Tabs defaultValue="breakdown" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4 overflow-x-auto">
            <TabsTrigger value="breakdown" className="text-xs sm:text-sm">Income</TabsTrigger>
            <TabsTrigger value="expenses" className="text-xs sm:text-sm">Expenses</TabsTrigger>
            <TabsTrigger value="comparison" className="text-xs sm:text-sm">Cap Rate</TabsTrigger>
          </TabsList>

          <TabsContent value="breakdown" className="mt-0">
            <div className="h-52 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={noiBreakdownData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {noiBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
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
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs sm:text-sm text-muted-foreground">NOI: {formatAED(noi)}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-xs sm:text-sm text-muted-foreground">Expenses: {formatAED(totalExpenses)}</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="expenses" className="mt-0">
            <div className="h-52 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    outerRadius={65}
                    dataKey="value"
                    label={({ name, percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
                    labelLine={false}
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
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
                    verticalAlign="bottom" 
                    height={36}
                    wrapperStyle={{ fontSize: '10px' }}
                    formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="comparison" className="mt-0">
            <div className="h-52 sm:h-64 overflow-x-auto scrollbar-hide">
              <ResponsiveContainer width="100%" height="100%" minWidth={350}>
                <BarChart data={capRateComparisonData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    type="number" 
                    domain={[0, Math.max(benchmark.typicalCapRate.max + 2, capRate + 2)]}
                    tickFormatter={(v) => `${v}%`}
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={75}
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toFixed(2)}%`, 'Cap Rate']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <ReferenceLine 
                    x={benchmark.typicalCapRate.avg} 
                    stroke="#94a3b8" 
                    strokeDasharray="5 5"
                    label={{ value: 'Avg', position: 'top', fill: '#94a3b8', fontSize: 10 }}
                  />
                  <Bar 
                    dataKey="capRate" 
                    radius={[0, 4, 4, 0]}
                  >
                    {capRateComparisonData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
