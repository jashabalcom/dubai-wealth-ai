import { useMemo } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer } from 'recharts';
import { PortfolioProperty } from '@/hooks/usePortfolio';

interface ComparisonRadarChartProps {
  properties: PortfolioProperty[];
}

const COLORS = ['hsl(var(--gold))', '#10b981', '#3b82f6', '#f59e0b'];

export function ComparisonRadarChart({ properties }: ComparisonRadarChartProps) {
  const data = useMemo(() => {
    if (properties.length === 0) return [];

    // Calculate metrics for normalization
    const maxValue = Math.max(...properties.map(p => Number(p.current_value)));
    const maxCashFlow = Math.max(...properties.map(p => Number(p.monthly_rental_income) - Number(p.monthly_expenses)));
    const maxAppreciation = Math.max(...properties.map(p => 
      ((Number(p.current_value) - Number(p.purchase_price)) / Number(p.purchase_price)) * 100
    ));
    const maxROI = Math.max(...properties.map(p => {
      const annualCashFlow = (Number(p.monthly_rental_income) - Number(p.monthly_expenses)) * 12;
      return (annualCashFlow / Number(p.purchase_price)) * 100;
    }));
    const maxEquityRatio = Math.max(...properties.map(p => {
      const equity = Number(p.current_value) - Number(p.mortgage_balance);
      return (equity / Number(p.current_value)) * 100;
    }));

    const metrics = [
      { metric: 'Value', fullMark: 100 },
      { metric: 'Cash Flow', fullMark: 100 },
      { metric: 'Appreciation', fullMark: 100 },
      { metric: 'ROI', fullMark: 100 },
      { metric: 'Equity Ratio', fullMark: 100 },
    ];

    return metrics.map(m => {
      const point: Record<string, number | string> = { metric: m.metric };
      
      properties.forEach((property, index) => {
        let value = 0;
        switch (m.metric) {
          case 'Value':
            value = (Number(property.current_value) / (maxValue || 1)) * 100;
            break;
          case 'Cash Flow':
            const cf = Number(property.monthly_rental_income) - Number(property.monthly_expenses);
            value = cf >= 0 ? (cf / (maxCashFlow || 1)) * 100 : 0;
            break;
          case 'Appreciation':
            const app = ((Number(property.current_value) - Number(property.purchase_price)) / Number(property.purchase_price)) * 100;
            value = app >= 0 ? (app / (maxAppreciation || 1)) * 100 : 0;
            break;
          case 'ROI':
            const annualCf = (Number(property.monthly_rental_income) - Number(property.monthly_expenses)) * 12;
            const roi = (annualCf / Number(property.purchase_price)) * 100;
            value = roi >= 0 ? (roi / (maxROI || 1)) * 100 : 0;
            break;
          case 'Equity Ratio':
            const equity = Number(property.current_value) - Number(property.mortgage_balance);
            const ratio = (equity / Number(property.current_value)) * 100;
            value = (ratio / (maxEquityRatio || 1)) * 100;
            break;
        }
        point[`property${index}`] = Math.min(Math.max(value, 0), 100);
      });
      
      return point;
    });
  }, [properties]);

  if (properties.length === 0) return null;

  return (
    <div className="h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis 
            dataKey="metric" 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 100]} 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
          />
          {properties.map((property, index) => (
            <Radar
              key={property.id}
              name={property.property_name}
              dataKey={`property${index}`}
              stroke={COLORS[index % COLORS.length]}
              fill={COLORS[index % COLORS.length]}
              fillOpacity={0.2}
              strokeWidth={2}
            />
          ))}
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => <span className="text-foreground text-sm">{value}</span>}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
