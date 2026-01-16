import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeftRight, Building, Calendar, TrendingUp, AlertTriangle, CheckCircle2, Lock } from 'lucide-react';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CurrencyPill } from '@/components/CurrencyPill';
import { SliderInput } from '@/components/tools/SliderInput';
import { DubaiPresets, AreaPreset } from '@/components/tools/DubaiPresets';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useAirbnbMarketData } from '@/hooks/useAirbnbMarketData';
import { DEFAULT_SHORT_TERM_COSTS, AREA_SERVICE_CHARGES } from '@/lib/dubaiRealEstateFees';
import { InvestmentDisclaimer } from '@/components/ui/disclaimers';
import { Badge } from '@/components/ui/badge';
import { ContextualUpgradePrompt } from '@/components/freemium/ContextualUpgradePrompt';
import { UsageLimitBanner } from '@/components/freemium/UsageLimitBanner';
import { UpgradeModal } from '@/components/freemium/UpgradeModal';
import { HardPaywall } from '@/components/freemium/HardPaywall';
import { useAuth } from '@/hooks/useAuth';
import { useToolUsage } from '@/hooks/useToolUsage';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
  PieChart, Pie, Cell
} from 'recharts';

const CHART_COLORS = {
  str: '#f97316', // orange
  ltr: '#3b82f6', // blue
  expenses: '#ef4444',
  net: '#22c55e',
};

// Helper to format AED amounts
function formatAED(amount: number): string {
  return `AED ${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function StrVsLtrCalculator() {
  const { formatPrice } = useCurrency();
  const { remainingUses, hasReachedLimit, isUnlimited, trackUsage, canUse, isLoading: usageLoading } = useToolUsage('str-vs-ltr');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [hasTracked, setHasTracked] = useState(false);
  const [activePreset, setActivePreset] = useState<string>();

  const [inputs, setInputs] = useState({
    propertyPrice: 2000000,
    propertySizeSqft: 1200,
    selectedArea: 'Dubai Marina',
    bedrooms: 2,
    // STR inputs
    strNightlyRate: 800,
    strOccupancy: 70,
    strManagementFee: 20,
    strPlatformFee: 3,
    // LTR inputs
    ltrMonthlyRent: 12000,
    ltrVacancy: 5, // % vacancy per year
    ltrManagementFee: 5,
    // Common inputs
    utilitiesMonthly: 1500,
    maintenancePercent: 1.5,
    insuranceAnnual: 2000,
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

  // Market data integration
  const { data: marketData } = useAirbnbMarketData({
    areaName: inputs.selectedArea,
    bedrooms: inputs.bedrooms,
  });

  const handleChange = (field: string, value: number | string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
    if (field !== 'selectedArea') setActivePreset(undefined);
  };

  const handlePresetSelect = (preset: AreaPreset) => {
    setInputs(prev => ({
      ...prev,
      propertyPrice: preset.propertyPrice,
      strNightlyRate: preset.nightlyRate || prev.strNightlyRate,
      ltrMonthlyRent: preset.monthlyRent || (preset.annualRent ? Math.round(preset.annualRent / 12) : prev.ltrMonthlyRent),
      propertySizeSqft: preset.sizeSqft || prev.propertySizeSqft,
      selectedArea: preset.name,
    }));
    setActivePreset(preset.name);
  };

  // Calculations
  const calculations = useMemo(() => {
    const serviceChargeRate = AREA_SERVICE_CHARGES[inputs.selectedArea] || 15;
    const annualServiceCharges = inputs.propertySizeSqft * serviceChargeRate;
    const annualMaintenance = inputs.propertyPrice * (inputs.maintenancePercent / 100);

    // STR Calculations
    const strNightsBooked = 365 * (inputs.strOccupancy / 100);
    const strGrossRevenue = strNightsBooked * inputs.strNightlyRate;
    const strPlatformFees = strGrossRevenue * (inputs.strPlatformFee / 100);
    const strManagementFees = strGrossRevenue * (inputs.strManagementFee / 100);
    const strUtilities = inputs.utilitiesMonthly * 12;
    const strLicensing = DEFAULT_SHORT_TERM_COSTS.holidayHomeLicense + 
                         DEFAULT_SHORT_TERM_COSTS.dtcmPermit + 
                         DEFAULT_SHORT_TERM_COSTS.licensingRenewal;
    const strTotalExpenses = strPlatformFees + strManagementFees + strUtilities + 
                             annualServiceCharges + annualMaintenance + strLicensing + 
                             inputs.insuranceAnnual;
    const strNetIncome = strGrossRevenue - strTotalExpenses;
    const strNetYield = (strNetIncome / inputs.propertyPrice) * 100;
    const strGrossYield = (strGrossRevenue / inputs.propertyPrice) * 100;

    // LTR Calculations
    const ltrGrossRevenue = inputs.ltrMonthlyRent * 12;
    const ltrVacancyLoss = ltrGrossRevenue * (inputs.ltrVacancy / 100);
    const ltrEffectiveRevenue = ltrGrossRevenue - ltrVacancyLoss;
    const ltrManagementFees = ltrEffectiveRevenue * (inputs.ltrManagementFee / 100);
    const ltrUtilities = 0; // Typically tenant pays
    const ltrTotalExpenses = ltrManagementFees + ltrUtilities + annualServiceCharges + 
                             annualMaintenance + inputs.insuranceAnnual;
    const ltrNetIncome = ltrEffectiveRevenue - ltrTotalExpenses;
    const ltrNetYield = (ltrNetIncome / inputs.propertyPrice) * 100;
    const ltrGrossYield = (ltrGrossRevenue / inputs.propertyPrice) * 100;

    // Comparison metrics
    const incomeDifference = strNetIncome - ltrNetIncome;
    const yieldDifference = strNetYield - ltrNetYield;
    const winner = strNetYield > ltrNetYield ? 'str' : 'ltr';
    const breakEvenOccupancy = (ltrNetIncome + strTotalExpenses) / (inputs.strNightlyRate * 365) * 100;

    return {
      str: {
        grossRevenue: strGrossRevenue,
        totalExpenses: strTotalExpenses,
        netIncome: strNetIncome,
        netYield: strNetYield,
        grossYield: strGrossYield,
        nightsBooked: strNightsBooked,
        expenses: {
          platform: strPlatformFees,
          management: strManagementFees,
          utilities: strUtilities,
          serviceCharges: annualServiceCharges,
          maintenance: annualMaintenance,
          licensing: strLicensing,
          insurance: inputs.insuranceAnnual,
        },
      },
      ltr: {
        grossRevenue: ltrGrossRevenue,
        effectiveRevenue: ltrEffectiveRevenue,
        totalExpenses: ltrTotalExpenses,
        netIncome: ltrNetIncome,
        netYield: ltrNetYield,
        grossYield: ltrGrossYield,
        vacancyLoss: ltrVacancyLoss,
        expenses: {
          management: ltrManagementFees,
          serviceCharges: annualServiceCharges,
          maintenance: annualMaintenance,
          insurance: inputs.insuranceAnnual,
        },
      },
      comparison: {
        incomeDifference,
        yieldDifference,
        winner,
        breakEvenOccupancy,
      },
    };
  }, [inputs]);

  // Chart data
  const incomeComparisonData = [
    { name: 'Gross Revenue', STR: calculations.str.grossRevenue, LTR: calculations.ltr.grossRevenue },
    { name: 'Expenses', STR: -calculations.str.totalExpenses, LTR: -calculations.ltr.totalExpenses },
    { name: 'Net Income', STR: calculations.str.netIncome, LTR: calculations.ltr.netIncome },
  ];

  const yieldComparisonData = [
    { name: 'Net Yield', STR: calculations.str.netYield, LTR: calculations.ltr.netYield },
    { name: 'Gross Yield', STR: calculations.str.grossYield, LTR: calculations.ltr.grossYield },
  ];

  const radarData = [
    { metric: 'Net Yield', STR: calculations.str.netYield, LTR: calculations.ltr.netYield, fullMark: 15 },
    { metric: 'Gross Yield', STR: calculations.str.grossYield, LTR: calculations.ltr.grossYield, fullMark: 20 },
    { metric: 'Stability', STR: 3, LTR: 9, fullMark: 10 },
    { metric: 'Flexibility', STR: 9, LTR: 3, fullMark: 10 },
    { metric: 'Effort', STR: 2, LTR: 8, fullMark: 10 },
  ];

  const strExpenseData = [
    { name: 'Platform Fees', value: calculations.str.expenses.platform, color: '#f97316' },
    { name: 'Management', value: calculations.str.expenses.management, color: '#fb923c' },
    { name: 'Utilities', value: calculations.str.expenses.utilities, color: '#fdba74' },
    { name: 'Service Charges', value: calculations.str.expenses.serviceCharges, color: '#fed7aa' },
    { name: 'Maintenance', value: calculations.str.expenses.maintenance, color: '#ffedd5' },
    { name: 'Licensing', value: calculations.str.expenses.licensing, color: '#ea580c' },
  ];

  const ltrExpenseData = [
    { name: 'Management', value: calculations.ltr.expenses.management, color: '#3b82f6' },
    { name: 'Service Charges', value: calculations.ltr.expenses.serviceCharges, color: '#60a5fa' },
    { name: 'Maintenance', value: calculations.ltr.expenses.maintenance, color: '#93c5fd' },
    { name: 'Insurance', value: calculations.ltr.expenses.insurance, color: '#bfdbfe' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
        feature="tools"
        toolName="STR vs LTR Calculator"
      />

      <section className="pt-24 pb-8">
        <div className="container mx-auto px-4">
          {!isUnlimited && !usageLoading && (
            <UsageLimitBanner remaining={remainingUses} total={2} type="tool" toolName="STR vs LTR Calculator" />
          )}
          <Breadcrumbs 
            items={[
              { label: 'Tools', href: '/tools' },
              { label: 'STR vs LTR Calculator' }
            ]} 
            className="mb-6"
          />

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-blue-500/20 border border-orange-500/20 flex items-center justify-center">
                  <ArrowLeftRight className="w-5 h-5 text-foreground" />
                </div>
                <h1 className="font-heading text-3xl md:text-4xl text-foreground">STR vs LTR Calculator</h1>
              </div>
              <p className="text-muted-foreground">Compare Short-Term (Airbnb) vs Long-Term Rental strategies.</p>
              <InvestmentDisclaimer variant="inline" className="mt-2" />
            </motion.div>
            <CurrencyPill />
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Inputs */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="space-y-6">
              <div className="p-6 rounded-2xl bg-card border border-border">
                <DubaiPresets onSelectPreset={handlePresetSelect} activePreset={activePreset} showDetails />
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border space-y-6">
                <h2 className="font-heading text-xl text-foreground">Property Details</h2>
                <SliderInput label="Property Price" value={inputs.propertyPrice} onChange={(v) => handleChange('propertyPrice', v)} min={500000} max={10000000} step={100000} formatValue={formatAED} />
                <div className="grid grid-cols-2 gap-4">
                  <SliderInput label="Size" value={inputs.propertySizeSqft} onChange={(v) => handleChange('propertySizeSqft', v)} min={400} max={3000} step={50} suffix=" sqft" />
                  <SliderInput label="Bedrooms" value={inputs.bedrooms} onChange={(v) => handleChange('bedrooms', v)} min={1} max={5} />
                </div>
              </div>

              {/* STR Inputs */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent border border-orange-500/20 space-y-6">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-400" />
                  <h2 className="font-heading text-xl text-foreground">Short-Term Rental</h2>
                </div>
                <SliderInput label="Nightly Rate" value={inputs.strNightlyRate} onChange={(v) => handleChange('strNightlyRate', v)} min={200} max={3000} step={50} formatValue={formatAED} />
                <SliderInput label="Occupancy Rate" value={inputs.strOccupancy} onChange={(v) => handleChange('strOccupancy', v)} min={30} max={95} suffix="%" />
                <SliderInput label="Management Fee" value={inputs.strManagementFee} onChange={(v) => handleChange('strManagementFee', v)} min={0} max={30} suffix="%" />
                <SliderInput label="Platform Fee" value={inputs.strPlatformFee} onChange={(v) => handleChange('strPlatformFee', v)} min={0} max={15} suffix="%" />
                
                {marketData && (
                  <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <p className="text-xs text-muted-foreground mb-2">Market Data (AirDNA)</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-muted-foreground">Avg Rate:</span> <span className="font-medium">{formatAED(marketData.avg_daily_rate || 0)}</span></div>
                      <div><span className="text-muted-foreground">Occupancy:</span> <span className="font-medium">{marketData.avg_occupancy?.toFixed(0)}%</span></div>
                    </div>
                  </div>
                )}
              </div>

              {/* LTR Inputs */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/20 space-y-6">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-400" />
                  <h2 className="font-heading text-xl text-foreground">Long-Term Rental</h2>
                </div>
                <SliderInput label="Monthly Rent" value={inputs.ltrMonthlyRent} onChange={(v) => handleChange('ltrMonthlyRent', v)} min={3000} max={50000} step={500} formatValue={formatAED} />
                <SliderInput label="Vacancy Rate" value={inputs.ltrVacancy} onChange={(v) => handleChange('ltrVacancy', v)} min={0} max={20} suffix="%" />
                <SliderInput label="Management Fee" value={inputs.ltrManagementFee} onChange={(v) => handleChange('ltrManagementFee', v)} min={0} max={15} suffix="%" />
              </div>
            </motion.div>

            {/* Middle & Right Columns - Results */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="lg:col-span-2 space-y-6">
              {/* Winner Banner */}
              <HardPaywall
                requiredTier="investor"
                feature="STR vs LTR Analysis"
                isLocked={hasReachedLimit && !isUnlimited}
                showTeaser={true}
                teaserMessage="Upgrade to see the full comparison and recommendations"
              >
                <div className={`p-6 rounded-2xl border ${
                  calculations.comparison.winner === 'str' 
                    ? 'bg-gradient-to-r from-orange-500/10 to-orange-500/5 border-orange-500/20' 
                    : 'bg-gradient-to-r from-blue-500/10 to-blue-500/5 border-blue-500/20'
                }`}>
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className={`w-8 h-8 ${calculations.comparison.winner === 'str' ? 'text-orange-400' : 'text-blue-400'}`} />
                      <div>
                        <p className="text-sm text-muted-foreground">Better Return</p>
                        <p className="font-heading text-2xl text-foreground">
                          {calculations.comparison.winner === 'str' ? 'Short-Term Rental' : 'Long-Term Rental'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Yield Advantage</p>
                      <p className={`font-heading text-3xl ${calculations.comparison.winner === 'str' ? 'text-orange-400' : 'text-blue-400'}`}>
                        +{Math.abs(calculations.comparison.yieldDifference).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              </HardPaywall>

              {/* Side by Side Comparison Cards */}
              <HardPaywall
                requiredTier="investor"
                feature="Detailed Comparison"
                isLocked={hasReachedLimit && !isUnlimited}
                showTeaser={true}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* STR Card */}
                  <div className="p-6 rounded-2xl bg-card border border-orange-500/20 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-orange-400" />
                        <h3 className="font-heading text-lg text-foreground">Short-Term</h3>
                      </div>
                      <Badge variant="secondary" className="bg-orange-500/10 text-orange-400 border-orange-500/20">
                        {calculations.str.nightsBooked.toFixed(0)} nights/yr
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Gross Revenue</span>
                        <span className="font-medium text-emerald-400">{formatAED(calculations.str.grossRevenue)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Expenses</span>
                        <span className="font-medium text-red-400">-{formatAED(calculations.str.totalExpenses)}</span>
                      </div>
                      <div className="flex justify-between text-sm pt-2 border-t border-border">
                        <span className="font-medium">Net Income</span>
                        <span className="font-heading text-lg text-foreground">{formatAED(calculations.str.netIncome)}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-3 rounded-lg bg-orange-500/10">
                        <p className="text-xs text-muted-foreground">Net Yield</p>
                        <p className="font-heading text-xl text-orange-400">{calculations.str.netYield.toFixed(1)}%</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/30">
                        <p className="text-xs text-muted-foreground">Gross Yield</p>
                        <p className="font-heading text-xl text-foreground">{calculations.str.grossYield.toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>

                  {/* LTR Card */}
                  <div className="p-6 rounded-2xl bg-card border border-blue-500/20 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building className="w-5 h-5 text-blue-400" />
                        <h3 className="font-heading text-lg text-foreground">Long-Term</h3>
                      </div>
                      <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                        {100 - inputs.ltrVacancy}% occupancy
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Gross Revenue</span>
                        <span className="font-medium text-emerald-400">{formatAED(calculations.ltr.grossRevenue)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Expenses</span>
                        <span className="font-medium text-red-400">-{formatAED(calculations.ltr.totalExpenses)}</span>
                      </div>
                      <div className="flex justify-between text-sm pt-2 border-t border-border">
                        <span className="font-medium">Net Income</span>
                        <span className="font-heading text-lg text-foreground">{formatAED(calculations.ltr.netIncome)}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-3 rounded-lg bg-blue-500/10">
                        <p className="text-xs text-muted-foreground">Net Yield</p>
                        <p className="font-heading text-xl text-blue-400">{calculations.ltr.netYield.toFixed(1)}%</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/30">
                        <p className="text-xs text-muted-foreground">Gross Yield</p>
                        <p className="font-heading text-xl text-foreground">{calculations.ltr.grossYield.toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </HardPaywall>

              {/* Charts */}
              {(!hasReachedLimit || isUnlimited) && (
                <>
                  {/* Income Comparison Chart */}
                  <div className="p-6 rounded-2xl bg-card border border-border">
                    <h3 className="font-heading text-lg text-foreground mb-4">Income Comparison</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={incomeComparisonData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                          <YAxis tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                          <Tooltip 
                            formatter={(value: number) => formatAED(Math.abs(value))}
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                          />
                          <Legend />
                          <Bar dataKey="STR" fill={CHART_COLORS.str} radius={[4, 4, 0, 0]} />
                          <Bar dataKey="LTR" fill={CHART_COLORS.ltr} radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Radar Chart */}
                  <div className="p-6 rounded-2xl bg-card border border-border">
                    <h3 className="font-heading text-lg text-foreground mb-4">Strategy Comparison</h3>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="hsl(var(--border))" />
                          <PolarAngleAxis dataKey="metric" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                          <PolarRadiusAxis angle={90} domain={[0, 15]} tick={{ fontSize: 10 }} />
                          <Radar name="STR" dataKey="STR" stroke={CHART_COLORS.str} fill={CHART_COLORS.str} fillOpacity={0.3} />
                          <Radar name="LTR" dataKey="LTR" stroke={CHART_COLORS.ltr} fill={CHART_COLORS.ltr} fillOpacity={0.3} />
                          <Legend />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </>
              )}

              {/* Break-even Analysis */}
              <HardPaywall
                requiredTier="investor"
                feature="Break-even Analysis"
                isLocked={hasReachedLimit && !isUnlimited}
                showTeaser={true}
              >
                <div className="p-6 rounded-2xl bg-card border border-border">
                  <h3 className="font-heading text-lg text-foreground mb-4">Break-Even Analysis</h3>
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
                    <AlertTriangle className="w-8 h-8 text-gold flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">STR Break-Even Occupancy</p>
                      <p className="text-sm text-muted-foreground">
                        You need at least <span className="font-semibold text-gold">{calculations.comparison.breakEvenOccupancy.toFixed(0)}%</span> occupancy 
                        for STR to match LTR returns at your current nightly rate.
                      </p>
                    </div>
                  </div>
                </div>
              </HardPaywall>

              {!isUnlimited && hasReachedLimit && (
                <ContextualUpgradePrompt
                  feature="Unlimited Calculator Access"
                  description="Get unlimited access to all investment calculators, AI analysis, and advanced features."
                  className="mt-8"
                />
              )}
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}