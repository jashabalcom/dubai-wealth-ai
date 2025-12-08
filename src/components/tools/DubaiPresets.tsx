import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

export interface AreaPreset {
  name: string;
  propertyPrice: number;
  annualRent?: number;
  nightlyRate?: number;
  monthlyRent?: number;
}

export const DUBAI_AREA_PRESETS: AreaPreset[] = [
  { name: 'Dubai Marina', propertyPrice: 2500000, annualRent: 140000, nightlyRate: 900, monthlyRent: 12000 },
  { name: 'Downtown Dubai', propertyPrice: 3200000, annualRent: 180000, nightlyRate: 1200, monthlyRent: 15000 },
  { name: 'Palm Jumeirah', propertyPrice: 5500000, annualRent: 280000, nightlyRate: 2000, monthlyRent: 25000 },
  { name: 'JVC', propertyPrice: 950000, annualRent: 65000, nightlyRate: 500, monthlyRent: 5500 },
  { name: 'Business Bay', propertyPrice: 1800000, annualRent: 100000, nightlyRate: 700, monthlyRent: 8500 },
  { name: 'JBR', propertyPrice: 3000000, annualRent: 160000, nightlyRate: 1100, monthlyRent: 14000 },
];

interface DubaiPresetsProps {
  onSelectPreset: (preset: AreaPreset) => void;
  activePreset?: string;
}

export function DubaiPresets({ onSelectPreset, activePreset }: DubaiPresetsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-gold" />
        <span className="text-sm font-medium text-foreground">Quick Presets</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {DUBAI_AREA_PRESETS.map((preset) => (
          <Button
            key={preset.name}
            variant="outline"
            size="sm"
            onClick={() => onSelectPreset(preset)}
            className={`text-xs transition-all ${
              activePreset === preset.name 
                ? 'bg-gold/20 border-gold/50 text-gold' 
                : 'hover:bg-gold/10 hover:border-gold/30'
            }`}
          >
            {preset.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
