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

export interface AreaCategory {
  name: string;
  areas: AreaPreset[];
}

export const DUBAI_AREA_PRESETS: AreaPreset[] = [
  // Premium Areas
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
    name: 'DIFC', 
    propertyPrice: 3500000, 
    annualRent: 175000, 
    nightlyRate: 1100, 
    monthlyRent: 15000,
    sizeSqft: 1000,
    serviceChargePerSqft: AREA_SERVICE_CHARGES['DIFC'],
    hasDistrictCooling: true,
    chillerMonthly: AREA_CHILLER_FEES['DIFC'],
  },
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
  { 
    name: 'Bluewaters Island', 
    propertyPrice: 4200000, 
    annualRent: 210000, 
    nightlyRate: 1500, 
    monthlyRent: 18000,
    sizeSqft: 1500,
    serviceChargePerSqft: AREA_SERVICE_CHARGES['Bluewaters Island'],
    hasDistrictCooling: true,
    chillerMonthly: AREA_CHILLER_FEES['Bluewaters Island'],
  },
  { 
    name: 'City Walk', 
    propertyPrice: 2800000, 
    annualRent: 150000, 
    nightlyRate: 1000, 
    monthlyRent: 13000,
    sizeSqft: 1200,
    serviceChargePerSqft: AREA_SERVICE_CHARGES['City Walk'],
    hasDistrictCooling: true,
    chillerMonthly: AREA_CHILLER_FEES['City Walk'],
  },
  { 
    name: 'Emirates Hills', 
    propertyPrice: 15000000, 
    annualRent: 550000, 
    nightlyRate: 4000, 
    monthlyRent: 50000,
    sizeSqft: 8000,
    serviceChargePerSqft: AREA_SERVICE_CHARGES['Emirates Hills'],
    hasDistrictCooling: false,
    chillerMonthly: 0,
  },
  
  // Mid-Range Areas
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
    name: 'Dubai Hills', 
    propertyPrice: 2200000, 
    annualRent: 120000, 
    nightlyRate: 800, 
    monthlyRent: 10000,
    sizeSqft: 1400,
    serviceChargePerSqft: AREA_SERVICE_CHARGES['Dubai Hills'],
    hasDistrictCooling: true,
    chillerMonthly: AREA_CHILLER_FEES['Dubai Hills'],
  },
  { 
    name: 'Dubai Creek Harbour', 
    propertyPrice: 2400000, 
    annualRent: 130000, 
    nightlyRate: 850, 
    monthlyRent: 11000,
    sizeSqft: 1200,
    serviceChargePerSqft: AREA_SERVICE_CHARGES['Dubai Creek Harbour'],
    hasDistrictCooling: true,
    chillerMonthly: AREA_CHILLER_FEES['Dubai Creek Harbour'],
  },
  { 
    name: 'MBR City', 
    propertyPrice: 2000000, 
    annualRent: 100000, 
    nightlyRate: 700, 
    monthlyRent: 8500,
    sizeSqft: 1300,
    serviceChargePerSqft: AREA_SERVICE_CHARGES['MBR City'],
    hasDistrictCooling: true,
    chillerMonthly: AREA_CHILLER_FEES['MBR City'],
  },
  { 
    name: 'Sobha Hartland', 
    propertyPrice: 2100000, 
    annualRent: 115000, 
    nightlyRate: 750, 
    monthlyRent: 9500,
    sizeSqft: 1250,
    serviceChargePerSqft: AREA_SERVICE_CHARGES['Sobha Hartland'],
    hasDistrictCooling: true,
    chillerMonthly: AREA_CHILLER_FEES['Sobha Hartland'],
  },
  { 
    name: 'JLT', 
    propertyPrice: 1200000, 
    annualRent: 85000, 
    nightlyRate: 550, 
    monthlyRent: 7000,
    sizeSqft: 1100,
    serviceChargePerSqft: AREA_SERVICE_CHARGES['JLT'],
    hasDistrictCooling: true,
    chillerMonthly: AREA_CHILLER_FEES['JLT'],
  },
  { 
    name: 'Meydan', 
    propertyPrice: 1600000, 
    annualRent: 95000, 
    nightlyRate: 650, 
    monthlyRent: 8000,
    sizeSqft: 1200,
    serviceChargePerSqft: AREA_SERVICE_CHARGES['Meydan'],
    hasDistrictCooling: true,
    chillerMonthly: AREA_CHILLER_FEES['Meydan'],
  },
  { 
    name: 'The Greens', 
    propertyPrice: 1400000, 
    annualRent: 90000, 
    nightlyRate: 600, 
    monthlyRent: 7500,
    sizeSqft: 1100,
    serviceChargePerSqft: AREA_SERVICE_CHARGES['The Greens'],
    hasDistrictCooling: true,
    chillerMonthly: AREA_CHILLER_FEES['The Greens'],
  },
  
  // Affordable / High-Yield Areas
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
    name: 'Sports City', 
    propertyPrice: 750000, 
    annualRent: 55000, 
    nightlyRate: 400, 
    monthlyRent: 4500,
    sizeSqft: 900,
    serviceChargePerSqft: AREA_SERVICE_CHARGES['Sports City'],
    hasDistrictCooling: false,
    chillerMonthly: 0,
  },
  { 
    name: 'Motor City', 
    propertyPrice: 950000, 
    annualRent: 62000, 
    nightlyRate: 450, 
    monthlyRent: 5200,
    sizeSqft: 1000,
    serviceChargePerSqft: AREA_SERVICE_CHARGES['Motor City'],
    hasDistrictCooling: false,
    chillerMonthly: 0,
  },
  { 
    name: 'Silicon Oasis', 
    propertyPrice: 850000, 
    annualRent: 60000, 
    nightlyRate: 420, 
    monthlyRent: 5000,
    sizeSqft: 950,
    serviceChargePerSqft: AREA_SERVICE_CHARGES['Silicon Oasis'],
    hasDistrictCooling: false,
    chillerMonthly: 0,
  },
  { 
    name: 'Town Square', 
    propertyPrice: 700000, 
    annualRent: 50000, 
    nightlyRate: 380, 
    monthlyRent: 4200,
    sizeSqft: 800,
    serviceChargePerSqft: AREA_SERVICE_CHARGES['Town Square'],
    hasDistrictCooling: false,
    chillerMonthly: 0,
  },
  { 
    name: 'Damac Hills', 
    propertyPrice: 1100000, 
    annualRent: 70000, 
    nightlyRate: 500, 
    monthlyRent: 6000,
    sizeSqft: 1100,
    serviceChargePerSqft: AREA_SERVICE_CHARGES['Damac Hills'],
    hasDistrictCooling: false,
    chillerMonthly: 0,
  },
  { 
    name: 'Al Furjan', 
    propertyPrice: 900000, 
    annualRent: 62000, 
    nightlyRate: 450, 
    monthlyRent: 5200,
    sizeSqft: 950,
    serviceChargePerSqft: AREA_SERVICE_CHARGES['Al Furjan'],
    hasDistrictCooling: false,
    chillerMonthly: 0,
  },
  { 
    name: 'Dubai South', 
    propertyPrice: 650000, 
    annualRent: 48000, 
    nightlyRate: 350, 
    monthlyRent: 4000,
    sizeSqft: 750,
    serviceChargePerSqft: AREA_SERVICE_CHARGES['Dubai South'],
    hasDistrictCooling: false,
    chillerMonthly: 0,
  },
  { 
    name: 'Discovery Gardens', 
    propertyPrice: 550000, 
    annualRent: 42000, 
    nightlyRate: 300, 
    monthlyRent: 3500,
    sizeSqft: 700,
    serviceChargePerSqft: AREA_SERVICE_CHARGES['Discovery Gardens'],
    hasDistrictCooling: false,
    chillerMonthly: 0,
  },
  { 
    name: 'International City', 
    propertyPrice: 450000, 
    annualRent: 38000, 
    nightlyRate: 280, 
    monthlyRent: 3200,
    sizeSqft: 650,
    serviceChargePerSqft: AREA_SERVICE_CHARGES['International City'],
    hasDistrictCooling: false,
    chillerMonthly: 0,
  },
];

// Helper to get areas by category
export const AREA_CATEGORIES: AreaCategory[] = [
  {
    name: 'Premium',
    areas: DUBAI_AREA_PRESETS.filter(p => 
      ['Palm Jumeirah', 'Downtown Dubai', 'DIFC', 'Dubai Marina', 'JBR', 'Bluewaters Island', 'City Walk', 'Emirates Hills'].includes(p.name)
    ),
  },
  {
    name: 'Mid-Range',
    areas: DUBAI_AREA_PRESETS.filter(p => 
      ['Business Bay', 'Dubai Hills', 'Dubai Creek Harbour', 'MBR City', 'Sobha Hartland', 'JLT', 'Meydan', 'The Greens'].includes(p.name)
    ),
  },
  {
    name: 'Affordable',
    areas: DUBAI_AREA_PRESETS.filter(p => 
      ['JVC', 'Sports City', 'Motor City', 'Silicon Oasis', 'Town Square', 'Damac Hills', 'Al Furjan', 'Dubai South', 'Discovery Gardens', 'International City'].includes(p.name)
    ),
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
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-gold" />
        <span className="text-sm font-medium text-foreground">Dubai Area Presets</span>
        <span className="text-xs text-muted-foreground">({DUBAI_AREA_PRESETS.length} areas)</span>
      </div>
      
      {AREA_CATEGORIES.map((category) => (
        <div key={category.name} className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {category.name}
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="flex flex-wrap gap-2">
            {category.areas.map((preset) => {
              const yieldPercent = preset.annualRent && preset.propertyPrice 
                ? ((preset.annualRent / preset.propertyPrice) * 100).toFixed(1)
                : null;
              return (
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
                  {yieldPercent && (
                    <span className={`ml-1.5 text-[10px] px-1 py-0.5 rounded ${
                      parseFloat(yieldPercent) >= 7 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : parseFloat(yieldPercent) >= 5.5 
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-muted text-muted-foreground'
                    }`}>
                      {yieldPercent}%
                    </span>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      ))}
      
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
