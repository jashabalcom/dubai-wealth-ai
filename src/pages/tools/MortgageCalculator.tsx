import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Home, AlertCircle } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CurrencySelector } from '@/components/tools/CurrencySelector';
import { SliderInput } from '@/components/tools/SliderInput';
import { DubaiPresets, AreaPreset } from '@/components/tools/DubaiPresets';
import { MortgageCharts } from '@/components/tools/MortgageCharts';
import { FeeBreakdownCard } from '@/components/tools/FeeBreakdownCard';
import { CalculatorAIAnalysis } from '@/components/tools/CalculatorAIAnalysis';
import { useCurrencyConverter } from '@/hooks/useCurrencyConverter';
import { calculateAcquisitionCosts, DEFAULT_MORTGAGE_FEES } from '@/lib/dubaiRealEstateFees';
import { InvestmentDisclaimer } from '@/components/ui/disclaimers';
import { SEOHead } from '@/components/SEOHead';
import { PAGE_SEO, generateSoftwareApplicationSchema, SITE_CONFIG } from '@/lib/seo-config';

export default function MortgageCalculator() {
  const { selectedCurrency, setSelectedCurrency, formatCurrency, formatAED, supportedCurrencies } = useCurrencyConverter();
  const [activePreset, setActivePreset] = useState<string>();

  const [inputs, setInputs] = useState({
    propertyPrice: 2000000,
    downPayment: 25,
    interestRate: 4.5,
    loanTerm: 25,
    // All mortgage fees
    bankProcessingFee: 1,
    mortgageRegistration: 0.25,
    bankValuation: 3000,
    lifeInsuranceRate: 0.5,
    propertyInsuranceRate: 0.1,
    includeLifeInsurance: true,
  });

  const handleChange = (field: string, value: number | boolean) => {
    setInputs(prev => ({ ...prev, [field]: value }));
    setActivePreset(undefined);
  };

  const handlePresetSelect = (preset: AreaPreset) => {
    setInputs(prev => ({
      ...prev,
      propertyPrice: preset.propertyPrice,
    }));
    setActivePreset(preset.name);
  };

  // Calculate base amounts
  const downPaymentAmount = inputs.propertyPrice * (inputs.downPayment / 100);
  const loanAmount = inputs.propertyPrice - downPaymentAmount;
  
  // Calculate all mortgage-related fees
  const bankProcessingFeeAmount = loanAmount * (inputs.bankProcessingFee / 100);
  const mortgageRegistrationFee = loanAmount * (inputs.mortgageRegistration / 100);
  const mortgageAdminFee = DEFAULT_MORTGAGE_FEES.mortgageAdminFee; // Fixed AED 290
  const bankValuationFee = inputs.bankValuation;
  
  // Calculate acquisition costs (DLD, agent, etc.)
  const acquisitionCosts = calculateAcquisitionCosts(inputs.propertyPrice, undefined, true, loanAmount);
  
  // Annual insurance costs
  const annualLifeInsurance = inputs.includeLifeInsurance ? loanAmount * (inputs.lifeInsuranceRate / 100) : 0;
  const annualPropertyInsurance = inputs.propertyPrice * (inputs.propertyInsuranceRate / 100);

  // Monthly payment calculation
  const monthlyRate = inputs.interestRate / 100 / 12;
  const numPayments = inputs.loanTerm * 12;
  const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
  
  // Total costs
  const totalMortgageFees = bankProcessingFeeAmount + mortgageRegistrationFee + mortgageAdminFee + bankValuationFee;
  const totalPayment = monthlyPayment * numPayments;
  const totalInterest = totalPayment - loanAmount;
  const totalInsuranceCost = (annualLifeInsurance + annualPropertyInsurance) * inputs.loanTerm;
  const totalCostOfOwnership = totalPayment + downPaymentAmount + acquisitionCosts.totalBaseCosts + totalMortgageFees + totalInsuranceCost;

  // Early settlement cost (1% of outstanding at year 5 as example)
  const year5Balance = loanAmount * Math.pow(1 + monthlyRate, 60) - monthlyPayment * ((Math.pow(1 + monthlyRate, 60) - 1) / monthlyRate);
  const earlySettlementPenalty = Math.max(0, year5Balance) * 0.01;

  const generateSchedule = () => {
    const schedule = [];
    let balance = loanAmount;
    
    for (let month = 1; month <= 12; month++) {
      const interest = balance * monthlyRate;
      const principal = monthlyPayment - interest;
      balance -= principal;
      
      schedule.push({
        month,
        payment: monthlyPayment,
        principal,
        interest,
        balance: Math.max(0, balance),
      });
    }
    
    return schedule;
  };

  const schedule = generateSchedule();

  // Fee items for breakdown
  const mortgageFeeItems = [
    { label: `Bank Processing (${inputs.bankProcessingFee}%)`, value: bankProcessingFeeAmount, key: 'bankProcessing', category: 'mortgage' as const },
    { label: `Mortgage Registration (${inputs.mortgageRegistration}%)`, value: mortgageRegistrationFee, key: 'mortgageRegistration', category: 'mortgage' as const },
    { label: 'Mortgage Admin Fee', value: mortgageAdminFee, key: 'mortgageAdminFee', category: 'mortgage' as const },
    { label: 'Bank Valuation', value: bankValuationFee, key: 'bankValuation', category: 'mortgage' as const },
  ];

  const acquisitionFeeItems = [
    { label: 'DLD Registration (4%)', value: acquisitionCosts.dldFee, key: 'dldRegistration', category: 'acquisition' as const },
    { label: 'DLD Admin Fee', value: acquisitionCosts.dldAdminFee, key: 'dldAdminFee', category: 'acquisition' as const },
    { label: 'Agent Commission (2%)', value: acquisitionCosts.agentFee, key: 'agentCommission', category: 'acquisition' as const },
    { label: 'Trustee Fee', value: acquisitionCosts.trusteeFee, key: 'trusteeFee', category: 'acquisition' as const },
    { label: 'Title Deed Fee', value: acquisitionCosts.titleDeedFee, key: 'titleDeedFee', category: 'acquisition' as const },
    { label: 'Developer NOC', value: acquisitionCosts.nocFee, key: 'nocFee', category: 'acquisition' as const },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        {...PAGE_SEO.mortgageCalculator} 
        structuredData={generateSoftwareApplicationSchema({
          name: 'Dubai Mortgage Calculator',
          description: PAGE_SEO.mortgageCalculator.description,
          url: `${SITE_CONFIG.url}/tools/mortgage`,
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
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Home className="w-5 h-5 text-blue-500" />
                </div>
                <h1 className="font-heading text-3xl md:text-4xl text-foreground">
                  Mortgage Calculator
                </h1>
              </div>
              <p className="text-muted-foreground">
                Calculate your true cost of financing with all Dubai mortgage fees.
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
                <DubaiPresets onSelectPreset={handlePresetSelect} activePreset={activePreset} showDetails />
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border">
                <h2 className="font-heading text-xl text-foreground mb-6">Loan Details</h2>
                
                <div className="space-y-6">
                  <SliderInput
                    label="Property Price (AED)"
                    value={inputs.propertyPrice}
                    onChange={(v) => handleChange('propertyPrice', v)}
                    min={500000}
                    max={20000000}
                    step={100000}
                    formatValue={(v) => formatAED(v)}
                  />

                  <SliderInput
                    label="Down Payment"
                    value={inputs.downPayment}
                    onChange={(v) => handleChange('downPayment', v)}
                    min={20}
                    max={80}
                    suffix="%"
                  />

                  <div className="grid grid-cols-2 gap-6">
                    <SliderInput
                      label="Interest Rate"
                      value={inputs.interestRate}
                      onChange={(v) => handleChange('interestRate', v)}
                      min={2}
                      max={10}
                      step={0.1}
                      suffix="%"
                    />
                    <SliderInput
                      label="Loan Term"
                      value={inputs.loanTerm}
                      onChange={(v) => handleChange('loanTerm', v)}
                      min={5}
                      max={25}
                      suffix=" yrs"
                    />
                  </div>
                </div>
              </div>

              {/* Fee Breakdowns */}
              <div className="space-y-3">
                <FeeBreakdownCard
                  title="Mortgage Fees"
                  fees={mortgageFeeItems}
                  total={totalMortgageFees}
                  formatValue={formatAED}
                  accentColor="purple-400"
                />
                <FeeBreakdownCard
                  title="Acquisition Costs"
                  fees={acquisitionFeeItems}
                  total={acquisitionCosts.totalBaseCosts}
                  formatValue={formatAED}
                  accentColor="blue-400"
                />
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border">
                <h2 className="font-heading text-xl text-foreground mb-6">Insurance & Fees</h2>
                
                <div className="space-y-6">
                  <SliderInput
                    label="Bank Processing Fee"
                    value={inputs.bankProcessingFee}
                    onChange={(v) => handleChange('bankProcessingFee', v)}
                    min={0.5}
                    max={2}
                    step={0.1}
                    suffix="%"
                  />

                  <div className="grid grid-cols-2 gap-6">
                    <SliderInput
                      label="Life Insurance"
                      value={inputs.lifeInsuranceRate}
                      onChange={(v) => handleChange('lifeInsuranceRate', v)}
                      min={0.3}
                      max={1}
                      step={0.05}
                      suffix="%/yr"
                    />
                    <SliderInput
                      label="Property Insurance"
                      value={inputs.propertyInsuranceRate}
                      onChange={(v) => handleChange('propertyInsuranceRate', v)}
                      min={0.05}
                      max={0.3}
                      step={0.01}
                      suffix="%/yr"
                    />
                  </div>
                </div>
              </div>

              {/* Charts */}
              <MortgageCharts
                loanAmount={loanAmount}
                totalInterest={totalInterest}
                downPaymentAmount={downPaymentAmount}
                schedule={schedule}
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
              {/* Monthly Payment */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/20">
                <h2 className="font-heading text-xl text-foreground mb-4">Monthly Payment</h2>
                
                <div className="text-center py-4">
                  <p className="font-heading text-4xl md:text-5xl text-blue-400 mb-2">
                    {formatAED(monthlyPayment)}
                  </p>
                  <p className="text-lg text-muted-foreground mb-4">{formatCurrency(monthlyPayment)}</p>
                  
                  <CalculatorAIAnalysis
                    calculatorType="mortgage"
                    inputs={inputs}
                    results={{
                      downPaymentAmount,
                      loanAmount,
                      monthlyPayment,
                      totalInterest,
                      totalMortgageFees,
                      totalUpfront: downPaymentAmount + acquisitionCosts.totalBaseCosts + totalMortgageFees,
                      totalCostOfOwnership,
                    }}
                    buttonText="Explain My Options"
                  />
                </div>
              </div>

              {/* Upfront Costs Summary */}
              <div className="p-6 rounded-2xl bg-card border border-border">
                <h2 className="font-heading text-xl text-foreground mb-6">Upfront Cash Required</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Down Payment ({inputs.downPayment}%)</span>
                    <span className="font-medium text-foreground">{formatAED(downPaymentAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Acquisition Costs</span>
                    <span className="font-medium text-foreground">{formatAED(acquisitionCosts.totalBaseCosts)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Mortgage Fees</span>
                    <span className="font-medium text-foreground">{formatAED(totalMortgageFees)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 bg-gold/10 rounded-lg px-3 -mx-3">
                    <span className="font-medium text-foreground">Total Upfront</span>
                    <div className="text-right">
                      <p className="font-heading text-xl text-gold">{formatAED(downPaymentAmount + acquisitionCosts.totalBaseCosts + totalMortgageFees)}</p>
                      <p className="text-sm text-gold/80">{formatCurrency(downPaymentAmount + acquisitionCosts.totalBaseCosts + totalMortgageFees)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* True Cost of Mortgage */}
              <div className="p-6 rounded-2xl bg-card border border-border">
                <h2 className="font-heading text-xl text-foreground mb-6">True Cost of Ownership ({inputs.loanTerm} yrs)</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Principal Repaid</span>
                    <span className="font-medium text-emerald-400">{formatAED(loanAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Total Interest Paid</span>
                    <span className="font-medium text-orange-400">{formatAED(totalInterest)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Total Insurance ({inputs.loanTerm}yr)</span>
                    <span className="font-medium text-foreground">{formatAED(totalInsuranceCost)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">All Fees & Costs</span>
                    <span className="font-medium text-foreground">{formatAED(acquisitionCosts.totalBaseCosts + totalMortgageFees)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 bg-blue-500/10 rounded-lg px-3 -mx-3">
                    <span className="font-medium text-foreground">Total Cost</span>
                    <div className="text-right">
                      <p className="font-heading text-xl text-blue-400">{formatAED(totalCostOfOwnership)}</p>
                      <p className="text-sm text-blue-400/80">{formatCurrency(totalCostOfOwnership)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Early Settlement Info */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground text-sm">Early Settlement Penalty</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      If you pay off your mortgage early (e.g., after 5 years), expect a penalty of ~1% of outstanding balance. 
                      Estimated: {formatAED(earlySettlementPenalty)} at year 5.
                    </p>
                  </div>
                </div>
              </div>

              {/* First Year Schedule */}
              <div className="p-6 rounded-2xl bg-card border border-border">
                <h2 className="font-heading text-xl text-foreground mb-6">First Year Schedule</h2>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 text-muted-foreground font-normal">Month</th>
                        <th className="text-right py-2 text-muted-foreground font-normal">Principal</th>
                        <th className="text-right py-2 text-muted-foreground font-normal">Interest</th>
                        <th className="text-right py-2 text-muted-foreground font-normal">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schedule.map((row) => (
                        <tr key={row.month} className="border-b border-border/50">
                          <td className="py-2">{row.month}</td>
                          <td className="text-right py-2 text-emerald-400">
                            {formatAED(row.principal)}
                          </td>
                          <td className="text-right py-2 text-orange-400">
                            {formatAED(row.interest)}
                          </td>
                          <td className="text-right py-2">
                            {formatAED(row.balance)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment Breakdown */}
              <div className="p-6 rounded-2xl bg-card border border-border">
                <h2 className="font-heading text-xl text-foreground mb-6">Payment Breakdown</h2>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Principal</span>
                      <span className="text-sm font-medium">{((loanAmount / totalPayment) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${(loanAmount / totalPayment) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Interest</span>
                      <span className="text-sm font-medium">{((totalInterest / totalPayment) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-orange-500 rounded-full"
                        style={{ width: `${(totalInterest / totalPayment) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">
                    Over {inputs.loanTerm} years, you'll pay {formatAED(totalInterest)} in interest, 
                    which is {((totalInterest / loanAmount) * 100).toFixed(1)}% of your loan amount.
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
