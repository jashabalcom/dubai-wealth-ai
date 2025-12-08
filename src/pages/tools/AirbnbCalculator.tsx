import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CurrencySelector } from '@/components/tools/CurrencySelector';
import { SliderInput } from '@/components/tools/SliderInput';
import { DubaiPresets, AreaPreset } from '@/components/tools/DubaiPresets';
import { AirbnbCharts } from '@/components/tools/AirbnbCharts';
import { useCurrencyConverter } from '@/hooks/useCurrencyConverter';

export default function AirbnbCalculator() {
  const { selectedCurrency, setSelectedCurrency, formatCurrency, formatAED, supportedCurrencies } = useCurrencyConverter();
  const [activePreset, setActivePreset] = useState<string>();

  const [inputs, setInputs] = useState({
    propertyPrice: 2000000,
    bedrooms: 2,
    nightlyRate: 800,
    weekendRate: 1000,
    peakSeasonRate: 1200,
    occupancyLow: 50,
    occupancyMid: 70,
    occupancyHigh: 85,
    cleaningFee: 200,
    managementFee: 20,
    platformFee: 3,
    utilities: 1500,
    maintenance: 1000,
    serviceCharges: 15000,
    furnishingCost: 100000,
    licenseFee: 5000,
  });

  const handleChange = (field: string, value: number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
    setActivePreset(undefined);
  };

  const handlePresetSelect = (preset: AreaPreset) => {
    setInputs(prev => ({
      ...prev,
      propertyPrice: preset.propertyPrice,
      nightlyRate: preset.nightlyRate || prev.nightlyRate,
    }));
    setActivePreset(preset.name);
  };

  // Calculations
  const peakSeasonMonths = 4;
  const midSeasonMonths = 4;
  const lowSeasonMonths = 4;

  const peakNights = peakSeasonMonths * 30 * (inputs.occupancyHigh / 100);
  const midNights = midSeasonMonths * 30 * (inputs.occupancyMid / 100);
  const lowNights = lowSeasonMonths * 30 * (inputs.occupancyLow / 100);
  const totalNights = peakNights + midNights + lowNights;

  const avgRate = (inputs.nightlyRate * 5 + inputs.weekendRate * 2) / 7;

  const peakRevenue = peakNights * inputs.peakSeasonRate;
  const midRevenue = midNights * avgRate;
  const lowRevenue = lowNights * inputs.nightlyRate * 0.8;
  const totalRentalRevenue = peakRevenue + midRevenue + lowRevenue;
  const cleaningRevenue = totalNights * inputs.cleaningFee * 0.5;
  const grossRevenue = totalRentalRevenue + cleaningRevenue;

  const platformFees = totalRentalRevenue * (inputs.platformFee / 100);
  const managementFees = grossRevenue * (inputs.managementFee / 100);
  const annualUtilities = inputs.utilities * 12;
  const annualMaintenance = inputs.maintenance * 12;
  const totalExpenses = platformFees + managementFees + annualUtilities + annualMaintenance + inputs.serviceCharges + inputs.licenseFee;

  const netAnnualIncome = grossRevenue - totalExpenses;
  const netMonthlyIncome = netAnnualIncome / 12;
  const netYield = (netAnnualIncome / inputs.propertyPrice) * 100;

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
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-orange-500" />
                </div>
                <h1 className="font-heading text-3xl md:text-4xl text-foreground">Airbnb Yield Calculator</h1>
              </div>
              <p className="text-muted-foreground">Estimate short-term rental income based on Dubai market dynamics.</p>
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
                <DubaiPresets onSelectPreset={handlePresetSelect} activePreset={activePreset} />
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border space-y-6">
                <h2 className="font-heading text-xl text-foreground">Property & Pricing</h2>
                <SliderInput label="Property Price" value={inputs.propertyPrice} onChange={(v) => handleChange('propertyPrice', v)} min={500000} max={10000000} step={100000} formatValue={formatAED} />
                <SliderInput label="Nightly Rate" value={inputs.nightlyRate} onChange={(v) => handleChange('nightlyRate', v)} min={200} max={3000} step={50} formatValue={formatAED} />
                <SliderInput label="Peak Season Rate" value={inputs.peakSeasonRate} onChange={(v) => handleChange('peakSeasonRate', v)} min={300} max={5000} step={50} formatValue={formatAED} />
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border space-y-6">
                <h2 className="font-heading text-xl text-foreground">Occupancy Rates</h2>
                <SliderInput label="Low Season (May-Sep)" value={inputs.occupancyLow} onChange={(v) => handleChange('occupancyLow', v)} min={10} max={100} suffix="%" />
                <SliderInput label="Mid Season" value={inputs.occupancyMid} onChange={(v) => handleChange('occupancyMid', v)} min={20} max={100} suffix="%" />
                <SliderInput label="Peak Season (Nov-Feb)" value={inputs.occupancyHigh} onChange={(v) => handleChange('occupancyHigh', v)} min={30} max={100} suffix="%" />
              </div>

              <AirbnbCharts peakRevenue={peakRevenue} midRevenue={midRevenue} lowRevenue={lowRevenue} totalExpenses={totalExpenses} netAnnualIncome={netAnnualIncome} grossRevenue={grossRevenue} platformFees={platformFees} managementFees={managementFees} annualUtilities={annualUtilities} annualMaintenance={annualMaintenance} serviceCharges={inputs.serviceCharges} licenseFee={inputs.licenseFee} formatAED={formatAED} />
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="space-y-6">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent border border-orange-500/20">
                <h2 className="font-heading text-xl text-foreground mb-4">Annual Returns</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-card/50">
                    <p className="text-sm text-muted-foreground mb-1">Net Yield</p>
                    <p className="font-heading text-3xl text-orange-400">{netYield.toFixed(1)}%</p>
                  </div>
                  <div className="p-4 rounded-xl bg-card/50">
                    <p className="text-sm text-muted-foreground mb-1">Monthly Income</p>
                    <p className="font-heading text-2xl text-foreground">{formatAED(netMonthlyIncome)}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border">
                <h2 className="font-heading text-xl text-foreground mb-6">Financial Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-border"><span className="text-muted-foreground">Gross Revenue</span><span className="font-medium text-emerald-400">{formatAED(grossRevenue)}</span></div>
                  <div className="flex justify-between py-2 border-b border-border"><span className="text-muted-foreground">Total Expenses</span><span className="font-medium text-orange-400">{formatAED(totalExpenses)}</span></div>
                  <div className="flex justify-between py-2 border-b border-border"><span className="text-muted-foreground">Nights Booked</span><span className="font-medium">{Math.round(totalNights)} nights</span></div>
                  <div className="flex justify-between py-3 bg-gold/10 rounded-lg px-3 -mx-3"><span className="font-medium">Net Annual Income</span><span className="font-heading text-xl text-gold">{formatAED(netAnnualIncome)}</span></div>
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
