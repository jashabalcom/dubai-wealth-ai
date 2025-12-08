import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
  Line,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TotalCostChartsProps {
  yearlyData: {
    year: number;
    acquisitionCost: number;
    ongoingCost: number;
    financingCost: number;
    exitCost: number;
    cumulativeCost: number;
    propertyValue: number;
    rentalIncome: number;
  }[];
  costBreakdown: {
    acquisition: number;
    ongoing: number;
    financing: number;
    exit: number;
  };
  formatValue: (value: number) => string;
  currencySymbol: string;
}

const COLORS = {
  acquisition: 'hsl(35 25% 70%)',
  ongoing: 'hsl(220 40% 50%)',
  financing: 'hsl(0 70% 55%)',
  exit: 'hsl(280 60% 55%)',
  propertyValue: 'hsl(145 60% 45%)',
  rental: 'hsl(190 70% 50%)',
};

export function TotalCostCharts({ yearlyData, costBreakdown, formatValue, currencySymbol }: TotalCostChartsProps) {
  const pieData = useMemo(() => [
    { name: 'Acquisition', value: costBreakdown.acquisition, color: COLORS.acquisition },
    { name: 'Ongoing', value: costBreakdown.ongoing, color: COLORS.ongoing },
    { name: 'Financing', value: costBreakdown.financing, color: COLORS.financing },
    { name: 'Exit', value: costBreakdown.exit, color: COLORS.exit },
  ].filter(item => item.value > 0), [costBreakdown]);

  const totalCost = pieData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-3 rounded-lg shadow-lg">
          <p className="font-medium text-foreground mb-2">Year {label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatValue(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const percentage = ((payload[0].value / totalCost) * 100).toFixed(1);
      return (
        <div className="bg-card border border-border p-3 rounded-lg shadow-lg">
          <p className="font-medium text-foreground">{payload[0].name}</p>
          <p className="text-sm text-muted-foreground">{formatValue(payload[0].value)}</p>
          <p className="text-sm text-muted-foreground">{percentage}% of total</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Stacked Bar Chart - Cost Composition by Year */}
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg font-heading">Cost Composition by Year</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="year" 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(value) => `${currencySymbol}${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="acquisitionCost" name="Acquisition" stackId="a" fill={COLORS.acquisition} />
                <Bar dataKey="ongoingCost" name="Ongoing" stackId="a" fill={COLORS.ongoing} />
                <Bar dataKey="financingCost" name="Financing" stackId="a" fill={COLORS.financing} />
                <Bar dataKey="exitCost" name="Exit" stackId="a" fill={COLORS.exit} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Area Chart - Cumulative Costs vs Property Value */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-heading">Value vs Cost Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={yearlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="year" 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(value) => `${currencySymbol}${(value / 1000000).toFixed(1)}M`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="cumulativeCost" 
                  name="Total Costs" 
                  fill="hsl(0 70% 55% / 0.2)" 
                  stroke={COLORS.financing}
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="propertyValue" 
                  name="Property Value" 
                  stroke={COLORS.propertyValue}
                  strokeWidth={3}
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="rentalIncome" 
                  name="Cumulative Rental" 
                  stroke={COLORS.rental}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Pie Chart - Total Cost Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-heading">Total Cost Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-muted-foreground">{item.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
