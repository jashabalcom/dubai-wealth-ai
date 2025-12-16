// Shared investment scoring utilities
// Comprehensive Dubai area benchmarks based on 2024 market data

export const AREA_BENCHMARKS: Record<string, { avgPriceSqft: number; avgYield: number }> = {
  // Ultra Premium Areas
  'Palm Jumeirah': { avgPriceSqft: 3200, avgYield: 5.0 },
  'Emirates Hills': { avgPriceSqft: 3500, avgYield: 3.5 },
  'Bluewaters Island': { avgPriceSqft: 2800, avgYield: 5.2 },
  
  // Premium Areas
  'Downtown Dubai': { avgPriceSqft: 2500, avgYield: 5.5 },
  'DIFC': { avgPriceSqft: 2600, avgYield: 5.3 },
  'Dubai Marina': { avgPriceSqft: 1800, avgYield: 6.0 },
  'JBR': { avgPriceSqft: 2000, avgYield: 5.8 },
  'City Walk': { avgPriceSqft: 2400, avgYield: 5.4 },
  'Emaar Beachfront': { avgPriceSqft: 2200, avgYield: 5.5 },
  'Dubai Creek Harbour': { avgPriceSqft: 1900, avgYield: 5.8 },
  
  // Mid-Premium Areas
  'Business Bay': { avgPriceSqft: 1600, avgYield: 6.5 },
  'Dubai Hills': { avgPriceSqft: 1400, avgYield: 5.5 },
  'Dubai Hills Estate': { avgPriceSqft: 1400, avgYield: 5.5 },
  'MBR City': { avgPriceSqft: 1200, avgYield: 6.0 },
  'Mohammed Bin Rashid City': { avgPriceSqft: 1200, avgYield: 6.0 },
  'Sobha Hartland': { avgPriceSqft: 1500, avgYield: 5.8 },
  'Meydan': { avgPriceSqft: 1300, avgYield: 6.2 },
  'JLT': { avgPriceSqft: 1100, avgYield: 7.0 },
  'Jumeirah Lake Towers': { avgPriceSqft: 1100, avgYield: 7.0 },
  'The Greens': { avgPriceSqft: 1150, avgYield: 6.8 },
  'The Views': { avgPriceSqft: 1200, avgYield: 6.5 },
  'Jumeirah': { avgPriceSqft: 1600, avgYield: 5.5 },
  'Umm Suqeim': { avgPriceSqft: 1500, avgYield: 5.8 },
  'Al Barsha': { avgPriceSqft: 1000, avgYield: 7.0 },
  
  // Mid-Range High Yield Areas
  'JVC': { avgPriceSqft: 900, avgYield: 8.0 },
  'Jumeirah Village Circle': { avgPriceSqft: 900, avgYield: 8.0 },
  'Damac Hills': { avgPriceSqft: 950, avgYield: 7.5 },
  'Damac Hills 2': { avgPriceSqft: 700, avgYield: 8.5 },
  'Damac Lagoons': { avgPriceSqft: 1000, avgYield: 6.5 },
  'Al Furjan': { avgPriceSqft: 850, avgYield: 7.8 },
  'Arabian Ranches': { avgPriceSqft: 1100, avgYield: 5.5 },
  'Arabian Ranches 2': { avgPriceSqft: 950, avgYield: 6.0 },
  'Arabian Ranches 3': { avgPriceSqft: 900, avgYield: 6.2 },
  'Tilal Al Ghaf': { avgPriceSqft: 1100, avgYield: 6.0 },
  'The Valley': { avgPriceSqft: 850, avgYield: 7.0 },
  
  // Affordable High Yield Areas
  'Sports City': { avgPriceSqft: 750, avgYield: 8.5 },
  'Dubai Sports City': { avgPriceSqft: 750, avgYield: 8.5 },
  'Motor City': { avgPriceSqft: 800, avgYield: 8.0 },
  'Silicon Oasis': { avgPriceSqft: 700, avgYield: 9.0 },
  'Dubai Silicon Oasis': { avgPriceSqft: 700, avgYield: 9.0 },
  'Town Square': { avgPriceSqft: 750, avgYield: 8.2 },
  'Dubai South': { avgPriceSqft: 650, avgYield: 8.5 },
  'Discovery Gardens': { avgPriceSqft: 550, avgYield: 9.5 },
  'International City': { avgPriceSqft: 450, avgYield: 10.0 },
  'Production City': { avgPriceSqft: 600, avgYield: 9.0 },
  'Impz': { avgPriceSqft: 600, avgYield: 9.0 },
  'Dubailand': { avgPriceSqft: 700, avgYield: 8.0 },
  'Remraam': { avgPriceSqft: 650, avgYield: 8.5 },
  'Liwan': { avgPriceSqft: 600, avgYield: 9.0 },
  'Arjan': { avgPriceSqft: 800, avgYield: 8.0 },
  'Al Barari': { avgPriceSqft: 1400, avgYield: 4.5 },
  
  // Off-Plan / Emerging Areas
  'Dubai Islands': { avgPriceSqft: 1800, avgYield: 5.5 },
  'Ras Al Khaimah': { avgPriceSqft: 900, avgYield: 7.5 },
};

export const DEFAULT_BENCHMARK = { avgPriceSqft: 1200, avgYield: 6.5 };

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
