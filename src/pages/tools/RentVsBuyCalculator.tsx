import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Building2, Home, Info } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CurrencySelector } from '@/components/tools/CurrencySelector';
import { SliderInput } from '@/components/tools/SliderInput';
import { DubaiPresets, AreaPreset } from '@/components/tools/DubaiPresets';
import { RentVsBuyCharts } from '@/components/tools/RentVsBuyCharts';
import { FeeBreakdownCard } from '@/components/tools/FeeBreakdownCard';
import { useCurrencyConverter } from '@/hooks/useCurrencyConverter';
import { calculateAcquisitionCosts, AREA_SERVICE_CHARGES, DEFAULT_RENTAL_COSTS } from '@/lib/dubaiRealEstateFees';
import { InvestmentDisclaimer } from '@/components/ui/disclaimers';

export default function RentVsBuyCalculator() {
  const { selectedCurrency, setSelectedCurrency, formatCurrency, formatAED, supportedCurrencies } = useCurrencyConverter();
  const [activePreset, setActivePreset] = useState<string>();

  const [inputs, setInputs] = useState({
    propertyPrice: 2000000,
    propertySizeSqft: 1200,
    selectedArea: 'Dubai Marina',
    downPayment: 25,
    interestRate: 4.5,
    loanTerm: 25,
    monthlyRent: 10000,
    rentIncrease: 5,
    propertyAppreciation: 5,
    maintenancePercent: 1.5,
    investmentReturn: 7,
    yearsToCompare: 10,
    // Renting costs
    agentFeePercent: 5,
    ejariRegistration: DEFAULT_RENTAL_COSTS.ejariRegistration,
  });

  const handleChange = (field: string, value: number | string) => { 
    setInputs(prev => ({ ...prev, [field]: value })); 
    if (field !== 'selectedArea') setActivePreset(undefined); 
  };

  const handlePresetSelect = (preset: AreaPreset) => { 
    setInputs(prev => ({ 
      ...prev, 
      propertyPrice: preset.propertyPrice, 
      monthlyRent: preset.monthlyRent || prev.monthlyRent,
      propertySizeSqft: preset.sizeSqft || prev.propertySizeSqft,
      selectedArea: preset.name,
    })); 
    setActivePreset(preset.name); 
  };

  // Area-specific service charges
  const serviceChargeRate = AREA_SERVICE_CHARGES[inputs.selectedArea] || 15;
  const annualServiceCharges = inputs.propertySizeSqft * serviceChargeRate;

  // Calculate all acquisition costs
  const acquisitionCosts = calculateAcquisitionCosts(inputs.propertyPrice);
  
  // Calculate loan details
  const downPaymentAmount = inputs.propertyPrice * (inputs.downPayment / 100);
  const loanAmount = inputs.propertyPrice - downPaymentAmount;
  const totalUpfront = downPaymentAmount + acquisitionCosts.grandTotal;
  
  const monthlyRate = inputs.interestRate / 100 / 12;
  const numPayments = inputs.loanTerm * 12;
  const monthlyMortgage = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);

  // Annual maintenance costs
  const annualMaintenance = inputs.propertyPrice * (inputs.maintenancePercent / 100);

  // Renting costs
  const annualRent = inputs.monthlyRent * 12;
  const agentFee = annualRent * (inputs.agentFeePercent / 100);

  // Calculate totals over comparison period
  let totalBuyingCost = totalUpfront;
  let totalRentingCost = agentFee + inputs.ejariRegistration;
  let currentRent = inputs.monthlyRent;
  let propertyValue = inputs.propertyPrice;
  let investmentValue = totalUpfront;
  let remainingLoan = loanAmount;
  let currentPropertyValue = inputs.propertyPrice;
  let currentServiceCharges = annualServiceCharges;

  for (let year = 1; year <= inputs.yearsToCompare; year++) {
    // Buying costs: mortgage + maintenance + service charges
    totalBuyingCost += monthlyMortgage * 12 + annualMaintenance + currentServiceCharges;
    
    // Property appreciates
    currentPropertyValue *= (1 + inputs.propertyAppreciation / 100);
    
    // Service charges typically increase ~3% per year
    currentServiceCharges *= 1.03;
    
    // Loan principal reduction
    const yearlyInterest = remainingLoan * (inputs.interestRate / 100);
    remainingLoan = Math.max(0, remainingLoan - (monthlyMortgage * 12 - yearlyInterest));
    
    // Renting costs: rent (increasing each year) + agent fee every year
    totalRentingCost += currentRent * 12;
    currentRent *= (1 + inputs.rentIncrease / 100);
    
    // Investment grows
    investmentValue *= (1 + inputs.investmentReturn / 100);
  }

  propertyValue = currentPropertyValue;
  const equityBuilt = propertyValue - remainingLoan;
  const netBuyingPosition = equityBuilt - totalBuyingCost;
  const netRentingPosition = investmentValue - totalRentingCost;
  const buyingAdvantage = netBuyingPosition - netRentingPosition;
  const buyingIsBetter = buyingAdvantage > 0;

  // Fee items for breakdown
  const buyingFeeItems = [
    { label: 'DLD Registration (4%)', value: acquisitionCosts.dldFee, key: 'dldRegistration', category: 'acquisition' as const },
    { label: 'Agent Commission (2%)', value: acquisitionCosts.agentFee, key: 'agentCommission', category: 'acquisition' as const },
    { label: 'Trustee Fee', value: acquisitionCosts.trusteeFee, key: 'trusteeFee', category: 'acquisition' as const },
    { label: 'Other Fees', value: acquisitionCosts.dldAdminFee + acquisitionCosts.titleDeedFee + acquisitionCosts.nocFee, key: 'otherFees', category: 'acquisition' as const },
  ];

  const annualBuyingCostItems = [
    { label: 'Mortgage Payments', value: monthlyMortgage * 12, key: 'mortgage', category: 'ongoing' as const },
    { label: `Service Charges (${serviceChargeRate} AED/sqft)`, value: annualServiceCharges, key: 'serviceCharges', category: 'ongoing' as const },
    { label: `Maintenance (${inputs.maintenancePercent}%)`, value: annualMaintenance, key: 'maintenance', category: 'ongoing' as const },
  ];

  const rentingCostItems = [
    { label: 'Annual Rent', value: annualRent, key: 'rent', category: 'ongoing' as const },
    { label: `Agent Fee (${inputs.agentFeePercent}%)`, value: agentFee, key: 'agentFee', category: 'acquisition' as const },
    { label: 'Ejari Registration', value: inputs.ejariRegistration, key: 'ejariRegistration', category: 'acquisition' as const },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-32 pb-8">
        <div className="container mx-auto px-4">
          <Link to="/tools" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Tools
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-purple-500" />
                </div>
                <h1 className="font-heading text-3xl md:text-4xl text-foreground">Rent vs Buy Calculator</h1>
              </div>
              <p className="text-muted-foreground">Compare with all Dubai fees included.</p>
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
              <div className="p-6 rounded-2xl bg-card border border-border">
                <DubaiPresets onSelectPreset={handlePresetSelect} activePreset={activePreset} showDetails />
              </div>
              
              <div className="p-6 rounded-2xl bg-card border border-border space-y-6">
                <h2 className="font-heading text-xl text-foreground">Property Details</h2>
                <SliderInput label="Property Price" value={inputs.propertyPrice} onChange={(v) => handleChange('propertyPrice', v)} min={500000} max={15000000} step={100000} formatValue={formatAED} />
                <div className="grid grid-cols-2 gap-6">
                  <SliderInput label="Size" value={inputs.propertySizeSqft} onChange={(v) => handleChange('propertySizeSqft', v)} min={400} max={4000} step={50} suffix=" sqft" />
                  <SliderInput label="Down Payment" value={inputs.downPayment} onChange={(v) => handleChange('downPayment', v)} min={20} max={80} suffix="%" />
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border space-y-6">
                <h2 className="font-heading text-xl text-foreground">Rental Comparison</h2>
                <SliderInput label="Monthly Rent" value={inputs.monthlyRent} onChange={(v) => handleChange('monthlyRent', v)} min={3000} max={50000} step={500} formatValue={formatAED} />
                <SliderInput label="Annual Rent Increase" value={inputs.rentIncrease} onChange={(v) => handleChange('rentIncrease', v)} min={0} max={10} step={0.5} suffix="%" />
              </div>

              {/* Fee Breakdowns */}
              <div className="space-y-3">
                <FeeBreakdownCard
                  title="Buying: Upfront Costs"
                  fees={buyingFeeItems}
                  total={acquisitionCosts.grandTotal}
                  formatValue={formatAED}
                  accentColor="emerald-400"
                />
                <FeeBreakdownCard
                  title="Buying: Annual Costs"
                  fees={annualBuyingCostItems}
                  total={monthlyMortgage * 12 + annualServiceCharges + annualMaintenance}
                  formatValue={formatAED}
                  accentColor="emerald-400"
                />
                <FeeBreakdownCard
                  title="Renting: Annual Costs"
                  fees={rentingCostItems}
                  total={annualRent + agentFee + inputs.ejariRegistration}
                  formatValue={formatAED}
                  accentColor="orange-400"
                />
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border space-y-6">
                <h2 className="font-heading text-xl text-foreground">Assumptions</h2>
                <SliderInput label="Property Appreciation" value={inputs.propertyAppreciation} onChange={(v) => handleChange('propertyAppreciation', v)} min={0} max={15} step={0.5} suffix="%/yr" />
                <SliderInput label="Investment Return (if renting)" value={inputs.investmentReturn} onChange={(v) => handleChange('investmentReturn', v)} min={0} max={15} step={0.5} suffix="%/yr" />
                <SliderInput label="Compare Over" value={inputs.yearsToCompare} onChange={(v) => handleChange('yearsToCompare', v)} min={3} max={30} suffix=" years" />
              </div>
              
              <RentVsBuyCharts 
                propertyPrice={inputs.propertyPrice} 
                yearsToCompare={inputs.yearsToCompare} 
                propertyAppreciation={inputs.propertyAppreciation} 
                investmentReturn={inputs.investmentReturn} 
                monthlyMortgage={monthlyMortgage} 
                monthlyRent={inputs.monthlyRent} 
                rentIncrease={inputs.rentIncrease} 
                serviceCharges={annualServiceCharges} 
                maintenanceCosts={inputs.maintenancePercent} 
                totalUpfront={totalUpfront} 
                formatAED={formatAED} 
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="space-y-6">
              <div className={`p-6 rounded-2xl border ${buyingIsBetter ? 'bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/20' : 'bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent border-orange-500/20'}`}>
                <div className="flex items-center gap-3 mb-4">
                  {buyingIsBetter ? <Home className="w-8 h-8 text-emerald-500" /> : <Building2 className="w-8 h-8 text-orange-500" />}
                  <div>
                    <h2 className="font-heading text-xl text-foreground">{buyingIsBetter ? 'Buying is Better' : 'Renting is Better'}</h2>
                    <p className="text-sm text-muted-foreground">Over {inputs.yearsToCompare} years</p>
                  </div>
                </div>
                <p className={`font-heading text-3xl ${buyingIsBetter ? 'text-emerald-400' : 'text-orange-400'}`}>
                  {formatAED(Math.abs(buyingAdvantage))} advantage
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-card border border-emerald-500/20">
                  <div className="flex items-center gap-2 mb-4">
                    <Home className="w-5 h-5 text-emerald-500" />
                    <h3 className="font-heading text-lg">Buying</h3>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Cash Required</p>
                      <p className="font-medium">{formatAED(totalUpfront)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Cost ({inputs.yearsToCompare}yr)</p>
                      <p className="font-medium">{formatAED(totalBuyingCost)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Property Value</p>
                      <p className="font-medium text-emerald-400">{formatAED(propertyValue)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Equity Built</p>
                      <p className="font-medium text-emerald-400">{formatAED(equityBuilt)}</p>
                    </div>
                    <div className="pt-2 border-t border-border">
                      <p className="text-muted-foreground">Net Position</p>
                      <p className="font-heading text-xl text-emerald-400">{formatAED(netBuyingPosition)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 rounded-2xl bg-card border border-orange-500/20">
                  <div className="flex items-center gap-2 mb-4">
                    <Building2 className="w-5 h-5 text-orange-500" />
                    <h3 className="font-heading text-lg">Renting</h3>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Initial Investment</p>
                      <p className="font-medium">{formatAED(totalUpfront)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Rent ({inputs.yearsToCompare}yr)</p>
                      <p className="font-medium">{formatAED(totalRentingCost)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Investment Value</p>
                      <p className="font-medium text-orange-400">{formatAED(investmentValue)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Investment Return</p>
                      <p className="font-medium text-orange-400">{inputs.investmentReturn}% per year</p>
                    </div>
                    <div className="pt-2 border-t border-border">
                      <p className="text-muted-foreground">Net Position</p>
                      <p className="font-heading text-xl text-orange-400">{formatAED(netRentingPosition)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <div className="flex gap-3">
                  <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground text-sm">How This Compares</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      <strong>Buying:</strong> Includes all Dubai fees (DLD 4%, agent 2%, trustee, NOC), mortgage payments, service charges ({serviceChargeRate} AED/sqft), and maintenance. Property appreciates at {inputs.propertyAppreciation}%/year.
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      <strong>Renting:</strong> Includes rent (increasing {inputs.rentIncrease}%/year), agent fees, and Ejari. The down payment amount is invested at {inputs.investmentReturn}%/year instead.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border">
                <h2 className="font-heading text-xl text-foreground mb-6">Year {inputs.yearsToCompare} Snapshot</h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Your Property Equity</span>
                      <span className="text-sm font-medium text-emerald-400">{formatAED(equityBuilt)}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${Math.min(100, (equityBuilt / propertyValue) * 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Remaining mortgage: {formatAED(remainingLoan)}
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Invested Capital (if renting)</span>
                      <span className="text-sm font-medium text-orange-400">{formatAED(investmentValue)}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-orange-500 rounded-full"
                        style={{ width: `${Math.min(100, (investmentValue / propertyValue) * 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Total rent paid: {formatAED(totalRentingCost)}
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
