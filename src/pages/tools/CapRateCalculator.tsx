import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Building2, TrendingUp, Percent, DollarSign, Info, BadgeCheck, AlertTriangle } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CurrencyPill } from '@/components/CurrencyPill';
import { SliderInput } from '@/components/tools/SliderInput';
import { InvestmentDisclaimer } from '@/components/ui/disclaimers';
import { SEOHead } from '@/components/SEOHead';
import { useToolUsage } from '@/hooks/useToolUsage';
import { UsageLimitBanner } from '@/components/freemium/UsageLimitBanner';
import { UpgradeModal } from '@/components/freemium/UpgradeModal';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  COMMERCIAL_BENCHMARKS, 
  COMMERCIAL_AREA_DATA,
  CommercialPropertyType,
  calculateNOI,
  calculateCapRate,
  getCapRateRating,
} from '@/lib/commercialRealEstateFees';
import { CapRateCharts } from '@/components/tools/CapRateCharts';

function formatAED(amount: number): string {
  return `AED ${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

const propertyTypeLabels: Record<CommercialPropertyType, string> = {
  office: 'Office Space',
  retail: 'Retail Space',
  warehouse: 'Warehouse/Logistics',
  industrial: 'Industrial Facility',
  'mixed-use': 'Mixed-Use Development',
};

export default function CapRateCalculator() {
  const { remainingUses, hasReachedLimit, isUnlimited, trackUsage, isLoading: usageLoading } = useToolUsage('cap-rate');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [hasTrackedUsage, setHasTrackedUsage] = useState(false);

  useEffect(() => {
    if (!hasTrackedUsage && !usageLoading && !isUnlimited) {
      trackUsage().then(success => {
        if (!success) {
          setShowUpgradeModal(true);
        }
        setHasTrackedUsage(true);
      });
    }
  }, [hasTrackedUsage, usageLoading, isUnlimited, trackUsage]);

  const [inputs, setInputs] = useState({
    propertyType: 'office' as CommercialPropertyType,
    selectedArea: 'Business Bay',
    purchasePrice: 5000000,
    sizeSqft: 2500,
    grossAnnualRent: 400000,
    vacancyRate: 10,
    // Operating expenses
    propertyManagement: 5,
    insurance: 5000,
    utilities: 37500,
    repairs: 12000,
    serviceCharges: 112500,
    marketing: 0,
    otherExpenses: 12500,
  });

  const handleChange = (field: string, value: number | string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const handlePropertyTypeChange = (type: CommercialPropertyType) => {
    const benchmark = COMMERCIAL_BENCHMARKS[type];
    setInputs(prev => ({
      ...prev,
      propertyType: type,
      vacancyRate: benchmark.vacancyRate,
    }));
  };

  const handleAreaChange = (area: string) => {
    const areaData = COMMERCIAL_AREA_DATA[area];
    if (areaData) {
      const newPrice = areaData.pricePerSqft * inputs.sizeSqft;
      const estimatedRent = newPrice * (areaData.capRate / 100) * 1.3; // Gross rent estimate
      setInputs(prev => ({
        ...prev,
        selectedArea: area,
        purchasePrice: newPrice,
        grossAnnualRent: Math.round(estimatedRent),
      }));
    } else {
      setInputs(prev => ({ ...prev, selectedArea: area }));
    }
  };

  // Calculations
  const effectiveGrossIncome = inputs.grossAnnualRent * (1 - inputs.vacancyRate / 100);
  const propertyManagementCost = effectiveGrossIncome * (inputs.propertyManagement / 100);
  
  const totalOperatingExpenses = useMemo(() => {
    return propertyManagementCost + 
           inputs.insurance + 
           inputs.utilities + 
           inputs.repairs + 
           inputs.serviceCharges + 
           inputs.marketing + 
           inputs.otherExpenses;
  }, [propertyManagementCost, inputs.insurance, inputs.utilities, inputs.repairs, inputs.serviceCharges, inputs.marketing, inputs.otherExpenses]);

  const noi = effectiveGrossIncome - totalOperatingExpenses;
  const capRate = calculateCapRate(noi, inputs.purchasePrice);
  const pricePerSqft = inputs.purchasePrice / inputs.sizeSqft;
  const operatingExpenseRatio = (totalOperatingExpenses / effectiveGrossIncome) * 100;

  const benchmark = COMMERCIAL_BENCHMARKS[inputs.propertyType];
  const capRateRating = getCapRateRating(capRate, inputs.propertyType);

  const ratingColors = {
    excellent: 'text-emerald-400',
    good: 'text-green-400',
    fair: 'text-amber-400',
    poor: 'text-red-400',
  };

  const ratingBgs = {
    excellent: 'bg-emerald-500/10 border-emerald-500/20',
    good: 'bg-green-500/10 border-green-500/20',
    fair: 'bg-amber-500/10 border-amber-500/20',
    poor: 'bg-red-500/10 border-red-500/20',
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Cap Rate & NOI Calculator | Dubai Commercial Real Estate"
        description="Calculate cap rate, NOI, and analyze commercial property investments in Dubai with market benchmarks."
      />
      <Navbar />

      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
        feature="tools"
        toolName="Cap Rate Calculator"
      />

      <section className="pt-32 pb-8">
        <div className="container mx-auto px-4">
          {!isUnlimited && !usageLoading && (
            <UsageLimitBanner remaining={remainingUses} total={3} type="tool" toolName="Cap Rate Calculator" />
          )}
          <Link
            to="/tools"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tools
          </Link>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-slate-500/10 border border-slate-500/20 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-slate-400" />
                </div>
                <h1 className="font-heading text-3xl md:text-4xl text-foreground">
                  Cap Rate & NOI Calculator
                </h1>
                <Badge className="bg-slate-500/20 text-slate-300 border-slate-500/30">
                  Commercial
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Analyze commercial property investments with Dubai market benchmarks.
              </p>
              <InvestmentDisclaimer variant="inline" className="mt-2" />
            </motion.div>

            <CurrencyPill />
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Inputs */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-6"
            >
              {/* Property Type & Location */}
              <div className="p-6 rounded-2xl bg-card border border-border">
                <h2 className="font-heading text-xl text-foreground mb-6">Property Type & Location</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Property Type</label>
                    <Select value={inputs.propertyType} onValueChange={(v) => handlePropertyTypeChange(v as CommercialPropertyType)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(propertyTypeLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-2">{benchmark.description}</p>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Location</label>
                    <Select value={inputs.selectedArea} onValueChange={handleAreaChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(COMMERCIAL_AREA_DATA).map((area) => (
                          <SelectItem key={area} value={area}>{area}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Property Details */}
              <div className="p-6 rounded-2xl bg-card border border-border">
                <h2 className="font-heading text-xl text-foreground mb-6">Property Details</h2>
                
                <div className="space-y-6">
                  <SliderInput
                    label="Purchase Price (AED)"
                    value={inputs.purchasePrice}
                    onChange={(v) => handleChange('purchasePrice', v)}
                    min={1000000}
                    max={100000000}
                    step={500000}
                    formatValue={(v) => formatAED(v)}
                  />

                  <SliderInput
                    label="Property Size"
                    value={inputs.sizeSqft}
                    onChange={(v) => handleChange('sizeSqft', v)}
                    min={500}
                    max={50000}
                    step={100}
                    suffix=" sqft"
                  />

                  <SliderInput
                    label="Gross Annual Rent (AED)"
                    value={inputs.grossAnnualRent}
                    onChange={(v) => handleChange('grossAnnualRent', v)}
                    min={50000}
                    max={5000000}
                    step={25000}
                    formatValue={(v) => formatAED(v)}
                  />

                  <SliderInput
                    label="Vacancy Rate"
                    value={inputs.vacancyRate}
                    onChange={(v) => handleChange('vacancyRate', v)}
                    min={0}
                    max={30}
                    suffix="%"
                  />
                </div>
              </div>

              {/* Operating Expenses */}
              <div className="p-6 rounded-2xl bg-card border border-border">
                <div className="flex items-center gap-2 mb-6">
                  <h2 className="font-heading text-xl text-foreground">Operating Expenses</h2>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Typical operating expense ratio for {propertyTypeLabels[inputs.propertyType]}: {benchmark.typicalOperatingExpenseRatio}%</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                <div className="space-y-4">
                  <SliderInput
                    label="Property Management"
                    value={inputs.propertyManagement}
                    onChange={(v) => handleChange('propertyManagement', v)}
                    min={0}
                    max={15}
                    step={0.5}
                    suffix="% of EGI"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <SliderInput
                      label="Insurance (Annual)"
                      value={inputs.insurance}
                      onChange={(v) => handleChange('insurance', v)}
                      min={0}
                      max={50000}
                      step={1000}
                      formatValue={(v) => formatAED(v)}
                    />
                    <SliderInput
                      label="Utilities (Annual)"
                      value={inputs.utilities}
                      onChange={(v) => handleChange('utilities', v)}
                      min={0}
                      max={200000}
                      step={2500}
                      formatValue={(v) => formatAED(v)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <SliderInput
                      label="Repairs & Maintenance"
                      value={inputs.repairs}
                      onChange={(v) => handleChange('repairs', v)}
                      min={0}
                      max={100000}
                      step={2000}
                      formatValue={(v) => formatAED(v)}
                    />
                    <SliderInput
                      label="Service Charges"
                      value={inputs.serviceCharges}
                      onChange={(v) => handleChange('serviceCharges', v)}
                      min={0}
                      max={500000}
                      step={5000}
                      formatValue={(v) => formatAED(v)}
                    />
                  </div>

                  {inputs.propertyType === 'retail' && (
                    <SliderInput
                      label="Marketing/Advertising"
                      value={inputs.marketing}
                      onChange={(v) => handleChange('marketing', v)}
                      min={0}
                      max={100000}
                      step={2000}
                      formatValue={(v) => formatAED(v)}
                    />
                  )}

                  <SliderInput
                    label="Other Expenses"
                    value={inputs.otherExpenses}
                    onChange={(v) => handleChange('otherExpenses', v)}
                    min={0}
                    max={100000}
                    step={2500}
                    formatValue={(v) => formatAED(v)}
                  />
                </div>
              </div>

              {/* Charts */}
              <CapRateCharts
                noi={noi}
                capRate={capRate}
                benchmark={benchmark}
                operatingExpenses={{
                  propertyManagement: propertyManagementCost,
                  insurance: inputs.insurance,
                  utilities: inputs.utilities,
                  repairs: inputs.repairs,
                  serviceCharges: inputs.serviceCharges,
                  marketing: inputs.marketing,
                  other: inputs.otherExpenses,
                }}
                effectiveGrossIncome={effectiveGrossIncome}
                formatAED={formatAED}
              />
            </motion.div>

            {/* Results */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-6"
            >
              {/* Key Metrics */}
              <div className={`p-6 rounded-2xl border ${ratingBgs[capRateRating]}`}>
                <h2 className="font-heading text-xl text-foreground mb-6">Key Metrics</h2>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-card/50">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm text-muted-foreground">Cap Rate</p>
                      {capRateRating === 'excellent' && <BadgeCheck className="w-4 h-4 text-emerald-400" />}
                      {capRateRating === 'poor' && <AlertTriangle className="w-4 h-4 text-red-400" />}
                    </div>
                    <p className={`font-heading text-3xl ${ratingColors[capRateRating]}`}>{capRate.toFixed(2)}%</p>
                    <p className="text-xs text-muted-foreground capitalize">{capRateRating} for {propertyTypeLabels[inputs.propertyType]}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-card/50">
                    <p className="text-sm text-muted-foreground mb-1">NOI (Annual)</p>
                    <p className="font-heading text-3xl text-foreground">{formatAED(noi)}</p>
                    <p className="text-xs text-muted-foreground">Net Operating Income</p>
                  </div>
                </div>

                {/* Market Comparison */}
                <div className="p-4 rounded-xl bg-card/50 mb-4">
                  <p className="text-sm font-medium text-foreground mb-3">Market Comparison</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Your Cap Rate</span>
                      <span className={ratingColors[capRateRating]}>{capRate.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Market Average</span>
                      <span className="text-foreground">{benchmark.typicalCapRate.avg}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Market Range</span>
                      <span className="text-foreground">{benchmark.typicalCapRate.min}% - {benchmark.typicalCapRate.max}%</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-500/10 text-sm">
                  {capRate > benchmark.typicalCapRate.avg ? (
                    <p className="text-emerald-400">✓ Above market average cap rate - potentially good value</p>
                  ) : capRate >= benchmark.typicalCapRate.min ? (
                    <p className="text-amber-400">→ Within typical market range</p>
                  ) : (
                    <p className="text-red-400">⚠ Below typical cap rates for this property type</p>
                  )}
                </div>
              </div>

              {/* Income Analysis */}
              <div className="p-6 rounded-2xl bg-card border border-border">
                <h2 className="font-heading text-xl text-foreground mb-6">Income Analysis</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Gross Annual Rent
                    </span>
                    <span className="font-heading text-lg text-foreground">{formatAED(inputs.grossAnnualRent)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Percent className="w-4 h-4" />
                      Less Vacancy ({inputs.vacancyRate}%)
                    </span>
                    <span className="font-heading text-lg text-red-400">-{formatAED(inputs.grossAnnualRent - effectiveGrossIncome)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-foreground font-medium">Effective Gross Income</span>
                    <span className="font-heading text-lg text-emerald-400">{formatAED(effectiveGrossIncome)}</span>
                  </div>
                </div>
              </div>

              {/* Expense Summary */}
              <div className="p-6 rounded-2xl bg-card border border-border">
                <h2 className="font-heading text-xl text-foreground mb-6">Expense Summary</h2>
                
                <div className="space-y-3">
                  {[
                    { label: 'Property Management', value: propertyManagementCost },
                    { label: 'Insurance', value: inputs.insurance },
                    { label: 'Utilities', value: inputs.utilities },
                    { label: 'Repairs & Maintenance', value: inputs.repairs },
                    { label: 'Service Charges', value: inputs.serviceCharges },
                    ...(inputs.propertyType === 'retail' ? [{ label: 'Marketing', value: inputs.marketing }] : []),
                    { label: 'Other', value: inputs.otherExpenses },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="text-foreground">{formatAED(item.value)}</span>
                    </div>
                  ))}
                  
                  <div className="border-t border-border pt-3 mt-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">Total Operating Expenses</span>
                      <span className="font-heading text-lg text-red-400">{formatAED(totalOperatingExpenses)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-muted-foreground">Operating Expense Ratio</span>
                      <span className={operatingExpenseRatio > benchmark.typicalOperatingExpenseRatio + 5 ? 'text-amber-400' : 'text-foreground'}>
                        {operatingExpenseRatio.toFixed(1)}% of EGI
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Property Metrics */}
              <div className="p-6 rounded-2xl bg-card border border-border">
                <h2 className="font-heading text-xl text-foreground mb-6">Property Metrics</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground">Price per Sqft</span>
                    <span className="font-heading text-lg text-foreground">{formatAED(pricePerSqft)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground">Rent per Sqft (Annual)</span>
                    <span className="font-heading text-lg text-foreground">{formatAED(inputs.grossAnnualRent / inputs.sizeSqft)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground">NOI per Sqft</span>
                    <span className="font-heading text-lg text-foreground">{formatAED(noi / inputs.sizeSqft)}</span>
                  </div>
                </div>
              </div>

              {/* Investment Return */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-500/10 via-slate-500/5 to-transparent border border-slate-500/20">
                <h2 className="font-heading text-xl text-foreground mb-4">Quick Analysis</h2>
                <div className="space-y-3 text-sm">
                  <p className="text-muted-foreground">
                    At a {capRate.toFixed(2)}% cap rate, this {propertyTypeLabels[inputs.propertyType].toLowerCase()} generates 
                    <span className="text-foreground font-medium"> {formatAED(noi)} </span> 
                    in annual NOI on a {formatAED(inputs.purchasePrice)} purchase.
                  </p>
                  <p className="text-muted-foreground">
                    The property's operating expense ratio of {operatingExpenseRatio.toFixed(1)}% is 
                    {operatingExpenseRatio <= benchmark.typicalOperatingExpenseRatio ? (
                      <span className="text-emerald-400"> below </span>
                    ) : (
                      <span className="text-amber-400"> above </span>
                    )}
                    the typical {benchmark.typicalOperatingExpenseRatio}% for this property type.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
