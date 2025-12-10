import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Info, Database, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CurrencySelector } from '@/components/tools/CurrencySelector';
import { SliderInput } from '@/components/tools/SliderInput';
import { DubaiPresets, AreaPreset } from '@/components/tools/DubaiPresets';
import { AirbnbCharts } from '@/components/tools/AirbnbCharts';
import { FeeBreakdownCard } from '@/components/tools/FeeBreakdownCard';
import { useCurrencyConverter } from '@/hooks/useCurrencyConverter';
import { DEFAULT_SHORT_TERM_COSTS, AREA_SERVICE_CHARGES } from '@/lib/dubaiRealEstateFees';
import { InvestmentDisclaimer } from '@/components/ui/disclaimers';
import { useAirbnbMarketData, useHasAirbnbMarketData } from '@/hooks/useAirbnbMarketData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { SEOHead } from '@/components/SEOHead';
import { PAGE_SEO, generateSoftwareApplicationSchema, SITE_CONFIG } from '@/lib/seo-config';

export default function AirbnbCalculator() {
  const { selectedCurrency, setSelectedCurrency, formatCurrency, formatAED, supportedCurrencies } = useCurrencyConverter();
  const [activePreset, setActivePreset] = useState<string>();
  
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

  const handleChange = (field: string, value: number | string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
    if (field !== 'selectedArea') setActivePreset(undefined);
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
  };

  // Fetch market data for selected area and bedrooms
  const { data: marketData, isLoading: isLoadingMarketData } = useAirbnbMarketData({
    areaName: inputs.selectedArea,
    bedrooms: inputs.bedrooms,
  });

  const handleUseMarketData = () => {
    if (!marketData) {
      toast.info('No market data available yet. Connect AirDNA API to enable this feature.');
      return;
    }

    setInputs(prev => ({
      ...prev,
      nightlyRatePeak: marketData.peak_daily_rate || prev.nightlyRatePeak,
      nightlyRateMid: marketData.avg_daily_rate || prev.nightlyRateMid,
      nightlyRateLow: marketData.low_daily_rate || prev.nightlyRateLow,
      occupancyPeak: marketData.peak_occupancy || prev.occupancyPeak,
      occupancyMid: marketData.avg_occupancy || prev.occupancyMid,
      occupancyLow: marketData.low_occupancy || prev.occupancyLow,
    }));
    toast.success('Rates updated with real market data!');
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

      <section className="pt-32 pb-8">
        <div className="container mx-auto px-4">
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
            <CurrencySelector selectedCurrency={selectedCurrency} onCurrencyChange={setSelectedCurrency} supportedCurrencies={supportedCurrencies} />
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
                      <p className="text-sm font-medium text-foreground">AirDNA Market Data</p>
                      <p className="text-xs text-muted-foreground">
                        {hasMarketData 
                          ? 'Real market data available' 
                          : 'Connect API for real rates & occupancy'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {marketData && (
                      <Badge variant="secondary" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                        Data Available
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      variant={marketData ? "default" : "outline"}
                      onClick={handleUseMarketData}
                      disabled={isLoadingMarketData || !hasMarketData}
                      className="text-xs"
                    >
                      {isLoadingMarketData ? (
                        <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Loading...</>
                      ) : hasMarketData ? (
                        'Use Market Data'
                      ) : (
                        'Coming Soon'
                      )}
                    </Button>
                  </div>
                </div>
                {marketData && (
                  <div className="mt-3 pt-3 border-t border-blue-500/10 grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-muted-foreground">Avg Daily Rate</span>
                      <p className="font-medium text-foreground">{formatAED(marketData.avg_daily_rate || 0)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Avg Occupancy</span>
                      <p className="font-medium text-foreground">{marketData.avg_occupancy?.toFixed(0) || '--'}%</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Active Listings</span>
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
                <div className="grid grid-cols-2 gap-6">
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
                <SliderInput label="Peak Season (Nov-Feb)" value={inputs.nightlyRatePeak} onChange={(v) => handleChange('nightlyRatePeak', v)} min={300} max={5000} step={50} formatValue={formatAED} />
                <SliderInput label="Mid Season (Mar-Apr, Sep-Oct)" value={inputs.nightlyRateMid} onChange={(v) => handleChange('nightlyRateMid', v)} min={200} max={3000} step={50} formatValue={formatAED} />
                <SliderInput label="Low Season (May-Aug)" value={inputs.nightlyRateLow} onChange={(v) => handleChange('nightlyRateLow', v)} min={100} max={2000} step={50} formatValue={formatAED} />
                <SliderInput label="Weekend Premium" value={inputs.weekendPremium} onChange={(v) => handleChange('weekendPremium', v)} min={0} max={50} suffix="%" />
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border space-y-6">
                <h2 className="font-heading text-xl text-foreground">Occupancy Rates</h2>
                <SliderInput label="Peak Season" value={inputs.occupancyPeak} onChange={(v) => handleChange('occupancyPeak', v)} min={30} max={100} suffix="%" />
                <SliderInput label="Mid Season" value={inputs.occupancyMid} onChange={(v) => handleChange('occupancyMid', v)} min={20} max={100} suffix="%" />
                <SliderInput label="Low Season" value={inputs.occupancyLow} onChange={(v) => handleChange('occupancyLow', v)} min={10} max={100} suffix="%" />
              </div>

              {/* Fee Breakdowns */}
              <div className="space-y-3">
                <FeeBreakdownCard
                  title="Initial Setup Costs"
                  fees={setupItems}
                  total={totalSetupCosts}
                  formatValue={formatAED}
                  accentColor="purple-400"
                  defaultExpanded
                />
                <FeeBreakdownCard
                  title="Annual Expenses"
                  fees={expenseItems}
                  total={totalExpenses}
                  formatValue={formatAED}
                  accentColor="orange-400"
                />
              </div>

              <AirbnbCharts 
                peakRevenue={peakRevenue} 
                midRevenue={midRevenue} 
                lowRevenue={lowRevenue} 
                totalExpenses={totalExpenses} 
                netAnnualIncome={netAnnualIncome} 
                grossRevenue={grossRevenue} 
                platformFees={platformFees} 
                managementFees={managementFees} 
                annualUtilities={annualUtilities} 
                annualMaintenance={annualMaintenance} 
                serviceCharges={annualServiceCharges} 
                licenseFee={annualLicensing} 
                formatAED={formatAED} 
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="space-y-6">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent border border-orange-500/20">
                <h2 className="font-heading text-xl text-foreground mb-4">Annual Returns</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-card/50">
                    <p className="text-sm text-muted-foreground mb-1">Net Yield</p>
                    <p className="font-heading text-3xl text-orange-400">{netYield.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">After all expenses</p>
                  </div>
                  <div className="p-4 rounded-xl bg-card/50">
                    <p className="text-sm text-muted-foreground mb-1">Gross Yield</p>
                    <p className="font-heading text-3xl text-foreground">{grossYield.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">Before expenses</p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border">
                <h2 className="font-heading text-xl text-foreground mb-6">Monthly Income</h2>
                <div className="text-center py-4">
                  <p className="font-heading text-4xl text-emerald-400 mb-2">{formatAED(netMonthlyIncome)}</p>
                  <p className="text-muted-foreground">{formatCurrency(netMonthlyIncome)}</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border">
                <h2 className="font-heading text-xl text-foreground mb-6">Occupancy Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Peak Season Nights</span>
                    <span className="font-medium">{Math.round(peakNights)} nights</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Mid Season Nights</span>
                    <span className="font-medium">{Math.round(midNights)} nights</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Low Season Nights</span>
                    <span className="font-medium">{Math.round(lowNights)} nights</span>
                  </div>
                  <div className="flex justify-between py-2 bg-muted/30 rounded-lg px-3 -mx-3">
                    <span className="font-medium text-foreground">Total Nights Booked</span>
                    <span className="font-heading text-lg text-foreground">{Math.round(totalNights)} nights</span>
                  </div>
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    Average occupancy: {((totalNights / 365) * 100).toFixed(0)}% annually
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border">
                <h2 className="font-heading text-xl text-foreground mb-6">Revenue Breakdown</h2>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Peak Season Revenue</span>
                    <span className="font-medium text-emerald-400">{formatAED(peakRevenue)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Mid Season Revenue</span>
                    <span className="font-medium text-emerald-400">{formatAED(midRevenue)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Low Season Revenue</span>
                    <span className="font-medium text-emerald-400">{formatAED(lowRevenue)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Cleaning Revenue</span>
                    <span className="font-medium">{formatAED(cleaningRevenue)}</span>
                  </div>
                  <div className="flex justify-between py-3 bg-emerald-500/10 rounded-lg px-3 -mx-3">
                    <span className="font-medium text-foreground">Gross Revenue</span>
                    <span className="font-heading text-xl text-emerald-400">{formatAED(grossRevenue)}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border">
                <h2 className="font-heading text-xl text-foreground mb-6">Financial Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Gross Revenue</span>
                    <span className="font-medium text-emerald-400">{formatAED(grossRevenue)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Total Expenses</span>
                    <span className="font-medium text-orange-400">-{formatAED(totalExpenses)}</span>
                  </div>
                  <div className="flex justify-between py-3 bg-gold/10 rounded-lg px-3 -mx-3">
                    <span className="font-medium text-foreground">Net Annual Income</span>
                    <div className="text-right">
                      <p className="font-heading text-xl text-gold">{formatAED(netAnnualIncome)}</p>
                      <p className="text-sm text-gold/80">{formatCurrency(netAnnualIncome)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <div className="flex gap-3">
                  <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground text-sm">Setup Investment Required</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Before earning income, you'll need approximately {formatAED(totalSetupCosts)} for furnishing, photography, and licensing. 
                      Payback period: ~{Math.ceil(totalSetupCosts / netMonthlyIncome)} months.
                    </p>
                  </div>
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
