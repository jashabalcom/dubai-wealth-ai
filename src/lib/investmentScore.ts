// Shared investment scoring utilities

export const AREA_BENCHMARKS: Record<string, { avgPriceSqft: number; avgYield: number }> = {
  'Dubai Marina': { avgPriceSqft: 1800, avgYield: 6.0 },
  'Downtown Dubai': { avgPriceSqft: 2500, avgYield: 5.5 },
  'Palm Jumeirah': { avgPriceSqft: 3200, avgYield: 5.0 },
  'Business Bay': { avgPriceSqft: 1600, avgYield: 6.5 },
  'JVC': { avgPriceSqft: 900, avgYield: 8.0 },
  'Dubai Hills': { avgPriceSqft: 1400, avgYield: 5.5 },
  'MBR City': { avgPriceSqft: 1200, avgYield: 6.0 },
  'Emaar Beachfront': { avgPriceSqft: 2200, avgYield: 5.5 },
  'Dubai Creek Harbour': { avgPriceSqft: 1900, avgYield: 5.8 },
  'Damac Lagoons': { avgPriceSqft: 1000, avgYield: 6.5 },
  'The Valley': { avgPriceSqft: 850, avgYield: 7.0 },
  'Tilal Al Ghaf': { avgPriceSqft: 1100, avgYield: 6.0 },
};

export const DEFAULT_BENCHMARK = { avgPriceSqft: 1500, avgYield: 6.0 };

export const TOP_DEVELOPERS = [
  'Emaar', 'DAMAC', 'Nakheel', 'Meraas', 'Dubai Properties', 
  'Sobha', 'Aldar', 'Omniyat', 'Select Group', 'Ellington'
];

export const GOLDEN_VISA_THRESHOLD = 2000000;

export interface InvestmentScoreInput {
  priceAed: number;
  sizeSqft: number;
  rentalYield?: number;
  area: string;
  developerName?: string;
  isOffPlan?: boolean;
}

export interface ScoreBreakdown {
  priceValue: number;
  yieldScore: number;
  developerScore: number;
  offPlanBonus: number;
}

export interface InvestmentScoreResult {
  score: number;
  breakdown: ScoreBreakdown;
}

export function calculateInvestmentScore(props: InvestmentScoreInput): InvestmentScoreResult {
  const { priceAed, sizeSqft, rentalYield = 0, area, developerName, isOffPlan } = props;
  const benchmark = AREA_BENCHMARKS[area] || DEFAULT_BENCHMARK;
  
  const priceSqft = priceAed / sizeSqft;
  
  // Price value score (0-35): How much below/above market
  const priceRatio = benchmark.avgPriceSqft / priceSqft;
  const priceValue = Math.min(35, Math.max(0, (priceRatio - 0.7) * 50));
  
  // Yield score (0-35): Higher yield = better
  const yieldRatio = rentalYield / benchmark.avgYield;
  const yieldScore = Math.min(35, Math.max(0, yieldRatio * 25));
  
  // Developer score (0-20): Top developers get bonus
  const isTopDeveloper = developerName && TOP_DEVELOPERS.some(
    dev => developerName.toLowerCase().includes(dev.toLowerCase())
  );
  const developerScore = isTopDeveloper ? 20 : 10;
  
  // Off-plan bonus (0-10): Off-plan typically has better entry prices
  const offPlanBonus = isOffPlan ? 10 : 0;
  
  const score = Math.round(priceValue + yieldScore + developerScore + offPlanBonus);
  
  return {
    score: Math.min(100, Math.max(0, score)),
    breakdown: { priceValue, yieldScore, developerScore, offPlanBonus }
  };
}

export function isGoldenVisaEligible(priceAed: number): boolean {
  return priceAed >= GOLDEN_VISA_THRESHOLD;
}

export function isBelowMarketValue(priceAed: number, sizeSqft: number, area: string): boolean {
  const benchmark = AREA_BENCHMARKS[area] || DEFAULT_BENCHMARK;
  const priceSqft = priceAed / sizeSqft;
  return priceSqft < benchmark.avgPriceSqft;
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-500';
  if (score >= 60) return 'text-gold';
  if (score >= 40) return 'text-amber-500';
  return 'text-red-500';
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Below Average';
}
