import { MapPin, Calendar, Trash2, TrendingUp, TrendingDown, Briefcase, Bed, Ruler } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Checkbox } from '@/components/ui/checkbox';
import { VirtualList } from '@/components/ui/virtual-list';
import { PortfolioProperty } from '@/hooks/usePortfolio';
import { cn } from '@/lib/utils';

interface PropertyListProps {
  properties: PortfolioProperty[];
  onDelete: (id: string) => void;
  selectionMode?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  maxSelection?: number;
}

export function PropertyList({ 
  properties, 
  onDelete, 
  selectionMode = false,
  selectedIds = [],
  onSelectionChange,
  maxSelection = 4 
}: PropertyListProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleSelect = (propertyId: string) => {
    if (!onSelectionChange) return;
    
    if (selectedIds.includes(propertyId)) {
      onSelectionChange(selectedIds.filter(id => id !== propertyId));
    } else if (selectedIds.length < maxSelection) {
      onSelectionChange([...selectedIds, propertyId]);
    }
  };

  const isSelected = (propertyId: string) => selectedIds.includes(propertyId);
  const isDisabled = (propertyId: string) => 
    !selectedIds.includes(propertyId) && selectedIds.length >= maxSelection;

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

  const renderPropertyItem = (property: PortfolioProperty, index: number) => {
    const cashFlow = Number(property.monthly_rental_income) - Number(property.monthly_expenses);
    const appreciation = Number(property.current_value) - Number(property.purchase_price);
    const appreciationPercent = (appreciation / Number(property.purchase_price)) * 100;
    const roi = ((Number(property.monthly_rental_income) - Number(property.monthly_expenses)) * 12 / Number(property.purchase_price)) * 100;
    const pricePerSqft = property.size_sqft 
      ? Number(property.current_value) / Number(property.size_sqft)
      : null;

    return (
      <div
        key={property.id}
        className={cn(
          "bg-card border rounded-xl p-5 transition-all cursor-pointer",
          isSelected(property.id) 
            ? "border-gold ring-1 ring-gold/30" 
            : "border-border hover:border-gold/30",
          selectionMode && isDisabled(property.id) && "opacity-50"
        )}
        onClick={() => selectionMode && handleSelect(property.id)}
      >
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Selection Checkbox */}
          {selectionMode && (
            <div className="flex-shrink-0">
              <Checkbox
                checked={isSelected(property.id)}
                disabled={isDisabled(property.id)}
                onCheckedChange={() => handleSelect(property.id)}
                className="data-[state=checked]:bg-gold data-[state=checked]:border-gold"
              />
            </div>
          )}

          {/* Property Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-lg">{property.property_name}</h3>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1 flex-wrap">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {property.location_area}
                  </span>
                  <span className="capitalize">{property.property_type}</span>
                  {property.bedrooms !== null && (
                    <span className="flex items-center gap-1">
                      <Bed className="h-3 w-3" />
                      {property.bedrooms === 0 ? 'Studio' : `${property.bedrooms} BR`}
                    </span>
                  )}
                  {property.size_sqft && (
                    <span className="flex items-center gap-1">
                      <Ruler className="h-3 w-3" />
                      {Number(property.size_sqft).toLocaleString()} sqft
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(property.purchase_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
              {!selectionMode && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(property.id);
                  }}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            {property.notes && (
              <p className="text-sm text-muted-foreground mt-2">{property.notes}</p>
            )}
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 lg:w-auto">
            <div className="text-center lg:text-right">
              <div className="text-xs text-muted-foreground">Current Value</div>
              <div className="font-semibold text-gold">{formatCurrency(Number(property.current_value))}</div>
              {pricePerSqft && (
                <div className="text-[10px] text-muted-foreground">
                  AED {pricePerSqft.toLocaleString(undefined, { maximumFractionDigits: 0 })}/sqft
                </div>
              )}
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
            <div className="text-center lg:text-right">
              <div className="text-xs text-muted-foreground">Equity</div>
              <div className="font-semibold text-foreground">
                {formatCurrency(Number(property.current_value) - Number(property.mortgage_balance))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Use regular list for small lists, virtual list for large
  if (properties.length <= 20) {
    return (
      <div className="space-y-4">
        {properties.map((property, index) => renderPropertyItem(property, index))}
      </div>
    );
  }

  return (
    <VirtualList
      items={properties}
      renderItem={renderPropertyItem}
      estimatedItemHeight={180}
      gap={16}
      className="min-h-[500px]"
    />
  );
}
