import { X, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { PortfolioProperty } from '@/hooks/usePortfolio';
import { ComparisonRadarChart } from './ComparisonRadarChart';

interface PortfolioComparisonPanelProps {
  isOpen: boolean;
  onClose: () => void;
  properties: PortfolioProperty[];
}

export function PortfolioComparisonPanel({ isOpen, onClose, properties }: PortfolioComparisonPanelProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const calculateMetrics = (property: PortfolioProperty) => {
    const cashFlow = Number(property.monthly_rental_income) - Number(property.monthly_expenses);
    const appreciation = Number(property.current_value) - Number(property.purchase_price);
    const appreciationPercent = (appreciation / Number(property.purchase_price)) * 100;
    const roi = ((Number(property.monthly_rental_income) - Number(property.monthly_expenses)) * 12 / Number(property.purchase_price)) * 100;
    const equity = Number(property.current_value) - Number(property.mortgage_balance);
    const equityRatio = (equity / Number(property.current_value)) * 100;

    return { cashFlow, appreciation, appreciationPercent, roi, equity, equityRatio };
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-center justify-between">
            <SheetTitle>Compare Properties ({properties.length})</SheetTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        {properties.length >= 2 && (
          <>
            {/* Radar Chart */}
            <div className="mb-8">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">Performance Overview</h3>
              <div className="bg-muted/30 rounded-xl p-4">
                <ComparisonRadarChart properties={properties} />
              </div>
            </div>

            {/* Comparison Table */}
            <div className="mb-8">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">Detailed Comparison</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Metric</th>
                      {properties.map((p) => (
                        <th key={p.id} className="text-right py-3 px-2 font-medium">
                          <div className="truncate max-w-[120px]" title={p.property_name}>
                            {p.property_name}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-2 text-muted-foreground">Current Value</td>
                      {properties.map((p) => (
                        <td key={p.id} className="text-right py-3 px-2 font-semibold text-gold">
                          {formatCurrency(Number(p.current_value))}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-2 text-muted-foreground">Purchase Price</td>
                      {properties.map((p) => (
                        <td key={p.id} className="text-right py-3 px-2">
                          {formatCurrency(Number(p.purchase_price))}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-2 text-muted-foreground">Appreciation</td>
                      {properties.map((p) => {
                        const { appreciationPercent } = calculateMetrics(p);
                        return (
                          <td key={p.id} className="text-right py-3 px-2">
                            <span className={`flex items-center justify-end gap-1 ${appreciationPercent >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                              {appreciationPercent >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                              {appreciationPercent.toFixed(1)}%
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-2 text-muted-foreground">Monthly Cash Flow</td>
                      {properties.map((p) => {
                        const { cashFlow } = calculateMetrics(p);
                        return (
                          <td key={p.id} className={`text-right py-3 px-2 ${cashFlow >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {formatCurrency(cashFlow)}
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-2 text-muted-foreground">Annual ROI</td>
                      {properties.map((p) => {
                        const { roi } = calculateMetrics(p);
                        return (
                          <td key={p.id} className="text-right py-3 px-2 font-semibold text-gold">
                            {roi.toFixed(1)}%
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-2 text-muted-foreground">Equity</td>
                      {properties.map((p) => {
                        const { equity } = calculateMetrics(p);
                        return (
                          <td key={p.id} className="text-right py-3 px-2 text-emerald-500">
                            {formatCurrency(equity)}
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-2 text-muted-foreground">Equity Ratio</td>
                      {properties.map((p) => {
                        const { equityRatio } = calculateMetrics(p);
                        return (
                          <td key={p.id} className="text-right py-3 px-2">
                            {equityRatio.toFixed(1)}%
                          </td>
                        );
                      })}
                    </tr>
                    <tr>
                      <td className="py-3 px-2 text-muted-foreground">Location</td>
                      {properties.map((p) => (
                        <td key={p.id} className="text-right py-3 px-2">
                          {p.location_area}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Winner Summary */}
            <div className="p-4 rounded-xl bg-gold/10 border border-gold/20">
              <h4 className="font-medium text-gold mb-2">Best Performers</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Highest ROI: </span>
                  <span className="font-medium">
                    {properties.reduce((best, p) => {
                      const roi = calculateMetrics(p).roi;
                      const bestRoi = calculateMetrics(best).roi;
                      return roi > bestRoi ? p : best;
                    }).property_name}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Best Cash Flow: </span>
                  <span className="font-medium">
                    {properties.reduce((best, p) => {
                      const cf = calculateMetrics(p).cashFlow;
                      const bestCf = calculateMetrics(best).cashFlow;
                      return cf > bestCf ? p : best;
                    }).property_name}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {properties.length < 2 && (
          <div className="text-center py-12 text-muted-foreground">
            Select at least 2 properties to compare
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
