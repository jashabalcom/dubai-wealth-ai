// Dubai Commercial Real Estate Configuration

export type CommercialPropertyType = 'office' | 'retail' | 'warehouse' | 'industrial' | 'mixed-use';

export interface CommercialBenchmark {
  name: string;
  type: CommercialPropertyType;
  typicalCapRate: { min: number; max: number; avg: number };
  typicalPricePerSqft: { min: number; max: number; avg: number };
  typicalOperatingExpenseRatio: number; // As percentage of gross income
  vacancyRate: number;
  description: string;
}

export interface FreeZoneInfo {
  name: string;
  slug: string;
  location: string;
  sector: string[];
  licenseCost: { from: number; to: number };
  visaAllocation: { min: number; max: number };
  setupTimeWeeks: number;
  corporateTax: number; // Percentage (0 for most free zones until threshold)
  importDuty: number;
  highlights: string[];
  bestFor: string[];
}

// Dubai Commercial Property Benchmarks by Type
export const COMMERCIAL_BENCHMARKS: Record<CommercialPropertyType, CommercialBenchmark> = {
  office: {
    name: 'Office Space',
    type: 'office',
    typicalCapRate: { min: 6.5, max: 9.5, avg: 7.8 },
    typicalPricePerSqft: { min: 800, max: 2500, avg: 1400 },
    typicalOperatingExpenseRatio: 35,
    vacancyRate: 15,
    description: 'Grade A office spaces in prime locations like DIFC, Business Bay, and Downtown Dubai.',
  },
  retail: {
    name: 'Retail Space',
    type: 'retail',
    typicalCapRate: { min: 7.0, max: 11.0, avg: 8.5 },
    typicalPricePerSqft: { min: 1200, max: 4000, avg: 2200 },
    typicalOperatingExpenseRatio: 25,
    vacancyRate: 12,
    description: 'High-street retail, mall units, and community retail centers.',
  },
  warehouse: {
    name: 'Warehouse/Logistics',
    type: 'warehouse',
    typicalCapRate: { min: 7.5, max: 10.5, avg: 8.8 },
    typicalPricePerSqft: { min: 350, max: 800, avg: 550 },
    typicalOperatingExpenseRatio: 20,
    vacancyRate: 8,
    description: 'Industrial warehouses, logistics facilities, and distribution centers in DIP, JAFZA, and Al Quoz.',
  },
  industrial: {
    name: 'Industrial Facility',
    type: 'industrial',
    typicalCapRate: { min: 8.0, max: 12.0, avg: 9.5 },
    typicalPricePerSqft: { min: 250, max: 600, avg: 400 },
    typicalOperatingExpenseRatio: 22,
    vacancyRate: 10,
    description: 'Manufacturing facilities, light industrial units, and production spaces.',
  },
  'mixed-use': {
    name: 'Mixed-Use Development',
    type: 'mixed-use',
    typicalCapRate: { min: 6.0, max: 9.0, avg: 7.2 },
    typicalPricePerSqft: { min: 900, max: 2800, avg: 1600 },
    typicalOperatingExpenseRatio: 30,
    vacancyRate: 12,
    description: 'Combined residential, retail, and office developments.',
  },
};

// Area-specific commercial data
export const COMMERCIAL_AREA_DATA: Record<string, { 
  pricePerSqft: number; 
  capRate: number; 
  propertyTypes: CommercialPropertyType[];
}> = {
  'DIFC': { pricePerSqft: 2200, capRate: 7.0, propertyTypes: ['office', 'retail'] },
  'Business Bay': { pricePerSqft: 1400, capRate: 7.5, propertyTypes: ['office', 'retail', 'mixed-use'] },
  'Downtown Dubai': { pricePerSqft: 2000, capRate: 6.8, propertyTypes: ['retail', 'office', 'mixed-use'] },
  'JLT': { pricePerSqft: 1100, capRate: 8.2, propertyTypes: ['office'] },
  'Dubai Marina': { pricePerSqft: 1600, capRate: 7.8, propertyTypes: ['retail', 'office'] },
  'Sheikh Zayed Road': { pricePerSqft: 1500, capRate: 7.5, propertyTypes: ['office'] },
  'Dubai Internet City': { pricePerSqft: 1200, capRate: 7.8, propertyTypes: ['office'] },
  'Dubai Media City': { pricePerSqft: 1150, capRate: 7.9, propertyTypes: ['office'] },
  'Al Quoz Industrial': { pricePerSqft: 450, capRate: 9.5, propertyTypes: ['warehouse', 'industrial'] },
  'DIP (Dubai Investment Park)': { pricePerSqft: 380, capRate: 9.2, propertyTypes: ['warehouse', 'industrial'] },
  'JAFZA': { pricePerSqft: 500, capRate: 8.8, propertyTypes: ['warehouse', 'industrial'] },
  'Dubai South': { pricePerSqft: 420, capRate: 9.0, propertyTypes: ['warehouse', 'industrial', 'office'] },
  'Deira': { pricePerSqft: 900, capRate: 8.5, propertyTypes: ['retail', 'office'] },
  'Bur Dubai': { pricePerSqft: 850, capRate: 8.8, propertyTypes: ['retail', 'office'] },
  'Jumeirah': { pricePerSqft: 1800, capRate: 7.2, propertyTypes: ['retail'] },
};

// Free Zones Database
export const DUBAI_FREE_ZONES: FreeZoneInfo[] = [
  {
    name: 'Dubai Multi Commodities Centre (DMCC)',
    slug: 'dmcc',
    location: 'JLT (Jumeirah Lakes Towers)',
    sector: ['Trading', 'Finance', 'Technology', 'Energy', 'Precious Metals'],
    licenseCost: { from: 15000, to: 50000 },
    visaAllocation: { min: 1, max: 100 },
    setupTimeWeeks: 2,
    corporateTax: 0,
    importDuty: 0,
    highlights: ['World\'s #1 Free Zone 6 years running', 'No currency restrictions', 'Full foreign ownership'],
    bestFor: ['Commodity trading', 'General trading', 'Professional services'],
  },
  {
    name: 'Dubai International Financial Centre (DIFC)',
    slug: 'difc',
    location: 'DIFC, Sheikh Zayed Road',
    sector: ['Finance', 'Legal', 'Fintech', 'Wealth Management'],
    licenseCost: { from: 30000, to: 150000 },
    visaAllocation: { min: 1, max: 500 },
    setupTimeWeeks: 4,
    corporateTax: 0,
    importDuty: 0,
    highlights: ['Independent legal jurisdiction (English common law)', 'Access to 72 countries', 'Premium business address'],
    bestFor: ['Financial services', 'Law firms', 'Fintech', 'Family offices'],
  },
  {
    name: 'Jebel Ali Free Zone (JAFZA)',
    slug: 'jafza',
    location: 'Jebel Ali',
    sector: ['Logistics', 'Manufacturing', 'Trading', 'E-commerce'],
    licenseCost: { from: 20000, to: 75000 },
    visaAllocation: { min: 3, max: 1000 },
    setupTimeWeeks: 2,
    corporateTax: 0,
    importDuty: 0,
    highlights: ['Direct access to Jebel Ali Port', 'World\'s largest man-made harbor', 'One-stop-shop services'],
    bestFor: ['Import/export', 'Manufacturing', 'Large-scale operations'],
  },
  {
    name: 'Dubai Airport Free Zone (DAFZA)',
    slug: 'dafza',
    location: 'Adjacent to Dubai International Airport',
    sector: ['Aviation', 'Logistics', 'Technology', 'Pharma'],
    licenseCost: { from: 18000, to: 60000 },
    visaAllocation: { min: 2, max: 500 },
    setupTimeWeeks: 2,
    corporateTax: 0,
    importDuty: 0,
    highlights: ['Integrated with Dubai Airport', 'Cargo hub connectivity', 'Cold storage facilities'],
    bestFor: ['Air cargo', 'Perishables', 'High-value goods'],
  },
  {
    name: 'Dubai Silicon Oasis (DSO)',
    slug: 'dso',
    location: 'Dubai Silicon Oasis',
    sector: ['Technology', 'Electronics', 'R&D', 'Startups'],
    licenseCost: { from: 12000, to: 45000 },
    visaAllocation: { min: 1, max: 100 },
    setupTimeWeeks: 2,
    corporateTax: 0,
    importDuty: 0,
    highlights: ['Technology-focused ecosystem', 'R&D incentives', 'Affordable office space'],
    bestFor: ['Tech startups', 'Electronics', 'Research companies'],
  },
  {
    name: 'Dubai Internet City (DIC)',
    slug: 'dic',
    location: 'Dubai Internet City',
    sector: ['Technology', 'IT Services', 'Software', 'Digital Media'],
    licenseCost: { from: 20000, to: 70000 },
    visaAllocation: { min: 1, max: 200 },
    setupTimeWeeks: 2,
    corporateTax: 0,
    importDuty: 0,
    highlights: ['Home to global tech giants', 'Networking opportunities', 'Smart city infrastructure'],
    bestFor: ['IT companies', 'Software development', 'Tech consulting'],
  },
  {
    name: 'Dubai Media City (DMC)',
    slug: 'dmc',
    location: 'Dubai Media City',
    sector: ['Media', 'Publishing', 'Advertising', 'Broadcasting'],
    licenseCost: { from: 18000, to: 65000 },
    visaAllocation: { min: 1, max: 100 },
    setupTimeWeeks: 2,
    corporateTax: 0,
    importDuty: 0,
    highlights: ['Media industry hub', 'Broadcast facilities', 'Creative community'],
    bestFor: ['Media production', 'Advertising agencies', 'Content creators'],
  },
  {
    name: 'Dubai Healthcare City (DHCC)',
    slug: 'dhcc',
    location: 'Dubai Healthcare City',
    sector: ['Healthcare', 'Wellness', 'Medical Education', 'Pharma'],
    licenseCost: { from: 25000, to: 100000 },
    visaAllocation: { min: 1, max: 200 },
    setupTimeWeeks: 4,
    corporateTax: 0,
    importDuty: 0,
    highlights: ['Healthcare-focused free zone', 'DHA licensing support', 'Medical education'],
    bestFor: ['Clinics', 'Pharma', 'Medical device companies'],
  },
  {
    name: 'Dubai South (Dubai World Central)',
    slug: 'dubai-south',
    location: 'Near Al Maktoum International Airport',
    sector: ['Aviation', 'Logistics', 'E-commerce', 'Exhibitions'],
    licenseCost: { from: 12000, to: 50000 },
    visaAllocation: { min: 1, max: 500 },
    setupTimeWeeks: 2,
    corporateTax: 0,
    importDuty: 0,
    highlights: ['Next to Expo 2020 site', 'Integrated logistics hub', 'Future Dubai\'s economic hub'],
    bestFor: ['Aviation businesses', 'Large-scale logistics', 'Events companies'],
  },
  {
    name: 'International Freezone Authority (IFZA)',
    slug: 'ifza',
    location: 'Dubai Silicon Oasis',
    sector: ['Consultancy', 'Trading', 'E-commerce', 'Services'],
    licenseCost: { from: 11750, to: 35000 },
    visaAllocation: { min: 1, max: 50 },
    setupTimeWeeks: 1,
    corporateTax: 0,
    importDuty: 0,
    highlights: ['Most affordable setup', 'Fast processing', 'Flexible packages'],
    bestFor: ['Consultants', 'Freelancers', 'Small businesses'],
  },
];

// Operating Expense Categories for Commercial Properties
export interface OperatingExpenseBreakdown {
  propertyManagement: number; // Percentage of gross income
  insurance: number; // Per sqft per year
  utilities: number; // Per sqft per year
  repairs: number; // Percentage of gross income
  propertyTax: number; // Per sqft (note: Dubai has no property tax, but service charges apply)
  serviceCharges: number; // Per sqft per year
  marketing: number; // Percentage of gross income for retail
  other: number; // Per sqft per year
}

export const DEFAULT_COMMERCIAL_EXPENSES: Record<CommercialPropertyType, OperatingExpenseBreakdown> = {
  office: {
    propertyManagement: 5,
    insurance: 2,
    utilities: 15,
    repairs: 3,
    propertyTax: 0,
    serviceCharges: 45,
    marketing: 0,
    other: 5,
  },
  retail: {
    propertyManagement: 6,
    insurance: 3,
    utilities: 20,
    repairs: 4,
    propertyTax: 0,
    serviceCharges: 60,
    marketing: 3,
    other: 5,
  },
  warehouse: {
    propertyManagement: 4,
    insurance: 2,
    utilities: 8,
    repairs: 2,
    propertyTax: 0,
    serviceCharges: 15,
    marketing: 0,
    other: 3,
  },
  industrial: {
    propertyManagement: 4,
    insurance: 3,
    utilities: 10,
    repairs: 3,
    propertyTax: 0,
    serviceCharges: 12,
    marketing: 0,
    other: 4,
  },
  'mixed-use': {
    propertyManagement: 5.5,
    insurance: 2.5,
    utilities: 18,
    repairs: 3.5,
    propertyTax: 0,
    serviceCharges: 50,
    marketing: 1,
    other: 5,
  },
};

// Helper functions
export function calculateNOI(
  grossIncome: number,
  expenses: {
    propertyManagement?: number;
    insurance?: number;
    utilities?: number;
    repairs?: number;
    serviceCharges?: number;
    marketing?: number;
    other?: number;
  }
): number {
  const totalExpenses = Object.values(expenses).reduce((sum, val) => sum + (val || 0), 0);
  return grossIncome - totalExpenses;
}

export function calculateCapRate(noi: number, purchasePrice: number): number {
  if (purchasePrice <= 0) return 0;
  return (noi / purchasePrice) * 100;
}

export function calculateDSCR(noi: number, annualDebtService: number): number {
  if (annualDebtService <= 0) return 0;
  return noi / annualDebtService;
}

export function getCapRateRating(capRate: number, propertyType: CommercialPropertyType): 'excellent' | 'good' | 'fair' | 'poor' {
  const benchmark = COMMERCIAL_BENCHMARKS[propertyType];
  if (capRate >= benchmark.typicalCapRate.max) return 'excellent';
  if (capRate >= benchmark.typicalCapRate.avg) return 'good';
  if (capRate >= benchmark.typicalCapRate.min) return 'fair';
  return 'poor';
}

export function getDSCRRating(dscr: number): 'excellent' | 'good' | 'fair' | 'poor' {
  if (dscr >= 1.5) return 'excellent';
  if (dscr >= 1.25) return 'good';
  if (dscr >= 1.0) return 'fair';
  return 'poor';
}
