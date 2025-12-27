import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Building2, Calendar, Percent, DollarSign, CheckCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CurrencyPill } from '@/components/CurrencyPill';
import { SliderInput } from '@/components/tools/SliderInput';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCurrency } from '@/contexts/CurrencyContext';
import { InvestmentDisclaimer } from '@/components/ui/disclaimers';
import { SEOHead } from '@/components/SEOHead';
import { PAGE_SEO, generateSoftwareApplicationSchema, SITE_CONFIG } from '@/lib/seo-config';
import { useToolUsage } from '@/hooks/useToolUsage';
import { UsageLimitBanner } from '@/components/freemium/UsageLimitBanner';
import { UpgradeModal } from '@/components/freemium/UpgradeModal';
import { ContextualUpgradePrompt } from '@/components/freemium/ContextualUpgradePrompt';
import { OffPlanCharts } from '@/components/tools/OffPlanCharts';
import { cn } from '@/lib/utils';

// Payment plan presets common in Dubai
const PAYMENT_PLANS = [
  {
    id: '20-80',
    name: '20/80 Plan',
    description: '20% during construction, 80% on handover',
    duringConstruction: 20,
    onHandover: 80,
    postHandover: 0,
    postHandoverMonths: 0,
    popular: true,
  },
  {
    id: '40-60',
    name: '40/60 Plan',
    description: '40% during construction, 60% on handover',
    duringConstruction: 40,
    onHandover: 60,
    postHandover: 0,
    postHandoverMonths: 0,
    popular: false,
  },
  {
    id: '50-50',
    name: '50/50 Plan',
    description: '50% during construction, 50% on handover',
    duringConstruction: 50,
    onHandover: 50,
    postHandover: 0,
    postHandoverMonths: 0,
    popular: false,
  },
  {
    id: '60-40-post',
    name: '60/40 Post-Handover',
    description: '10% booking, 50% during, 40% post-handover (24 months)',
    duringConstruction: 60,
    onHandover: 0,
    postHandover: 40,
    postHandoverMonths: 24,
    popular: true,
  },
  {
    id: '30-70-post',
    name: '30/70 Post-Handover',
    description: '30% during construction, 70% over 3 years post-handover',
    duringConstruction: 30,
    onHandover: 0,
    postHandover: 70,
    postHandoverMonths: 36,
    popular: false,
  },
  {
    id: 'custom',
    name: 'Custom Plan',
    description: 'Configure your own payment structure',
    duringConstruction: 50,
    onHandover: 30,
    postHandover: 20,
    postHandoverMonths: 12,
    popular: false,
  },
];

// DLD fees for off-plan
const OFF_PLAN_FEES = {
  oqoodFee: 0.04, // 4% of property value
  adminFee: 5460, // AED fixed
  dldRegistration: 0.04, // 4% at handover
  developerAdminFee: 5000, // Typical admin fee
};

function formatAED(amount: number): string {
  return `AED ${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function OffPlanCalculator() {
  const { formatPrice } = useCurrency();
  const { remainingUses, hasReachedLimit, isUnlimited, trackUsage, isLoading: usageLoading } = useToolUsage('offplan');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(PAYMENT_PLANS[0]);
  const [isCustom, setIsCustom] = useState(false);

  const [inputs, setInputs] = useState({
    propertyPrice: 2000000,
    constructionMonths: 36,
    expectedAppreciation: 15, // Total appreciation by handover
    // Custom plan inputs
    duringConstruction: 20,
    onHandover: 80,
    postHandover: 0,
    postHandoverMonths: 0,
    // Booking details
    bookingDeposit: 10, // Part of duringConstruction
  });

  const handleChange = (field: string, value: number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const handlePlanSelect = (plan: typeof PAYMENT_PLANS[0]) => {
    setSelectedPlan(plan);
    setIsCustom(plan.id === 'custom');
    if (plan.id !== 'custom') {
      setInputs(prev => ({
        ...prev,
        duringConstruction: plan.duringConstruction,
        onHandover: plan.onHandover,
        postHandover: plan.postHandover,
        postHandoverMonths: plan.postHandoverMonths,
      }));
    }
  };

  // Use custom values if custom plan selected
  const activePlan = useMemo(() => {
    if (isCustom) {
      return {
        duringConstruction: inputs.duringConstruction,
        onHandover: inputs.onHandover,
        postHandover: inputs.postHandover,
        postHandoverMonths: inputs.postHandoverMonths,
      };
    }
    return selectedPlan;
  }, [isCustom, inputs, selectedPlan]);

  // Calculate payments
  const calculations = useMemo(() => {
    const price = inputs.propertyPrice;
    
    // Amounts by phase
    const duringConstructionAmount = price * (activePlan.duringConstruction / 100);
    const bookingAmount = price * (inputs.bookingDeposit / 100);
    const remainingConstruction = duringConstructionAmount - bookingAmount;
    const onHandoverAmount = price * (activePlan.onHandover / 100);
    const postHandoverAmount = price * (activePlan.postHandover / 100);
    
    // Monthly payments during construction (excluding booking)
    const constructionMonths = Math.max(inputs.constructionMonths - 1, 1);
    const monthlyDuringConstruction = remainingConstruction / constructionMonths;
    
    // Monthly payments post-handover
    const monthlyPostHandover = activePlan.postHandoverMonths > 0 
      ? postHandoverAmount / activePlan.postHandoverMonths 
      : 0;
    
    // Fees
    const oqoodFee = price * OFF_PLAN_FEES.oqoodFee;
    const adminFee = OFF_PLAN_FEES.adminFee + OFF_PLAN_FEES.developerAdminFee;
    const dldAtHandover = price * OFF_PLAN_FEES.dldRegistration;
    const totalFees = oqoodFee + adminFee + dldAtHandover;
    
    // Appreciation calculations
    const appreciatedValue = price * (1 + inputs.expectedAppreciation / 100);
    const equityAtHandover = appreciatedValue - price;
    
    // Total paid by handover
    const paidByHandover = duringConstructionAmount + onHandoverAmount + oqoodFee + adminFee;
    const paidAfterHandover = postHandoverAmount + dldAtHandover;
    const grandTotal = price + totalFees;
    
    // Cash flow timeline
    const timeline = [];
    
    // Month 0: Booking
    timeline.push({
      month: 0,
      phase: 'Booking',
      payment: bookingAmount + oqoodFee + adminFee,
      cumulative: bookingAmount + oqoodFee + adminFee,
    });
    
    // Construction phase
    let cumulative = bookingAmount + oqoodFee + adminFee;
    for (let m = 1; m <= constructionMonths; m++) {
      cumulative += monthlyDuringConstruction;
      if (m % 3 === 0 || m === constructionMonths) { // Show quarterly
        timeline.push({
          month: m,
          phase: 'Construction',
          payment: monthlyDuringConstruction * (m === constructionMonths ? 1 : 3),
          cumulative,
        });
      }
    }
    
    // Handover
    if (onHandoverAmount > 0 || dldAtHandover > 0) {
      cumulative += onHandoverAmount + dldAtHandover;
      timeline.push({
        month: inputs.constructionMonths,
        phase: 'Handover',
        payment: onHandoverAmount + dldAtHandover,
        cumulative,
      });
    }
    
    // Post-handover
    if (postHandoverAmount > 0 && activePlan.postHandoverMonths > 0) {
      for (let m = 1; m <= activePlan.postHandoverMonths; m++) {
        cumulative += monthlyPostHandover;
        if (m % 6 === 0 || m === activePlan.postHandoverMonths) {
          timeline.push({
            month: inputs.constructionMonths + m,
            phase: 'Post-Handover',
            payment: monthlyPostHandover * Math.min(6, m),
            cumulative,
          });
        }
      }
    }
    
    return {
      duringConstructionAmount,
      bookingAmount,
      remainingConstruction,
      onHandoverAmount,
      postHandoverAmount,
      monthlyDuringConstruction,
      monthlyPostHandover,
      oqoodFee,
      adminFee,
      dldAtHandover,
      totalFees,
      appreciatedValue,
      equityAtHandover,
      paidByHandover,
      paidAfterHandover,
      grandTotal,
      timeline,
    };
  }, [inputs, activePlan]);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Off-Plan Payment Calculator | Dubai Wealth Hub"
        description="Calculate off-plan property payment plans in Dubai. Compare 20/80, 40/60, post-handover plans with Oqood fees and DLD costs."
      />
      <Navbar />

      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
        feature="tools"
        toolName="Off-Plan Calculator"
      />

      <section className="pt-32 pb-8">
        <div className="container mx-auto px-4">
          {!isUnlimited && !usageLoading && (
            <UsageLimitBanner remaining={remainingUses} total={3} type="tool" toolName="Off-Plan Calculator" />
          )}
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
                <div className="w-10 h-10 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-violet-500" />
                </div>
                <h1 className="font-heading text-3xl md:text-4xl text-foreground">
                  Off-Plan Payment Calculator
                </h1>
              </div>
              <p className="text-muted-foreground">
                Compare payment plans and calculate your cash flow for Dubai off-plan properties.
              </p>
              <InvestmentDisclaimer variant="inline" className="mt-2" />
            </motion.div>

            <CurrencyPill />
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
              {/* Payment Plan Selection */}
              <div className="p-6 rounded-2xl bg-card border border-border">
                <h2 className="font-heading text-xl text-foreground mb-4">Select Payment Plan</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {PAYMENT_PLANS.map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => handlePlanSelect(plan)}
                      className={cn(
                        "relative p-4 rounded-xl border text-left transition-all",
                        selectedPlan.id === plan.id
                          ? "border-violet-500 bg-violet-500/10"
                          : "border-border hover:border-violet-500/50"
                      )}
                    >
                      {plan.popular && (
                        <Badge className="absolute -top-2 -right-2 bg-violet-500 text-white text-xs">
                          Popular
                        </Badge>
                      )}
                      <p className="font-medium text-foreground text-sm">{plan.name}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {plan.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Property Details */}
              <div className="p-6 rounded-2xl bg-card border border-border">
                <h2 className="font-heading text-xl text-foreground mb-6">Property Details</h2>
                
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

                  <div className="grid grid-cols-2 gap-4">
                    <SliderInput
                      label="Construction Period"
                      value={inputs.constructionMonths}
                      onChange={(v) => handleChange('constructionMonths', v)}
                      min={12}
                      max={60}
                      suffix=" months"
                    />
                    <SliderInput
                      label="Booking Deposit"
                      value={inputs.bookingDeposit}
                      onChange={(v) => handleChange('bookingDeposit', v)}
                      min={5}
                      max={20}
                      suffix="%"
                    />
                  </div>

                  <SliderInput
                    label="Expected Appreciation (by handover)"
                    value={inputs.expectedAppreciation}
                    onChange={(v) => handleChange('expectedAppreciation', v)}
                    min={0}
                    max={50}
                    suffix="%"
                  />
                </div>
              </div>

              {/* Custom Plan Config */}
              {isCustom && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-6 rounded-2xl bg-card border border-violet-500/30"
                >
                  <h2 className="font-heading text-xl text-foreground mb-6">Custom Payment Structure</h2>
                  
                  <div className="space-y-6">
                    <SliderInput
                      label="During Construction"
                      value={inputs.duringConstruction}
                      onChange={(v) => handleChange('duringConstruction', v)}
                      min={10}
                      max={100}
                      suffix="%"
                    />
                    <SliderInput
                      label="On Handover"
                      value={inputs.onHandover}
                      onChange={(v) => handleChange('onHandover', v)}
                      min={0}
                      max={100 - inputs.duringConstruction}
                      suffix="%"
                    />
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">Post-Handover</span>
                        <span className="text-sm font-semibold text-gold">
                          {100 - inputs.duringConstruction - inputs.onHandover}%
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">Auto-calculated from remaining percentage</p>
                    </div>
                    {(100 - inputs.duringConstruction - inputs.onHandover) > 0 && (
                      <SliderInput
                        label="Post-Handover Period"
                        value={inputs.postHandoverMonths}
                        onChange={(v) => handleChange('postHandoverMonths', v)}
                        min={6}
                        max={60}
                        suffix=" months"
                      />
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground mt-4">
                    Total: {inputs.duringConstruction + inputs.onHandover + (100 - inputs.duringConstruction - inputs.onHandover)}%
                  </p>
                </motion.div>
              )}

              {/* Charts */}
              <OffPlanCharts
                timeline={calculations.timeline}
                planBreakdown={{
                  duringConstruction: activePlan.duringConstruction,
                  onHandover: activePlan.onHandover,
                  postHandover: activePlan.postHandover,
                }}
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
              {/* Key Metrics */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-500/10 via-violet-500/5 to-transparent border border-violet-500/20">
                <h2 className="font-heading text-xl text-foreground mb-6">Payment Summary</h2>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-card/50">
                    <p className="text-sm text-muted-foreground mb-1">Monthly During Construction</p>
                    <p className="font-heading text-2xl text-violet-400">
                      {formatAED(calculations.monthlyDuringConstruction)}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-card/50">
                    <p className="text-sm text-muted-foreground mb-1">Booking Payment</p>
                    <p className="font-heading text-2xl text-foreground">
                      {formatAED(calculations.bookingAmount)}
                    </p>
                  </div>
                </div>

                {calculations.monthlyPostHandover > 0 && (
                  <div className="p-4 rounded-xl bg-card/50 mb-4">
                    <p className="text-sm text-muted-foreground mb-1">Monthly Post-Handover</p>
                    <p className="font-heading text-2xl text-violet-400">
                      {formatAED(calculations.monthlyPostHandover)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      For {activePlan.postHandoverMonths} months after handover
                    </p>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <p className="text-sm text-muted-foreground">Estimated Equity at Handover</p>
                  </div>
                  <p className="font-heading text-3xl text-emerald-400">
                    {formatAED(calculations.equityAtHandover)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Based on {inputs.expectedAppreciation}% appreciation
                  </p>
                </div>
              </div>

              {/* Payment Timeline */}
              <div className="p-6 rounded-2xl bg-card border border-border">
                <h2 className="font-heading text-xl text-foreground mb-6">Payment Breakdown</h2>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      During Construction ({activePlan.duringConstruction}%)
                    </span>
                    <span className="font-heading text-lg text-foreground">
                      {formatAED(calculations.duringConstructionAmount)}
                    </span>
                  </div>
                  
                  {calculations.onHandoverAmount > 0 && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        On Handover ({activePlan.onHandover}%)
                      </span>
                      <span className="font-heading text-lg text-foreground">
                        {formatAED(calculations.onHandoverAmount)}
                      </span>
                    </div>
                  )}
                  
                  {calculations.postHandoverAmount > 0 && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Post-Handover ({activePlan.postHandover}%)
                      </span>
                      <span className="font-heading text-lg text-foreground">
                        {formatAED(calculations.postHandoverAmount)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Fees Breakdown */}
              <div className="p-6 rounded-2xl bg-card border border-border">
                <h2 className="font-heading text-xl text-foreground mb-6">Fees & Costs</h2>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <span className="text-foreground">Oqood Fee (4%)</span>
                      <p className="text-xs text-muted-foreground">Paid at booking</p>
                    </div>
                    <span className="font-heading text-lg text-foreground">
                      {formatAED(calculations.oqoodFee)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <span className="text-foreground">Admin Fees</span>
                      <p className="text-xs text-muted-foreground">DLD + Developer</p>
                    </div>
                    <span className="font-heading text-lg text-foreground">
                      {formatAED(calculations.adminFee)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <span className="text-foreground">DLD Registration (4%)</span>
                      <p className="text-xs text-muted-foreground">Paid at handover</p>
                    </div>
                    <span className="font-heading text-lg text-foreground">
                      {formatAED(calculations.dldAtHandover)}
                    </span>
                  </div>

                  <div className="border-t border-border pt-3 mt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground font-medium">Total Fees</span>
                      <span className="font-heading text-xl text-foreground">
                        {formatAED(calculations.totalFees)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grand Total */}
              <div className="p-6 rounded-2xl bg-secondary border border-border">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-secondary-foreground">Property Price</span>
                  <span className="font-heading text-lg text-secondary-foreground">
                    {formatAED(inputs.propertyPrice)}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-secondary-foreground">Total Fees</span>
                  <span className="font-heading text-lg text-secondary-foreground">
                    + {formatAED(calculations.totalFees)}
                  </span>
                </div>
                <div className="border-t border-border/50 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-secondary-foreground font-medium">Grand Total</span>
                    <span className="font-heading text-2xl text-gold">
                      {formatAED(calculations.grandTotal)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pro Tips */}
              <div className="p-6 rounded-2xl bg-card border border-border">
                <h3 className="font-heading text-lg text-foreground mb-4">Off-Plan Tips</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>Post-handover plans reduce upfront cash but may have higher total cost</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>Oqood (4%) is required for off-plan registration with DLD</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>Consider construction delays when planning your cash flow</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>You can often sell (assign) before handover if prices appreciate</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
