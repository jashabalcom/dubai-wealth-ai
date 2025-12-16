import { MapPin, Calendar, Trash2, TrendingUp, TrendingDown, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { PortfolioProperty } from '@/hooks/usePortfolio';

interface PropertyListProps {
  properties: PortfolioProperty[];
  onDelete: (id: string) => void;
}

export function PropertyList({ properties, onDelete }: PropertyListProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (properties.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl">
        <EmptyState
          icon={Briefcase}
          title="Your portfolio is empty"
          description="Add your first property to start tracking your Dubai real estate investments and see performance metrics."
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {properties.map((property) => {
        const cashFlow = Number(property.monthly_rental_income) - Number(property.monthly_expenses);
        const appreciation = Number(property.current_value) - Number(property.purchase_price);
        const appreciationPercent = (appreciation / Number(property.purchase_price)) * 100;
        const roi = ((Number(property.monthly_rental_income) - Number(property.monthly_expenses)) * 12 / Number(property.purchase_price)) * 100;

        return (
          <div
            key={property.id}
            className="bg-card border border-border rounded-xl p-5 hover:border-gold/30 transition-colors"
          >
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Property Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">{property.property_name}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {property.location_area}
                      </span>
                      <span className="capitalize">{property.property_type}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(property.purchase_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(property.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {property.notes && (
                  <p className="text-sm text-muted-foreground mt-2">{property.notes}</p>
                )}
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:w-auto">
                <div className="text-center lg:text-right">
                  <div className="text-xs text-muted-foreground">Current Value</div>
                  <div className="font-semibold text-gold">{formatCurrency(Number(property.current_value))}</div>
                </div>
                <div className="text-center lg:text-right">
                  <div className="text-xs text-muted-foreground">Appreciation</div>
                  <div className={`font-semibold flex items-center justify-center lg:justify-end gap-1 ${appreciation >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {appreciation >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {appreciationPercent.toFixed(1)}%
                  </div>
                </div>
                <div className="text-center lg:text-right">
                  <div className="text-xs text-muted-foreground">Monthly Cash Flow</div>
                  <div className={`font-semibold ${cashFlow >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {formatCurrency(cashFlow)}
                  </div>
                </div>
                <div className="text-center lg:text-right">
                  <div className="text-xs text-muted-foreground">ROI</div>
                  <div className="font-semibold text-gold">{roi.toFixed(1)}%</div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
