import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SEOHead } from '@/components/SEOHead';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SliderInput } from '@/components/tools/SliderInput';
import { DSCRCharts } from '@/components/tools/DSCRCharts';
import { UsageLimitBanner } from '@/components/freemium/UsageLimitBanner';
import { UpgradeModal } from '@/components/freemium/UpgradeModal';
import { ContextualUpgradePrompt } from '@/components/freemium/ContextualUpgradePrompt';
import { HardPaywall } from '@/components/freemium/HardPaywall';
import { useToolUsage } from '@/hooks/useToolUsage';
import { Building2, TrendingUp, Calculator, AlertTriangle, CheckCircle, Sparkles, Lock } from 'lucide-react';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';

function formatAED(amount: number): string {
  return `AED ${amount.toLocaleString('en-AE', { maximumFractionDigits: 0 })}`;
}

export default function DSCRCalculator() {
  const [searchParams] = useSearchParams();
  const { usageCount, remainingUses, hasReachedLimit, isUnlimited, trackUsage, canUse } = useToolUsage('dscr');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [hasTracked, setHasTracked] = useState(false);

  // Get NOI from URL params (from Cap Rate Calculator)
  const noiFromCapRate = searchParams.get('noi');
  const propertyPriceFromCapRate = searchParams.get('price');

  const [inputs, setInputs] = useState({
    noi: noiFromCapRate ? parseInt(noiFromCapRate) : 500000,
    propertyPrice: propertyPriceFromCapRate ? parseInt(propertyPriceFromCapRate) : 8000000,
    loanToValue: 65,
    interestRate: 5.5,
    loanTerm: 25,
    // Additional inputs for max loan calculation
    targetDSCR: 1.25,
  });

  useEffect(() => {
    async function track() {
      if (!hasTracked && canUse) {
        const success = await trackUsage();
        if (!success && !isUnlimited) {
          setShowUpgradeModal(true);
        }
        setHasTracked(true);
      } else if (!canUse && !hasTracked) {
        setShowUpgradeModal(true);
        setHasTracked(true);
      }
    }
    track();
  }, [hasTracked, canUse, trackUsage, isUnlimited]);

  const handleChange = (field: keyof typeof inputs, value: number) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  // Calculations
  const calculations = useMemo(() => {
    const { noi, propertyPrice, loanToValue, interestRate, loanTerm, targetDSCR } = inputs;
    
    // Current loan calculations
    const loanAmount = propertyPrice * (loanToValue / 100);
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;
    
    // Monthly payment (P&I)
    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    const annualDebtService = monthlyPayment * 12;
    
    // DSCR
    const dscr = noi / annualDebtService;
    
    // Cash flow
    const annualCashFlow = noi - annualDebtService;
    const monthlyCashFlow = annualCashFlow / 12;
    
    // Cash on cash return
    const downPayment = propertyPrice - loanAmount;
    const cashOnCash = (annualCashFlow / downPayment) * 100;
    
    // Max loan amount at target DSCR
    const maxAnnualDebtService = noi / targetDSCR;
    const maxMonthlyPayment = maxAnnualDebtService / 12;
    // Reverse mortgage calculation to find max loan
    const maxLoanAmount = maxMonthlyPayment * (Math.pow(1 + monthlyRate, numberOfPayments) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments));
    const maxLTV = (maxLoanAmount / propertyPrice) * 100;
    
    // Break-even occupancy (assuming NOI is at current occupancy)
    const breakEvenOccupancy = (annualDebtService / noi) * 100;
    
    return {
      loanAmount,
      monthlyPayment,
      annualDebtService,
      dscr,
      annualCashFlow,
      monthlyCashFlow,
      downPayment,
      cashOnCash,
      maxLoanAmount,
      maxLTV,
      breakEvenOccupancy,
    };
  }, [inputs]);

  const getDSCRRating = (dscr: number): { label: string; color: string; bg: string } => {
    if (dscr >= 1.5) return { label: 'Excellent', color: 'text-green-500', bg: 'bg-green-500/20' };
    if (dscr >= 1.25) return { label: 'Good', color: 'text-green-400', bg: 'bg-green-400/20' };
    if (dscr >= 1.1) return { label: 'Acceptable', color: 'text-yellow-500', bg: 'bg-yellow-500/20' };
    if (dscr >= 1.0) return { label: 'Marginal', color: 'text-orange-500', bg: 'bg-orange-500/20' };
    return { label: 'Negative', color: 'text-red-500', bg: 'bg-red-500/20' };
  };

  const dscrRating = getDSCRRating(calculations.dscr);

  return (
    <>
      <SEOHead
        title="DSCR Calculator | Commercial Real Estate | Dubai Wealth Hub"
        description="Calculate Debt Service Coverage Ratio for Dubai commercial properties. Analyze loan eligibility, compare UAE lenders, and run sensitivity analysis."
        keywords={["DSCR calculator Dubai", "commercial mortgage Dubai", "debt service coverage ratio", "UAE commercial lending"]}
      />
      <Navbar />
      
      <main className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <Breadcrumbs 
              items={[
                { label: 'Tools', href: '/tools' },
                { label: 'DSCR Calculator' }
              ]} 
              className="mb-4"
            />
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-slate-500/20">
                <TrendingUp className="h-6 w-6 text-slate-400" />
              </div>
              <h1 className="text-3xl font-bold">DSCR Calculator</h1>
              <Badge variant="outline" className="bg-slate-500/20 text-slate-300 border-slate-500/50">
                Commercial
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Calculate Debt Service Coverage Ratio for commercial financing eligibility
            </p>
            {noiFromCapRate && (
              <div className="mt-3 p-3 bg-primary/10 border border-primary/30 rounded-lg inline-flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm">NOI pre-filled from Cap Rate Calculator</span>
              </div>
            )}
          </div>

          {!isUnlimited && (
            <UsageLimitBanner
              remaining={remainingUses}
              total={2}
              type="tool"
            />
          )}

          <UpgradeModal
            isOpen={showUpgradeModal}
            onClose={() => setShowUpgradeModal(false)}
            feature="tools"
          />

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Input Section */}
            <div className="lg:col-span-1 space-y-6">
              {/* Property & Income */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Building2 className="h-5 w-5 text-slate-400" />
                    Property & Income
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <SliderInput
                    label="Property Price"
                    value={inputs.propertyPrice}
                    onChange={(v) => handleChange('propertyPrice', v)}
                    min={1000000}
                    max={100000000}
                    step={500000}
                    prefix="AED "
                  />
                  <SliderInput
                    label="Net Operating Income (NOI)"
                    value={inputs.noi}
                    onChange={(v) => handleChange('noi', v)}
                    min={50000}
                    max={10000000}
                    step={25000}
                    prefix="AED "
                  />
                  <div className="pt-2">
                    <Link to="/tools/cap-rate">
                      <Button variant="outline" size="sm" className="w-full">
                        <Calculator className="h-4 w-4 mr-2" />
                        Calculate NOI with Cap Rate Tool
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Loan Terms */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="h-5 w-5 text-slate-400" />
                    Loan Terms
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <SliderInput
                    label="Loan-to-Value (LTV)"
                    value={inputs.loanToValue}
                    onChange={(v) => handleChange('loanToValue', v)}
                    min={30}
                    max={80}
                    step={5}
                    suffix="%"
                  />
                  <SliderInput
                    label="Interest Rate"
                    value={inputs.interestRate}
                    onChange={(v) => handleChange('interestRate', v)}
                    min={3}
                    max={10}
                    step={0.25}
                    suffix="%"
                  />
                  <SliderInput
                    label="Loan Term"
                    value={inputs.loanTerm}
                    onChange={(v) => handleChange('loanTerm', v)}
                    min={5}
                    max={30}
                    step={1}
                    suffix=" years"
                  />
                  <SliderInput
                    label="Target DSCR (for max loan)"
                    value={inputs.targetDSCR}
                    onChange={(v) => handleChange('targetDSCR', v)}
                    min={1.0}
                    max={2.0}
                    step={0.05}
                    suffix="x"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Results Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* DSCR Result */}
              <Card className={`border-2 ${calculations.dscr >= 1.25 ? 'border-green-500/50 bg-green-500/5' : calculations.dscr >= 1.0 ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-red-500/50 bg-red-500/5'}`}>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Debt Service Coverage Ratio</p>
                      <div className="flex items-center gap-3">
                        {hasReachedLimit && !isUnlimited ? (
                          <div className="flex items-center gap-2">
                            <Lock className="h-6 w-6 text-muted-foreground" />
                            <span className="text-3xl font-bold text-muted-foreground">---</span>
                          </div>
                        ) : (
                          <>
                            <span className="text-5xl font-bold">{calculations.dscr.toFixed(2)}x</span>
                            <Badge className={`${dscrRating.bg} ${dscrRating.color} border-0`}>
                              {dscrRating.label}
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                    {(!hasReachedLimit || isUnlimited) && (
                      <div className="flex items-start gap-2 p-4 rounded-lg bg-background/50">
                        {calculations.dscr >= 1.25 ? (
                          <>
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                            <div>
                              <p className="font-medium text-green-500">Meets Lender Requirements</p>
                              <p className="text-sm text-muted-foreground">Eligible for most UAE commercial lenders</p>
                            </div>
                          </>
                        ) : calculations.dscr >= 1.0 ? (
                          <>
                            <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                            <div>
                              <p className="font-medium text-yellow-500">Below Typical Requirements</p>
                              <p className="text-sm text-muted-foreground">May qualify with lower LTV or higher down payment</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                            <div>
                              <p className="font-medium text-red-500">Negative Cash Flow</p>
                              <p className="text-sm text-muted-foreground">Income doesn't cover debt service</p>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Key Metrics Grid */}
              <HardPaywall
                requiredTier="investor"
                feature="DSCR Analysis"
                isLocked={hasReachedLimit && !isUnlimited}
                showTeaser={true}
                teaserMessage="Upgrade to see full DSCR analysis, max loan calculations, and cash flow metrics"
              >
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Card className="bg-card border-border">
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">Loan Amount</p>
                      <p className="text-2xl font-bold">{formatAED(calculations.loanAmount)}</p>
                      <p className="text-xs text-muted-foreground">{inputs.loanToValue}% LTV</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-card border-border">
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">Annual Debt Service</p>
                      <p className="text-2xl font-bold">{formatAED(calculations.annualDebtService)}</p>
                      <p className="text-xs text-muted-foreground">{formatAED(calculations.monthlyPayment)}/month</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-card border-border">
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">Annual Cash Flow</p>
                      <p className={`text-2xl font-bold ${calculations.annualCashFlow >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {formatAED(calculations.annualCashFlow)}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatAED(calculations.monthlyCashFlow)}/month</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-card border-border">
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">Cash on Cash Return</p>
                      <p className={`text-2xl font-bold ${calculations.cashOnCash >= 8 ? 'text-green-500' : calculations.cashOnCash >= 5 ? 'text-yellow-500' : 'text-red-500'}`}>
                        {calculations.cashOnCash.toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted-foreground">On {formatAED(calculations.downPayment)} down</p>
                    </CardContent>
                  </Card>
                </div>
              </HardPaywall>

              {/* Max Loan Analysis */}
              <HardPaywall
                requiredTier="investor"
                feature="Max Loan Analysis"
                isLocked={hasReachedLimit && !isUnlimited}
                showTeaser={true}
              >
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold">Maximum Loan at {inputs.targetDSCR}x DSCR</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="p-4 rounded-lg bg-muted/30">
                        <p className="text-sm text-muted-foreground">Max Loan Amount</p>
                        <p className="text-xl font-bold text-primary">{formatAED(calculations.maxLoanAmount)}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/30">
                        <p className="text-sm text-muted-foreground">Max LTV Achievable</p>
                        <p className="text-xl font-bold">{Math.min(calculations.maxLTV, 80).toFixed(1)}%</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/30">
                        <p className="text-sm text-muted-foreground">Required Down Payment</p>
                        <p className="text-xl font-bold">{formatAED(inputs.propertyPrice - Math.min(calculations.maxLoanAmount, inputs.propertyPrice * 0.8))}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">
                      Based on your NOI of {formatAED(inputs.noi)}, the maximum loan you can support while maintaining a {inputs.targetDSCR}x DSCR is {formatAED(calculations.maxLoanAmount)}.
                    </p>
                  </CardContent>
                </Card>
              </HardPaywall>

              {/* Charts */}
              {(!hasReachedLimit || isUnlimited) && (
                <DSCRCharts
                  dscr={calculations.dscr}
                  noi={inputs.noi}
                  annualDebtService={calculations.annualDebtService}
                  loanAmount={calculations.loanAmount}
                  interestRate={inputs.interestRate}
                  formatAED={formatAED}
                />
              )}

              {!isUnlimited && hasReachedLimit && (
                <ContextualUpgradePrompt
                  feature="Unlimited Calculator Access"
                  description="Get unlimited access to all investment calculators, AI analysis, and advanced features."
                  className="mt-8"
                />
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}