import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Home } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CurrencySelector } from '@/components/tools/CurrencySelector';
import { SliderInput } from '@/components/tools/SliderInput';
import { DubaiPresets, AreaPreset } from '@/components/tools/DubaiPresets';
import { MortgageCharts } from '@/components/tools/MortgageCharts';
import { useCurrencyConverter } from '@/hooks/useCurrencyConverter';

export default function MortgageCalculator() {
  const { selectedCurrency, setSelectedCurrency, formatCurrency, formatAED, supportedCurrencies } = useCurrencyConverter();
  const [activePreset, setActivePreset] = useState<string>();

  const [inputs, setInputs] = useState({
    propertyPrice: 2000000,
    downPayment: 25,
    interestRate: 4.5,
    loanTerm: 25,
    processingFee: 1,
  });

  const handleChange = (field: string, value: number) => {
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

  // Calculations
  const downPaymentAmount = inputs.propertyPrice * (inputs.downPayment / 100);
  const loanAmount = inputs.propertyPrice - downPaymentAmount;
  const processingFeeAmount = loanAmount * (inputs.processingFee / 100);
  
  const monthlyRate = inputs.interestRate / 100 / 12;
  const numPayments = inputs.loanTerm * 12;
  
  const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
  
  const totalPayment = monthlyPayment * numPayments;
  const totalInterest = totalPayment - loanAmount;
  const totalCost = totalPayment + downPaymentAmount + processingFeeAmount;

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

  return (
    <div className="min-h-screen bg-background">
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
                Calculate your monthly mortgage payments and total cost of financing.
              </p>
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
                <DubaiPresets onSelectPreset={handlePresetSelect} activePreset={activePreset} />
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
                    min={10}
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
                      max={30}
                      suffix=" yrs"
                    />
                  </div>

                  <SliderInput
                    label="Processing Fee"
                    value={inputs.processingFee}
                    onChange={(v) => handleChange('processingFee', v)}
                    min={0}
                    max={3}
                    step={0.1}
                    suffix="%"
                  />
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
                  <p className="text-lg text-muted-foreground">{formatCurrency(monthlyPayment)}</p>
                </div>
              </div>

              {/* Loan Summary */}
              <div className="p-6 rounded-2xl bg-card border border-border">
                <h2 className="font-heading text-xl text-foreground mb-6">Loan Summary</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Loan Amount</span>
                    <div className="text-right">
                      <p className="font-medium text-foreground">{formatAED(loanAmount)}</p>
                      <p className="text-xs text-muted-foreground">{formatCurrency(loanAmount)}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Down Payment</span>
                    <div className="text-right">
                      <p className="font-medium text-foreground">{formatAED(downPaymentAmount)}</p>
                      <p className="text-xs text-muted-foreground">{formatCurrency(downPaymentAmount)}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Processing Fee</span>
                    <div className="text-right">
                      <p className="font-medium text-foreground">{formatAED(processingFeeAmount)}</p>
                      <p className="text-xs text-muted-foreground">{formatCurrency(processingFeeAmount)}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Total Interest Paid</span>
                    <div className="text-right">
                      <p className="font-medium text-orange-400">{formatAED(totalInterest)}</p>
                      <p className="text-xs text-muted-foreground">{formatCurrency(totalInterest)}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-3 bg-gold/10 rounded-lg px-3 -mx-3">
                    <span className="font-medium text-foreground">Total Cost of Ownership</span>
                    <div className="text-right">
                      <p className="font-heading text-xl text-gold">{formatAED(totalCost)}</p>
                      <p className="text-sm text-gold/80">{formatCurrency(totalCost)}</p>
                    </div>
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
