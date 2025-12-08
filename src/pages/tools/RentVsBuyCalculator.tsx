import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Building2, Home } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CurrencySelector } from '@/components/tools/CurrencySelector';
import { SliderInput } from '@/components/tools/SliderInput';
import { DubaiPresets, AreaPreset } from '@/components/tools/DubaiPresets';
import { RentVsBuyCharts } from '@/components/tools/RentVsBuyCharts';
import { useCurrencyConverter } from '@/hooks/useCurrencyConverter';

export default function RentVsBuyCalculator() {
  const { selectedCurrency, setSelectedCurrency, formatCurrency, formatAED, supportedCurrencies } = useCurrencyConverter();
  const [activePreset, setActivePreset] = useState<string>();

  const [inputs, setInputs] = useState({
    propertyPrice: 2000000, downPayment: 25, interestRate: 4.5, loanTerm: 25, monthlyRent: 10000,
    rentIncrease: 5, propertyAppreciation: 5, maintenanceCosts: 1, serviceCharges: 15000,
    closingCosts: 8, investmentReturn: 7, yearsToCompare: 10,
  });

  const handleChange = (field: string, value: number) => { setInputs(prev => ({ ...prev, [field]: value })); setActivePreset(undefined); };
  const handlePresetSelect = (preset: AreaPreset) => { setInputs(prev => ({ ...prev, propertyPrice: preset.propertyPrice, monthlyRent: preset.monthlyRent || prev.monthlyRent })); setActivePreset(preset.name); };

  const downPaymentAmount = inputs.propertyPrice * (inputs.downPayment / 100);
  const loanAmount = inputs.propertyPrice - downPaymentAmount;
  const closingCostsAmount = inputs.propertyPrice * (inputs.closingCosts / 100);
  const totalUpfront = downPaymentAmount + closingCostsAmount;
  const monthlyRate = inputs.interestRate / 100 / 12;
  const numPayments = inputs.loanTerm * 12;
  const monthlyMortgage = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);

  let totalBuyingCost = totalUpfront, totalRentingCost = 0, currentRent = inputs.monthlyRent, propertyValue = inputs.propertyPrice, investmentValue = totalUpfront, remainingLoan = loanAmount;
  for (let year = 1; year <= inputs.yearsToCompare; year++) {
    totalBuyingCost += monthlyMortgage * 12 + propertyValue * (inputs.maintenanceCosts / 100) + inputs.serviceCharges;
    propertyValue *= (1 + inputs.propertyAppreciation / 100);
    const yearlyInterest = remainingLoan * (inputs.interestRate / 100);
    remainingLoan = Math.max(0, remainingLoan - (monthlyMortgage * 12 - yearlyInterest));
    totalRentingCost += currentRent * 12;
    currentRent *= (1 + inputs.rentIncrease / 100);
    investmentValue *= (1 + inputs.investmentReturn / 100);
  }

  const equityBuilt = propertyValue - remainingLoan;
  const netBuyingPosition = equityBuilt - totalBuyingCost;
  const netRentingPosition = investmentValue - totalRentingCost;
  const buyingAdvantage = netBuyingPosition - netRentingPosition;
  const buyingIsBetter = buyingAdvantage > 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-32 pb-8">
        <div className="container mx-auto px-4">
          <Link to="/tools" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"><ArrowLeft className="w-4 h-4" /> Back to Tools</Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center"><Building2 className="w-5 h-5 text-purple-500" /></div>
                <h1 className="font-heading text-3xl md:text-4xl text-foreground">Rent vs Buy Calculator</h1>
              </div>
              <p className="text-muted-foreground">Compare the long-term financial impact of renting versus buying in Dubai.</p>
            </motion.div>
            <CurrencySelector selectedCurrency={selectedCurrency} onCurrencyChange={setSelectedCurrency} supportedCurrencies={supportedCurrencies} />
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="space-y-6">
              <div className="p-6 rounded-2xl bg-card border border-border"><DubaiPresets onSelectPreset={handlePresetSelect} activePreset={activePreset} /></div>
              <div className="p-6 rounded-2xl bg-card border border-border space-y-6">
                <h2 className="font-heading text-xl text-foreground">Property Details</h2>
                <SliderInput label="Property Price" value={inputs.propertyPrice} onChange={(v) => handleChange('propertyPrice', v)} min={500000} max={15000000} step={100000} formatValue={formatAED} />
                <SliderInput label="Down Payment" value={inputs.downPayment} onChange={(v) => handleChange('downPayment', v)} min={10} max={80} suffix="%" />
                <SliderInput label="Monthly Rent" value={inputs.monthlyRent} onChange={(v) => handleChange('monthlyRent', v)} min={3000} max={50000} step={500} formatValue={formatAED} />
              </div>
              <div className="p-6 rounded-2xl bg-card border border-border space-y-6">
                <h2 className="font-heading text-xl text-foreground">Assumptions</h2>
                <SliderInput label="Property Appreciation" value={inputs.propertyAppreciation} onChange={(v) => handleChange('propertyAppreciation', v)} min={0} max={15} step={0.5} suffix="%/yr" />
                <SliderInput label="Investment Return" value={inputs.investmentReturn} onChange={(v) => handleChange('investmentReturn', v)} min={0} max={15} step={0.5} suffix="%/yr" />
                <SliderInput label="Compare Over" value={inputs.yearsToCompare} onChange={(v) => handleChange('yearsToCompare', v)} min={3} max={30} suffix=" years" />
              </div>
              <RentVsBuyCharts propertyPrice={inputs.propertyPrice} yearsToCompare={inputs.yearsToCompare} propertyAppreciation={inputs.propertyAppreciation} investmentReturn={inputs.investmentReturn} monthlyMortgage={monthlyMortgage} monthlyRent={inputs.monthlyRent} rentIncrease={inputs.rentIncrease} serviceCharges={inputs.serviceCharges} maintenanceCosts={inputs.maintenanceCosts} totalUpfront={totalUpfront} formatAED={formatAED} />
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="space-y-6">
              <div className={`p-6 rounded-2xl border ${buyingIsBetter ? 'bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/20' : 'bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent border-orange-500/20'}`}>
                <div className="flex items-center gap-3 mb-4">
                  {buyingIsBetter ? <Home className="w-8 h-8 text-emerald-500" /> : <Building2 className="w-8 h-8 text-orange-500" />}
                  <div><h2 className="font-heading text-xl text-foreground">{buyingIsBetter ? 'Buying is Better' : 'Renting is Better'}</h2><p className="text-sm text-muted-foreground">Over {inputs.yearsToCompare} years</p></div>
                </div>
                <p className={`font-heading text-3xl ${buyingIsBetter ? 'text-emerald-400' : 'text-orange-400'}`}>{formatAED(Math.abs(buyingAdvantage))} advantage</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-card border border-border">
                  <div className="flex items-center gap-2 mb-4"><Home className="w-5 h-5 text-emerald-500" /><h3 className="font-heading text-lg">Buying</h3></div>
                  <div className="space-y-2 text-sm">
                    <div><p className="text-muted-foreground">Total Cost</p><p className="font-medium">{formatAED(totalBuyingCost)}</p></div>
                    <div><p className="text-muted-foreground">Property Value</p><p className="font-medium text-emerald-400">{formatAED(propertyValue)}</p></div>
                    <div className="pt-2 border-t border-border"><p className="text-muted-foreground">Net Position</p><p className="font-heading text-xl text-emerald-400">{formatAED(netBuyingPosition)}</p></div>
                  </div>
                </div>
                <div className="p-6 rounded-2xl bg-card border border-border">
                  <div className="flex items-center gap-2 mb-4"><Building2 className="w-5 h-5 text-orange-500" /><h3 className="font-heading text-lg">Renting</h3></div>
                  <div className="space-y-2 text-sm">
                    <div><p className="text-muted-foreground">Total Rent</p><p className="font-medium">{formatAED(totalRentingCost)}</p></div>
                    <div><p className="text-muted-foreground">Investment</p><p className="font-medium text-orange-400">{formatAED(investmentValue)}</p></div>
                    <div className="pt-2 border-t border-border"><p className="text-muted-foreground">Net Position</p><p className="font-heading text-xl text-orange-400">{formatAED(netRentingPosition)}</p></div>
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
