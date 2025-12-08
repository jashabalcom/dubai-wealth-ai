import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Building2, Home, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CurrencySelector } from '@/components/tools/CurrencySelector';
import { useCurrencyConverter } from '@/hooks/useCurrencyConverter';

export default function RentVsBuyCalculator() {
  const { selectedCurrency, setSelectedCurrency, formatCurrency, formatAED, supportedCurrencies } = useCurrencyConverter();

  const [inputs, setInputs] = useState({
    propertyPrice: 2000000,
    downPayment: 25,
    interestRate: 4.5,
    loanTerm: 25,
    monthlyRent: 10000,
    rentIncrease: 5,
    propertyAppreciation: 5,
    maintenanceCosts: 1, // % of property value
    serviceCharges: 15000, // annual
    closingCosts: 8, // %
    investmentReturn: 7, // % if investing down payment instead
    yearsToCompare: 10,
  });

  const handleChange = (field: string, value: number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  // Buying calculations
  const downPaymentAmount = inputs.propertyPrice * (inputs.downPayment / 100);
  const loanAmount = inputs.propertyPrice - downPaymentAmount;
  const closingCostsAmount = inputs.propertyPrice * (inputs.closingCosts / 100);
  const totalUpfront = downPaymentAmount + closingCostsAmount;

  const monthlyRate = inputs.interestRate / 100 / 12;
  const numPayments = inputs.loanTerm * 12;
  const monthlyMortgage = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);

  // Calculate totals over comparison period
  let totalBuyingCost = totalUpfront;
  let totalRentingCost = 0;
  let currentRent = inputs.monthlyRent;
  let propertyValue = inputs.propertyPrice;
  let investmentValue = totalUpfront; // If renting, invest down payment
  let remainingLoan = loanAmount;

  for (let year = 1; year <= inputs.yearsToCompare; year++) {
    // Buying costs for this year
    const yearlyMortgage = monthlyMortgage * 12;
    const yearlyMaintenance = propertyValue * (inputs.maintenanceCosts / 100);
    const yearlyServiceCharges = inputs.serviceCharges;
    totalBuyingCost += yearlyMortgage + yearlyMaintenance + yearlyServiceCharges;

    // Property appreciation
    propertyValue *= (1 + inputs.propertyAppreciation / 100);

    // Reduce loan principal (simplified)
    const yearlyInterest = remainingLoan * (inputs.interestRate / 100);
    const yearlyPrincipal = yearlyMortgage - yearlyInterest;
    remainingLoan = Math.max(0, remainingLoan - yearlyPrincipal);

    // Renting costs for this year
    const yearlyRent = currentRent * 12;
    totalRentingCost += yearlyRent;
    currentRent *= (1 + inputs.rentIncrease / 100);

    // Investment growth if renting
    investmentValue *= (1 + inputs.investmentReturn / 100);
  }

  // Net position
  const equityBuilt = propertyValue - remainingLoan;
  const netBuyingPosition = equityBuilt - totalBuyingCost;
  const netRentingPosition = investmentValue - totalRentingCost;
  const buyingAdvantage = netBuyingPosition - netRentingPosition;
  const buyingIsBetter = buyingAdvantage > 0;

  // Break-even analysis
  const monthlyBuyingCost = monthlyMortgage + (inputs.serviceCharges / 12) + (inputs.propertyPrice * inputs.maintenanceCosts / 100 / 12);

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
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-purple-500" />
                </div>
                <h1 className="font-heading text-3xl md:text-4xl text-foreground">
                  Rent vs Buy Calculator
                </h1>
              </div>
              <p className="text-muted-foreground">
                Compare the long-term financial impact of renting versus buying in Dubai.
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
                    <Label>Property Price (AED)</Label>
                    <Input
                      type="number"
                      value={inputs.propertyPrice}
                      onChange={(e) => handleChange('propertyPrice', Number(e.target.value))}
                      className="mt-1"
                    />
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Interest Rate (%)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={inputs.interestRate}
                        onChange={(e) => handleChange('interestRate', Number(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Loan Term (Years)</Label>
                      <Input
                        type="number"
                        value={inputs.loanTerm}
                        onChange={(e) => handleChange('loanTerm', Number(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border">
                <h2 className="font-heading text-xl text-foreground mb-6">Rental Details</h2>
                
                <div className="space-y-4">
                  <div>
                    <Label>Monthly Rent (AED)</Label>
                    <Input
                      type="number"
                      value={inputs.monthlyRent}
                      onChange={(e) => handleChange('monthlyRent', Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Annual Rent Increase (%)</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={inputs.rentIncrease}
                      onChange={(e) => handleChange('rentIncrease', Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border">
                <h2 className="font-heading text-xl text-foreground mb-6">Assumptions</h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Property Appreciation (%/yr)</Label>
                      <Input
                        type="number"
                        step="0.5"
                        value={inputs.propertyAppreciation}
                        onChange={(e) => handleChange('propertyAppreciation', Number(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Investment Return (%/yr)</Label>
                      <Input
                        type="number"
                        step="0.5"
                        value={inputs.investmentReturn}
                        onChange={(e) => handleChange('investmentReturn', Number(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Maintenance (%/yr)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={inputs.maintenanceCosts}
                        onChange={(e) => handleChange('maintenanceCosts', Number(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Service Charges (AED/yr)</Label>
                      <Input
                        type="number"
                        value={inputs.serviceCharges}
                        onChange={(e) => handleChange('serviceCharges', Number(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Comparison Period (Years)</Label>
                    <Input
                      type="number"
                      value={inputs.yearsToCompare}
                      onChange={(e) => handleChange('yearsToCompare', Number(e.target.value))}
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
              {/* Verdict */}
              <div className={`p-6 rounded-2xl border ${
                buyingIsBetter 
                  ? 'bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/20'
                  : 'bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent border-orange-500/20'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  {buyingIsBetter ? (
                    <Home className="w-8 h-8 text-emerald-500" />
                  ) : (
                    <Building2 className="w-8 h-8 text-orange-500" />
                  )}
                  <div>
                    <h2 className="font-heading text-xl text-foreground">
                      {buyingIsBetter ? 'Buying is Better' : 'Renting is Better'}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Over {inputs.yearsToCompare} years
                    </p>
                  </div>
                </div>
                
                <p className={`font-heading text-3xl ${buyingIsBetter ? 'text-emerald-400' : 'text-orange-400'}`}>
                  {formatAED(Math.abs(buyingAdvantage))} advantage
                </p>
                <p className="text-muted-foreground">{formatCurrency(Math.abs(buyingAdvantage))}</p>
              </div>

              {/* Comparison */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-card border border-border">
                  <div className="flex items-center gap-2 mb-4">
                    <Home className="w-5 h-5 text-emerald-500" />
                    <h3 className="font-heading text-lg text-foreground">Buying</h3>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Cost</p>
                      <p className="font-medium text-foreground">{formatAED(totalBuyingCost)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Property Value</p>
                      <p className="font-medium text-emerald-400">{formatAED(propertyValue)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Equity Built</p>
                      <p className="font-medium text-foreground">{formatAED(equityBuilt)}</p>
                    </div>
                    <div className="pt-2 border-t border-border">
                      <p className="text-muted-foreground">Net Position</p>
                      <p className="font-heading text-xl text-emerald-400">{formatAED(netBuyingPosition)}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-card border border-border">
                  <div className="flex items-center gap-2 mb-4">
                    <Building2 className="w-5 h-5 text-orange-500" />
                    <h3 className="font-heading text-lg text-foreground">Renting</h3>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Rent Paid</p>
                      <p className="font-medium text-foreground">{formatAED(totalRentingCost)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Investment Value</p>
                      <p className="font-medium text-orange-400">{formatAED(investmentValue)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Initial Investment</p>
                      <p className="font-medium text-foreground">{formatAED(totalUpfront)}</p>
                    </div>
                    <div className="pt-2 border-t border-border">
                      <p className="text-muted-foreground">Net Position</p>
                      <p className="font-heading text-xl text-orange-400">{formatAED(netRentingPosition)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Monthly Comparison */}
              <div className="p-6 rounded-2xl bg-card border border-border">
                <h2 className="font-heading text-xl text-foreground mb-6">Monthly Cost Comparison</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Home className="w-4 h-4 text-emerald-500" />
                      <span className="text-muted-foreground">Buying (Monthly)</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatAED(monthlyBuyingCost)}</p>
                      <p className="text-xs text-muted-foreground">{formatCurrency(monthlyBuyingCost)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-orange-500" />
                      <span className="text-muted-foreground">Renting (Current)</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatAED(inputs.monthlyRent)}</p>
                      <p className="text-xs text-muted-foreground">{formatCurrency(inputs.monthlyRent)}</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Buying costs {formatAED(monthlyBuyingCost - inputs.monthlyRent)} {monthlyBuyingCost > inputs.monthlyRent ? 'more' : 'less'} per month initially, 
                      but you build equity and benefit from property appreciation.
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
