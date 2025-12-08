import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';
import { AREA_SERVICE_CHARGES, AREA_CHILLER_FEES } from '@/lib/dubaiRealEstateFees';

export interface AreaPreset {
  name: string;
  propertyPrice: number;
  annualRent?: number;
  nightlyRate?: number;
  monthlyRent?: number;
  sizeSqft?: number;
  serviceChargePerSqft?: number;
  hasDistrictCooling?: boolean;
  chillerMonthly?: number;
}

export const DUBAI_AREA_PRESETS: AreaPreset[] = [
  { 
    name: 'Dubai Marina', 
    propertyPrice: 2500000, 
    annualRent: 140000, 
    nightlyRate: 900, 
    monthlyRent: 12000,
    sizeSqft: 1200,
    serviceChargePerSqft: AREA_SERVICE_CHARGES['Dubai Marina'],
    hasDistrictCooling: true,
    chillerMonthly: AREA_CHILLER_FEES['Dubai Marina'],
  },
  { 
    name: 'Downtown Dubai', 
    propertyPrice: 3200000, 
    annualRent: 180000, 
    nightlyRate: 1200, 
    monthlyRent: 15000,
    sizeSqft: 1100,
    serviceChargePerSqft: AREA_SERVICE_CHARGES['Downtown Dubai'],
    hasDistrictCooling: true,
    chillerMonthly: AREA_CHILLER_FEES['Downtown Dubai'],
  },
  { 
    name: 'Palm Jumeirah', 
    propertyPrice: 5500000, 
    annualRent: 280000, 
    nightlyRate: 2000, 
    monthlyRent: 25000,
    sizeSqft: 2200,
    serviceChargePerSqft: AREA_SERVICE_CHARGES['Palm Jumeirah'],
    hasDistrictCooling: true,
    chillerMonthly: AREA_CHILLER_FEES['Palm Jumeirah'],
  },
  { 
    name: 'JVC', 
    propertyPrice: 950000, 
    annualRent: 65000, 
    nightlyRate: 500, 
    monthlyRent: 5500,
    sizeSqft: 900,
    serviceChargePerSqft: AREA_SERVICE_CHARGES['JVC'],
    hasDistrictCooling: false,
    chillerMonthly: 0,
  },
  { 
    name: 'Business Bay', 
    propertyPrice: 1800000, 
    annualRent: 100000, 
    nightlyRate: 700, 
    monthlyRent: 8500,
    sizeSqft: 1000,
    serviceChargePerSqft: AREA_SERVICE_CHARGES['Business Bay'],
    hasDistrictCooling: true,
    chillerMonthly: AREA_CHILLER_FEES['Business Bay'],
  },
  { 
    name: 'JBR', 
    propertyPrice: 3000000, 
    annualRent: 160000, 
    nightlyRate: 1100, 
    monthlyRent: 14000,
    sizeSqft: 1400,
    serviceChargePerSqft: AREA_SERVICE_CHARGES['JBR'],
    hasDistrictCooling: true,
    chillerMonthly: AREA_CHILLER_FEES['JBR'],
  },
];

interface DubaiPresetsProps {
  onSelectPreset: (preset: AreaPreset) => void;
  activePreset?: string;
  showDetails?: boolean;
}

export function DubaiPresets({ onSelectPreset, activePreset, showDetails = false }: DubaiPresetsProps) {
  const activeData = DUBAI_AREA_PRESETS.find(p => p.name === activePreset);
  
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-gold" />
        <span className="text-sm font-medium text-foreground">Dubai Area Presets</span>
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
      
      {showDetails && activeData && (
        <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Service Charge:</span>
            <span className="font-medium">AED {activeData.serviceChargePerSqft}/sqft</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Avg Size:</span>
            <span className="font-medium">{activeData.sizeSqft} sqft</span>
          </div>
          {activeData.hasDistrictCooling && (
            <div className="flex justify-between col-span-2">
              <span className="text-muted-foreground">District Cooling:</span>
              <span className="font-medium text-amber-400">~AED {activeData.chillerMonthly}/mo</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
