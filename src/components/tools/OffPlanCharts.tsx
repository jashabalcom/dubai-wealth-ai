import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { motion } from 'framer-motion';

interface TimelinePoint {
  month: number;
  phase: string;
  payment: number;
  cumulative: number;
}

interface OffPlanChartsProps {
  timeline: TimelinePoint[];
  planBreakdown: {
    duringConstruction: number;
    onHandover: number;
    postHandover: number;
  };
  formatAED: (amount: number) => string;
}

const COLORS = {
  construction: '#8b5cf6', // violet
  handover: '#f59e0b', // amber
  postHandover: '#10b981', // emerald
};

export function OffPlanCharts({ timeline, planBreakdown, formatAED }: OffPlanChartsProps) {
  // Prepare pie chart data
  const pieData = useMemo(() => {
    const data = [];
    if (planBreakdown.duringConstruction > 0) {
      data.push({ name: 'During Construction', value: planBreakdown.duringConstruction, color: COLORS.construction });
    }
    if (planBreakdown.onHandover > 0) {
      data.push({ name: 'On Handover', value: planBreakdown.onHandover, color: COLORS.handover });
    }
    if (planBreakdown.postHandover > 0) {
      data.push({ name: 'Post-Handover', value: planBreakdown.postHandover, color: COLORS.postHandover });
    }
    return data;
  }, [planBreakdown]);

  // Format timeline for chart
  const chartData = useMemo(() => {
    return timeline.map(point => ({
      ...point,
      label: point.month === 0 ? 'Booking' : `Month ${point.month}`,
    }));
  }, [timeline]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground mb-1">{label}</p>
          <p className="text-sm text-muted-foreground">
            Phase: <span className="text-foreground">{payload[0]?.payload?.phase}</span>
          </p>
          <p className="text-sm text-violet-400">
            Cumulative: {formatAED(payload[0]?.value || 0)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Payment Split Pie Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl bg-card border border-border"
      >
        <h3 className="font-heading text-lg text-foreground mb-4">Payment Split</h3>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
                label={({ name, value }) => `${value}%`}
                labelLine={false}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`${value}%`, 'Percentage']}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend 
                verticalAlign="bottom"
                formatter={(value) => <span className="text-muted-foreground text-sm">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Cumulative Payment Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-6 rounded-2xl bg-card border border-border"
      >
        <h3 className="font-heading text-lg text-foreground mb-4">Payment Timeline</h3>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="label" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="stepAfter"
                dataKey="cumulative"
                stroke="#8b5cf6"
                strokeWidth={2}
                fill="url(#colorCumulative)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Cumulative payments over the investment period
        </p>
      </motion.div>
    </div>
  );
}
