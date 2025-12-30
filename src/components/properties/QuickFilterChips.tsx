import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Calendar, MapPin, Bed, Award, TrendingUp, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuickFilterChipsProps {
  selectedArea: string;
  onAreaChange: (value: string) => void;
  selectedBedrooms: string;
  onBedroomsChange: (value: string) => void;
  showOffPlanOnly: boolean;
  onOffPlanChange: (value: boolean) => void;
  showGoldenVisaOnly?: boolean;
  onGoldenVisaChange?: (value: boolean) => void;
  className?: string;
}

const popularAreas = ['Dubai Marina', 'Downtown Dubai', 'Palm Jumeirah', 'Business Bay', 'JVC'];
const bedroomOptions = ['Studio', '1 BR', '2 BR', '3+ BR'];

export function QuickFilterChips({
  selectedArea,
  onAreaChange,
  selectedBedrooms,
  onBedroomsChange,
  showOffPlanOnly,
  onOffPlanChange,
  showGoldenVisaOnly = false,
  onGoldenVisaChange,
  className,
}: QuickFilterChipsProps) {
  const hasActiveFilters = selectedArea !== 'All Areas' || selectedBedrooms !== '-1' || showOffPlanOnly || showGoldenVisaOnly;

  const handleBedroomClick = (option: string) => {
    const valueMap: Record<string, string> = {
      'Studio': '0',
      '1 BR': '1',
      '2 BR': '2',
      '3+ BR': '4',
    };
    const newValue = valueMap[option];
    onBedroomsChange(selectedBedrooms === newValue ? '-1' : newValue);
  };

  const handleAreaClick = (area: string) => {
    onAreaChange(selectedArea === area ? 'All Areas' : area);
  };

  const clearAll = () => {
    onAreaChange('All Areas');
    onBedroomsChange('-1');
    onOffPlanChange(false);
    onGoldenVisaChange?.(false);
  };

  return (
    <div className={cn("lg:hidden", className)}>
      {/* Horizontal scrollable chips */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 snap-x snap-mandatory">
        {/* Off-Plan chip */}
        <FilterChip
          active={showOffPlanOnly}
          onClick={() => onOffPlanChange(!showOffPlanOnly)}
          icon={<Calendar className="w-3.5 h-3.5" />}
        >
          Off-Plan
        </FilterChip>

        {/* Golden Visa chip */}
        {onGoldenVisaChange && (
          <FilterChip
            active={showGoldenVisaOnly}
            onClick={() => onGoldenVisaChange(!showGoldenVisaOnly)}
            icon={<Award className="w-3.5 h-3.5" />}
          >
            Golden Visa
          </FilterChip>
        )}

        {/* Divider */}
        <div className="w-px bg-border shrink-0" />

        {/* Popular areas */}
        {popularAreas.map((area) => (
          <FilterChip
            key={area}
            active={selectedArea === area}
            onClick={() => handleAreaClick(area)}
            icon={<MapPin className="w-3.5 h-3.5" />}
          >
            {area}
          </FilterChip>
        ))}

        {/* Divider */}
        <div className="w-px bg-border shrink-0" />

        {/* Bedroom options */}
        {bedroomOptions.map((option) => {
          const valueMap: Record<string, string> = {
            'Studio': '0',
            '1 BR': '1',
            '2 BR': '2',
            '3+ BR': '4',
          };
          return (
            <FilterChip
              key={option}
              active={selectedBedrooms === valueMap[option]}
              onClick={() => handleBedroomClick(option)}
              icon={<Bed className="w-3.5 h-3.5" />}
            >
              {option}
            </FilterChip>
          );
        })}
      </div>

      {/* Active filters summary with clear button */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2"
          >
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Clear filters
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface FilterChipProps {
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

function FilterChip({ active, onClick, icon, children }: FilterChipProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap snap-start",
        "transition-all duration-200 touch-target",
        "border min-h-[40px]",
        active
          ? "bg-primary text-primary-foreground border-primary shadow-sm"
          : "bg-background text-foreground border-border hover:border-primary/50 hover:bg-muted/50"
      )}
    >
      {icon}
      {children}
    </motion.button>
  );
}
