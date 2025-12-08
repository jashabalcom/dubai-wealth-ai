import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { PortfolioProperty } from '@/hooks/usePortfolio';

interface PortfolioChartsProps {
  properties: PortfolioProperty[];
}

const COLORS = ['#CBB89E', '#D4C5B0', '#9CA3AF', '#6B7280', '#4B5563', '#374151'];

export function PortfolioCharts({ properties }: PortfolioChartsProps) {
  // Value distribution by property
  const valueData = properties.map((p) => ({
    name: p.property_name,
    value: Number(p.current_value),
  }));

  // Cash flow by property
  const cashFlowData = properties.map((p) => ({
    name: p.property_name.length > 15 ? p.property_name.substring(0, 15) + '...' : p.property_name,
    income: Number(p.monthly_rental_income),
    expenses: Number(p.monthly_expenses),
    cashFlow: Number(p.monthly_rental_income) - Number(p.monthly_expenses),
  }));

  // Location distribution
  const locationData = properties.reduce((acc, p) => {
    const existing = acc.find((item) => item.name === p.location_area);
    if (existing) {
      existing.value += Number(p.current_value);
    } else {
      acc.push({ name: p.location_area, value: Number(p.current_value) });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: AED {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (properties.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Value Distribution */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Value Distribution</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={valueData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              fill="#CBB89E"
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) => `${name.substring(0, 10)}... (${(percent * 100).toFixed(0)}%)`}
              labelLine={false}
            >
              {valueData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `AED ${value.toLocaleString()}`} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Location Distribution */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">By Location</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={locationData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              fill="#CBB89E"
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              labelLine={false}
            >
              {locationData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `AED ${value.toLocaleString()}`} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Cash Flow by Property */}
      <div className="bg-card border border-border rounded-xl p-6 lg:col-span-2">
        <h3 className="text-lg font-semibold mb-4">Monthly Cash Flow by Property</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={cashFlowData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
            <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={formatCurrency} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
            <Bar dataKey="cashFlow" name="Net Cash Flow" fill="#CBB89E" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
