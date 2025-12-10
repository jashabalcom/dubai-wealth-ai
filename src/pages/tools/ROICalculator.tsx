import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, DollarSign, Percent } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CurrencySelector } from '@/components/tools/CurrencySelector';
import { SliderInput } from '@/components/tools/SliderInput';
import { DubaiPresets, DUBAI_AREA_PRESETS, AreaPreset } from '@/components/tools/DubaiPresets';
import { ROICharts } from '@/components/tools/ROICharts';
import { FeeBreakdownCard } from '@/components/tools/FeeBreakdownCard';
import { CalculatorAIAnalysis } from '@/components/tools/CalculatorAIAnalysis';
import { useCurrencyConverter } from '@/hooks/useCurrencyConverter';
import { calculateAcquisitionCosts, DEFAULT_ACQUISITION_FEES, AREA_SERVICE_CHARGES } from '@/lib/dubaiRealEstateFees';
import { InvestmentDisclaimer } from '@/components/ui/disclaimers';
import { SEOHead } from '@/components/SEOHead';
import { PAGE_SEO, generateSoftwareApplicationSchema, SITE_CONFIG } from '@/lib/seo-config';

export default function ROICalculator() {
  const { selectedCurrency, setSelectedCurrency, formatCurrency, formatAED, supportedCurrencies } = useCurrencyConverter();
  const [activePreset, setActivePreset] = useState<string>();

  const [inputs, setInputs] = useState({
    purchasePrice: 2000000,
    downPayment: 25,
    propertySizeSqft: 1200,
    selectedArea: 'Dubai Marina',
    annualRent: 120000,
    annualAppreciation: 5,
    holdingPeriod: 5,
    vacancyRate: 5,
    // Detailed fees (can be customized)
    dldFeePercent: 4,
    agentCommission: 2,
    trusteeFee: 4410,
    nocFee: 1500,
    // Ongoing costs
    maintenancePercent: 1.5,
    insuranceAnnual: 2000,
    dewaMonthly: 800,
  });

  const handleChange = (field: string, value: number | string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
    if (field !== 'selectedArea') setActivePreset(undefined);
  };

  const handlePresetSelect = (preset: AreaPreset) => {
    setInputs(prev => ({
      ...prev,
      purchasePrice: preset.propertyPrice,
      annualRent: preset.annualRent || prev.annualRent,
      propertySizeSqft: preset.sizeSqft || prev.propertySizeSqft,
      selectedArea: preset.name,
    }));
    setActivePreset(preset.name);
  };

  // Get area-specific service charges
  const serviceChargePerSqft = AREA_SERVICE_CHARGES[inputs.selectedArea] || 15;
  const annualServiceCharges = inputs.propertySizeSqft * serviceChargePerSqft;

  // Calculate detailed acquisition costs
  const acquisitionCosts = calculateAcquisitionCosts(inputs.purchasePrice, {
    ...DEFAULT_ACQUISITION_FEES,
    dldRegistration: inputs.dldFeePercent,
    agentCommission: inputs.agentCommission,
    trusteeFee: inputs.trusteeFee,
    nocFee: inputs.nocFee,
  }, false);

  // Calculate total annual expenses
  const annualMaintenance = inputs.purchasePrice * (inputs.maintenancePercent / 100);
  const annualDewa = inputs.dewaMonthly * 12;
  const totalAnnualExpenses = annualServiceCharges + annualMaintenance + inputs.insuranceAnnual + annualDewa;

  // ROI Calculations
  const downPaymentAmount = inputs.purchasePrice * (inputs.downPayment / 100);
  const totalInitialInvestment = downPaymentAmount + acquisitionCosts.grandTotal;
  
  const effectiveRent = inputs.annualRent * (1 - inputs.vacancyRate / 100);
  const netRentalIncome = effectiveRent - totalAnnualExpenses;
  const grossYield = (inputs.annualRent / inputs.purchasePrice) * 100;
  const netYield = (netRentalIncome / inputs.purchasePrice) * 100;

  const futureValue = inputs.purchasePrice * Math.pow(1 + inputs.annualAppreciation / 100, inputs.holdingPeriod);
  const capitalGain = futureValue - inputs.purchasePrice;
  
  const totalRentalIncome = netRentalIncome * inputs.holdingPeriod;
  const totalReturn = capitalGain + totalRentalIncome;
  const totalROI = (totalReturn / totalInitialInvestment) * 100;
  const annualizedROI = (Math.pow(1 + totalReturn / totalInitialInvestment, 1 / inputs.holdingPeriod) - 1) * 100;
  const cashOnCash = (netRentalIncome / totalInitialInvestment) * 100;

  // Fee items for breakdown card
  const acquisitionFeeItems = [
    { label: 'DLD Registration (4%)', value: acquisitionCosts.dldFee, key: 'dldRegistration', category: 'acquisition' as const },
    { label: 'DLD Admin Fee', value: acquisitionCosts.dldAdminFee, key: 'dldAdminFee', category: 'acquisition' as const },
    { label: 'Agent Commission (2%)', value: acquisitionCosts.agentFee, key: 'agentCommission', category: 'acquisition' as const },
    { label: 'Trustee Fee', value: acquisitionCosts.trusteeFee, key: 'trusteeFee', category: 'acquisition' as const },
    { label: 'Title Deed Fee', value: acquisitionCosts.titleDeedFee, key: 'titleDeedFee', category: 'acquisition' as const },
    { label: 'Developer NOC', value: acquisitionCosts.nocFee, key: 'nocFee', category: 'acquisition' as const },
    { label: 'Valuation Fee', value: acquisitionCosts.valuationFee, key: 'valuationFee', category: 'acquisition' as const },
  ];

  const annualExpenseItems = [
    { label: `Service Charges (${serviceChargePerSqft} AED/sqft)`, value: annualServiceCharges, key: 'serviceCharges', category: 'ongoing' as const },
    { label: 'Maintenance Reserve', value: annualMaintenance, key: 'maintenance', category: 'ongoing' as const },
    { label: 'Home Insurance', value: inputs.insuranceAnnual, key: 'insurance', category: 'ongoing' as const },
    { label: 'DEWA (Est.)', value: annualDewa, key: 'dewa', category: 'ongoing' as const },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        {...PAGE_SEO.roiCalculator} 
        structuredData={generateSoftwareApplicationSchema({
          name: 'Dubai Property ROI Calculator',
          description: PAGE_SEO.roiCalculator.description,
          url: `${SITE_CONFIG.url}/tools/roi`,
        })}
      />
      <Navbar />

      <section className="pt-32 pb-8">
        <div className="container mx-auto px-4">
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
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                </div>
                <h1 className="font-heading text-3xl md:text-4xl text-foreground">
                  ROI Calculator
                </h1>
              </div>
              <p className="text-muted-foreground">
                Calculate your total return with all Dubai real estate fees included.
              </p>
              <InvestmentDisclaimer variant="inline" className="mt-2" />
            </motion.div>

            <CurrencySelector
              selectedCurrency={selectedCurrency}
              onCurrencyChange={setSelectedCurrency}
              supportedCurrencies={supportedCurrencies}
            />
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
              {/* Dubai Presets */}
              <div className="p-6 rounded-2xl bg-card border border-border">
                <DubaiPresets 
                  onSelectPreset={handlePresetSelect} 
                  activePreset={activePreset} 
                  showDetails={true}
                />
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border">
                <h2 className="font-heading text-xl text-foreground mb-6">Property Details</h2>
                
                <div className="space-y-6">
                  <SliderInput
                    label="Purchase Price (AED)"
                    value={inputs.purchasePrice}
                    onChange={(v) => handleChange('purchasePrice', v)}
                    min={500000}
                    max={20000000}
                    step={100000}
                    formatValue={(v) => formatAED(v)}
                  />

                  <div className="grid grid-cols-2 gap-6">
                    <SliderInput
                      label="Property Size"
                      value={inputs.propertySizeSqft}
                      onChange={(v) => handleChange('propertySizeSqft', v)}
                      min={400}
                      max={5000}
                      step={50}
                      suffix=" sqft"
                    />
                    <SliderInput
                      label="Down Payment"
                      value={inputs.downPayment}
                      onChange={(v) => handleChange('downPayment', v)}
                      min={10}
                      max={100}
                      suffix="%"
                    />
                  </div>
                </div>
              </div>

              {/* Fee Breakdown */}
              <div className="space-y-3">
                <FeeBreakdownCard
                  title="Acquisition Costs"
                  fees={acquisitionFeeItems}
                  total={acquisitionCosts.grandTotal}
                  formatValue={formatAED}
                  accentColor="blue-400"
                />
                <FeeBreakdownCard
                  title="Annual Expenses"
                  fees={annualExpenseItems}
                  total={totalAnnualExpenses}
                  formatValue={formatAED}
                  accentColor="amber-400"
                />
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border">
                <h2 className="font-heading text-xl text-foreground mb-6">Income & Timeline</h2>
                
                <div className="space-y-6">
                  <SliderInput
                    label="Annual Rent (AED)"
                    value={inputs.annualRent}
                    onChange={(v) => handleChange('annualRent', v)}
                    min={20000}
                    max={500000}
                    step={5000}
                    formatValue={(v) => formatAED(v)}
                  />

                  <div className="grid grid-cols-2 gap-6">
                    <SliderInput
                      label="Vacancy Rate"
                      value={inputs.vacancyRate}
                      onChange={(v) => handleChange('vacancyRate', v)}
                      min={0}
                      max={30}
                      suffix="%"
                    />
                    <SliderInput
                      label="Holding Period"
                      value={inputs.holdingPeriod}
                      onChange={(v) => handleChange('holdingPeriod', v)}
                      min={1}
                      max={30}
                      suffix=" yrs"
                    />
                  </div>

                  <SliderInput
                    label="Annual Appreciation"
                    value={inputs.annualAppreciation}
                    onChange={(v) => handleChange('annualAppreciation', v)}
                    min={0}
                    max={15}
                    step={0.5}
                    suffix="%"
                  />
                </div>
              </div>

              {/* Charts */}
              <ROICharts
                purchasePrice={inputs.purchasePrice}
                downPaymentAmount={downPaymentAmount}
                closingCostsAmount={acquisitionCosts.grandTotal}
                annualAppreciation={inputs.annualAppreciation}
                holdingPeriod={inputs.holdingPeriod}
                netRentalIncome={netRentalIncome}
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
              <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20">
                <h2 className="font-heading text-xl text-foreground mb-6">Key Returns</h2>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-4 rounded-xl bg-card/50">
                    <p className="text-sm text-muted-foreground mb-1">Total ROI</p>
                    <p className="font-heading text-3xl text-emerald-400">{totalROI.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">Over {inputs.holdingPeriod} years</p>
                  </div>
                  <div className="p-4 rounded-xl bg-card/50">
                    <p className="text-sm text-muted-foreground mb-1">Annualized ROI</p>
                    <p className="font-heading text-3xl text-emerald-400">{annualizedROI.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">Per year</p>
                  </div>
                </div>

                <CalculatorAIAnalysis
                  calculatorType="roi"
                  inputs={inputs}
                  results={{
                    grossYield,
                    netYield,
                    cashOnCash,
                    totalROI,
                    annualizedROI,
                    totalInitialInvestment,
                    netRentalIncome,
                    capitalGain,
                    futureValue,
                    totalReturn,
                  }}
                  area={inputs.selectedArea}
                  buttonText="Get AI Analysis"
                />
              </div>

              {/* Yield Analysis */}
              <div className="p-6 rounded-2xl bg-card border border-border">
                <h2 className="font-heading text-xl text-foreground mb-6">Yield Analysis</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Percent className="w-4 h-4" />
                      Gross Rental Yield
                    </span>
                    <span className="font-heading text-lg text-foreground">{grossYield.toFixed(2)}%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Percent className="w-4 h-4" />
                      Net Rental Yield
                    </span>
                    <span className="font-heading text-lg text-foreground">{netYield.toFixed(2)}%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Cash on Cash Return
                    </span>
                    <span className="font-heading text-lg text-foreground">{cashOnCash.toFixed(2)}%</span>
                  </div>
                </div>
              </div>

              {/* Total Investment Breakdown */}
              <div className="p-6 rounded-2xl bg-card border border-border">
                <h2 className="font-heading text-xl text-foreground mb-6">Total Initial Investment</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Down Payment ({inputs.downPayment}%)</span>
                    <div className="text-right">
                      <p className="font-medium text-foreground">{formatAED(downPaymentAmount)}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Acquisition Costs ({acquisitionCosts.percentageOfProperty.toFixed(1)}%)</span>
                    <div className="text-right">
                      <p className="font-medium text-foreground">{formatAED(acquisitionCosts.grandTotal)}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-3 bg-gold/10 rounded-lg px-3 -mx-3">
                    <span className="font-medium text-foreground">Total Cash Required</span>
                    <div className="text-right">
                      <p className="font-heading text-xl text-gold">{formatAED(totalInitialInvestment)}</p>
                      <p className="text-sm text-gold/80">{formatCurrency(totalInitialInvestment)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="p-6 rounded-2xl bg-card border border-border">
                <h2 className="font-heading text-xl text-foreground mb-6">Financial Projection</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Net Annual Rental Income</span>
                    <div className="text-right">
                      <p className="font-medium text-emerald-400">{formatAED(netRentalIncome)}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Total Rental ({inputs.holdingPeriod}yr)</span>
                    <div className="text-right">
                      <p className="font-medium text-foreground">{formatAED(totalRentalIncome)}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Capital Appreciation</span>
                    <div className="text-right">
                      <p className="font-medium text-foreground">{formatAED(capitalGain)}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Future Property Value</span>
                    <div className="text-right">
                      <p className="font-medium text-foreground">{formatAED(futureValue)}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-3 bg-emerald-500/10 rounded-lg px-3 -mx-3">
                    <span className="font-medium text-foreground">Total Return</span>
                    <div className="text-right">
                      <p className="font-heading text-xl text-emerald-400">{formatAED(totalReturn)}</p>
                      <p className="text-sm text-emerald-400/80">{formatCurrency(totalReturn)}</p>
                    </div>
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
