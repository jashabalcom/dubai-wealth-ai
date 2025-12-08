import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  Legend,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { TrendingUp, TrendingDown, Target, AlertTriangle, Clock, CheckCircle2, XCircle } from 'lucide-react';

interface SensitivityAnalysisChartsProps {
  baseAppreciationRate: number;
  baseAnnualRent: number;
  purchasePrice: number;
  holdingPeriod: number;
  initialInvestment: number;
  useMortgage: boolean;
  downPayment: number;
  interestRate: number;
  loanTerm: number;
  propertySize: number;
  selectedArea: string;
  usageType: 'personal' | 'long-term' | 'short-term';
  dailyRate: number;
  occupancyRate: number;
  formatValue: (value: number) => string;
  currencySymbol: string;
}

// ROI calculation helper
function calculateROIForScenario(params: {
  purchasePrice: number;
  appreciationRate: number;
  annualRent: number;
  holdingPeriod: number;
  useMortgage: boolean;
  downPayment: number;
  interestRate: number;
  loanTerm: number;
  propertySize: number;
  usageType: 'personal' | 'long-term' | 'short-term';
  dailyRate: number;
  occupancyRate: number;
}): { roi: number; netProfit: number; annualizedRoi: number } {
  const {
    purchasePrice,
    appreciationRate,
    annualRent,
    holdingPeriod,
    useMortgage,
    downPayment,
    interestRate,
    loanTerm,
    propertySize,
    usageType,
    dailyRate,
    occupancyRate,
  } = params;

  const loanAmount = useMortgage ? purchasePrice * (1 - downPayment / 100) : 0;
  
  // Simplified acquisition costs (approximately 7% of purchase price)
  const acquisitionCosts = purchasePrice * 0.07;
  
  // Annual ongoing costs (simplified ~2% of property value)
  const annualOngoing = purchasePrice * 0.02;
  
  // Monthly mortgage payment
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = loanTerm * 12;
  const monthlyPayment = useMortgage && loanAmount > 0
    ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
      (Math.pow(1 + monthlyRate, numPayments) - 1)
    : 0;
  const annualMortgagePayment = monthlyPayment * 12;

  // Calculate rental income
  let annualRentalIncome = 0;
  if (usageType === 'long-term') {
    annualRentalIncome = annualRent;
  } else if (usageType === 'short-term') {
    annualRentalIncome = dailyRate * 365 * (occupancyRate / 100) * 0.85;
  }

  // Property value at exit
  const exitPropertyValue = purchasePrice * Math.pow(1 + appreciationRate / 100, holdingPeriod);
  
  // Exit costs (~2.5% of sale price)
  const exitCosts = exitPropertyValue * 0.025;

  // Total ongoing costs over holding period
  const totalOngoingCosts = annualOngoing * holdingPeriod;

  // Total financing costs
  const mortgageYears = Math.min(holdingPeriod, loanTerm);
  const totalFinancingCosts = useMortgage ? annualMortgagePayment * mortgageYears : 0;

  // Total rental income over holding period
  const totalRentalIncome = annualRentalIncome * holdingPeriod;

  // Capital appreciation
  const capitalAppreciation = exitPropertyValue - purchasePrice;

  // Total interest
  const totalMortgagePayments = monthlyPayment * numPayments;
  const totalInterest = useMortgage ? totalMortgagePayments - loanAmount : 0;

  // Net profit
  const netProfit = capitalAppreciation + totalRentalIncome - totalOngoingCosts - totalFinancingCosts - exitCosts - (useMortgage ? totalInterest : 0);

  // Initial investment
  const initialInvestment = useMortgage 
    ? (purchasePrice * downPayment / 100) + acquisitionCosts 
    : purchasePrice + acquisitionCosts;

  // ROI
  const roi = (netProfit / initialInvestment) * 100;
  const annualizedRoi = (Math.pow(1 + roi / 100, 1 / holdingPeriod) - 1) * 100;

  return { roi, netProfit, annualizedRoi };
}

// Break-even calculation helper
function calculateBreakEvenYear(params: {
  purchasePrice: number;
  appreciationRate: number;
  annualRent: number;
  useMortgage: boolean;
  downPayment: number;
  interestRate: number;
  loanTerm: number;
  propertySize: number;
  usageType: 'personal' | 'long-term' | 'short-term';
  dailyRate: number;
  occupancyRate: number;
  maxYears?: number;
}): { breakEvenYear: number; isProfitable: boolean; cumulativeProfitByYear: number[] } {
  const {
    purchasePrice,
    appreciationRate,
    annualRent,
    useMortgage,
    downPayment,
    interestRate,
    loanTerm,
    propertySize,
    usageType,
    dailyRate,
    occupancyRate,
    maxYears = 30,
  } = params;

  const loanAmount = useMortgage ? purchasePrice * (1 - downPayment / 100) : 0;
  const acquisitionCosts = purchasePrice * 0.07;
  const annualOngoing = purchasePrice * 0.02;
  
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = loanTerm * 12;
  const monthlyPayment = useMortgage && loanAmount > 0
    ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
      (Math.pow(1 + monthlyRate, numPayments) - 1)
    : 0;
  const annualMortgagePayment = monthlyPayment * 12;

  let annualRentalIncome = 0;
  if (usageType === 'long-term') {
    annualRentalIncome = annualRent;
  } else if (usageType === 'short-term') {
    annualRentalIncome = dailyRate * 365 * (occupancyRate / 100) * 0.85;
  }

  const initialInvestment = useMortgage 
    ? (purchasePrice * downPayment / 100) + acquisitionCosts 
    : purchasePrice + acquisitionCosts;

  const cumulativeProfitByYear: number[] = [];
  let breakEvenYear = -1;

  for (let year = 1; year <= maxYears; year++) {
    const propertyValue = purchasePrice * Math.pow(1 + appreciationRate / 100, year);
    const capitalAppreciation = propertyValue - purchasePrice;
    const exitCosts = propertyValue * 0.025;
    
    const mortgageYears = Math.min(year, loanTerm);
    const totalFinancingCosts = useMortgage ? annualMortgagePayment * mortgageYears : 0;
    const totalOngoingCosts = annualOngoing * year;
    const totalRentalIncome = annualRentalIncome * year;
    
    // Calculate remaining mortgage balance
    let remainingBalance = 0;
    if (useMortgage && year < loanTerm) {
      const paymentsRemaining = (loanTerm - year) * 12;
      remainingBalance = monthlyPayment * (1 - Math.pow(1 + monthlyRate, -paymentsRemaining)) / monthlyRate;
    }

    const netProfit = capitalAppreciation + totalRentalIncome - totalOngoingCosts - totalFinancingCosts - exitCosts - initialInvestment + (useMortgage ? loanAmount - remainingBalance : 0);
    
    cumulativeProfitByYear.push(netProfit);
    
    if (breakEvenYear === -1 && netProfit >= 0) {
      breakEvenYear = year;
    }
  }

  return {
    breakEvenYear: breakEvenYear === -1 ? maxYears + 1 : breakEvenYear,
    isProfitable: breakEvenYear !== -1,
    cumulativeProfitByYear,
  };
}

export function SensitivityAnalysisCharts({
  baseAppreciationRate,
  baseAnnualRent,
  purchasePrice,
  holdingPeriod,
  initialInvestment,
  useMortgage,
  downPayment,
  interestRate,
  loanTerm,
  propertySize,
  selectedArea,
  usageType,
  dailyRate,
  occupancyRate,
  formatValue,
  currencySymbol,
}: SensitivityAnalysisChartsProps) {
  
  // Generate appreciation rate sensitivity data
  const appreciationSensitivity = useMemo(() => {
    const rates = [0, 2, 4, 6, 8, 10, 12, 15];
    return rates.map(rate => {
      const result = calculateROIForScenario({
        purchasePrice,
        appreciationRate: rate,
        annualRent: baseAnnualRent,
        holdingPeriod,
        useMortgage,
        downPayment,
        interestRate,
        loanTerm,
        propertySize,
        usageType,
        dailyRate,
        occupancyRate,
      });
      return {
        rate: `${rate}%`,
        rateNum: rate,
        roi: parseFloat(result.roi.toFixed(1)),
        annualizedRoi: parseFloat(result.annualizedRoi.toFixed(2)),
        isBase: rate === baseAppreciationRate,
      };
    });
  }, [purchasePrice, baseAnnualRent, holdingPeriod, useMortgage, downPayment, interestRate, loanTerm, propertySize, usageType, dailyRate, occupancyRate, baseAppreciationRate]);

  // Generate rental yield sensitivity data
  const rentalYieldSensitivity = useMemo(() => {
    if (usageType === 'personal') return [];
    
    const yields = [3, 4, 5, 6, 7, 8, 9, 10];
    return yields.map(yieldPercent => {
      const simulatedRent = purchasePrice * (yieldPercent / 100);
      const result = calculateROIForScenario({
        purchasePrice,
        appreciationRate: baseAppreciationRate,
        annualRent: simulatedRent,
        holdingPeriod,
        useMortgage,
        downPayment,
        interestRate,
        loanTerm,
        propertySize,
        usageType,
        dailyRate,
        occupancyRate,
      });
      const baseYield = (baseAnnualRent / purchasePrice) * 100;
      return {
        yield: `${yieldPercent}%`,
        yieldNum: yieldPercent,
        roi: parseFloat(result.roi.toFixed(1)),
        annualizedRoi: parseFloat(result.annualizedRoi.toFixed(2)),
        isBase: Math.abs(yieldPercent - baseYield) < 0.5,
      };
    });
  }, [purchasePrice, baseAppreciationRate, baseAnnualRent, holdingPeriod, useMortgage, downPayment, interestRate, loanTerm, propertySize, usageType, dailyRate, occupancyRate]);

  // Generate ROI matrix for heatmap
  const roiMatrix = useMemo(() => {
    const appreciationRates = [0, 2, 4, 6, 8, 10];
    const rentalYields = usageType === 'personal' ? [0] : [3, 4, 5, 6, 7, 8];
    
    return appreciationRates.map(appRate => {
      const row: Record<string, any> = { appreciation: `${appRate}%` };
      rentalYields.forEach(yieldRate => {
        const simulatedRent = usageType === 'personal' ? 0 : purchasePrice * (yieldRate / 100);
        const result = calculateROIForScenario({
          purchasePrice,
          appreciationRate: appRate,
          annualRent: simulatedRent,
          holdingPeriod,
          useMortgage,
          downPayment,
          interestRate,
          loanTerm,
          propertySize,
          usageType,
          dailyRate,
          occupancyRate,
        });
        row[`yield${yieldRate}`] = parseFloat(result.roi.toFixed(1));
      });
      return row;
    });
  }, [purchasePrice, holdingPeriod, useMortgage, downPayment, interestRate, loanTerm, propertySize, usageType, dailyRate, occupancyRate]);

  // Scenario comparison
  const scenarios = useMemo(() => {
    const baseResult = calculateROIForScenario({
      purchasePrice,
      appreciationRate: baseAppreciationRate,
      annualRent: baseAnnualRent,
      holdingPeriod,
      useMortgage,
      downPayment,
      interestRate,
      loanTerm,
      propertySize,
      usageType,
      dailyRate,
      occupancyRate,
    });

    const conservativeResult = calculateROIForScenario({
      purchasePrice,
      appreciationRate: Math.max(0, baseAppreciationRate - 3),
      annualRent: baseAnnualRent * 0.85,
      holdingPeriod,
      useMortgage,
      downPayment,
      interestRate,
      loanTerm,
      propertySize,
      usageType,
      dailyRate: dailyRate * 0.85,
      occupancyRate: Math.max(30, occupancyRate - 15),
    });

    const optimisticResult = calculateROIForScenario({
      purchasePrice,
      appreciationRate: baseAppreciationRate + 3,
      annualRent: baseAnnualRent * 1.15,
      holdingPeriod,
      useMortgage,
      downPayment,
      interestRate,
      loanTerm,
      propertySize,
      usageType,
      dailyRate: dailyRate * 1.15,
      occupancyRate: Math.min(95, occupancyRate + 10),
    });

    return [
      {
        name: 'Conservative',
        description: `${Math.max(0, baseAppreciationRate - 3)}% appreciation, 15% lower rent`,
        roi: conservativeResult.roi,
        annualizedRoi: conservativeResult.annualizedRoi,
        netProfit: conservativeResult.netProfit,
        icon: TrendingDown,
        color: 'text-amber-500',
        bgColor: 'bg-amber-500/10 border-amber-500/20',
      },
      {
        name: 'Base Case',
        description: `${baseAppreciationRate}% appreciation, current rent`,
        roi: baseResult.roi,
        annualizedRoi: baseResult.annualizedRoi,
        netProfit: baseResult.netProfit,
        icon: Target,
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10 border-blue-500/20',
      },
      {
        name: 'Optimistic',
        description: `${baseAppreciationRate + 3}% appreciation, 15% higher rent`,
        roi: optimisticResult.roi,
        annualizedRoi: optimisticResult.annualizedRoi,
        netProfit: optimisticResult.netProfit,
        icon: TrendingUp,
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-500/10 border-emerald-500/20',
      },
    ];
  }, [purchasePrice, baseAppreciationRate, baseAnnualRent, holdingPeriod, useMortgage, downPayment, interestRate, loanTerm, propertySize, usageType, dailyRate, occupancyRate]);

  const getROIColor = (roi: number) => {
    if (roi >= 100) return 'bg-emerald-500 text-white';
    if (roi >= 50) return 'bg-emerald-400 text-white';
    if (roi >= 25) return 'bg-green-400 text-white';
    if (roi >= 0) return 'bg-yellow-400 text-gray-900';
    if (roi >= -25) return 'bg-orange-400 text-white';
    return 'bg-red-500 text-white';
  };

  const rentalYields = usageType === 'personal' ? [0] : [3, 4, 5, 6, 7, 8];

  // Break-even analysis for scenarios
  const breakEvenData = useMemo(() => {
    const baseBreakEven = calculateBreakEvenYear({
      purchasePrice,
      appreciationRate: baseAppreciationRate,
      annualRent: baseAnnualRent,
      useMortgage,
      downPayment,
      interestRate,
      loanTerm,
      propertySize,
      usageType,
      dailyRate,
      occupancyRate,
    });

    const conservativeBreakEven = calculateBreakEvenYear({
      purchasePrice,
      appreciationRate: Math.max(0, baseAppreciationRate - 3),
      annualRent: baseAnnualRent * 0.85,
      useMortgage,
      downPayment,
      interestRate,
      loanTerm,
      propertySize,
      usageType,
      dailyRate: dailyRate * 0.85,
      occupancyRate: Math.max(30, occupancyRate - 15),
    });

    const optimisticBreakEven = calculateBreakEvenYear({
      purchasePrice,
      appreciationRate: baseAppreciationRate + 3,
      annualRent: baseAnnualRent * 1.15,
      useMortgage,
      downPayment,
      interestRate,
      loanTerm,
      propertySize,
      usageType,
      dailyRate: dailyRate * 1.15,
      occupancyRate: Math.min(95, occupancyRate + 10),
    });

    return {
      base: baseBreakEven,
      conservative: conservativeBreakEven,
      optimistic: optimisticBreakEven,
    };
  }, [purchasePrice, baseAppreciationRate, baseAnnualRent, useMortgage, downPayment, interestRate, loanTerm, propertySize, usageType, dailyRate, occupancyRate]);

  // Cumulative profit data for chart
  const cumulativeProfitData = useMemo(() => {
    const maxYears = Math.min(holdingPeriod + 5, 20);
    const data = [];
    
    for (let i = 0; i < maxYears; i++) {
      data.push({
        year: i + 1,
        conservative: breakEvenData.conservative.cumulativeProfitByYear[i] || 0,
        base: breakEvenData.base.cumulativeProfitByYear[i] || 0,
        optimistic: breakEvenData.optimistic.cumulativeProfitByYear[i] || 0,
      });
    }
    return data;
  }, [breakEvenData, holdingPeriod]);

  // Break-even by appreciation rate
  const breakEvenByAppreciation = useMemo(() => {
    const rates = [0, 2, 4, 6, 8, 10];
    return rates.map(rate => {
      const result = calculateBreakEvenYear({
        purchasePrice,
        appreciationRate: rate,
        annualRent: baseAnnualRent,
        useMortgage,
        downPayment,
        interestRate,
        loanTerm,
        propertySize,
        usageType,
        dailyRate,
        occupancyRate,
      });
      return {
        scenario: `${rate}% Appreciation`,
        years: result.breakEvenYear > 30 ? 30 : result.breakEvenYear,
        isProfitable: result.isProfitable,
        isNever: result.breakEvenYear > 30,
      };
    });
  }, [purchasePrice, baseAnnualRent, useMortgage, downPayment, interestRate, loanTerm, propertySize, usageType, dailyRate, occupancyRate]);

  // Break-even matrix
  const breakEvenMatrix = useMemo(() => {
    const appreciationRates = [0, 2, 4, 6, 8, 10];
    const yields = usageType === 'personal' ? [0] : [3, 4, 5, 6, 7, 8];
    
    return appreciationRates.map(appRate => {
      const row: Record<string, any> = { appreciation: `${appRate}%` };
      yields.forEach(yieldRate => {
        const simulatedRent = usageType === 'personal' ? 0 : purchasePrice * (yieldRate / 100);
        const result = calculateBreakEvenYear({
          purchasePrice,
          appreciationRate: appRate,
          annualRent: simulatedRent,
          useMortgage,
          downPayment,
          interestRate,
          loanTerm,
          propertySize,
          usageType,
          dailyRate,
          occupancyRate,
        });
        row[`yield${yieldRate}`] = result.breakEvenYear > 30 ? 'Never' : result.breakEvenYear;
      });
      return row;
    });
  }, [purchasePrice, useMortgage, downPayment, interestRate, loanTerm, propertySize, usageType, dailyRate, occupancyRate]);

  const getBreakEvenColor = (years: number | string) => {
    if (years === 'Never' || (typeof years === 'number' && years > 30)) return 'bg-red-500 text-white';
    if (typeof years === 'number') {
      if (years <= 3) return 'bg-emerald-500 text-white';
      if (years <= 5) return 'bg-emerald-400 text-white';
      if (years <= 7) return 'bg-green-400 text-white';
      if (years <= 10) return 'bg-yellow-400 text-gray-900';
      if (years <= 15) return 'bg-orange-400 text-white';
      return 'bg-red-400 text-white';
    }
    return 'bg-muted text-muted-foreground';
  };

  const getBarColor = (years: number, isNever: boolean) => {
    if (isNever) return 'hsl(0, 84%, 60%)';
    if (years <= 5) return 'hsl(142, 76%, 36%)';
    if (years <= 10) return 'hsl(48, 96%, 53%)';
    if (years <= 15) return 'hsl(25, 95%, 53%)';
    return 'hsl(0, 84%, 60%)';
  };

  return (
    <div className="space-y-6">
      {/* Break-Even Summary Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-heading flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Break-Even Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Years until your investment becomes profitable under different market conditions
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border bg-emerald-500/10 border-emerald-500/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                <h4 className="font-medium">Best Case</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-2">Optimistic scenario</p>
              <div className="flex items-baseline gap-1">
                {breakEvenData.optimistic.isProfitable ? (
                  <>
                    <span className="text-3xl font-bold text-emerald-500">
                      {breakEvenData.optimistic.breakEvenYear}
                    </span>
                    <span className="text-sm text-muted-foreground">years</span>
                  </>
                ) : (
                  <span className="text-lg font-semibold text-red-500 flex items-center gap-1">
                    <XCircle className="w-4 h-4" /> Not profitable in 30 years
                  </span>
                )}
              </div>
            </div>

            <div className="p-4 rounded-lg border bg-blue-500/10 border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-blue-500" />
                <h4 className="font-medium">Expected</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-2">Base case scenario</p>
              <div className="flex items-baseline gap-1">
                {breakEvenData.base.isProfitable ? (
                  <>
                    <span className="text-3xl font-bold text-blue-500">
                      {breakEvenData.base.breakEvenYear}
                    </span>
                    <span className="text-sm text-muted-foreground">years</span>
                  </>
                ) : (
                  <span className="text-lg font-semibold text-red-500 flex items-center gap-1">
                    <XCircle className="w-4 h-4" /> Not profitable in 30 years
                  </span>
                )}
              </div>
            </div>

            <div className="p-4 rounded-lg border bg-amber-500/10 border-amber-500/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-5 h-5 text-amber-500" />
                <h4 className="font-medium">Worst Case</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-2">Conservative scenario</p>
              <div className="flex items-baseline gap-1">
                {breakEvenData.conservative.isProfitable ? (
                  <>
                    <span className="text-3xl font-bold text-amber-500">
                      {breakEvenData.conservative.breakEvenYear}
                    </span>
                    <span className="text-sm text-muted-foreground">years</span>
                  </>
                ) : (
                  <span className="text-lg font-semibold text-red-500 flex items-center gap-1">
                    <XCircle className="w-4 h-4" /> Not profitable in 30 years
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Risk Indicator */}
          {breakEvenData.base.isProfitable && breakEvenData.conservative.isProfitable && (
            <div className="mt-4 p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium">Risk Spread:</span>
                <span className="text-sm text-muted-foreground">
                  {breakEvenData.conservative.breakEvenYear - breakEvenData.optimistic.breakEvenYear} years between best and worst case
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cumulative Profit Over Time */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-heading flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            Cumulative Profit Trajectory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Net profit over time for each scenario (line crosses zero = break-even)
          </p>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cumulativeProfitData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="year" 
                  className="text-xs fill-muted-foreground"
                  tick={{ fontSize: 11 }}
                  label={{ value: 'Years', position: 'insideBottom', offset: -5, fontSize: 11 }}
                />
                <YAxis 
                  className="text-xs fill-muted-foreground"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
                />
                <ReferenceLine y={0} stroke="hsl(var(--destructive))" strokeWidth={2} strokeDasharray="5 5" />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    formatValue(value), 
                    name === 'conservative' ? 'Conservative' : name === 'base' ? 'Base Case' : 'Optimistic'
                  ]}
                  labelFormatter={(label) => `Year ${label}`}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend 
                  formatter={(value) => value === 'conservative' ? 'Conservative' : value === 'base' ? 'Base Case' : 'Optimistic'}
                />
                <Line 
                  type="monotone" 
                  dataKey="conservative" 
                  stroke="hsl(45, 93%, 47%)" 
                  strokeWidth={2}
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="base" 
                  stroke="hsl(217, 91%, 60%)" 
                  strokeWidth={2}
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="optimistic" 
                  stroke="hsl(142, 76%, 36%)" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Break-Even Timeline Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-heading flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            Break-Even by Appreciation Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Years to break-even at different appreciation rates (holding rental yield constant)
          </p>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={breakEvenByAppreciation} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  type="number" 
                  domain={[0, 30]}
                  className="text-xs fill-muted-foreground"
                  tick={{ fontSize: 11 }}
                  label={{ value: 'Years', position: 'insideBottom', offset: -5, fontSize: 11 }}
                />
                <YAxis 
                  type="category" 
                  dataKey="scenario" 
                  width={120}
                  className="text-xs fill-muted-foreground"
                  tick={{ fontSize: 11 }}
                />
                <Tooltip 
                  formatter={(value: number, name: string, props: any) => [
                    props.payload.isNever ? 'Never (30+ years)' : `${value} years`,
                    'Break-Even'
                  ]}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="years" radius={[0, 4, 4, 0]}>
                  {breakEvenByAppreciation.map((entry, index) => (
                    <Cell key={index} fill={getBarColor(entry.years, entry.isNever)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-4 mt-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(142, 76%, 36%)' }} />
              <span className="text-muted-foreground">≤5 years</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(48, 96%, 53%)' }} />
              <span className="text-muted-foreground">5-10 years</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(25, 95%, 53%)' }} />
              <span className="text-muted-foreground">10-15 years</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(0, 84%, 60%)' }} />
              <span className="text-muted-foreground">&gt;15 / Never</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Break-Even Matrix */}
      {usageType !== 'personal' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-heading flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Break-Even Matrix (Years)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Years to break-even based on different appreciation rates and rental yields
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="p-2 text-left font-medium text-muted-foreground">
                      Appreciation ↓ / Yield →
                    </th>
                    {rentalYields.map(y => (
                      <th key={y} className="p-2 text-center font-medium text-muted-foreground">
                        {y}%
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {breakEvenMatrix.map((row, i) => (
                    <tr key={i}>
                      <td className="p-2 font-medium">{row.appreciation}</td>
                      {rentalYields.map(y => {
                        const years = row[`yield${y}`];
                        return (
                          <td key={y} className="p-1">
                            <div className={`p-2 text-center rounded font-semibold ${getBreakEvenColor(years)}`}>
                              {years === 'Never' ? '30+' : `${years}y`}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-center gap-4 mt-4 text-xs flex-wrap">
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-emerald-500" />
                <span className="text-muted-foreground">≤3 years</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-green-400" />
                <span className="text-muted-foreground">4-7 years</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-yellow-400" />
                <span className="text-muted-foreground">8-10 years</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-orange-400" />
                <span className="text-muted-foreground">11-15 years</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-red-500" />
                <span className="text-muted-foreground">&gt;15 / Never</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scenario Comparison Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-heading flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Scenario Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {scenarios.map((scenario) => (
              <div
                key={scenario.name}
                className={`p-4 rounded-lg border ${scenario.bgColor}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <scenario.icon className={`w-5 h-5 ${scenario.color}`} />
                  <h4 className="font-medium">{scenario.name}</h4>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{scenario.description}</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total ROI</span>
                    <span className={`font-semibold ${scenario.roi >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {scenario.roi.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Annualized</span>
                    <span className={`font-semibold ${scenario.annualizedRoi >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {scenario.annualizedRoi.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Net Profit</span>
                    <span className={`font-semibold ${scenario.netProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {formatValue(scenario.netProfit)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ROI Matrix / Heatmap */}
      {usageType !== 'personal' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-heading flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              ROI Sensitivity Matrix
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Total ROI (%) based on different appreciation rates and rental yields
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="p-2 text-left font-medium text-muted-foreground">
                      Appreciation ↓ / Yield →
                    </th>
                    {rentalYields.map(y => (
                      <th key={y} className="p-2 text-center font-medium text-muted-foreground">
                        {y}%
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {roiMatrix.map((row, i) => (
                    <tr key={i}>
                      <td className="p-2 font-medium">{row.appreciation}</td>
                      {rentalYields.map(y => {
                        const roi = row[`yield${y}`];
                        return (
                          <td key={y} className="p-1">
                            <div className={`p-2 text-center rounded font-semibold ${getROIColor(roi)}`}>
                              {roi.toFixed(0)}%
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-center gap-4 mt-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-red-500" />
                <span className="text-muted-foreground">&lt; -25%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-orange-400" />
                <span className="text-muted-foreground">-25% to 0%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-yellow-400" />
                <span className="text-muted-foreground">0% to 25%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-emerald-400" />
                <span className="text-muted-foreground">&gt; 25%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Line Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appreciation Rate Impact */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-heading">
              ROI vs. Appreciation Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={appreciationSensitivity}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="rate" 
                    className="text-xs fill-muted-foreground"
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis 
                    className="text-xs fill-muted-foreground"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Total ROI']}
                    labelFormatter={(label) => `Appreciation: ${label}`}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="roi" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={(props: any) => {
                      const { cx, cy, payload } = props;
                      if (payload.isBase) {
                        return (
                          <circle 
                            cx={cx} 
                            cy={cy} 
                            r={6} 
                            fill="hsl(var(--primary))" 
                            stroke="white" 
                            strokeWidth={2}
                          />
                        );
                      }
                      return <circle cx={cx} cy={cy} r={4} fill="hsl(var(--primary))" />;
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Current selection: {baseAppreciationRate}% appreciation (highlighted)
            </p>
          </CardContent>
        </Card>

        {/* Rental Yield Impact */}
        {usageType !== 'personal' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-heading">
                ROI vs. Rental Yield
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={rentalYieldSensitivity}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="yield" 
                      className="text-xs fill-muted-foreground"
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis 
                      className="text-xs fill-muted-foreground"
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                    <Tooltip 
                      formatter={(value: number) => [`${value.toFixed(1)}%`, 'Total ROI']}
                      labelFormatter={(label) => `Rental Yield: ${label}`}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="roi" 
                      stroke="hsl(142, 76%, 36%)" 
                      strokeWidth={2}
                      dot={(props: any) => {
                        const { cx, cy, payload } = props;
                        if (payload.isBase) {
                          return (
                            <circle 
                              cx={cx} 
                              cy={cy} 
                              r={6} 
                              fill="hsl(142, 76%, 36%)" 
                              stroke="white" 
                              strokeWidth={2}
                            />
                          );
                        }
                        return <circle cx={cx} cy={cy} r={4} fill="hsl(142, 76%, 36%)" />;
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Current yield: {((baseAnnualRent / purchasePrice) * 100).toFixed(1)}% (highlighted if in range)
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
