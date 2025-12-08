import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, TrendingUp, DollarSign, Percent } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CurrencySelector } from '@/components/tools/CurrencySelector';
import { useCurrencyConverter } from '@/hooks/useCurrencyConverter';

export default function AirbnbCalculator() {
  const { selectedCurrency, setSelectedCurrency, formatCurrency, formatAED, supportedCurrencies } = useCurrencyConverter();

  const [inputs, setInputs] = useState({
    propertyPrice: 2000000,
    bedrooms: 2,
    location: 'Dubai Marina',
    nightlyRate: 800,
    weekendRate: 1000,
    peakSeasonRate: 1200,
    occupancyLow: 50, // %
    occupancyMid: 70,
    occupancyHigh: 85,
    cleaningFee: 200,
    managementFee: 20, // % of revenue
    platformFee: 3, // Airbnb fee %
    utilities: 1500, // monthly
    maintenance: 1000, // monthly
    serviceCharges: 15000, // annual
    furnishingCost: 100000,
    licenseFee: 5000, // annual DTCM
  });

  const handleChange = (field: string, value: number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  // Seasonality breakdown (simplified Dubai market)
  const peakSeasonMonths = 4; // Nov-Feb
  const midSeasonMonths = 4; // Mar-Apr, Oct
  const lowSeasonMonths = 4; // May-Sep

  // Calculate nights per season
  const peakNights = peakSeasonMonths * 30 * (inputs.occupancyHigh / 100);
  const midNights = midSeasonMonths * 30 * (inputs.occupancyMid / 100);
  const lowNights = lowSeasonMonths * 30 * (inputs.occupancyLow / 100);
  const totalNights = peakNights + midNights + lowNights;

  // Average weekend boost (assume 8 weekends per month)
  const avgRate = (inputs.nightlyRate * 5 + inputs.weekendRate * 2) / 7;

  // Revenue calculations
  const peakRevenue = peakNights * inputs.peakSeasonRate;
  const midRevenue = midNights * avgRate;
  const lowRevenue = lowNights * inputs.nightlyRate * 0.8; // Lower rates in off-season
  const totalRentalRevenue = peakRevenue + midRevenue + lowRevenue;
  const cleaningRevenue = totalNights * inputs.cleaningFee * 0.5; // Assume 50% margin on cleaning
  const grossRevenue = totalRentalRevenue + cleaningRevenue;

  // Expenses
  const platformFees = totalRentalRevenue * (inputs.platformFee / 100);
  const managementFees = grossRevenue * (inputs.managementFee / 100);
  const annualUtilities = inputs.utilities * 12;
  const annualMaintenance = inputs.maintenance * 12;
  const totalExpenses = platformFees + managementFees + annualUtilities + annualMaintenance + inputs.serviceCharges + inputs.licenseFee;

  // Net income
  const netAnnualIncome = grossRevenue - totalExpenses;
  const netMonthlyIncome = netAnnualIncome / 12;
  const netYield = (netAnnualIncome / inputs.propertyPrice) * 100;
  const grossYield = (grossRevenue / inputs.propertyPrice) * 100;

  // Compare with long-term rental
  const estimatedLongTermRent = inputs.bedrooms === 0 ? 6000 : inputs.bedrooms * 5000 + 4000;
  const longTermAnnual = estimatedLongTermRent * 12;
  const longTermYield = (longTermAnnual / inputs.propertyPrice) * 100;
  const premiumOverLongTerm = ((netAnnualIncome - longTermAnnual) / longTermAnnual) * 100;

  // ROI including furnishing
  const totalInvestment = inputs.propertyPrice + inputs.furnishingCost;
  const trueYield = (netAnnualIncome / totalInvestment) * 100;
  const paybackYears = inputs.furnishingCost / netAnnualIncome;

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
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-orange-500" />
                </div>
                <h1 className="font-heading text-3xl md:text-4xl text-foreground">
                  Airbnb Yield Calculator
                </h1>
              </div>
              <p className="text-muted-foreground">
                Estimate short-term rental income based on Dubai market dynamics.
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
                      <Label>Bedrooms</Label>
                      <Input
                        type="number"
                        value={inputs.bedrooms}
                        onChange={(e) => handleChange('bedrooms', Number(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Furnishing Cost (AED)</Label>
                      <Input
                        type="number"
                        value={inputs.furnishingCost}
                        onChange={(e) => handleChange('furnishingCost', Number(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border">
                <h2 className="font-heading text-xl text-foreground mb-6">Pricing</h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Nightly Rate</Label>
                      <Input
                        type="number"
                        value={inputs.nightlyRate}
                        onChange={(e) => handleChange('nightlyRate', Number(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Weekend Rate</Label>
                      <Input
                        type="number"
                        value={inputs.weekendRate}
                        onChange={(e) => handleChange('weekendRate', Number(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Peak Season</Label>
                      <Input
                        type="number"
                        value={inputs.peakSeasonRate}
                        onChange={(e) => handleChange('peakSeasonRate', Number(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Cleaning Fee (per stay)</Label>
                    <Input
                      type="number"
                      value={inputs.cleaningFee}
                      onChange={(e) => handleChange('cleaningFee', Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border">
                <h2 className="font-heading text-xl text-foreground mb-6">Occupancy Rates (%)</h2>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Low Season</Label>
                    <Input
                      type="number"
                      value={inputs.occupancyLow}
                      onChange={(e) => handleChange('occupancyLow', Number(e.target.value))}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">May-Sep</p>
                  </div>
                  <div>
                    <Label>Mid Season</Label>
                    <Input
                      type="number"
                      value={inputs.occupancyMid}
                      onChange={(e) => handleChange('occupancyMid', Number(e.target.value))}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Mar-Apr, Oct</p>
                  </div>
                  <div>
                    <Label>Peak Season</Label>
                    <Input
                      type="number"
                      value={inputs.occupancyHigh}
                      onChange={(e) => handleChange('occupancyHigh', Number(e.target.value))}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Nov-Feb</p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border">
                <h2 className="font-heading text-xl text-foreground mb-6">Expenses</h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Management Fee (%)</Label>
                      <Input
                        type="number"
                        value={inputs.managementFee}
                        onChange={(e) => handleChange('managementFee', Number(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Platform Fee (%)</Label>
                      <Input
                        type="number"
                        value={inputs.platformFee}
                        onChange={(e) => handleChange('platformFee', Number(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Utilities (AED/mo)</Label>
                      <Input
                        type="number"
                        value={inputs.utilities}
                        onChange={(e) => handleChange('utilities', Number(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Maintenance (AED/mo)</Label>
                      <Input
                        type="number"
                        value={inputs.maintenance}
                        onChange={(e) => handleChange('maintenance', Number(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Service Charges (AED/yr)</Label>
                      <Input
                        type="number"
                        value={inputs.serviceCharges}
                        onChange={(e) => handleChange('serviceCharges', Number(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>DTCM License (AED/yr)</Label>
                      <Input
                        type="number"
                        value={inputs.licenseFee}
                        onChange={(e) => handleChange('licenseFee', Number(e.target.value))}
                        className="mt-1"
                      />
                    </div>
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
              {/* Net Yield */}
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
                    <p className="text-xs text-muted-foreground">{formatCurrency(netMonthlyIncome)}</p>
                  </div>
                </div>
              </div>

              {/* Occupancy Stats */}
              <div className="p-6 rounded-2xl bg-card border border-border">
                <h2 className="font-heading text-xl text-foreground mb-6">Occupancy Analysis</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Nights Booked</span>
                    <span className="font-heading text-lg">{Math.round(totalNights)} nights</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Average Occupancy</span>
                    <span className="font-heading text-lg">{((totalNights / 365) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Average Daily Rate</span>
                    <span className="font-heading text-lg">{formatAED(totalRentalRevenue / totalNights)}</span>
                  </div>
                </div>
              </div>

              {/* Revenue Breakdown */}
              <div className="p-6 rounded-2xl bg-card border border-border">
                <h2 className="font-heading text-xl text-foreground mb-6">Revenue Breakdown</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Peak Season Revenue</span>
                    <span className="font-medium">{formatAED(peakRevenue)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Mid Season Revenue</span>
                    <span className="font-medium">{formatAED(midRevenue)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Low Season Revenue</span>
                    <span className="font-medium">{formatAED(lowRevenue)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Cleaning Revenue</span>
                    <span className="font-medium">{formatAED(cleaningRevenue)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 bg-emerald-500/10 rounded-lg px-3 -mx-3">
                    <span className="font-medium">Gross Revenue</span>
                    <span className="font-heading text-lg text-emerald-400">{formatAED(grossRevenue)}</span>
                  </div>
                </div>
              </div>

              {/* Expenses */}
              <div className="p-6 rounded-2xl bg-card border border-border">
                <h2 className="font-heading text-xl text-foreground mb-6">Expenses</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Platform Fees</span>
                    <span className="font-medium text-orange-400">-{formatAED(platformFees)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Management Fees</span>
                    <span className="font-medium text-orange-400">-{formatAED(managementFees)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Utilities</span>
                    <span className="font-medium text-orange-400">-{formatAED(annualUtilities)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Maintenance</span>
                    <span className="font-medium text-orange-400">-{formatAED(annualMaintenance)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Service Charges</span>
                    <span className="font-medium text-orange-400">-{formatAED(inputs.serviceCharges)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">DTCM License</span>
                    <span className="font-medium text-orange-400">-{formatAED(inputs.licenseFee)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 bg-gold/10 rounded-lg px-3 -mx-3">
                    <span className="font-medium">Net Annual Income</span>
                    <div className="text-right">
                      <p className="font-heading text-xl text-gold">{formatAED(netAnnualIncome)}</p>
                      <p className="text-sm text-gold/80">{formatCurrency(netAnnualIncome)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comparison with Long-term */}
              <div className="p-6 rounded-2xl bg-card border border-border">
                <h2 className="font-heading text-xl text-foreground mb-6">vs Long-Term Rental</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground">Est. Long-Term Rent</span>
                    <span className="font-medium">{formatAED(estimatedLongTermRent)}/mo</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground">Long-Term Yield</span>
                    <span className="font-medium">{longTermYield.toFixed(1)}%</span>
                  </div>
                  <div className={`flex items-center justify-between p-3 rounded-lg ${premiumOverLongTerm > 0 ? 'bg-emerald-500/10' : 'bg-orange-500/10'}`}>
                    <span className="text-muted-foreground">Airbnb Premium</span>
                    <span className={`font-heading text-lg ${premiumOverLongTerm > 0 ? 'text-emerald-400' : 'text-orange-400'}`}>
                      {premiumOverLongTerm > 0 ? '+' : ''}{premiumOverLongTerm.toFixed(0)}%
                    </span>
                  </div>
                </div>

                <div className="mt-4 p-4 rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground">
                    Furnishing payback: <span className="font-medium text-foreground">{paybackYears.toFixed(1)} years</span>
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
