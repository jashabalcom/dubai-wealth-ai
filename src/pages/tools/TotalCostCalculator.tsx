import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Wallet, 
  Building2, 
  Landmark,
  Home,
  Calendar,
  TrendingUp,
  DollarSign,
  PiggyBank,
  BarChart3,
  Info,
  Download
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SliderInput } from '@/components/tools/SliderInput';
import { CurrencyPill } from '@/components/CurrencyPill';
import { useCurrency } from '@/contexts/CurrencyContext';
import { DubaiPresets, DUBAI_AREA_PRESETS, AreaPreset } from '@/components/tools/DubaiPresets';
import { FeeBreakdownCard } from '@/components/tools/FeeBreakdownCard';
import { TotalCostCharts } from '@/components/tools/TotalCostCharts';
import { SensitivityAnalysisCharts } from '@/components/tools/SensitivityAnalysisCharts';
import { CalculatorAIAnalysis } from '@/components/tools/CalculatorAIAnalysis';
import { generateTotalCostPDF } from '@/lib/pdfExport';
import { useToast } from '@/hooks/use-toast';
import { 
  calculateAcquisitionCosts, 
  calculateAnnualOngoingCosts,
  calculateExitCosts,
  DEFAULT_ACQUISITION_FEES,
  DEFAULT_MORTGAGE_FEES,
  FEE_DESCRIPTIONS
} from '@/lib/dubaiRealEstateFees';
import { InvestmentDisclaimer } from '@/components/ui/disclaimers';
import { ContextualUpgradePrompt } from '@/components/freemium/ContextualUpgradePrompt';
import { useAuth } from '@/hooks/useAuth';

type UsageType = 'personal' | 'long-term' | 'short-term';

const currencySymbols: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'C$',
  AUD: 'A$',
  CHF: 'CHF',
  INR: '₹',
  CNY: '¥',
  JPY: '¥',
  SGD: 'S$',
};

export default function TotalCostCalculator() {
  const { convert, formatPrice, selectedCurrency } = useCurrency();
  const { toast } = useToast();
  const [activePreset, setActivePreset] = useState<string>('');

  // Property Details
  const [purchasePrice, setPurchasePrice] = useState(2000000);
  const [propertySize, setPropertySize] = useState(1200);
  const [selectedArea, setSelectedArea] = useState('Dubai Marina');
  const [isOffPlan, setIsOffPlan] = useState(false);

  // Financing
  const [useMortgage, setUseMortgage] = useState(false);
  const [downPayment, setDownPayment] = useState(25);
  const [interestRate, setInterestRate] = useState(4.5);
  const [loanTerm, setLoanTerm] = useState(25);

  // Investment Strategy
  const [usageType, setUsageType] = useState<UsageType>('long-term');
  const [annualRent, setAnnualRent] = useState(120000);
  const [dailyRate, setDailyRate] = useState(800);
  const [occupancyRate, setOccupancyRate] = useState(70);

  // Timeline
  const [holdingPeriod, setHoldingPeriod] = useState(10);
  const [appreciationRate, setAppreciationRate] = useState(5);

  const currencySymbol = currencySymbols[selectedCurrency] || '$';

  const handlePresetSelect = (preset: AreaPreset) => {
    setActivePreset(preset.name);
    setPurchasePrice(preset.propertyPrice);
    setPropertySize(preset.sizeSqft || 1200);
    setSelectedArea(preset.name);
    setAnnualRent(preset.annualRent || 120000);
    setDailyRate(preset.nightlyRate || 800);
  };

  // Calculate all costs
  const calculations = useMemo(() => {
    const loanAmount = useMortgage ? purchasePrice * (1 - downPayment / 100) : 0;
    
    // Acquisition costs
    const acquisition = calculateAcquisitionCosts(
      purchasePrice,
      DEFAULT_ACQUISITION_FEES,
      useMortgage,
      loanAmount
    );

    // Annual ongoing costs
    const annualOngoing = calculateAnnualOngoingCosts(
      purchasePrice,
      propertySize,
      selectedArea,
      usageType !== 'personal'
    );

    // Monthly mortgage payment
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = loanTerm * 12;
    const monthlyPayment = useMortgage && loanAmount > 0
      ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
        (Math.pow(1 + monthlyRate, numPayments) - 1)
      : 0;
    const annualMortgagePayment = monthlyPayment * 12;

    // Total interest over loan term
    const totalMortgagePayments = monthlyPayment * numPayments;
    const totalInterest = useMortgage ? totalMortgagePayments - loanAmount : 0;

    // Calculate rental income
    let annualRentalIncome = 0;
    if (usageType === 'long-term') {
      annualRentalIncome = annualRent;
    } else if (usageType === 'short-term') {
      annualRentalIncome = dailyRate * 365 * (occupancyRate / 100) * 0.85; // 15% platform fees
    }

    // Property value at exit
    const exitPropertyValue = purchasePrice * Math.pow(1 + appreciationRate / 100, holdingPeriod);
    
    // Outstanding mortgage at exit
    const yearsRemaining = Math.max(0, loanTerm - holdingPeriod);
    const paymentsRemaining = yearsRemaining * 12;
    const outstandingMortgage = useMortgage && paymentsRemaining > 0
      ? (loanAmount * (Math.pow(1 + monthlyRate, numPayments) - Math.pow(1 + monthlyRate, numPayments - paymentsRemaining))) /
        (Math.pow(1 + monthlyRate, numPayments) - 1)
      : 0;

    // Exit costs
    const exit = calculateExitCosts(exitPropertyValue, outstandingMortgage);

    // Total ongoing costs over holding period
    const totalOngoingCosts = annualOngoing.total * holdingPeriod;

    // Total financing costs (mortgage payments within holding period)
    const mortgageYears = Math.min(holdingPeriod, loanTerm);
    const totalFinancingCosts = useMortgage 
      ? annualMortgagePayment * mortgageYears + DEFAULT_MORTGAGE_FEES.mortgageRegistration * loanAmount / 100 + DEFAULT_MORTGAGE_FEES.bankProcessing * loanAmount / 100
      : 0;

    // Total rental income over holding period
    const totalRentalIncome = annualRentalIncome * holdingPeriod;

    // Capital appreciation
    const capitalAppreciation = exitPropertyValue - purchasePrice;

    // Total cost of ownership
    const totalCostOfOwnership = acquisition.grandTotal + totalOngoingCosts + totalFinancingCosts + exit.total;

    // Net profit
    const netProfit = capitalAppreciation + totalRentalIncome - totalOngoingCosts - totalFinancingCosts - exit.total - (useMortgage ? totalInterest : 0);

    // ROI
    const initialInvestment = useMortgage ? (purchasePrice * downPayment / 100) + acquisition.grandTotal : purchasePrice + acquisition.grandTotal;
    const roi = (netProfit / initialInvestment) * 100;
    const annualizedRoi = Math.pow(1 + roi / 100, 1 / holdingPeriod) - 1;

    // Break-even year
    let breakEvenYear = 0;
    if (annualRentalIncome > 0) {
      const annualCostWithMortgage = annualOngoing.total + (useMortgage ? annualMortgagePayment : 0);
      if (annualRentalIncome > annualCostWithMortgage) {
        breakEvenYear = Math.ceil(acquisition.grandTotal / (annualRentalIncome - annualCostWithMortgage));
      }
    }

    // Generate yearly data for charts
    const yearlyData = [];
    let cumulativeCost = acquisition.grandTotal;
    let cumulativeRental = 0;
    
    for (let year = 0; year <= holdingPeriod; year++) {
      const propertyValue = purchasePrice * Math.pow(1 + appreciationRate / 100, year);
      const isExitYear = year === holdingPeriod;
      
      cumulativeRental += year > 0 ? annualRentalIncome : 0;
      
      yearlyData.push({
        year,
        acquisitionCost: year === 0 ? acquisition.grandTotal : 0,
        ongoingCost: year > 0 ? annualOngoing.total : 0,
        financingCost: year > 0 && useMortgage && year <= loanTerm ? annualMortgagePayment : 0,
        exitCost: isExitYear ? exit.total : 0,
        cumulativeCost: year === 0 ? cumulativeCost : (cumulativeCost += annualOngoing.total + (useMortgage && year <= loanTerm ? annualMortgagePayment : 0) + (isExitYear ? exit.total : 0)),
        propertyValue,
        rentalIncome: cumulativeRental,
      });
    }

    return {
      acquisition,
      annualOngoing,
      exit,
      loanAmount,
      monthlyPayment,
      totalInterest,
      annualRentalIncome,
      totalRentalIncome,
      totalOngoingCosts,
      totalFinancingCosts,
      totalCostOfOwnership,
      capitalAppreciation,
      netProfit,
      roi,
      annualizedRoi: annualizedRoi * 100,
      breakEvenYear,
      initialInvestment,
      exitPropertyValue,
      yearlyData,
      costBreakdown: {
        acquisition: acquisition.grandTotal,
        ongoing: totalOngoingCosts,
        financing: useMortgage ? totalFinancingCosts : 0,
        exit: exit.total,
      }
    };
  }, [purchasePrice, propertySize, selectedArea, isOffPlan, useMortgage, downPayment, interestRate, loanTerm, usageType, annualRent, dailyRate, occupancyRate, holdingPeriod, appreciationRate]);

  // Build fee items for breakdown cards
  const acquisitionFeeItems = useMemo(() => [
    { label: 'DLD Registration (4%)', value: calculations.acquisition.dldFee, key: 'dldRegistration' },
    { label: 'DLD Admin Fee', value: calculations.acquisition.dldAdminFee, key: 'dldAdminFee' },
    { label: 'Agent Commission (2%)', value: calculations.acquisition.agentFee, key: 'agentCommission' },
    { label: 'Trustee Fee', value: calculations.acquisition.trusteeFee, key: 'trusteeFee' },
    { label: 'Title Deed Fee', value: calculations.acquisition.titleDeedFee, key: 'titleDeedFee' },
    { label: 'NOC Fee', value: calculations.acquisition.nocFee, key: 'nocFee' },
    ...(useMortgage ? [
      { label: 'Mortgage Registration (0.25%)', value: calculations.acquisition.mortgageRegistration, key: 'mortgageRegistration' },
      { label: 'Bank Valuation', value: calculations.acquisition.bankValuation, key: 'bankValuation' },
      { label: 'Bank Processing (1%)', value: calculations.acquisition.bankProcessing, key: 'bankProcessing' },
    ] : []),
  ], [calculations.acquisition, useMortgage]);

  const ongoingFeeItems = useMemo(() => [
    { label: 'Service Charges', value: calculations.annualOngoing.serviceCharges, key: 'serviceCharges' },
    { label: 'District Cooling', value: calculations.annualOngoing.chillerAnnual, key: 'districtCooling' },
    { label: 'DEWA Utilities', value: calculations.annualOngoing.dewaEstimate, key: 'dewa' },
    { label: 'Maintenance Reserve', value: calculations.annualOngoing.maintenance, key: 'maintenance' },
    { label: 'Home Insurance', value: calculations.annualOngoing.insurance, key: 'insurance' },
  ], [calculations.annualOngoing]);

  const exitFeeItems = useMemo(() => [
    { label: 'Agent Commission (2%)', value: calculations.exit.agentFee, key: 'exitAgentCommission' },
    { label: 'Developer NOC', value: calculations.exit.noc, key: 'exitNocFee' },
    ...(useMortgage ? [
      { label: 'Early Settlement Penalty', value: calculations.exit.earlySettlement, key: 'earlySettlement' },
      { label: 'Mortgage Release Fee', value: calculations.exit.mortgageRelease, key: 'mortgageRelease' },
    ] : []),
  ], [calculations.exit, useMortgage]);

  const formatValue = (value: number) => formatPrice(value);

  const handleExportPDF = () => {
    try {
      generateTotalCostPDF({
        propertyDetails: {
          purchasePrice,
          propertySize,
          area: selectedArea,
          isOffPlan,
        },
        financing: {
          useMortgage,
          downPayment,
          interestRate,
          loanTerm,
          loanAmount: calculations.loanAmount,
          monthlyPayment: calculations.monthlyPayment,
        },
        strategy: {
          usageType,
          annualRent,
          dailyRate,
          occupancyRate,
        },
        timeline: {
          holdingPeriod,
          appreciationRate,
        },
        costs: {
          acquisition: acquisitionFeeItems,
          acquisitionTotal: calculations.acquisition.grandTotal,
          ongoing: ongoingFeeItems,
          ongoingTotal: calculations.annualOngoing.total,
          exit: exitFeeItems,
          exitTotal: calculations.exit.total,
        },
        results: {
          totalCostOfOwnership: calculations.totalCostOfOwnership,
          netProfit: calculations.netProfit,
          roi: calculations.roi,
          annualizedRoi: calculations.annualizedRoi,
          initialInvestment: calculations.initialInvestment,
          exitPropertyValue: calculations.exitPropertyValue,
          capitalAppreciation: calculations.capitalAppreciation,
          totalRentalIncome: calculations.totalRentalIncome,
          totalInterest: calculations.totalInterest,
          breakEvenYear: calculations.breakEvenYear,
        },
        formatValue,
      });
      
      toast({
        title: "PDF Downloaded",
        description: "Your Total Cost of Ownership report has been saved.",
      });
    } catch (error) {
      console.error('PDF Export Error:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "There was an error generating the PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="pt-24 pb-8 bg-gradient-to-b from-primary-dark to-background">
        <div className="container mx-auto px-4">
          <Link 
            to="/tools" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Tools</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                <Wallet className="w-7 h-7 text-teal-500" />
              </div>
              <div>
                <h1 className="font-heading text-3xl md:text-4xl text-foreground">
                  Total Cost of <span className="text-gradient-gold">Ownership</span>
                </h1>
                <p className="text-muted-foreground mt-1">
                  Complete financial picture over your investment timeline
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <CalculatorAIAnalysis
                calculatorType="total-cost"
                inputs={{
                  purchasePrice,
                  propertySize,
                  useMortgage,
                  downPayment,
                  interestRate,
                  loanTerm,
                  usageType,
                  annualRent,
                  dailyRate,
                  occupancyRate,
                  holdingPeriod,
                  appreciationRate,
                }}
                results={{
                  acquisitionTotal: calculations.acquisition.grandTotal,
                  annualOngoing: calculations.annualOngoing.total,
                  totalFinancingCosts: calculations.totalFinancingCosts,
                  exitTotal: calculations.exit.total,
                  totalCostOfOwnership: calculations.totalCostOfOwnership,
                  netProfit: calculations.netProfit,
                  roi: calculations.roi,
                  annualizedRoi: calculations.annualizedRoi,
                  breakEvenYear: calculations.breakEvenYear,
                  exitPropertyValue: calculations.exitPropertyValue,
                }}
                area={selectedArea}
                buttonText="Get AI Analysis"
              />
              <Button 
                onClick={handleExportPDF}
                className="bg-teal-600 hover:bg-teal-700 text-white gap-2"
              >
                <Download className="w-4 h-4" />
                Export PDF Report
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Inputs */}
            <div className="lg:col-span-1 space-y-6">
              {/* Currency Selector */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Display Currency</span>
                    <CurrencyPill />
                  </div>
                </CardContent>
              </Card>

              {/* Dubai Presets */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-heading flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    Dubai Area Presets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DubaiPresets
                    onSelectPreset={handlePresetSelect}
                    activePreset={activePreset}
                    showDetails={true}
                  />
                </CardContent>
              </Card>

              {/* Property Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-heading flex items-center gap-2">
                    <Home className="w-5 h-5 text-primary" />
                    Property Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <SliderInput
                    label="Purchase Price"
                    value={purchasePrice}
                    onChange={setPurchasePrice}
                    min={500000}
                    max={50000000}
                    step={100000}
                    formatValue={formatValue}
                  />
                  <SliderInput
                    label="Property Size"
                    value={propertySize}
                    onChange={setPropertySize}
                    min={300}
                    max={10000}
                    step={50}
                    formatValue={(v) => `${v.toLocaleString()} sqft`}
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label>Off-Plan Property</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Off-plan properties have different fee structures and payment plans</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Switch checked={isOffPlan} onCheckedChange={setIsOffPlan} />
                  </div>
                </CardContent>
              </Card>

              {/* Financing */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-heading flex items-center gap-2">
                    <Landmark className="w-5 h-5 text-primary" />
                    Financing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <Label>Use Mortgage</Label>
                    <Switch checked={useMortgage} onCheckedChange={setUseMortgage} />
                  </div>
                  {useMortgage && (
                    <>
                      <SliderInput
                        label="Down Payment"
                        value={downPayment}
                        onChange={setDownPayment}
                        min={20}
                        max={80}
                        step={5}
                        formatValue={(v) => `${v}%`}
                      />
                      <SliderInput
                        label="Interest Rate"
                        value={interestRate}
                        onChange={setInterestRate}
                        min={2}
                        max={8}
                        step={0.1}
                        formatValue={(v) => `${v}%`}
                      />
                      <SliderInput
                        label="Loan Term"
                        value={loanTerm}
                        onChange={setLoanTerm}
                        min={5}
                        max={25}
                        step={1}
                        formatValue={(v) => `${v} years`}
                      />
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Investment Strategy */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-heading flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Investment Strategy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Usage Type</Label>
                    <Select value={usageType} onValueChange={(v) => setUsageType(v as UsageType)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="personal">Personal Use</SelectItem>
                        <SelectItem value="long-term">Long-Term Rental</SelectItem>
                        <SelectItem value="short-term">Short-Term (Airbnb)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {usageType === 'long-term' && (
                    <SliderInput
                      label="Annual Rent"
                      value={annualRent}
                      onChange={setAnnualRent}
                      min={30000}
                      max={500000}
                      step={5000}
                      formatValue={formatValue}
                    />
                  )}
                  
                  {usageType === 'short-term' && (
                    <>
                      <SliderInput
                        label="Daily Rate"
                        value={dailyRate}
                        onChange={setDailyRate}
                        min={200}
                        max={5000}
                        step={50}
                        formatValue={formatValue}
                      />
                      <SliderInput
                        label="Occupancy Rate"
                        value={occupancyRate}
                        onChange={setOccupancyRate}
                        min={30}
                        max={95}
                        step={5}
                        formatValue={(v) => `${v}%`}
                      />
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-heading flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Timeline & Exit
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <SliderInput
                    label="Holding Period"
                    value={holdingPeriod}
                    onChange={setHoldingPeriod}
                    min={1}
                    max={30}
                    step={1}
                    formatValue={(v) => `${v} years`}
                  />
                  <SliderInput
                    label="Expected Appreciation"
                    value={appreciationRate}
                    onChange={setAppreciationRate}
                    min={0}
                    max={15}
                    step={0.5}
                    formatValue={(v) => `${v}% / year`}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Results */}
            <div className="lg:col-span-2 space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-teal-500/10 to-teal-500/5 border-teal-500/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Wallet className="w-4 h-4 text-teal-500" />
                      <span className="text-xs text-muted-foreground">Total Cost</span>
                    </div>
                    <p className="text-xl font-heading text-foreground">
                      {formatValue(calculations.totalCostOfOwnership)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="w-4 h-4 text-blue-500" />
                      <span className="text-xs text-muted-foreground">Cost/Year</span>
                    </div>
                    <p className="text-xl font-heading text-foreground">
                      {formatValue(calculations.totalCostOfOwnership / holdingPeriod)}
                    </p>
                  </CardContent>
                </Card>
                <Card className={`bg-gradient-to-br ${calculations.netProfit >= 0 ? 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20' : 'from-red-500/10 to-red-500/5 border-red-500/20'}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <PiggyBank className={`w-4 h-4 ${calculations.netProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`} />
                      <span className="text-xs text-muted-foreground">Net Profit</span>
                    </div>
                    <p className={`text-xl font-heading ${calculations.netProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {formatValue(calculations.netProfit)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <span className="text-xs text-muted-foreground">Total ROI</span>
                    </div>
                    <p className="text-xl font-heading text-primary">
                      {calculations.roi.toFixed(1)}%
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <TotalCostCharts
                yearlyData={calculations.yearlyData}
                costBreakdown={calculations.costBreakdown}
                formatValue={(v) => formatValue(v)}
                currencySymbol={currencySymbol}
              />

              {/* Fee Breakdown Tabs */}
              <Tabs defaultValue="acquisition" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="acquisition">Acquisition</TabsTrigger>
                  <TabsTrigger value="ongoing">Annual Ongoing</TabsTrigger>
                  <TabsTrigger value="exit">Exit Costs</TabsTrigger>
                  <TabsTrigger value="sensitivity">Sensitivity</TabsTrigger>
                </TabsList>
                <TabsContent value="acquisition" className="mt-4">
                  <FeeBreakdownCard
                    title="Acquisition Costs (Year 0)"
                    fees={acquisitionFeeItems}
                    total={calculations.acquisition.grandTotal}
                    formatValue={formatValue}
                    defaultExpanded={true}
                  />
                </TabsContent>
                <TabsContent value="ongoing" className="mt-4">
                  <FeeBreakdownCard
                    title="Annual Ongoing Costs"
                    fees={ongoingFeeItems}
                    total={calculations.annualOngoing.total}
                    formatValue={formatValue}
                    defaultExpanded={true}
                  />
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Over {holdingPeriod} years:</strong> {formatValue(calculations.totalOngoingCosts)}
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="exit" className="mt-4">
                  <FeeBreakdownCard
                    title={`Exit Costs (Year ${holdingPeriod})`}
                    fees={exitFeeItems}
                    total={calculations.exit.total}
                    formatValue={formatValue}
                    defaultExpanded={true}
                  />
                </TabsContent>
                <TabsContent value="sensitivity" className="mt-4">
                  <SensitivityAnalysisCharts
                    baseAppreciationRate={appreciationRate}
                    baseAnnualRent={annualRent}
                    purchasePrice={purchasePrice}
                    holdingPeriod={holdingPeriod}
                    initialInvestment={calculations.initialInvestment}
                    useMortgage={useMortgage}
                    downPayment={downPayment}
                    interestRate={interestRate}
                    loanTerm={loanTerm}
                    propertySize={propertySize}
                    selectedArea={selectedArea}
                    usageType={usageType}
                    dailyRate={dailyRate}
                    occupancyRate={occupancyRate}
                    formatValue={formatValue}
                    currencySymbol={currencySymbol}
                  />
                </TabsContent>
              </Tabs>

              {/* Summary Card */}
              <Card className="bg-secondary text-secondary-foreground">
                <CardHeader>
                  <CardTitle className="text-lg font-heading flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Investment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Initial Investment</p>
                      <p className="text-lg font-medium">{formatValue(calculations.initialInvestment)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Property Value at Exit</p>
                      <p className="text-lg font-medium">{formatValue(calculations.exitPropertyValue)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Capital Appreciation</p>
                      <p className="text-lg font-medium text-emerald-400">+{formatValue(calculations.capitalAppreciation)}</p>
                    </div>
                    {usageType !== 'personal' && (
                      <>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Annual Rental Income</p>
                          <p className="text-lg font-medium">{formatValue(calculations.annualRentalIncome)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Total Rental Income</p>
                          <p className="text-lg font-medium text-emerald-400">+{formatValue(calculations.totalRentalIncome)}</p>
                        </div>
                        {calculations.breakEvenYear > 0 && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Break-Even Year</p>
                            <p className="text-lg font-medium">Year {calculations.breakEvenYear}</p>
                          </div>
                        )}
                      </>
                    )}
                    {useMortgage && (
                      <>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Monthly Payment</p>
                          <p className="text-lg font-medium">{formatValue(calculations.monthlyPayment)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Total Interest Paid</p>
                          <p className="text-lg font-medium text-red-400">-{formatValue(calculations.totalInterest)}</p>
                        </div>
                      </>
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Annualized ROI</p>
                      <p className="text-lg font-medium text-primary">{calculations.annualizedRoi.toFixed(2)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
