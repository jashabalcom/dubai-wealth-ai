import { PitchDeckSlide } from "../PitchDeckSlide";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, Tooltip, Legend, ComposedChart, Line } from "recharts";

// 5-Year Growth Projections
const projections = [
  { year: "Y1", mrr: 25, arr: 300, users: 500, cac: 60, ltv: 660, ltvCac: "11:1", margin: 85, ebitda: -150, milestone: "Product-market fit" },
  { year: "Y2", mrr: 100, arr: 1200, users: 2000, cac: 45, ltv: 660, ltvCac: "15:1", margin: 85, ebitda: 50, milestone: "Scale acquisition" },
  { year: "Y3", mrr: 350, arr: 4200, users: 7000, cac: 35, ltv: 660, ltvCac: "19:1", margin: 87, ebitda: 800, milestone: "Market leadership" },
  { year: "Y4", mrr: 750, arr: 9000, users: 15000, cac: 30, ltv: 660, ltvCac: "22:1", margin: 88, ebitda: 2500, milestone: "Regional expansion" },
  { year: "Y5", mrr: 1500, arr: 18000, users: 30000, cac: 25, ltv: 660, ltvCac: "26:1", margin: 90, ebitda: 6000, milestone: "Profitability" }
];

// Revenue breakdown
const revenueBreakdown = [
  { name: 'B2C Subscriptions', value: 60, color: 'hsl(var(--primary))' },
  { name: 'B2B Partnerships', value: 25, color: 'hsl(var(--accent))' },
  { name: 'Premium Services', value: 15, color: 'hsl(var(--muted-foreground))' }
];

// Growth chart data
const growthData = projections.map(p => ({
  name: p.year,
  arr: p.arr,
  users: p.users / 100, // Scale down for visualization
  ebitda: p.ebitda
}));

const formatCurrency = (value: number) => {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}M`;
  return `$${value}K`;
};

export const FinancialsSlide = () => (
  <PitchDeckSlide className="p-6 md:p-10">
    <div className="space-y-5">
      <div>
        <p className="text-primary font-semibold mb-1 text-sm">FINANCIAL PROJECTIONS</p>
        <h2 className="text-2xl md:text-3xl font-bold">
          5-Year Growth Model
        </h2>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* ARR Growth Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-4">
          <h4 className="font-bold text-xs mb-3 text-muted-foreground">ARR & USER GROWTH</h4>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={growthData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis 
                  yAxisId="left" 
                  tick={{ fontSize: 10 }} 
                  axisLine={false} 
                  tickLine={false}
                  tickFormatter={(v) => `$${v/1000}M`}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  tick={{ fontSize: 10 }} 
                  axisLine={false} 
                  tickLine={false}
                  tickFormatter={(v) => `${v*100/1000}K`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === 'arr') return [formatCurrency(value), 'ARR'];
                    if (name === 'users') return [`${(value * 100).toLocaleString()}`, 'Users'];
                    return [value, name];
                  }}
                />
                <defs>
                  <linearGradient id="arrGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="arr" 
                  stroke="hsl(var(--primary))" 
                  fill="url(#arrGradient)"
                  strokeWidth={2}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="users" 
                  stroke="hsl(var(--accent))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--accent))' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 text-[10px] mt-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-primary rounded" />
              <span>ARR</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-accent rounded" />
              <span>Users</span>
            </div>
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h4 className="font-bold text-xs mb-3 text-muted-foreground">REVENUE MIX (Y3+)</h4>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {revenueBreakdown.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '11px'
                  }}
                  formatter={(value: number) => [`${value}%`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1 text-[10px]">
            {revenueBreakdown.map((item, i) => (
              <div key={i} className="flex justify-between">
                <span className="text-muted-foreground">{item.name}</span>
                <span className="font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Projections Table */}
      <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-2 font-medium text-muted-foreground"></th>
              <th className="text-right py-2 px-2 font-medium">MRR</th>
              <th className="text-right py-2 px-2 font-medium">ARR</th>
              <th className="text-right py-2 px-2 font-medium">Users</th>
              <th className="text-right py-2 px-2 font-medium">CAC</th>
              <th className="text-right py-2 px-2 font-medium">LTV:CAC</th>
              <th className="text-right py-2 px-2 font-medium">Margin</th>
              <th className="text-right py-2 px-2 font-medium">EBITDA</th>
              <th className="text-left py-2 px-2 font-medium">Milestone</th>
            </tr>
          </thead>
          <tbody>
            {projections.map((row, i) => (
              <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                <td className="py-2 px-2 font-bold">{row.year}</td>
                <td className="text-right py-2 px-2 text-primary font-medium">${row.mrr}K</td>
                <td className="text-right py-2 px-2 text-accent font-medium">${row.arr >= 1000 ? `${row.arr/1000}M` : `${row.arr}K`}</td>
                <td className="text-right py-2 px-2">{row.users.toLocaleString()}</td>
                <td className="text-right py-2 px-2">${row.cac}</td>
                <td className="text-right py-2 px-2 text-primary">{row.ltvCac}</td>
                <td className="text-right py-2 px-2">{row.margin}%</td>
                <td className={`text-right py-2 px-2 font-medium ${row.ebitda >= 0 ? 'text-primary' : 'text-destructive'}`}>
                  {row.ebitda >= 0 ? '+' : ''}{row.ebitda >= 1000 ? `$${row.ebitda/1000}M` : `$${row.ebitda}K`}
                </td>
                <td className="py-2 px-2 text-muted-foreground">{row.milestone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-primary/10 to-transparent border border-border rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-primary">60x</p>
          <p className="text-[10px] text-muted-foreground">ARR Growth (5yr)</p>
        </div>
        <div className="bg-gradient-to-br from-accent/10 to-transparent border border-border rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-accent">90%</p>
          <p className="text-[10px] text-muted-foreground">Target Gross Margin</p>
        </div>
        <div className="bg-gradient-to-br from-primary/10 to-transparent border border-border rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-primary">26:1</p>
          <p className="text-[10px] text-muted-foreground">LTV:CAC (Y5)</p>
        </div>
        <div className="bg-gradient-to-br from-accent/10 to-transparent border border-border rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-accent">Y5</p>
          <p className="text-[10px] text-muted-foreground">Profitability</p>
        </div>
      </div>

      <div className="bg-muted/50 rounded-lg p-3">
        <p className="text-[10px] text-muted-foreground">
          <span className="font-medium text-foreground">Assumptions:</span> 15% MoM growth Y1-2, 10% MoM Y3+, 5% monthly churn, $55 blended ARPU, 85-90% gross margin, $660 LTV
        </p>
      </div>
    </div>
  </PitchDeckSlide>
);
