import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface RentVsBuyChartsProps {
  propertyPrice: number;
  yearsToCompare: number;
  propertyAppreciation: number;
  investmentReturn: number;
  monthlyMortgage: number;
  monthlyRent: number;
  rentIncrease: number;
  serviceCharges: number;
  maintenanceCosts: number;
  totalUpfront: number;
  formatAED: (value: number) => string;
}

export function RentVsBuyCharts({
  propertyPrice,
  yearsToCompare,
  propertyAppreciation,
  investmentReturn,
  monthlyMortgage,
  monthlyRent,
  rentIncrease,
  serviceCharges,
  maintenanceCosts,
  totalUpfront,
  formatAED,
}: RentVsBuyChartsProps) {
  // Calculate yearly positions for both scenarios
  const comparisonData = Array.from({ length: yearsToCompare + 1 }, (_, year) => {
    let propertyValue = propertyPrice;
    let investmentValue = totalUpfront;
    let totalBuyingCost = 0;
    let totalRentingCost = 0;
    let currentRent = monthlyRent;
    
    for (let y = 1; y <= year; y++) {
      // Buying costs
      const yearlyMortgage = monthlyMortgage * 12;
      const yearlyMaintenance = propertyValue * (maintenanceCosts / 100);
      totalBuyingCost += yearlyMortgage + yearlyMaintenance + serviceCharges;
      propertyValue *= (1 + propertyAppreciation / 100);
      
      // Renting costs
      totalRentingCost += currentRent * 12;
      currentRent *= (1 + rentIncrease / 100);
      investmentValue *= (1 + investmentReturn / 100);
    }
    
    const buyingNetPosition = propertyValue - totalBuyingCost;
    const rentingNetPosition = investmentValue - totalRentingCost;
    
    return {
      year: `Y${year}`,
      Buying: Math.round(buyingNetPosition),
      Renting: Math.round(rentingNetPosition),
    };
  });

  // Cumulative cost comparison
  const costData = Array.from({ length: yearsToCompare + 1 }, (_, year) => {
    let buyingCost = totalUpfront;
    let rentingCost = 0;
    let currentRent = monthlyRent;
    let propValue = propertyPrice;
    
    for (let y = 1; y <= year; y++) {
      buyingCost += monthlyMortgage * 12 + serviceCharges + propValue * (maintenanceCosts / 100);
      propValue *= (1 + propertyAppreciation / 100);
      rentingCost += currentRent * 12;
      currentRent *= (1 + rentIncrease / 100);
    }
    
    return {
      year: `Y${year}`,
      'Buying Costs': Math.round(buyingCost),
      'Renting Costs': Math.round(rentingCost),
    };
  });

  return (
    <div className="space-y-6">
      {/* Net Position Over Time */}
      <div className="p-4 sm:p-6 rounded-2xl bg-card border border-border">
        <h3 className="font-heading text-base sm:text-lg text-foreground mb-4">Net Position Over Time</h3>
        <div className="h-56 sm:h-64 overflow-x-auto scrollbar-hide">
          <ResponsiveContainer width="100%" height="100%" minWidth={350}>
            <AreaChart data={comparisonData}>
              <defs>
                <linearGradient id="colorBuying" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorRenting" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(25, 95%, 53%)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(25, 95%, 53%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="year" 
                tick={{ fontSize: 10 }} 
                stroke="hsl(var(--muted-foreground))"
                interval={Math.floor(comparisonData.length / 6)}
              />
              <YAxis 
                tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} 
                tick={{ fontSize: 10 }}
                stroke="hsl(var(--muted-foreground))"
                width={45}
              />
              <Tooltip 
                formatter={(value: number) => formatAED(value)}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Area 
                type="monotone" 
                dataKey="Buying" 
                stroke="hsl(142, 76%, 36%)" 
                fill="url(#colorBuying)"
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey="Renting" 
                stroke="hsl(25, 95%, 53%)" 
                fill="url(#colorRenting)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cumulative Costs */}
      <div className="p-4 sm:p-6 rounded-2xl bg-card border border-border">
        <h3 className="font-heading text-base sm:text-lg text-foreground mb-4">Cumulative Costs Comparison</h3>
        <div className="h-40 sm:h-48 overflow-x-auto scrollbar-hide">
          <ResponsiveContainer width="100%" height="100%" minWidth={350}>
            <AreaChart data={costData}>
              <XAxis 
                dataKey="year" 
                tick={{ fontSize: 10 }} 
                stroke="hsl(var(--muted-foreground))"
                interval={Math.floor(costData.length / 6)}
              />
              <YAxis 
                tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} 
                tick={{ fontSize: 10 }}
                stroke="hsl(var(--muted-foreground))"
                width={45}
              />
              <Tooltip 
                formatter={(value: number) => formatAED(value)}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Area 
                type="monotone" 
                dataKey="Buying Costs" 
                stroke="hsl(142, 76%, 36%)" 
                fill="hsl(142, 76%, 36%)"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey="Renting Costs" 
                stroke="hsl(25, 95%, 53%)" 
                fill="hsl(25, 95%, 53%)"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
