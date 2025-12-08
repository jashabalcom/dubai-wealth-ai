import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, TrendingUp, DollarSign, Percent, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';

interface InlineROICalculatorProps {
  purchasePrice: number;
  estimatedYield: number;
  sizeSquft: number;
}

export function InlineROICalculator({ 
  purchasePrice, 
  estimatedYield, 
  sizeSquft 
}: InlineROICalculatorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [downPaymentPercent, setDownPaymentPercent] = useState(25);
  const [appreciationRate, setAppreciationRate] = useState(5);
  const [holdingPeriod, setHoldingPeriod] = useState(5);

  const calculations = useMemo(() => {
    const downPayment = purchasePrice * (downPaymentPercent / 100);
    const loanAmount = purchasePrice - downPayment;
    
    // Dubai fees (simplified)
    const dldFee = purchasePrice * 0.04; // 4% DLD
    const agentFee = purchasePrice * 0.02; // 2% Agent
    const otherFees = 10000; // Misc fees
    const totalClosingCosts = dldFee + agentFee + otherFees;
    
    const totalInitialInvestment = downPayment + totalClosingCosts;
    
    // Annual rental income
    const annualRent = purchasePrice * (estimatedYield / 100);
    const monthlyRent = annualRent / 12;
    
    // Expenses (estimated)
    const serviceCharges = sizeSquft * 25; // AED 25/sqft
    const maintenance = annualRent * 0.05; // 5% of rent
    const vacancy = annualRent * 0.05; // 5% vacancy
    const totalExpenses = serviceCharges + maintenance + vacancy;
    
    const netAnnualIncome = annualRent - totalExpenses;
    
    // Property value after holding period with appreciation
    const futureValue = purchasePrice * Math.pow(1 + appreciationRate / 100, holdingPeriod);
    const appreciation = futureValue - purchasePrice;
    
    // Total return
    const totalRentalIncome = netAnnualIncome * holdingPeriod;
    const totalReturn = appreciation + totalRentalIncome;
    const totalROI = (totalReturn / totalInitialInvestment) * 100;
    const annualizedROI = Math.pow(1 + totalROI / 100, 1 / holdingPeriod) - 1;
    
    // Cash-on-cash return
    const cashOnCash = (netAnnualIncome / totalInitialInvestment) * 100;

    return {
      downPayment,
      totalInitialInvestment,
      monthlyRent,
      annualRent,
      netAnnualIncome,
      futureValue,
      appreciation,
      totalReturn,
      totalROI,
      annualizedROI: annualizedROI * 100,
      cashOnCash,
      totalClosingCosts,
    };
  }, [purchasePrice, estimatedYield, sizeSquft, downPaymentPercent, appreciationRate, holdingPeriod]);

  const formatAED = (value: number) => {
    return `AED ${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="p-6 rounded-xl bg-card border border-border">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-gold" />
          <h2 className="font-heading text-xl text-foreground">Quick ROI Calculator</h2>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </button>

      {/* Quick Stats (always visible) */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Est. Monthly Rent</p>
          <p className="font-heading text-lg text-gold">
            {formatAED(calculations.monthlyRent)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Cash-on-Cash</p>
          <p className="font-heading text-lg text-emerald-500">
            {calculations.cashOnCash.toFixed(1)}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">{holdingPeriod}Y Total ROI</p>
          <p className="font-heading text-lg text-foreground">
            {calculations.totalROI.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Expandable Section */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-6 mt-4 border-t border-border space-y-6">
              {/* Sliders */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <Label>Down Payment</Label>
                    <span className="text-sm font-medium text-gold">{downPaymentPercent}%</span>
                  </div>
                  <Slider
                    value={[downPaymentPercent]}
                    onValueChange={(v) => setDownPaymentPercent(v[0])}
                    min={20}
                    max={100}
                    step={5}
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <Label>Annual Appreciation</Label>
                    <span className="text-sm font-medium text-gold">{appreciationRate}%</span>
                  </div>
                  <Slider
                    value={[appreciationRate]}
                    onValueChange={(v) => setAppreciationRate(v[0])}
                    min={0}
                    max={15}
                    step={1}
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <Label>Holding Period</Label>
                    <span className="text-sm font-medium text-gold">{holdingPeriod} years</span>
                  </div>
                  <Slider
                    value={[holdingPeriod]}
                    onValueChange={(v) => setHoldingPeriod(v[0])}
                    min={1}
                    max={10}
                    step={1}
                  />
                </div>
              </div>

              {/* Detailed Results */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Initial Investment</span>
                  <span className="font-medium">{formatAED(calculations.totalInitialInvestment)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Total Closing Costs</span>
                  <span className="font-medium">{formatAED(calculations.totalClosingCosts)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Net Annual Income</span>
                  <span className="font-medium text-emerald-500">{formatAED(calculations.netAnnualIncome)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Property Value ({holdingPeriod}Y)</span>
                  <span className="font-medium">{formatAED(calculations.futureValue)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Total Appreciation</span>
                  <span className="font-medium text-emerald-500">{formatAED(calculations.appreciation)}</span>
                </div>
                <div className="flex justify-between py-2 bg-gold/10 rounded-lg px-3">
                  <span className="font-medium">Total Return</span>
                  <span className="font-heading text-gold">{formatAED(calculations.totalReturn)}</span>
                </div>
              </div>

              <Link to="/tools/roi" className="block">
                <Button variant="outline" className="w-full">
                  Full ROI Calculator
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
