import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, DollarSign, Percent, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CurrencySelector } from '@/components/tools/CurrencySelector';
import { useCurrencyConverter } from '@/hooks/useCurrencyConverter';

export default function ROICalculator() {
  const { selectedCurrency, setSelectedCurrency, formatCurrency, formatAED, supportedCurrencies } = useCurrencyConverter();

  const [inputs, setInputs] = useState({
    purchasePrice: 2000000,
    downPayment: 25,
    closingCosts: 8, // DLD 4% + agent 2% + other 2%
    annualRent: 120000,
    annualAppreciation: 5,
    holdingPeriod: 5,
    annualExpenses: 15000, // service charges, maintenance
    vacancyRate: 5,
  });

  const handleChange = (field: string, value: number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  // Calculations
  const downPaymentAmount = inputs.purchasePrice * (inputs.downPayment / 100);
  const closingCostsAmount = inputs.purchasePrice * (inputs.closingCosts / 100);
  const totalInitialInvestment = downPaymentAmount + closingCostsAmount;
  
  const effectiveRent = inputs.annualRent * (1 - inputs.vacancyRate / 100);
  const netRentalIncome = effectiveRent - inputs.annualExpenses;
  const grossYield = (inputs.annualRent / inputs.purchasePrice) * 100;
  const netYield = (netRentalIncome / inputs.purchasePrice) * 100;

  // Future value with appreciation
  const futureValue = inputs.purchasePrice * Math.pow(1 + inputs.annualAppreciation / 100, inputs.holdingPeriod);
  const capitalGain = futureValue - inputs.purchasePrice;
  
  // Total returns over holding period
  const totalRentalIncome = netRentalIncome * inputs.holdingPeriod;
  const totalReturn = capitalGain + totalRentalIncome;
  const totalROI = (totalReturn / totalInitialInvestment) * 100;
  const annualizedROI = (Math.pow(1 + totalReturn / totalInitialInvestment, 1 / inputs.holdingPeriod) - 1) * 100;

  // Cash on Cash return (first year)
  const cashOnCash = (netRentalIncome / totalInitialInvestment) * 100;

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
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                </div>
                <h1 className="font-heading text-3xl md:text-4xl text-foreground">
                  ROI Calculator
                </h1>
              </div>
              <p className="text-muted-foreground">
                Calculate your total return on investment including rental yield and capital appreciation.
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
              <div className="p-6 rounded-2xl bg-card border border-border">
                <h2 className="font-heading text-xl text-foreground mb-6">Property Details</h2>
                
                <div className="space-y-4">
                  <div>
                    <Label>Purchase Price (AED)</Label>
                    <Input
                      type="number"
                      value={inputs.purchasePrice}
                      onChange={(e) => handleChange('purchasePrice', Number(e.target.value))}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">{formatCurrency(inputs.purchasePrice)}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Down Payment (%)</Label>
                      <Input
                        type="number"
                        value={inputs.downPayment}
                        onChange={(e) => handleChange('downPayment', Number(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Closing Costs (%)</Label>
                      <Input
                        type="number"
                        value={inputs.closingCosts}
                        onChange={(e) => handleChange('closingCosts', Number(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border">
                <h2 className="font-heading text-xl text-foreground mb-6">Income & Expenses</h2>
                
                <div className="space-y-4">
                  <div>
                    <Label>Annual Rent (AED)</Label>
                    <Input
                      type="number"
                      value={inputs.annualRent}
                      onChange={(e) => handleChange('annualRent', Number(e.target.value))}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">{formatCurrency(inputs.annualRent)}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Annual Expenses (AED)</Label>
                      <Input
                        type="number"
                        value={inputs.annualExpenses}
                        onChange={(e) => handleChange('annualExpenses', Number(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Vacancy Rate (%)</Label>
                      <Input
                        type="number"
                        value={inputs.vacancyRate}
                        onChange={(e) => handleChange('vacancyRate', Number(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border">
                <h2 className="font-heading text-xl text-foreground mb-6">Investment Timeline</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Holding Period (Years)</Label>
                    <Input
                      type="number"
                      value={inputs.holdingPeriod}
                      onChange={(e) => handleChange('holdingPeriod', Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Annual Appreciation (%)</Label>
                    <Input
                      type="number"
                      value={inputs.annualAppreciation}
                      onChange={(e) => handleChange('annualAppreciation', Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
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
                
                <div className="grid grid-cols-2 gap-4">
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

              {/* Financial Summary */}
              <div className="p-6 rounded-2xl bg-card border border-border">
                <h2 className="font-heading text-xl text-foreground mb-6">Financial Summary</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Initial Investment</span>
                    <div className="text-right">
                      <p className="font-medium text-foreground">{formatAED(totalInitialInvestment)}</p>
                      <p className="text-xs text-muted-foreground">{formatCurrency(totalInitialInvestment)}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Total Rental Income ({inputs.holdingPeriod}yr)</span>
                    <div className="text-right">
                      <p className="font-medium text-foreground">{formatAED(totalRentalIncome)}</p>
                      <p className="text-xs text-muted-foreground">{formatCurrency(totalRentalIncome)}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Capital Appreciation</span>
                    <div className="text-right">
                      <p className="font-medium text-foreground">{formatAED(capitalGain)}</p>
                      <p className="text-xs text-muted-foreground">{formatCurrency(capitalGain)}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Future Property Value</span>
                    <div className="text-right">
                      <p className="font-medium text-foreground">{formatAED(futureValue)}</p>
                      <p className="text-xs text-muted-foreground">{formatCurrency(futureValue)}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-3 bg-gold/10 rounded-lg px-3 -mx-3">
                    <span className="font-medium text-foreground">Total Return</span>
                    <div className="text-right">
                      <p className="font-heading text-xl text-gold">{formatAED(totalReturn)}</p>
                      <p className="text-sm text-gold/80">{formatCurrency(totalReturn)}</p>
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
