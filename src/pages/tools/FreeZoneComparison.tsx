import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  MapPin, ArrowLeft, Search, Filter, Check, X, Building2, 
  Users, Clock, Sparkles, Lock, ChevronDown, Info
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { InvestmentDisclaimer } from '@/components/ui/disclaimers';
import { FreeZoneCard } from '@/components/tools/FreeZoneCard';
import { FreeZoneCharts } from '@/components/tools/FreeZoneCharts';
import { UpgradeModal } from '@/components/freemium/UpgradeModal';
import { ContextualUpgradePrompt } from '@/components/freemium/ContextualUpgradePrompt';
import { useProfile } from '@/hooks/useProfile';
import { useToolUsage } from '@/hooks/useToolUsage';
import { useCalculatorAnalysis } from '@/hooks/useCalculatorAnalysis';
import { DUBAI_FREE_ZONES, getAllSectors, calculateFirstYearCost, calculateAnnualRenewal } from '@/lib/commercialRealEstateFees';
import type { FreeZoneInfo } from '@/lib/commercialRealEstateFees';
import { cn } from '@/lib/utils';

const MAX_ZONES_FREE = 2;
const MAX_ZONES_PAID = 4;

export default function FreeZoneComparison() {
  const { profile } = useProfile();
  const { hasReachedLimit, isUnlimited } = useToolUsage('free-zone');
  const membershipTier = profile?.membership_tier || 'free';
  const { analysis, isAnalyzing, error: analysisError, analyze, reset: resetAnalysis } = useCalculatorAnalysis({ calculatorType: 'free-zone' });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [budgetRange, setBudgetRange] = useState<[number]>([100000]);
  const [minVisas, setMinVisas] = useState<number>(0);
  const [maxSetupWeeks, setMaxSetupWeeks] = useState<number>(4);
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);

  // Calculator inputs
  const [numVisas, setNumVisas] = useState(2);
  const [officeType, setOfficeType] = useState<'none' | 'virtual' | 'flexi' | 'dedicated'>('flexi');
  const [businessDescription, setBusinessDescription] = useState('');
  const [teamSize, setTeamSize] = useState('1-5');

  const allSectors = useMemo(() => getAllSectors(), []);
  const maxZones = membershipTier === 'free' ? MAX_ZONES_FREE : MAX_ZONES_PAID;
  const isElite = membershipTier === 'elite';

  // Filter zones
  const filteredZones = useMemo(() => {
    return DUBAI_FREE_ZONES.filter(zone => {
      // Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          zone.name.toLowerCase().includes(query) ||
          zone.location.toLowerCase().includes(query) ||
          zone.sector.some(s => s.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }
      
      // Sector filter
      if (selectedSector !== 'all' && !zone.sector.includes(selectedSector)) {
        return false;
      }

      // Budget filter
      if (zone.licenseCost.from > budgetRange[0]) {
        return false;
      }

      // Visa filter
      if (zone.visaAllocation.max < minVisas) {
        return false;
      }

      // Setup time filter
      if (zone.setupTimeWeeks > maxSetupWeeks) {
        return false;
      }

      return true;
    });
  }, [searchQuery, selectedSector, budgetRange, minVisas, maxSetupWeeks]);

  // Get selected zone objects
  const selectedZoneObjects = useMemo(() => {
    return selectedZones.map(slug => DUBAI_FREE_ZONES.find(z => z.slug === slug)!).filter(Boolean);
  }, [selectedZones]);

  // Handle zone selection
  const handleZoneSelect = (zone: FreeZoneInfo, selected: boolean) => {
    if (selected) {
      if (selectedZones.length >= maxZones) {
        if (membershipTier === 'free') {
          setShowUpgradeModal(true);
        }
        return;
      }
      setSelectedZones([...selectedZones, zone.slug]);
    } else {
      setSelectedZones(selectedZones.filter(s => s !== zone.slug));
    }
  };

  // Handle AI analysis
  const handleAIAnalysis = async () => {
    if (!isElite) {
      setShowUpgradeModal(true);
      return;
    }

    setShowAIModal(true);
    
    const inputs = {
      selectedZones: selectedZoneObjects.map(z => z.name),
      businessDescription,
      teamSize,
      numVisas,
      officeType,
      budget: budgetRange[0],
    };

    const results = {
      zones: selectedZoneObjects.map(z => ({
        name: z.name,
        licenseCost: z.licenseCost.from,
        visaMax: z.visaAllocation.max,
        setupWeeks: z.setupTimeWeeks,
        sectors: z.sector,
        firstYearCost: calculateFirstYearCost(z, { numVisas, officeType }).total,
        annualRenewal: calculateAnnualRenewal(z, numVisas, officeType),
      })),
    };

    await analyze(inputs, results);
  };

  // Calculate costs for comparison table
  const getZoneCosts = (zone: FreeZoneInfo) => {
    const firstYear = calculateFirstYearCost(zone, { numVisas, officeType });
    const annualRenewal = calculateAnnualRenewal(zone, numVisas, officeType);
    return { firstYear, annualRenewal };
  };

  // Find best values for highlighting
  const getBestValues = () => {
    if (selectedZoneObjects.length === 0) return {};
    
    const costs = selectedZoneObjects.map(z => getZoneCosts(z));
    const minLicense = Math.min(...selectedZoneObjects.map(z => z.licenseCost.from));
    const minFirstYear = Math.min(...costs.map(c => c.firstYear.total));
    const maxVisas = Math.max(...selectedZoneObjects.map(z => z.visaAllocation.max));
    const minSetup = Math.min(...selectedZoneObjects.map(z => z.setupTimeWeeks));

    return { minLicense, minFirstYear, maxVisas, minSetup };
  };

  const bestValues = getBestValues();

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Free Zone Comparison Tool | Dubai Real Estate Investor"
        description="Compare Dubai free zones side-by-side. Analyze DMCC, DIFC, JAFZA, and more with setup costs, visa allocation, and sector fit."
        keywords={['dubai free zones', 'free zone comparison', 'dmcc', 'difc', 'jafza', 'business setup dubai']}
      />
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-8 bg-gradient-to-b from-secondary to-background">
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
            className="max-w-3xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-slate-500/10 border border-slate-500/20 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-slate-400" />
              </div>
              <Badge className="bg-slate-500/20 text-slate-300 border-slate-500/30">Commercial</Badge>
            </div>
            <h1 className="font-heading text-3xl md:text-4xl text-foreground mb-3">
              Free Zone <span className="text-gradient-gold">Comparison Tool</span>
            </h1>
            <p className="text-muted-foreground">
              Compare {DUBAI_FREE_ZONES.length} UAE free zones. Calculate setup costs, compare visa allocations, 
              and find the perfect free zone for your business.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <Card className="bg-card border-border sticky top-24">
                <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
                  <CollapsibleTrigger className="w-full">
                    <CardHeader className="flex flex-row items-center justify-between py-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        Filters
                      </CardTitle>
                      <ChevronDown className={cn(
                        "w-4 h-4 transition-transform",
                        filtersOpen && "rotate-180"
                      )} />
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="space-y-6 pt-0">
                      {/* Search */}
                      <div>
                        <Label className="text-sm text-muted-foreground mb-2 block">Search</Label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="Search zones..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      {/* Sector */}
                      <div>
                        <Label className="text-sm text-muted-foreground mb-2 block">Sector</Label>
                        <Select value={selectedSector} onValueChange={setSelectedSector}>
                          <SelectTrigger>
                            <SelectValue placeholder="All sectors" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Sectors</SelectItem>
                            {allSectors.map(sector => (
                              <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Budget */}
                      <div>
                        <Label className="text-sm text-muted-foreground mb-2 block">
                          Max License Cost: AED {budgetRange[0].toLocaleString()}
                        </Label>
                        <Slider
                          value={budgetRange}
                          onValueChange={(v) => setBudgetRange(v as [number])}
                          min={5000}
                          max={200000}
                          step={5000}
                          className="mt-2"
                        />
                      </div>

                      {/* Min Visas */}
                      <div>
                        <Label className="text-sm text-muted-foreground mb-2 block">
                          Min Visa Capacity: {minVisas}
                        </Label>
                        <Slider
                          value={[minVisas]}
                          onValueChange={(v) => setMinVisas(v[0])}
                          min={0}
                          max={100}
                          step={5}
                          className="mt-2"
                        />
                      </div>

                      {/* Max Setup Time */}
                      <div>
                        <Label className="text-sm text-muted-foreground mb-2 block">
                          Max Setup Time: {maxSetupWeeks} weeks
                        </Label>
                        <Slider
                          value={[maxSetupWeeks]}
                          onValueChange={(v) => setMaxSetupWeeks(v[0])}
                          min={1}
                          max={6}
                          step={1}
                          className="mt-2"
                        />
                      </div>

                      {/* Reset */}
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedSector('all');
                          setBudgetRange([100000]);
                          setMinVisas(0);
                          setMaxSetupWeeks(4);
                        }}
                      >
                        Reset Filters
                      </Button>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              {/* Selection Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <p className="text-muted-foreground">
                    <span className="font-semibold text-foreground">{filteredZones.length}</span> zones found
                  </p>
                  {selectedZones.length > 0 && (
                    <Badge variant="outline" className="bg-gold/10 text-gold border-gold/30">
                      {selectedZones.length}/{maxZones} selected
                    </Badge>
                  )}
                </div>
                {selectedZones.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedZones([])}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear Selection
                  </Button>
                )}
              </div>

              {/* Zone Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredZones.map(zone => (
                  <FreeZoneCard
                    key={zone.slug}
                    zone={zone}
                    isSelected={selectedZones.includes(zone.slug)}
                    onSelect={(selected) => handleZoneSelect(zone, selected)}
                    disabled={selectedZones.length >= maxZones && !selectedZones.includes(zone.slug)}
                  />
                ))}
              </div>

              {filteredZones.length === 0 && (
                <div className="text-center py-12 bg-card rounded-xl border border-border">
                  <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No free zones match your filters</p>
                  <Button variant="link" onClick={() => {
                    setSearchQuery('');
                    setSelectedSector('all');
                    setBudgetRange([100000]);
                    setMinVisas(0);
                    setMaxSetupWeeks(4);
                  }}>
                    Reset Filters
                  </Button>
                </div>
              )}

              {/* Comparison Section */}
              {selectedZoneObjects.length >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="font-heading text-2xl text-foreground">Comparison</h2>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={handleAIAnalysis}
                            disabled={isAnalyzing}
                            className={cn(
                              "gap-2",
                              isElite 
                                ? "bg-gold hover:bg-gold/90 text-primary-foreground" 
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {isElite ? (
                              <Sparkles className="w-4 h-4" />
                            ) : (
                              <Lock className="w-4 h-4" />
                            )}
                            AI Best-Fit Analysis
                          </Button>
                        </TooltipTrigger>
                        {!isElite && (
                          <TooltipContent>
                            <p>Elite membership required</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  {/* Setup Cost Calculator */}
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-gold" />
                        Setup Cost Calculator
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                          <Label className="text-sm text-muted-foreground mb-2 block">Number of Visas</Label>
                          <Select value={numVisas.toString()} onValueChange={(v) => setNumVisas(parseInt(v))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[1, 2, 3, 5, 10, 15, 20, 50].map(n => (
                                <SelectItem key={n} value={n.toString()}>{n} visa{n > 1 ? 's' : ''}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground mb-2 block">Office Type</Label>
                          <Select value={officeType} onValueChange={(v) => setOfficeType(v as any)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No Office</SelectItem>
                              <SelectItem value="virtual">Virtual Office</SelectItem>
                              <SelectItem value="flexi">Flexi Desk</SelectItem>
                              <SelectItem value="dedicated">Dedicated Office</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Comparison Table */}
                  <Card className="bg-card border-border overflow-hidden">
                    <CardHeader>
                      <CardTitle className="text-lg">Side-by-Side Comparison</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-border bg-secondary/50">
                              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Feature</th>
                              {selectedZoneObjects.map(zone => (
                                <th key={zone.slug} className="text-left p-4 text-sm font-medium text-foreground">
                                  {zone.name}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-border">
                              <td className="p-4 text-sm text-muted-foreground">Location</td>
                              {selectedZoneObjects.map(zone => (
                                <td key={zone.slug} className="p-4 text-sm text-foreground">{zone.location}</td>
                              ))}
                            </tr>
                            <tr className="border-b border-border">
                              <td className="p-4 text-sm text-muted-foreground">License From</td>
                              {selectedZoneObjects.map(zone => (
                                <td key={zone.slug} className={cn(
                                  "p-4 text-sm font-semibold",
                                  zone.licenseCost.from === bestValues.minLicense ? "text-emerald-500" : "text-foreground"
                                )}>
                                  AED {zone.licenseCost.from.toLocaleString()}
                                  {zone.licenseCost.from === bestValues.minLicense && (
                                    <Check className="inline w-4 h-4 ml-1" />
                                  )}
                                </td>
                              ))}
                            </tr>
                            <tr className="border-b border-border">
                              <td className="p-4 text-sm text-muted-foreground">Max Visas</td>
                              {selectedZoneObjects.map(zone => (
                                <td key={zone.slug} className={cn(
                                  "p-4 text-sm font-semibold",
                                  zone.visaAllocation.max === bestValues.maxVisas ? "text-emerald-500" : "text-foreground"
                                )}>
                                  {zone.visaAllocation.max}
                                  {zone.visaAllocation.max === bestValues.maxVisas && (
                                    <Check className="inline w-4 h-4 ml-1" />
                                  )}
                                </td>
                              ))}
                            </tr>
                            <tr className="border-b border-border">
                              <td className="p-4 text-sm text-muted-foreground">Setup Time</td>
                              {selectedZoneObjects.map(zone => (
                                <td key={zone.slug} className={cn(
                                  "p-4 text-sm font-semibold",
                                  zone.setupTimeWeeks === bestValues.minSetup ? "text-emerald-500" : "text-foreground"
                                )}>
                                  {zone.setupTimeWeeks} week{zone.setupTimeWeeks > 1 ? 's' : ''}
                                  {zone.setupTimeWeeks === bestValues.minSetup && (
                                    <Check className="inline w-4 h-4 ml-1" />
                                  )}
                                </td>
                              ))}
                            </tr>
                            <tr className="border-b border-border bg-gold/5">
                              <td className="p-4 text-sm font-medium text-foreground">First Year Total</td>
                              {selectedZoneObjects.map(zone => {
                                const costs = getZoneCosts(zone);
                                return (
                                  <td key={zone.slug} className={cn(
                                    "p-4 text-sm font-bold",
                                    costs.firstYear.total === bestValues.minFirstYear ? "text-emerald-500" : "text-gold"
                                  )}>
                                    AED {costs.firstYear.total.toLocaleString()}
                                    {costs.firstYear.total === bestValues.minFirstYear && (
                                      <Check className="inline w-4 h-4 ml-1" />
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                            <tr className="border-b border-border">
                              <td className="p-4 text-sm text-muted-foreground">Annual Renewal</td>
                              {selectedZoneObjects.map(zone => {
                                const costs = getZoneCosts(zone);
                                return (
                                  <td key={zone.slug} className="p-4 text-sm text-foreground">
                                    AED {costs.annualRenewal.toLocaleString()}/year
                                  </td>
                                );
                              })}
                            </tr>
                            <tr className="border-b border-border">
                              <td className="p-4 text-sm text-muted-foreground">Sectors</td>
                              {selectedZoneObjects.map(zone => (
                                <td key={zone.slug} className="p-4 text-sm text-foreground">
                                  <div className="flex flex-wrap gap-1">
                                    {zone.sector.slice(0, 3).map(s => (
                                      <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                                    ))}
                                  </div>
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <td className="p-4 text-sm text-muted-foreground">Highlights</td>
                              {selectedZoneObjects.map(zone => (
                                <td key={zone.slug} className="p-4 text-sm text-muted-foreground">
                                  <ul className="space-y-1">
                                    {zone.highlights.slice(0, 2).map((h, i) => (
                                      <li key={i} className="flex items-start gap-1">
                                        <Check className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-xs">{h}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </td>
                              ))}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Charts */}
                  <FreeZoneCharts 
                    zones={selectedZoneObjects}
                    numVisas={numVisas}
                    officeType={officeType}
                  />
                </motion.div>
              )}

              {selectedZoneObjects.length === 1 && (
                <div className="text-center py-8 bg-secondary/50 rounded-xl border border-border">
                  <Info className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Select at least 2 zones to compare</p>
                </div>
              )}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-12">
            <InvestmentDisclaimer />
          </div>
        </div>
      </section>

      {/* AI Analysis Modal */}
      <Dialog open={showAIModal} onOpenChange={setShowAIModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-gold" />
              AI Best-Fit Analysis
            </DialogTitle>
          </DialogHeader>
          
          {!analysis && !isAnalyzing && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">Describe your business</Label>
                <Textarea
                  placeholder="E.g., We're a fintech startup building payment solutions for SMEs..."
                  value={businessDescription}
                  onChange={(e) => setBusinessDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">Team size</Label>
                <Select value={teamSize} onValueChange={setTeamSize}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-5">1-5 employees</SelectItem>
                    <SelectItem value="6-15">6-15 employees</SelectItem>
                    <SelectItem value="16-50">16-50 employees</SelectItem>
                    <SelectItem value="50+">50+ employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleAIAnalysis}
                className="w-full bg-gold hover:bg-gold/90 text-primary-foreground"
              >
                Generate Analysis
              </Button>
            </div>
          )}

          {isAnalyzing && (
            <div className="py-8 text-center">
              <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Analyzing free zones...</p>
            </div>
          )}

          {analysis && (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-foreground">{analysis}</div>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  resetAnalysis();
                  setShowAIModal(false);
                }}
              >
                Close
              </Button>
            </div>
          )}

          {analysisError && (
            <div className="text-center py-4">
              <p className="text-destructive mb-4">{analysisError}</p>
              <Button variant="outline" onClick={handleAIAnalysis}>
                Try Again
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {!isUnlimited && hasReachedLimit && (
        <div className="container mx-auto px-4 pb-8">
          <ContextualUpgradePrompt
            feature="Unlimited Calculator Access"
            description="Get unlimited access to all investment calculators, AI analysis, and advanced features."
          />
        </div>
      )}

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature="tools"
      />

      <Footer />
    </div>
  );
}
