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
  // Extended fields
  officeSpaceFrom: number; // Starting office costs per year
  flexDeskFrom: number; // Flexi desk option cost
  virtualOfficeFrom: number; // Virtual office cost
  renewalCost: { license: number; visa: number }; // Annual renewal costs
  minimumCapital: number; // Required share capital (0 = none)
  establishmentCard: number; // Cost for establishment card
  websiteUrl: string; // Official website
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

// Free Zones Database (Expanded)
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
    officeSpaceFrom: 25000,
    flexDeskFrom: 15000,
    virtualOfficeFrom: 0,
    renewalCost: { license: 12000, visa: 4500 },
    minimumCapital: 0,
    establishmentCard: 1200,
    websiteUrl: 'https://www.dmcc.ae',
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
    officeSpaceFrom: 75000,
    flexDeskFrom: 35000,
    virtualOfficeFrom: 0,
    renewalCost: { license: 25000, visa: 5500 },
    minimumCapital: 50000,
    establishmentCard: 0,
    websiteUrl: 'https://www.difc.ae',
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
    officeSpaceFrom: 35000,
    flexDeskFrom: 0,
    virtualOfficeFrom: 0,
    renewalCost: { license: 18000, visa: 4000 },
    minimumCapital: 0,
    establishmentCard: 1500,
    websiteUrl: 'https://www.jafza.ae',
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
    officeSpaceFrom: 30000,
    flexDeskFrom: 18000,
    virtualOfficeFrom: 0,
    renewalCost: { license: 15000, visa: 4200 },
    minimumCapital: 0,
    establishmentCard: 1000,
    websiteUrl: 'https://www.dafz.ae',
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
    officeSpaceFrom: 18000,
    flexDeskFrom: 12000,
    virtualOfficeFrom: 8000,
    renewalCost: { license: 10000, visa: 3800 },
    minimumCapital: 0,
    establishmentCard: 800,
    websiteUrl: 'https://www.dsoa.ae',
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
    officeSpaceFrom: 45000,
    flexDeskFrom: 25000,
    virtualOfficeFrom: 0,
    renewalCost: { license: 18000, visa: 4500 },
    minimumCapital: 0,
    establishmentCard: 1200,
    websiteUrl: 'https://dic.ae',
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
    officeSpaceFrom: 40000,
    flexDeskFrom: 22000,
    virtualOfficeFrom: 0,
    renewalCost: { license: 16000, visa: 4500 },
    minimumCapital: 0,
    establishmentCard: 1200,
    websiteUrl: 'https://dmc.ae',
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
    officeSpaceFrom: 55000,
    flexDeskFrom: 30000,
    virtualOfficeFrom: 0,
    renewalCost: { license: 22000, visa: 5000 },
    minimumCapital: 0,
    establishmentCard: 1500,
    websiteUrl: 'https://www.dhcc.ae',
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
    officeSpaceFrom: 20000,
    flexDeskFrom: 12000,
    virtualOfficeFrom: 6000,
    renewalCost: { license: 10000, visa: 3500 },
    minimumCapital: 0,
    establishmentCard: 800,
    websiteUrl: 'https://www.dubaisouth.ae',
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
    officeSpaceFrom: 15000,
    flexDeskFrom: 8500,
    virtualOfficeFrom: 5500,
    renewalCost: { license: 9000, visa: 3500 },
    minimumCapital: 0,
    establishmentCard: 600,
    websiteUrl: 'https://www.ifza.com',
  },
  {
    name: 'RAKEZ (Ras Al Khaimah Economic Zone)',
    slug: 'rakez',
    location: 'Ras Al Khaimah',
    sector: ['Manufacturing', 'Trading', 'Services', 'E-commerce'],
    licenseCost: { from: 7500, to: 30000 },
    visaAllocation: { min: 1, max: 100 },
    setupTimeWeeks: 1,
    corporateTax: 0,
    importDuty: 0,
    highlights: ['Lowest setup costs in UAE', 'No office requirement for some licenses', 'Strategic location'],
    bestFor: ['Budget-conscious startups', 'E-commerce', 'Small trading companies'],
    officeSpaceFrom: 12000,
    flexDeskFrom: 6000,
    virtualOfficeFrom: 4000,
    renewalCost: { license: 6500, visa: 3000 },
    minimumCapital: 0,
    establishmentCard: 500,
    websiteUrl: 'https://www.rakez.com',
  },
  {
    name: 'Meydan Free Zone',
    slug: 'meydan',
    location: 'Meydan, Dubai',
    sector: ['General Trading', 'Consultancy', 'E-commerce', 'Services'],
    licenseCost: { from: 12500, to: 40000 },
    visaAllocation: { min: 1, max: 50 },
    setupTimeWeeks: 1,
    corporateTax: 0,
    importDuty: 0,
    highlights: ['Central Dubai location', 'Premium address', 'Fast setup process'],
    bestFor: ['Consultants', 'Trading companies', 'Service businesses'],
    officeSpaceFrom: 22000,
    flexDeskFrom: 12000,
    virtualOfficeFrom: 7500,
    renewalCost: { license: 10000, visa: 3800 },
    minimumCapital: 0,
    establishmentCard: 750,
    websiteUrl: 'https://www.meydanfz.ae',
  },
  {
    name: 'Dubai Design District (d3)',
    slug: 'd3',
    location: 'Dubai Design District',
    sector: ['Design', 'Fashion', 'Art', 'Luxury', 'Creative'],
    licenseCost: { from: 22000, to: 80000 },
    visaAllocation: { min: 1, max: 100 },
    setupTimeWeeks: 2,
    corporateTax: 0,
    importDuty: 0,
    highlights: ['Creative industries hub', 'Fashion week venue', 'Premium showroom spaces'],
    bestFor: ['Fashion brands', 'Interior designers', 'Art galleries', 'Creative agencies'],
    officeSpaceFrom: 50000,
    flexDeskFrom: 28000,
    virtualOfficeFrom: 0,
    renewalCost: { license: 18000, visa: 4500 },
    minimumCapital: 0,
    establishmentCard: 1200,
    websiteUrl: 'https://www.dubaidesigndistrict.com',
  },
  {
    name: 'Dubai Production City (DPC)',
    slug: 'dpc',
    location: 'Dubai Production City',
    sector: ['Printing', 'Publishing', 'Packaging', 'Media Production'],
    licenseCost: { from: 15000, to: 55000 },
    visaAllocation: { min: 1, max: 200 },
    setupTimeWeeks: 2,
    corporateTax: 0,
    importDuty: 0,
    highlights: ['Production-focused facilities', 'Warehouse spaces available', 'Media production equipment'],
    bestFor: ['Printing companies', 'Publishers', 'Packaging manufacturers'],
    officeSpaceFrom: 25000,
    flexDeskFrom: 15000,
    virtualOfficeFrom: 8000,
    renewalCost: { license: 12000, visa: 4000 },
    minimumCapital: 0,
    establishmentCard: 1000,
    websiteUrl: 'https://www.dpc.ae',
  },
  {
    name: 'Sharjah Media City (Shams)',
    slug: 'shams',
    location: 'Sharjah',
    sector: ['Media', 'Marketing', 'Consultancy', 'E-commerce'],
    licenseCost: { from: 5750, to: 20000 },
    visaAllocation: { min: 0, max: 50 },
    setupTimeWeeks: 1,
    corporateTax: 0,
    importDuty: 0,
    highlights: ['Lowest cost in UAE', 'No visa requirement for freelancers', '100% online process'],
    bestFor: ['Freelancers', 'Digital nomads', 'Solo consultants', 'Online businesses'],
    officeSpaceFrom: 10000,
    flexDeskFrom: 5000,
    virtualOfficeFrom: 2500,
    renewalCost: { license: 5000, visa: 2800 },
    minimumCapital: 0,
    establishmentCard: 0,
    websiteUrl: 'https://www.shams.ae',
  },
];

// Get all unique sectors from free zones
export function getAllSectors(): string[] {
  const sectors = new Set<string>();
  DUBAI_FREE_ZONES.forEach(zone => {
    zone.sector.forEach(s => sectors.add(s));
  });
  return Array.from(sectors).sort();
}

// Calculate total first year cost for a free zone
export function calculateFirstYearCost(
  zone: FreeZoneInfo,
  options: {
    numVisas: number;
    officeType: 'none' | 'virtual' | 'flexi' | 'dedicated';
    additionalServices?: number;
  }
): {
  licenseFee: number;
  visaCost: number;
  officeCost: number;
  establishmentCard: number;
  additionalServices: number;
  total: number;
} {
  const licenseFee = zone.licenseCost.from;
  const visaCost = options.numVisas * 4500; // Average visa processing cost
  
  let officeCost = 0;
  switch (options.officeType) {
    case 'virtual':
      officeCost = zone.virtualOfficeFrom;
      break;
    case 'flexi':
      officeCost = zone.flexDeskFrom;
      break;
    case 'dedicated':
      officeCost = zone.officeSpaceFrom;
      break;
  }

  const additionalServices = options.additionalServices || 0;

  return {
    licenseFee,
    visaCost,
    officeCost,
    establishmentCard: zone.establishmentCard,
    additionalServices,
    total: licenseFee + visaCost + officeCost + zone.establishmentCard + additionalServices,
  };
}

// Calculate annual renewal cost
export function calculateAnnualRenewal(
  zone: FreeZoneInfo,
  numVisas: number,
  officeType: 'none' | 'virtual' | 'flexi' | 'dedicated'
): number {
  let officeCost = 0;
  switch (officeType) {
    case 'virtual':
      officeCost = zone.virtualOfficeFrom;
      break;
    case 'flexi':
      officeCost = zone.flexDeskFrom;
      break;
    case 'dedicated':
      officeCost = zone.officeSpaceFrom;
      break;
  }
  
  return zone.renewalCost.license + (numVisas * zone.renewalCost.visa) + officeCost;
}

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
