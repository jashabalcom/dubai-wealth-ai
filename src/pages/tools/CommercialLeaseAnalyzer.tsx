import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Building2, Calculator, TrendingUp, AlertTriangle, Sparkles, FileText, Scale, ArrowUpRight, Calendar, DollarSign, Percent, Info } from "lucide-react";
import { CalculatorAIAnalysis } from "@/components/tools/CalculatorAIAnalysis";
import { useAuth } from "@/hooks/useAuth";
import { UpgradeModal } from "@/components/freemium/UpgradeModal";
import { ContextualUpgradePrompt } from "@/components/freemium/ContextualUpgradePrompt";
import { SliderInput } from "@/components/tools/SliderInput";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell
} from "recharts";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Lease type definitions
type LeaseType = 'gross' | 'modified-gross' | 'triple-net';
type EscalationType = 'fixed' | 'cpi' | 'market' | 'none';

interface LeaseInputs {
  baseRentPerSqft: number;
  leasableArea: number;
  leaseTerm: number;
  leaseType: LeaseType;
  // Operating expenses (for comparison)
  cam: number; // Common Area Maintenance
  insurance: number;
  propertyTax: number;
  utilities: number;
  // Escalation
  escalationType: EscalationType;
  fixedEscalation: number;
  cpiEstimate: number;
  marketReviewYears: number;
  // Break clause
  hasBreakClause: boolean;
  breakClauseYear: number;
  breakPenaltyMonths: number;
  // Other terms
  rentFreeMonths: number;
  securityDeposit: number;
  fitOutContribution: number;
  renewalOption: boolean;
  renewalTerms: number;
}

const defaultInputs: LeaseInputs = {
  baseRentPerSqft: 150,
  leasableArea: 2000,
  leaseTerm: 5,
  leaseType: 'gross',
  cam: 25,
  insurance: 5,
  propertyTax: 0, // UAE has no property tax
  utilities: 15,
  escalationType: 'fixed',
  fixedEscalation: 5,
  cpiEstimate: 3,
  marketReviewYears: 3,
  hasBreakClause: false,
  breakClauseYear: 3,
  breakPenaltyMonths: 6,
  rentFreeMonths: 0,
  securityDeposit: 3,
  fitOutContribution: 0,
  renewalOption: true,
  renewalTerms: 3,
};

const CHART_COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--muted))', '#10b981', '#f59e0b'];

const CommercialLeaseAnalyzer = () => {
  const { profile } = useAuth();
  const [inputs, setInputs] = useState<LeaseInputs>(defaultInputs);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  
  const isElite = profile?.membership_tier === 'elite';

  const updateInput = (key: keyof LeaseInputs, value: number | string | boolean) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  // Calculate all lease metrics
  const results = useMemo(() => {
    const { baseRentPerSqft, leasableArea, leaseTerm, leaseType, cam, insurance, propertyTax, utilities,
            escalationType, fixedEscalation, cpiEstimate, marketReviewYears,
            hasBreakClause, breakClauseYear, breakPenaltyMonths,
            rentFreeMonths, securityDeposit, fitOutContribution } = inputs;

    // Calculate annual base rent
    const annualBaseRent = baseRentPerSqft * leasableArea;
    
    // Calculate operating expenses per sqft
    const operatingExpensesPerSqft = cam + insurance + propertyTax + utilities;
    const annualOperatingExpenses = operatingExpensesPerSqft * leasableArea;
    
    // Calculate effective rent based on lease type
    let effectiveRentPerSqft = baseRentPerSqft;
    if (leaseType === 'triple-net') {
      effectiveRentPerSqft = baseRentPerSqft + operatingExpensesPerSqft;
    } else if (leaseType === 'modified-gross') {
      effectiveRentPerSqft = baseRentPerSqft + (operatingExpensesPerSqft * 0.5);
    }
    // Gross lease: landlord pays all expenses, tenant just pays base rent
    
    const annualEffectiveRent = effectiveRentPerSqft * leasableArea;
    
    // Generate yearly projections with escalation
    const yearlyProjections: { year: number; baseRent: number; effectiveRent: number; escalationRate: number }[] = [];
    let currentBaseRent = annualBaseRent;
    let currentEffectiveRent = annualEffectiveRent;
    
    for (let year = 1; year <= leaseTerm; year++) {
      let escalationRate = 0;
      
      if (year > 1) {
        switch (escalationType) {
          case 'fixed':
            escalationRate = fixedEscalation;
            currentBaseRent *= (1 + fixedEscalation / 100);
            currentEffectiveRent *= (1 + fixedEscalation / 100);
            break;
          case 'cpi':
            escalationRate = cpiEstimate;
            currentBaseRent *= (1 + cpiEstimate / 100);
            currentEffectiveRent *= (1 + cpiEstimate / 100);
            break;
          case 'market':
            if (year % marketReviewYears === 1) {
              escalationRate = 10; // Assume 10% market adjustment
              currentBaseRent *= 1.10;
              currentEffectiveRent *= 1.10;
            }
            break;
          case 'none':
            escalationRate = 0;
            break;
        }
      }
      
      yearlyProjections.push({
        year,
        baseRent: Math.round(currentBaseRent),
        effectiveRent: Math.round(currentEffectiveRent),
        escalationRate,
      });
    }
    
    // Calculate total lease cost
    const totalBaseRent = yearlyProjections.reduce((sum, y) => sum + y.baseRent, 0);
    const totalEffectiveRent = yearlyProjections.reduce((sum, y) => sum + y.effectiveRent, 0);
    
    // Adjust for rent-free period
    const rentFreeValue = (annualBaseRent / 12) * rentFreeMonths;
    const netTotalBaseRent = totalBaseRent - rentFreeValue;
    const netTotalEffectiveRent = totalEffectiveRent - rentFreeValue;
    
    // Security deposit calculation
    const securityDepositAmount = (annualBaseRent / 12) * securityDeposit;
    
    // Break clause analysis
    let breakClauseCost = 0;
    let rentPaidBeforeBreak = 0;
    if (hasBreakClause && breakClauseYear <= leaseTerm) {
      breakClauseCost = (annualBaseRent / 12) * breakPenaltyMonths;
      rentPaidBeforeBreak = yearlyProjections
        .slice(0, breakClauseYear)
        .reduce((sum, y) => sum + y.effectiveRent, 0);
    }
    
    // Total occupancy cost (Year 1)
    const year1OccupancyCost = yearlyProjections[0]?.effectiveRent || 0;
    const totalInitialOutlay = securityDepositAmount + (fitOutContribution > 0 ? 0 : 50 * leasableArea); // Assume AED 50/sqft if no contribution
    
    // Average effective rent per sqft over term
    const avgEffectiveRentPerSqft = (netTotalEffectiveRent / leaseTerm) / leasableArea;
    
    // Lease comparison metrics (vs different lease types)
    const grossEquivalent = baseRentPerSqft;
    const tripleNetEquivalent = baseRentPerSqft + operatingExpensesPerSqft;
    const modifiedGrossEquivalent = baseRentPerSqft + (operatingExpensesPerSqft * 0.5);
    
    return {
      annualBaseRent,
      annualEffectiveRent,
      operatingExpensesPerSqft,
      annualOperatingExpenses,
      effectiveRentPerSqft,
      yearlyProjections,
      totalBaseRent,
      totalEffectiveRent,
      rentFreeValue,
      netTotalBaseRent,
      netTotalEffectiveRent,
      securityDepositAmount,
      breakClauseCost,
      rentPaidBeforeBreak,
      year1OccupancyCost,
      totalInitialOutlay,
      avgEffectiveRentPerSqft,
      grossEquivalent,
      tripleNetEquivalent,
      modifiedGrossEquivalent,
    };
  }, [inputs]);

  // Chart data
  const rentProjectionData = results.yearlyProjections.map(y => ({
    name: `Year ${y.year}`,
    'Base Rent': y.baseRent,
    'Effective Rent': y.effectiveRent,
  }));

  const leaseTypeComparisonData = [
    { name: 'Gross Lease', rent: results.grossEquivalent * inputs.leasableArea },
    { name: 'Modified Gross', rent: results.modifiedGrossEquivalent * inputs.leasableArea },
    { name: 'Triple Net', rent: results.tripleNetEquivalent * inputs.leasableArea },
  ];

  const costBreakdownData = [
    { name: 'Base Rent', value: results.annualBaseRent, color: CHART_COLORS[0] },
    { name: 'CAM', value: inputs.cam * inputs.leasableArea, color: CHART_COLORS[1] },
    { name: 'Insurance', value: inputs.insurance * inputs.leasableArea, color: CHART_COLORS[2] },
    { name: 'Utilities', value: inputs.utilities * inputs.leasableArea, color: CHART_COLORS[3] },
  ].filter(d => d.value > 0);

  const handleAIAnalysis = () => {
    if (!isElite) {
      setShowUpgradeModal(true);
      return;
    }
    setShowAIAnalysis(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Commercial Lease Analyzer</h1>
            <Badge variant="outline" className="bg-slate-500/10 text-slate-600 border-slate-300">
              Commercial
            </Badge>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Compare lease structures, calculate total occupancy costs, analyze escalation clauses, and understand break clause implications.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Basic Lease Terms */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Lease Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Base Rent (AED/sqft/year)</Label>
                  <Input
                    type="number"
                    value={inputs.baseRentPerSqft}
                    onChange={(e) => updateInput('baseRentPerSqft', parseFloat(e.target.value) || 0)}
                  />
                </div>
                
                <div>
                  <Label>Leasable Area (sqft)</Label>
                  <Input
                    type="number"
                    value={inputs.leasableArea}
                    onChange={(e) => updateInput('leasableArea', parseFloat(e.target.value) || 0)}
                  />
                </div>
                
                <SliderInput
                  label="Lease Term"
                  value={inputs.leaseTerm}
                  onChange={(v) => updateInput('leaseTerm', v)}
                  min={1}
                  max={15}
                  step={1}
                  suffix=" years"
                />

                <div>
                  <Label>Lease Type</Label>
                  <Select value={inputs.leaseType} onValueChange={(v) => updateInput('leaseType', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gross">Gross Lease (Full Service)</SelectItem>
                      <SelectItem value="modified-gross">Modified Gross</SelectItem>
                      <SelectItem value="triple-net">Triple Net (NNN)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {inputs.leaseType === 'gross' && 'Landlord pays all operating expenses'}
                    {inputs.leaseType === 'modified-gross' && 'Shared expenses between tenant and landlord'}
                    {inputs.leaseType === 'triple-net' && 'Tenant pays base rent + all operating expenses'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Operating Expenses */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Operating Expenses (AED/sqft/year)
                </CardTitle>
                <CardDescription>
                  {inputs.leaseType === 'gross' ? 'Paid by landlord' : inputs.leaseType === 'triple-net' ? 'Paid by tenant' : 'Shared costs'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">CAM Charges</Label>
                    <Input
                      type="number"
                      value={inputs.cam}
                      onChange={(e) => updateInput('cam', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Insurance</Label>
                    <Input
                      type="number"
                      value={inputs.insurance}
                      onChange={(e) => updateInput('insurance', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Property Tax</Label>
                    <Input
                      type="number"
                      value={inputs.propertyTax}
                      onChange={(e) => updateInput('propertyTax', parseFloat(e.target.value) || 0)}
                      disabled
                    />
                    <p className="text-xs text-muted-foreground">N/A in UAE</p>
                  </div>
                  <div>
                    <Label className="text-xs">Utilities</Label>
                    <Input
                      type="number"
                      value={inputs.utilities}
                      onChange={(e) => updateInput('utilities', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Escalation Terms */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Rent Escalation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Escalation Type</Label>
                  <Select value={inputs.escalationType} onValueChange={(v) => updateInput('escalationType', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Annual Increase</SelectItem>
                      <SelectItem value="cpi">CPI-Linked</SelectItem>
                      <SelectItem value="market">Market Review</SelectItem>
                      <SelectItem value="none">No Escalation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {inputs.escalationType === 'fixed' && (
                  <SliderInput
                    label="Annual Increase"
                    value={inputs.fixedEscalation}
                    onChange={(v) => updateInput('fixedEscalation', v)}
                    min={0}
                    max={15}
                    step={0.5}
                    suffix="%"
                  />
                )}

                {inputs.escalationType === 'cpi' && (
                  <SliderInput
                    label="Estimated CPI"
                    value={inputs.cpiEstimate}
                    onChange={(v) => updateInput('cpiEstimate', v)}
                    min={0}
                    max={10}
                    step={0.5}
                    suffix="%"
                  />
                )}

                {inputs.escalationType === 'market' && (
                  <SliderInput
                    label="Market Review Every"
                    value={inputs.marketReviewYears}
                    onChange={(v) => updateInput('marketReviewYears', v)}
                    min={1}
                    max={5}
                    step={1}
                    suffix=" years"
                  />
                )}
              </CardContent>
            </Card>

            {/* Break Clause & Other Terms */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Scale className="h-5 w-5 text-primary" />
                  Break Clause & Incentives
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Break Clause</Label>
                  <Switch
                    checked={inputs.hasBreakClause}
                    onCheckedChange={(v) => updateInput('hasBreakClause', v)}
                  />
                </div>

                {inputs.hasBreakClause && (
                  <>
                    <SliderInput
                      label="Break Option Year"
                      value={inputs.breakClauseYear}
                      onChange={(v) => updateInput('breakClauseYear', v)}
                      min={1}
                      max={inputs.leaseTerm}
                      step={1}
                      suffix=""
                    />
                    <SliderInput
                      label="Break Penalty"
                      value={inputs.breakPenaltyMonths}
                      onChange={(v) => updateInput('breakPenaltyMonths', v)}
                      min={0}
                      max={12}
                      step={1}
                      suffix=" months rent"
                    />
                  </>
                )}

                <Separator />

                <SliderInput
                  label="Rent-Free Period"
                  value={inputs.rentFreeMonths}
                  onChange={(v) => updateInput('rentFreeMonths', v)}
                  min={0}
                  max={12}
                  step={1}
                  suffix=" months"
                />

                <SliderInput
                  label="Security Deposit"
                  value={inputs.securityDeposit}
                  onChange={(v) => updateInput('securityDeposit', v)}
                  min={1}
                  max={12}
                  step={1}
                  suffix=" months"
                />

                <div>
                  <Label>Fit-Out Contribution (AED)</Label>
                  <Input
                    type="number"
                    value={inputs.fitOutContribution}
                    onChange={(e) => updateInput('fitOutContribution', parseFloat(e.target.value) || 0)}
                    placeholder="Landlord contribution"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-4">
                  <p className="text-xs text-muted-foreground mb-1">Year 1 Total Cost</p>
                  <p className="text-2xl font-bold">AED {results.year1OccupancyCost.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">AED {results.effectiveRentPerSqft.toFixed(0)}/sqft</p>
                </CardContent>
              </Card>

              <Card className="bg-accent/5 border-accent/20">
                <CardContent className="pt-4">
                  <p className="text-xs text-muted-foreground mb-1">Total Lease Cost</p>
                  <p className="text-2xl font-bold">AED {(results.netTotalEffectiveRent / 1000000).toFixed(2)}M</p>
                  <p className="text-xs text-muted-foreground">{inputs.leaseTerm} year term</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <p className="text-xs text-muted-foreground mb-1">Security Deposit</p>
                  <p className="text-2xl font-bold">AED {results.securityDepositAmount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{inputs.securityDeposit} months</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <p className="text-xs text-muted-foreground mb-1">Rent-Free Value</p>
                  <p className="text-2xl font-bold text-green-600">AED {results.rentFreeValue.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{inputs.rentFreeMonths} months</p>
                </CardContent>
              </Card>
            </div>

            {/* Tabs for different views */}
            <Tabs defaultValue="projection" className="w-full">
              <TabsList className="w-full flex overflow-x-auto scrollbar-hide gap-1 h-auto p-1">
                <TabsTrigger value="projection" className="flex-1 min-w-[100px] text-xs sm:text-sm">Rent Projection</TabsTrigger>
                <TabsTrigger value="comparison" className="flex-1 min-w-[100px] text-xs sm:text-sm">Lease Comparison</TabsTrigger>
                <TabsTrigger value="breakdown" className="flex-1 min-w-[100px] text-xs sm:text-sm">Cost Breakdown</TabsTrigger>
                <TabsTrigger value="break-clause" className="flex-1 min-w-[100px] text-xs sm:text-sm">Break Analysis</TabsTrigger>
              </TabsList>

              <TabsContent value="projection" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Rent Projection Over Lease Term</CardTitle>
                    <CardDescription>
                      Base rent vs effective rent with {inputs.escalationType === 'none' ? 'no' : inputs.escalationType} escalation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={rentProjectionData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                          <YAxis tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} tick={{ fontSize: 12 }} />
                          <Tooltip formatter={(value: number) => `AED ${value.toLocaleString()}`} />
                          <Legend />
                          <Area type="monotone" dataKey="Base Rent" stackId="1" fill="hsl(var(--primary))" fillOpacity={0.3} stroke="hsl(var(--primary))" />
                          <Area type="monotone" dataKey="Effective Rent" stackId="2" fill="hsl(var(--accent))" fillOpacity={0.3} stroke="hsl(var(--accent))" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Yearly breakdown table */}
                    <div className="mt-4 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Year</th>
                            <th className="text-right py-2">Base Rent</th>
                            <th className="text-right py-2">Effective Rent</th>
                            <th className="text-right py-2">Escalation</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results.yearlyProjections.map((y) => (
                            <tr key={y.year} className="border-b border-muted/50">
                              <td className="py-2">Year {y.year}</td>
                              <td className="text-right">AED {y.baseRent.toLocaleString()}</td>
                              <td className="text-right">AED {y.effectiveRent.toLocaleString()}</td>
                              <td className="text-right">
                                {y.year > 1 && y.escalationRate > 0 ? (
                                  <span className="text-amber-600">+{y.escalationRate.toFixed(1)}%</span>
                                ) : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="font-semibold">
                            <td className="py-2">Total</td>
                            <td className="text-right">AED {results.totalBaseRent.toLocaleString()}</td>
                            <td className="text-right">AED {results.totalEffectiveRent.toLocaleString()}</td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="comparison" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Lease Type Comparison</CardTitle>
                    <CardDescription>
                      Annual cost comparison across different lease structures
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={leaseTypeComparisonData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis type="number" tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                          <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                          <Tooltip formatter={(value: number) => `AED ${value.toLocaleString()}`} />
                          <Bar dataKey="rent" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="mt-6 grid grid-cols-3 gap-4">
                      <Card className={inputs.leaseType === 'gross' ? 'border-primary bg-primary/5' : ''}>
                        <CardContent className="pt-4">
                          <h4 className="font-semibold mb-2">Gross Lease</h4>
                          <p className="text-2xl font-bold">AED {results.grossEquivalent.toFixed(0)}/sqft</p>
                          <p className="text-xs text-muted-foreground mt-1">All-inclusive rate</p>
                          <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                            <li>✓ Predictable costs</li>
                            <li>✓ Simple budgeting</li>
                            <li>✗ Higher base rate</li>
                          </ul>
                        </CardContent>
                      </Card>

                      <Card className={inputs.leaseType === 'modified-gross' ? 'border-primary bg-primary/5' : ''}>
                        <CardContent className="pt-4">
                          <h4 className="font-semibold mb-2">Modified Gross</h4>
                          <p className="text-2xl font-bold">AED {results.modifiedGrossEquivalent.toFixed(0)}/sqft</p>
                          <p className="text-xs text-muted-foreground mt-1">Shared expenses</p>
                          <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                            <li>✓ Balanced risk</li>
                            <li>✓ Moderate control</li>
                            <li>○ Medium complexity</li>
                          </ul>
                        </CardContent>
                      </Card>

                      <Card className={inputs.leaseType === 'triple-net' ? 'border-primary bg-primary/5' : ''}>
                        <CardContent className="pt-4">
                          <h4 className="font-semibold mb-2">Triple Net (NNN)</h4>
                          <p className="text-2xl font-bold">AED {results.tripleNetEquivalent.toFixed(0)}/sqft</p>
                          <p className="text-xs text-muted-foreground mt-1">Base + all expenses</p>
                          <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                            <li>✓ Lower base rent</li>
                            <li>✓ More control</li>
                            <li>✗ Variable costs</li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="breakdown" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Annual Cost Breakdown</CardTitle>
                    <CardDescription>
                      Year 1 total occupancy costs by category
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={costBreakdownData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={2}
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              labelLine={false}
                            >
                              {costBreakdownData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => `AED ${value.toLocaleString()}`} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="space-y-4">
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <h4 className="font-semibold mb-3">Cost Summary</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Base Rent</span>
                              <span className="font-medium">AED {results.annualBaseRent.toLocaleString()}</span>
                            </div>
                            {inputs.leaseType !== 'gross' && (
                              <div className="flex justify-between">
                                <span>Operating Expenses</span>
                                <span className="font-medium">AED {results.annualOperatingExpenses.toLocaleString()}</span>
                              </div>
                            )}
                            <Separator className="my-2" />
                            <div className="flex justify-between font-semibold">
                              <span>Total Annual Cost</span>
                              <span>AED {results.annualEffectiveRent.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                              <span>Monthly Cost</span>
                              <span>AED {Math.round(results.annualEffectiveRent / 12).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-muted/50 rounded-lg">
                          <h4 className="font-semibold mb-3">Per Sqft Breakdown</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Base Rent</span>
                              <span>AED {inputs.baseRentPerSqft}/sqft</span>
                            </div>
                            <div className="flex justify-between">
                              <span>CAM</span>
                              <span>AED {inputs.cam}/sqft</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Insurance</span>
                              <span>AED {inputs.insurance}/sqft</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Utilities</span>
                              <span>AED {inputs.utilities}/sqft</span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between font-semibold">
                              <span>Effective Rate</span>
                              <span>AED {results.effectiveRentPerSqft.toFixed(0)}/sqft</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="break-clause" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      Break Clause Analysis
                      {!inputs.hasBreakClause && (
                        <Badge variant="outline">Not Included</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {inputs.hasBreakClause 
                        ? `Break option available at Year ${inputs.breakClauseYear}`
                        : 'Enable break clause in settings to see analysis'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {inputs.hasBreakClause ? (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200">
                            <CardContent className="pt-4">
                              <p className="text-xs text-muted-foreground mb-1">Break Option</p>
                              <p className="text-2xl font-bold">Year {inputs.breakClauseYear}</p>
                              <p className="text-xs text-muted-foreground">of {inputs.leaseTerm} year term</p>
                            </CardContent>
                          </Card>

                          <Card className="bg-red-50 dark:bg-red-950/30 border-red-200">
                            <CardContent className="pt-4">
                              <p className="text-xs text-muted-foreground mb-1">Break Penalty</p>
                              <p className="text-2xl font-bold">AED {results.breakClauseCost.toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground">{inputs.breakPenaltyMonths} months rent</p>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardContent className="pt-4">
                              <p className="text-xs text-muted-foreground mb-1">Rent Before Break</p>
                              <p className="text-2xl font-bold">AED {(results.rentPaidBeforeBreak / 1000000).toFixed(2)}M</p>
                              <p className="text-xs text-muted-foreground">{inputs.breakClauseYear} years</p>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardContent className="pt-4">
                              <p className="text-xs text-muted-foreground mb-1">Total Exit Cost</p>
                              <p className="text-2xl font-bold">AED {(results.rentPaidBeforeBreak + results.breakClauseCost).toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground">Rent + penalty</p>
                            </CardContent>
                          </Card>
                        </div>

                        <div className="p-4 bg-muted/50 rounded-lg">
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                            Break Clause Considerations
                          </h4>
                          <ul className="text-sm text-muted-foreground space-y-2">
                            <li>• Notice period typically required (3-6 months before break date)</li>
                            <li>• Break penalty of {inputs.breakPenaltyMonths} months = AED {results.breakClauseCost.toLocaleString()}</li>
                            <li>• Total commitment if you exercise break: AED {(results.rentPaidBeforeBreak + results.breakClauseCost).toLocaleString()}</li>
                            <li>• Savings vs full term: AED {(results.netTotalEffectiveRent - results.rentPaidBeforeBreak - results.breakClauseCost).toLocaleString()}</li>
                          </ul>
                        </div>

                        <div className="p-4 border rounded-lg">
                          <h4 className="font-semibold mb-3">Stay vs Break Comparison</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-4 bg-muted/30 rounded">
                              <p className="text-sm text-muted-foreground mb-1">Complete Full Term</p>
                              <p className="text-xl font-bold">AED {(results.netTotalEffectiveRent / 1000000).toFixed(2)}M</p>
                              <p className="text-xs text-muted-foreground">{inputs.leaseTerm} years total</p>
                            </div>
                            <div className="text-center p-4 bg-muted/30 rounded">
                              <p className="text-sm text-muted-foreground mb-1">Exercise Break Option</p>
                              <p className="text-xl font-bold">AED {((results.rentPaidBeforeBreak + results.breakClauseCost) / 1000000).toFixed(2)}M</p>
                              <p className="text-xs text-muted-foreground">{inputs.breakClauseYear} years + penalty</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <Scale className="h-12 w-12 mx-auto mb-4 opacity-30" />
                        <p>Enable break clause in the settings panel to see analysis</p>
                        <p className="text-sm mt-2">Break clauses provide flexibility to exit early with defined penalties</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* AI Analysis Button */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      AI Lease Analysis
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Get personalized recommendations on lease terms and negotiation points
                    </p>
                  </div>
                  <Button 
                    onClick={handleAIAnalysis}
                    className={!isElite ? 'opacity-75' : ''}
                  >
                    {isElite ? 'Get AI Analysis' : 'Elite Feature'}
                    <ArrowUpRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>

                {showAIAnalysis && isElite && (
                  <div className="mt-6">
                    <CalculatorAIAnalysis
                      calculatorType="total-cost"
                      inputs={{
                        ...inputs,
                        annualBaseRent: results.annualBaseRent,
                        annualEffectiveRent: results.annualEffectiveRent,
                      }}
                      results={results}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Upgrade Modal */}
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          feature="tools"
        />
      </div>
    </div>
  );
};

export default CommercialLeaseAnalyzer;
