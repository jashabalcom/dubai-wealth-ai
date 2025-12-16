import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { FreeZoneInfo } from '@/lib/commercialRealEstateFees';
import { calculateFirstYearCost } from '@/lib/commercialRealEstateFees';

interface FreeZoneChartsProps {
  zones: FreeZoneInfo[];
  numVisas: number;
  officeType: 'none' | 'virtual' | 'flexi' | 'dedicated';
}

const COLORS = ['hsl(var(--gold))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

export function FreeZoneCharts({ zones, numVisas, officeType }: FreeZoneChartsProps) {
  if (zones.length === 0) return null;

  // Prepare cost comparison data
  const costComparisonData = zones.map((zone, index) => {
    const costs = calculateFirstYearCost(zone, { numVisas, officeType });
    return {
      name: zone.slug.toUpperCase(),
      fullName: zone.name,
      'License Fee': costs.licenseFee,
      'Visa Costs': costs.visaCost,
      'Office Cost': costs.officeCost,
      'Other Fees': costs.establishmentCard,
      total: costs.total,
      color: COLORS[index % COLORS.length],
    };
  });

  // Prepare radar chart data (normalized 0-100 scale)
  const getRadarValue = (zone: FreeZoneInfo, metric: string): number => {
    const maxValues = {
      cost: 150000, // Max license cost
      visas: 1000, // Max visa allocation
      speed: 4, // Max setup weeks (inverted)
      sectors: 6, // Max sectors
    };

    switch (metric) {
      case 'Cost Efficiency':
        return Math.max(0, 100 - (zone.licenseCost.from / maxValues.cost) * 100);
      case 'Visa Capacity':
        return (zone.visaAllocation.max / maxValues.visas) * 100;
      case 'Setup Speed':
        return Math.max(0, 100 - ((zone.setupTimeWeeks - 1) / (maxValues.speed - 1)) * 100);
      case 'Sector Diversity':
        return Math.min(100, (zone.sector.length / maxValues.sectors) * 100);
      case 'Office Options':
        let score = 0;
        if (zone.virtualOfficeFrom > 0) score += 33;
        if (zone.flexDeskFrom > 0) score += 33;
        if (zone.officeSpaceFrom > 0) score += 34;
        return score;
      default:
        return 50;
    }
  };

  const radarData = ['Cost Efficiency', 'Visa Capacity', 'Setup Speed', 'Sector Diversity', 'Office Options'].map(metric => {
    const dataPoint: any = { metric };
    zones.forEach((zone, index) => {
      dataPoint[zone.slug] = getRadarValue(zone, metric);
    });
    return dataPoint;
  });

  // Setup time comparison
  const setupTimeData = zones.map((zone, index) => ({
    name: zone.slug.toUpperCase(),
    weeks: zone.setupTimeWeeks,
    fill: COLORS[index % COLORS.length],
  }));

  return (
    <div className="space-y-6">
      {/* Cost Comparison Bar Chart */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Total First Year Cost Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costComparisonData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  type="number" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={80}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={(value: number) => [`AED ${value.toLocaleString()}`, '']}
                  labelFormatter={(label) => costComparisonData.find(d => d.name === label)?.fullName || label}
                />
                <Legend />
                <Bar dataKey="License Fee" stackId="a" fill="hsl(var(--gold))" />
                <Bar dataKey="Visa Costs" stackId="a" fill="hsl(var(--chart-2))" />
                <Bar dataKey="Office Cost" stackId="a" fill="hsl(var(--chart-3))" />
                <Bar dataKey="Other Fees" stackId="a" fill="hsl(var(--chart-4))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Comparison Chart */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Multi-Factor Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis 
                    dataKey="metric" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 100]} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  />
                  {zones.map((zone, index) => (
                    <Radar
                      key={zone.slug}
                      name={zone.slug.toUpperCase()}
                      dataKey={zone.slug}
                      stroke={COLORS[index % COLORS.length]}
                      fill={COLORS[index % COLORS.length]}
                      fillOpacity={0.2}
                    />
                  ))}
                  <Legend />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Setup Time Comparison */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Setup Time (Weeks)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={setupTimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <YAxis 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    domain={[0, 5]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${value} week${value > 1 ? 's' : ''}`, 'Setup Time']}
                  />
                  <Bar dataKey="weeks" radius={[4, 4, 0, 0]}>
                    {setupTimeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cost Breakdown Pie Charts */}
      {zones.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Cost Breakdown by Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`grid grid-cols-1 ${zones.length > 1 ? 'md:grid-cols-2' : ''} ${zones.length > 2 ? 'lg:grid-cols-4' : ''} gap-6`}>
              {zones.map((zone, zoneIndex) => {
                const costs = calculateFirstYearCost(zone, { numVisas, officeType });
                const pieData = [
                  { name: 'License', value: costs.licenseFee, color: 'hsl(var(--gold))' },
                  { name: 'Visas', value: costs.visaCost, color: 'hsl(var(--chart-2))' },
                  { name: 'Office', value: costs.officeCost, color: 'hsl(var(--chart-3))' },
                  { name: 'Other', value: costs.establishmentCard, color: 'hsl(var(--chart-4))' },
                ].filter(d => d.value > 0);

                return (
                  <div key={zone.slug} className="text-center">
                    <h4 className="font-medium text-foreground mb-2 text-sm">{zone.name}</h4>
                    <p className="text-lg font-bold text-gold mb-2">AED {costs.total.toLocaleString()}</p>
                    <div className="h-[180px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={70}
                            paddingAngle={2}
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              borderColor: 'hsl(var(--border))',
                              borderRadius: '8px',
                            }}
                            formatter={(value: number) => [`AED ${value.toLocaleString()}`, '']}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
