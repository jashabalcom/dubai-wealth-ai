import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Info, Database, TrendingUp, TrendingDown, Minus, RotateCcw, Lock } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CurrencyPill } from '@/components/CurrencyPill';
import { SliderInput } from '@/components/tools/SliderInput';
import { DubaiPresets, AreaPreset } from '@/components/tools/DubaiPresets';
import { AirbnbCharts } from '@/components/tools/AirbnbCharts';
import { FeeBreakdownCard } from '@/components/tools/FeeBreakdownCard';
import { useCurrency } from '@/contexts/CurrencyContext';
import { DEFAULT_SHORT_TERM_COSTS, AREA_SERVICE_CHARGES } from '@/lib/dubaiRealEstateFees';
import { InvestmentDisclaimer } from '@/components/ui/disclaimers';
import { useAirbnbMarketData, useHasAirbnbMarketData } from '@/hooks/useAirbnbMarketData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { SEOHead } from '@/components/SEOHead';
import { PAGE_SEO, generateSoftwareApplicationSchema, SITE_CONFIG } from '@/lib/seo-config';
import { ContextualUpgradePrompt } from '@/components/freemium/ContextualUpgradePrompt';
import { UsageLimitBanner } from '@/components/freemium/UsageLimitBanner';
import { UpgradeModal } from '@/components/freemium/UpgradeModal';
import { HardPaywall } from '@/components/freemium/HardPaywall';
import { useAuth } from '@/hooks/useAuth';
import { useToolUsage } from '@/hooks/useToolUsage';

// Helper to format AED amounts
function formatAED(amount: number): string {
  return `AED ${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

// Market benchmark comparison badge
function MarketBenchmark({ 
  value, 
  marketValue, 
  label,
  isPercentage = false 
}: { 
  value: number; 
  marketValue: number | null; 
  label: string;
  isPercentage?: boolean;
}) {
  if (!marketValue) return null;
  
  const diff = ((value - marketValue) / marketValue) * 100;
  const isAbove = diff > 5;
  const isBelow = diff < -5;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
            isAbove ? 'bg-emerald-500/10 text-emerald-400' : 
            isBelow ? 'bg-orange-500/10 text-orange-400' : 
            'bg-muted text-muted-foreground'
          }`}>
            {isAbove ? <TrendingUp className="w-3 h-3" /> : 
             isBelow ? <TrendingDown className="w-3 h-3" /> : 
             <Minus className="w-3 h-3" />}
            <span>{isAbove ? '+' : ''}{diff.toFixed(0)}%</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">
            {label}: {isPercentage ? `${marketValue.toFixed(0)}%` : formatAED(marketValue)}
            <br />
            Your estimate is {Math.abs(diff).toFixed(0)}% {isAbove ? 'above' : isBelow ? 'below' : 'at'} market
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function AirbnbCalculator() {
  const { formatPrice } = useCurrency();
  const { remainingUses, hasReachedLimit, isUnlimited, trackUsage, canUse, isLoading: usageLoading } = useToolUsage('airbnb');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [hasTracked, setHasTracked] = useState(false);
  const [activePreset, setActivePreset] = useState<string>();
  const [isUsingMarketData, setIsUsingMarketData] = useState(false);
  const prevAreaRef = useRef<string>();
  const prevBedroomsRef = useRef<number>();
  
  // Market data integration
  const { data: hasMarketData } = useHasAirbnbMarketData();

  const [inputs, setInputs] = useState({
    propertyPrice: 2000000,
    propertySizeSqft: 1200,
    selectedArea: 'Dubai Marina',
    bedrooms: 2,
    // Nightly rates by season
    nightlyRatePeak: 1200,
    nightlyRateMid: 800,
    nightlyRateLow: 500,
    weekendPremium: 25,
    // Occupancy by season
    occupancyPeak: 85,
    occupancyMid: 70,
    occupancyLow: 50,
    cleaningFee: 200,
    // Platform & Management
    airbnbFee: 3,
    managementFee: 20,
    // Ongoing costs
    utilitiesMonthly: 1500,
    maintenanceMonthly: 1000,
    // Short-term specific
    holidayHomeLicense: DEFAULT_SHORT_TERM_COSTS.holidayHomeLicense,
    dtcmPermit: DEFAULT_SHORT_TERM_COSTS.dtcmPermit,
    licensingRenewal: DEFAULT_SHORT_TERM_COSTS.licensingRenewal,
    furnishingCost: 150000,
    professionalPhotos: DEFAULT_SHORT_TERM_COSTS.professionalPhotography,
  });

  useEffect(() => {
    async function track() {
      if (!hasTracked && canUse) {
        const success = await trackUsage();
        if (!success && !isUnlimited) {
          setShowUpgradeModal(true);
        }
        setHasTracked(true);
      } else if (!canUse && !hasTracked) {
        setShowUpgradeModal(true);
        setHasTracked(true);
      }
    }
    track();
  }, [hasTracked, canUse, trackUsage, isUnlimited]);

  const handleChange = (field: string, value: number | string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
    if (field !== 'selectedArea') setActivePreset(undefined);
    // Clear market data flag when user manually changes rates/occupancy
    if (['nightlyRatePeak', 'nightlyRateMid', 'nightlyRateLow', 'occupancyPeak', 'occupancyMid', 'occupancyLow'].includes(field)) {
      setIsUsingMarketData(false);
    }
  };

  const handlePresetSelect = (preset: AreaPreset) => {
    setInputs(prev => ({
      ...prev,
      propertyPrice: preset.propertyPrice,
      nightlyRatePeak: preset.nightlyRate ? preset.nightlyRate * 1.5 : prev.nightlyRatePeak,
      nightlyRateMid: preset.nightlyRate || prev.nightlyRateMid,
      nightlyRateLow: preset.nightlyRate ? preset.nightlyRate * 0.6 : prev.nightlyRateLow,
      propertySizeSqft: preset.sizeSqft || prev.propertySizeSqft,
      selectedArea: preset.name,
    }));
    setActivePreset(preset.name);
    setIsUsingMarketData(false);
  };

  // Fetch market data for selected area and bedrooms
  const { data: marketData, isLoading: isLoadingMarketData } = useAirbnbMarketData({
    areaName: inputs.selectedArea,
    bedrooms: inputs.bedrooms,
  });

  // Auto-populate when area or bedrooms change and market data is available
  useEffect(() => {
    if (!marketData) return;
    
    const areaChanged = prevAreaRef.current !== inputs.selectedArea;
    const bedroomsChanged = prevBedroomsRef.current !== inputs.bedrooms;
    
    if ((areaChanged || bedroomsChanged) && prevAreaRef.current !== undefined) {
      // Auto-apply market data when area/bedrooms change
      setInputs(prev => ({
        ...prev,
        nightlyRatePeak: marketData.peak_daily_rate || prev.nightlyRatePeak,
        nightlyRateMid: marketData.avg_daily_rate || prev.nightlyRateMid,
        nightlyRateLow: marketData.low_daily_rate || prev.nightlyRateLow,
        occupancyPeak: marketData.peak_occupancy || prev.occupancyPeak,
        occupancyMid: marketData.avg_occupancy || prev.occupancyMid,
        occupancyLow: marketData.low_occupancy || prev.occupancyLow,
      }));
      setIsUsingMarketData(true);
      toast.success(`Updated with ${inputs.selectedArea} market data`, { duration: 2000 });
    }
    
    prevAreaRef.current = inputs.selectedArea;
    prevBedroomsRef.current = inputs.bedrooms;
  }, [marketData, inputs.selectedArea, inputs.bedrooms]);

  const handleResetToDefaults = () => {
    setInputs(prev => ({
      ...prev,
      nightlyRatePeak: 1200,
      nightlyRateMid: 800,
      nightlyRateLow: 500,
      occupancyPeak: 85,
      occupancyMid: 70,
      occupancyLow: 50,
    }));
    setIsUsingMarketData(false);
    toast.info('Reset to default rates');
  };

  // Season definitions
  const peakSeasonMonths = 4; // Nov-Feb
  const midSeasonMonths = 4; // Mar-Apr, Sep-Oct
  const lowSeasonMonths = 4; // May-Aug

  // Calculate nights booked per season
  const peakNights = peakSeasonMonths * 30 * (inputs.occupancyPeak / 100);
  const midNights = midSeasonMonths * 30 * (inputs.occupancyMid / 100);
  const lowNights = lowSeasonMonths * 30 * (inputs.occupancyLow / 100);
  const totalNights = peakNights + midNights + lowNights;

  // Calculate average weekend vs weekday rates
  const weekendMultiplier = 1 + inputs.weekendPremium / 100;
  const peakAvgRate = (inputs.nightlyRatePeak * 5 + inputs.nightlyRatePeak * weekendMultiplier * 2) / 7;
  const midAvgRate = (inputs.nightlyRateMid * 5 + inputs.nightlyRateMid * weekendMultiplier * 2) / 7;
  const lowAvgRate = (inputs.nightlyRateLow * 5 + inputs.nightlyRateLow * weekendMultiplier * 2) / 7;

  // Revenue calculations
  const peakRevenue = peakNights * peakAvgRate;
  const midRevenue = midNights * midAvgRate;
  const lowRevenue = lowNights * lowAvgRate;
  const totalRentalRevenue = peakRevenue + midRevenue + lowRevenue;
  
  const cleaningRevenue = totalNights * inputs.cleaningFee * 0.5; // Assume 50% of cleaning fees go to revenue
  const grossRevenue = totalRentalRevenue + cleaningRevenue;

  // Expense calculations
  const platformFees = totalRentalRevenue * (inputs.airbnbFee / 100);
  const managementFees = grossRevenue * (inputs.managementFee / 100);
  const annualUtilities = inputs.utilitiesMonthly * 12;
  const annualMaintenance = inputs.maintenanceMonthly * 12;
  
  // Area-specific service charges
  const serviceChargeRate = AREA_SERVICE_CHARGES[inputs.selectedArea] || 15;
  const annualServiceCharges = inputs.propertySizeSqft * serviceChargeRate;
  
  // Licensing costs
  const annualLicensing = inputs.holidayHomeLicense + inputs.dtcmPermit + inputs.licensingRenewal;

  const totalExpenses = platformFees + managementFees + annualUtilities + annualMaintenance + annualServiceCharges + annualLicensing;

  const netAnnualIncome = grossRevenue - totalExpenses;
  const netMonthlyIncome = netAnnualIncome / 12;
  const netYield = (netAnnualIncome / inputs.propertyPrice) * 100;
  const grossYield = (grossRevenue / inputs.propertyPrice) * 100;

  // Setup costs
  const totalSetupCosts = inputs.furnishingCost + inputs.professionalPhotos + inputs.holidayHomeLicense + inputs.dtcmPermit;

  // Expense items for breakdown
  const expenseItems = [
    { label: `Airbnb Fees (${inputs.airbnbFee}%)`, value: platformFees, key: 'airbnbFee', category: 'ongoing' as const },
    { label: `Management (${inputs.managementFee}%)`, value: managementFees, key: 'managementFee', category: 'ongoing' as const },
    { label: `Service Charges (${serviceChargeRate} AED/sqft)`, value: annualServiceCharges, key: 'serviceCharges', category: 'ongoing' as const },
    { label: 'Utilities', value: annualUtilities, key: 'utilities', category: 'ongoing' as const },
    { label: 'Maintenance', value: annualMaintenance, key: 'maintenance', category: 'ongoing' as const },
    { label: 'Licensing & Permits', value: annualLicensing, key: 'licensing', category: 'ongoing' as const },
  ];

  const setupItems = [
    { label: 'Holiday Home License', value: inputs.holidayHomeLicense, key: 'holidayHomeLicense', category: 'acquisition' as const },
    { label: 'DTCM Permit', value: inputs.dtcmPermit, key: 'dtcmPermit', category: 'acquisition' as const },
    { label: 'Furnishing', value: inputs.furnishingCost, key: 'furnishing', category: 'acquisition' as const },
    { label: 'Professional Photography', value: inputs.professionalPhotos, key: 'photography', category: 'acquisition' as const },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        {...PAGE_SEO.airbnbCalculator} 
        structuredData={generateSoftwareApplicationSchema({
          name: 'Dubai Airbnb Yield Calculator',
          description: PAGE_SEO.airbnbCalculator.description,
          url: `${SITE_CONFIG.url}/tools/airbnb`,
        })}
      />
      <Navbar />

      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
        feature="tools"
        toolName="Airbnb Calculator"
      />

      <section className="pt-32 pb-8">
        <div className="container mx-auto px-4">
          {!isUnlimited && !usageLoading && (
            <UsageLimitBanner remaining={remainingUses} total={2} type="tool" toolName="Airbnb Calculator" />
          )}
          <Link to="/tools" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Tools
          </Link>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-orange-500" />
                </div>
                <h1 className="font-heading text-3xl md:text-4xl text-foreground">Airbnb Yield Calculator</h1>
              </div>
              <p className="text-muted-foreground">Calculate short-term rental income with all Dubai licensing & fees.</p>
              <InvestmentDisclaimer variant="inline" className="mt-2" />
            </motion.div>
            <CurrencyPill />
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="space-y-6">
              {/* Market Data Integration Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/20">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <Database className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Market Data</p>
                      <p className="text-xs text-muted-foreground">
                        {isUsingMarketData 
                          ? `Using ${inputs.selectedArea} ${inputs.bedrooms}BR data` 
                          : hasMarketData 
                            ? 'Auto-syncs when you change area' 
                            : 'Coming soon'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isUsingMarketData && (
                      <Badge variant="secondary" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                        Market Data Active
                      </Badge>
                    )}
                    {isUsingMarketData && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleResetToDefaults}
                        className="text-xs h-7 px-2"
                      >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Reset
                      </Button>
                    )}
                  </div>
                </div>
                {marketData && (
                  <div className="mt-3 pt-3 border-t border-blue-500/10 grid grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-muted-foreground">Avg Rate</span>
                      <p className="font-medium text-foreground">{formatAED(marketData.avg_daily_rate || 0)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Occupancy</span>
                      <p className="font-medium text-foreground">{marketData.avg_occupancy?.toFixed(0) || '--'}%</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Avg Revenue</span>
                      <p className="font-medium text-foreground">{marketData.avg_annual_revenue ? formatAED(marketData.avg_annual_revenue) : '--'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Listings</span>
                      <p className="font-medium text-foreground">{marketData.active_listings_count?.toLocaleString() || '--'}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border">
                <DubaiPresets onSelectPreset={handlePresetSelect} activePreset={activePreset} showDetails />
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border space-y-6">
                <h2 className="font-heading text-xl text-foreground">Property Details</h2>
                <SliderInput label="Property Price" value={inputs.propertyPrice} onChange={(v) => handleChange('propertyPrice', v)} min={500000} max={10000000} step={100000} formatValue={formatAED} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <SliderInput label="Size" value={inputs.propertySizeSqft} onChange={(v) => handleChange('propertySizeSqft', v)} min={400} max={3000} step={50} suffix=" sqft" />
                  <SliderInput label="Bedrooms" value={inputs.bedrooms} onChange={(v) => handleChange('bedrooms', v)} min={1} max={5} />
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading text-xl text-foreground">Seasonal Rates</h2>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Info className="w-3 h-3" />
                    <span>Weekday rates shown</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Peak Season (Nov-Feb)</span>
                    <MarketBenchmark value={inputs.nightlyRatePeak} marketValue={marketData?.peak_daily_rate || null} label="Market peak rate" />
                  </div>
                  <SliderInput label="" value={inputs.nightlyRatePeak} onChange={(v) => handleChange('nightlyRatePeak', v)} min={300} max={5000} step={50} formatValue={formatAED} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Mid Season (Mar-Apr, Sep-Oct)</span>
                    <MarketBenchmark value={inputs.nightlyRateMid} marketValue={marketData?.avg_daily_rate || null} label="Market average rate" />
                  </div>
                  <SliderInput label="" value={inputs.nightlyRateMid} onChange={(v) => handleChange('nightlyRateMid', v)} min={200} max={3000} step={50} formatValue={formatAED} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Low Season (May-Aug)</span>
                    <MarketBenchmark value={inputs.nightlyRateLow} marketValue={marketData?.low_daily_rate || null} label="Market low rate" />
                  </div>
                  <SliderInput label="" value={inputs.nightlyRateLow} onChange={(v) => handleChange('nightlyRateLow', v)} min={100} max={2000} step={50} formatValue={formatAED} />
                </div>
                <SliderInput label="Weekend Premium" value={inputs.weekendPremium} onChange={(v) => handleChange('weekendPremium', v)} min={0} max={50} step={5} suffix="%" />
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border space-y-6">
                <h2 className="font-heading text-xl text-foreground">Occupancy Rates</h2>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Peak Season</span>
                    <MarketBenchmark value={inputs.occupancyPeak} marketValue={marketData?.peak_occupancy || null} label="Market peak occupancy" isPercentage />
                  </div>
                  <SliderInput label="" value={inputs.occupancyPeak} onChange={(v) => handleChange('occupancyPeak', v)} min={50} max={100} step={5} suffix="%" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Mid Season</span>
                    <MarketBenchmark value={inputs.occupancyMid} marketValue={marketData?.avg_occupancy || null} label="Market average occupancy" isPercentage />
                  </div>
                  <SliderInput label="" value={inputs.occupancyMid} onChange={(v) => handleChange('occupancyMid', v)} min={30} max={100} step={5} suffix="%" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Low Season</span>
                    <MarketBenchmark value={inputs.occupancyLow} marketValue={marketData?.low_occupancy || null} label="Market low occupancy" isPercentage />
                  </div>
                  <SliderInput label="" value={inputs.occupancyLow} onChange={(v) => handleChange('occupancyLow', v)} min={20} max={80} step={5} suffix="%" />
                </div>
              </div>
            </motion.div>

            {/* Results Column */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="space-y-6">
              {/* Key Metrics */}
              <HardPaywall
                requiredTier="investor"
                feature="Yield Analysis"
                isLocked={hasReachedLimit && !isUnlimited}
                showTeaser={true}
                teaserMessage="Upgrade to see full yield analysis, revenue breakdown, and expense details"
              >
                <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent border border-orange-500/20">
                  <h2 className="font-heading text-xl text-foreground mb-6">Annual Returns</h2>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 rounded-xl bg-card/50">
                      <p className="text-sm text-muted-foreground">Net Yield</p>
                      <p className="font-heading text-3xl text-emerald-400">{netYield.toFixed(1)}%</p>
                    </div>
                    <div className="p-4 rounded-xl bg-card/50">
                      <p className="text-sm text-muted-foreground">Gross Yield</p>
                      <p className="font-heading text-3xl text-foreground">{grossYield.toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Gross Revenue</span>
                      <span className="font-medium text-emerald-400">{formatAED(grossRevenue)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Expenses</span>
                      <span className="font-medium text-red-400">-{formatAED(totalExpenses)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-orange-500/20">
                      <span className="font-medium text-foreground">Net Annual Income</span>
                      <span className="font-heading text-2xl text-emerald-400">{formatAED(netAnnualIncome)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Monthly Income</span>
                      <span className="font-medium">{formatAED(netMonthlyIncome)}</span>
                    </div>
                  </div>
                </div>
              </HardPaywall>

              {/* Occupancy Summary */}
              <HardPaywall
                requiredTier="investor"
                feature="Occupancy Analysis"
                isLocked={hasReachedLimit && !isUnlimited}
                showTeaser={true}
              >
                <div className="p-6 rounded-2xl bg-card border border-border">
                  <h2 className="font-heading text-xl text-foreground mb-4">Occupancy Summary</h2>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 rounded-lg bg-orange-500/10">
                      <p className="text-xs text-muted-foreground">Peak Nights</p>
                      <p className="font-heading text-xl">{peakNights.toFixed(0)}</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-orange-500/10">
                      <p className="text-xs text-muted-foreground">Mid Nights</p>
                      <p className="font-heading text-xl">{midNights.toFixed(0)}</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-orange-500/10">
                      <p className="text-xs text-muted-foreground">Low Nights</p>
                      <p className="font-heading text-xl">{lowNights.toFixed(0)}</p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 rounded-lg bg-muted/30 flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Nights Booked</span>
                    <span className="font-heading text-lg">{totalNights.toFixed(0)} / 365</span>
                  </div>
                </div>
              </HardPaywall>

              {/* Fee Breakdowns */}
              <HardPaywall
                requiredTier="investor"
                feature="Fee Breakdown"
                isLocked={hasReachedLimit && !isUnlimited}
                showTeaser={true}
              >
                <div className="space-y-4">
                  <FeeBreakdownCard
                    title="Annual Expenses"
                    fees={expenseItems}
                    total={totalExpenses}
                    formatValue={formatAED}
                    accentColor="red-400"
                  />
                  <FeeBreakdownCard
                    title="Setup Costs (One-Time)"
                    fees={setupItems}
                    total={totalSetupCosts}
                    formatValue={formatAED}
                    accentColor="orange-400"
                  />
                </div>
              </HardPaywall>

              {/* Charts */}
              {(!hasReachedLimit || isUnlimited) && (
                <AirbnbCharts
                  peakRevenue={peakRevenue}
                  midRevenue={midRevenue}
                  lowRevenue={lowRevenue}
                  totalExpenses={totalExpenses}
                  expenseItems={expenseItems}
                  formatAED={formatAED}
                />
              )}

              {!isUnlimited && hasReachedLimit && (
                <ContextualUpgradePrompt
                  feature="Unlimited Calculator Access"
                  description="Get unlimited access to all investment calculators, AI analysis, and advanced features."
                  className="mt-8"
                />
              )}
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}