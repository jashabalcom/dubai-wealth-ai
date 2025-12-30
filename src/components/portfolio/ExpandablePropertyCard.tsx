import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Calendar, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  ChevronDown,
  Home,
  Wallet,
  DollarSign,
  SquareAsterisk
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { PortfolioProperty } from '@/hooks/usePortfolio';
import { MetricSparkline } from './MetricSparkline';

interface ExpandablePropertyCardProps {
  property: PortfolioProperty;
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onDelete: (id: string) => void;
  historicalValues?: number[];
}

export function ExpandablePropertyCard({ 
  property, 
  isSelected, 
  onSelect, 
  onDelete,
  historicalValues = []
}: ExpandablePropertyCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const cashFlow = Number(property.monthly_rental_income) - Number(property.monthly_expenses);
  const appreciation = Number(property.current_value) - Number(property.purchase_price);
  const appreciationPercent = (appreciation / Number(property.purchase_price)) * 100;
  const roi = ((Number(property.monthly_rental_income) - Number(property.monthly_expenses)) * 12 / Number(property.purchase_price)) * 100;
  const equity = Number(property.current_value) - Number(property.mortgage_balance);
  const equityRatio = (equity / Number(property.current_value)) * 100;

  return (
    <motion.div
      layout
      className={`bg-card border rounded-xl transition-colors ${
        isSelected ? 'border-gold/50 ring-1 ring-gold/20' : 'border-border hover:border-gold/30'
      }`}
    >
      {/* Main Row */}
      <div className="p-5">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Checkbox + Property Info */}
          <div className="flex items-start gap-3 flex-1">
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => onSelect(property.id, checked as boolean)}
              className="mt-1"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-lg truncate">{property.property_name}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
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
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(property.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-muted-foreground"
                  >
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </motion.div>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:w-auto">
            <div className="text-center lg:text-right">
              <div className="text-xs text-muted-foreground">Current Value</div>
              <div className="font-semibold text-gold">{formatCurrency(Number(property.current_value))}</div>
              {historicalValues.length > 1 && (
                <MetricSparkline data={historicalValues} height={20} width={60} showDots />
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
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-2 border-t border-border/50">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Home className="h-3 w-3" />
                    Purchase Price
                  </div>
                  <div className="font-semibold">{formatCurrency(Number(property.purchase_price))}</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Wallet className="h-3 w-3" />
                    Equity
                  </div>
                  <div className="font-semibold text-emerald-500">{formatCurrency(equity)}</div>
                  <div className="text-xs text-muted-foreground">{equityRatio.toFixed(1)}% ratio</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <DollarSign className="h-3 w-3" />
                    Monthly Income
                  </div>
                  <div className="font-semibold">{formatCurrency(Number(property.monthly_rental_income))}</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <SquareAsterisk className="h-3 w-3" />
                    Mortgage Balance
                  </div>
                  <div className="font-semibold">{formatCurrency(Number(property.mortgage_balance))}</div>
                </div>
              </div>
              
              {property.notes && (
                <div className="mt-4 p-3 rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground">{property.notes}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
