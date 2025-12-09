// Comprehensive Dubai Real Estate Fees Configuration
// All values are in AED unless specified otherwise

export interface AcquisitionFees {
  dldRegistration: number; // 4% - Dubai Land Department
  dldAdminFee: number; // Fixed AED 580
  trusteeFee: number; // AED 4,200 + 5% VAT = 4,410
  titleDeedFee: number; // AED 520
  agentCommission: number; // 2% (buyer side)
  nocFee: number; // Developer NOC: AED 500-5,000
  valuationFee: number; // AED 2,500-3,500
}

export interface MortgageFees {
  mortgageRegistration: number; // 0.25% of loan amount
  mortgageAdminFee: number; // Fixed AED 290
  bankValuation: number; // AED 2,500-3,500
  bankProcessing: number; // 0.5-1% of loan
  lifeInsurance: number; // ~0.4-0.6% of outstanding loan annually
  propertyInsurance: number; // ~0.1% of property value annually
}

export interface OngoingCosts {
  serviceChargesPerSqft: [number, number]; // Range by area
  dewaDeposit: number; // AED 2,000 (refundable)
  dewaMonthly: [number, number]; // Range
  maintenancePercent: number; // 1-2% of property value
  homeInsurance: number; // AED 1,500-3,000 annually
  chillerFee?: number; // District cooling where applicable
}

export interface RentalCosts {
  ejariRegistration: number; // AED 220
  securityDeposit: number; // 5% of annual rent (refundable)
  agentFee: number; // 5% of annual rent
  propertyManagement: number; // 5-10% of rental income
  maintenanceReserve: number; // 1% of property value
  landlordInsurance: number; // AED 1,000-2,000
}

export interface ShortTermRentalCosts {
  holidayHomeLicense: number; // AED 1,520
  dtcmPermit: number; // AED 370
  airbnbFee: number; // 3% of booking
  bookingComFee: number; // 15% of booking
  managementFee: number; // 15-25% of revenue
  professionalPhotography: number; // AED 2,000-5,000
  furnishingPerSqft: number; // AED 100-200/sqft
  licensingRenewal: number; // Annual renewal ~AED 1,000
}

export interface ExitCosts {
  agentCommission: number; // 2%
  mortgageEarlySettlement: number; // 1-3% of outstanding
  nocFromDeveloper: number; // AED 500-5,000
  mortgageReleaseFee: number; // AED 1,065
}

export interface OffPlanCosts {
  dldOqood: number; // 4% for off-plan
  adminFee: number; // AED 5,250 (Oqood admin)
  developerAdminFee: number; // 1-3% varies
  escrowFee: number; // Included in purchase usually
}

// Default values based on 2024 Dubai market
export const DEFAULT_ACQUISITION_FEES: AcquisitionFees = {
  dldRegistration: 4,
  dldAdminFee: 580,
  trusteeFee: 4410, // 4,200 + 5% VAT
  titleDeedFee: 520,
  agentCommission: 2,
  nocFee: 1500, // Average
  valuationFee: 3000,
};

export const DEFAULT_MORTGAGE_FEES: MortgageFees = {
  mortgageRegistration: 0.25,
  mortgageAdminFee: 290,
  bankValuation: 3000,
  bankProcessing: 1,
  lifeInsurance: 0.5,
  propertyInsurance: 0.1,
};

export const DEFAULT_ONGOING_COSTS: OngoingCosts = {
  serviceChargesPerSqft: [15, 50],
  dewaDeposit: 2000,
  dewaMonthly: [500, 2000],
  maintenancePercent: 1.5,
  homeInsurance: 2000,
};

export const DEFAULT_RENTAL_COSTS: RentalCosts = {
  ejariRegistration: 220,
  securityDeposit: 5,
  agentFee: 5,
  propertyManagement: 8,
  maintenanceReserve: 1,
  landlordInsurance: 1500,
};

export const DEFAULT_SHORT_TERM_COSTS: ShortTermRentalCosts = {
  holidayHomeLicense: 1520,
  dtcmPermit: 370,
  airbnbFee: 3,
  bookingComFee: 15,
  managementFee: 20,
  professionalPhotography: 3500,
  furnishingPerSqft: 150,
  licensingRenewal: 1000,
};

export const DEFAULT_EXIT_COSTS: ExitCosts = {
  agentCommission: 2,
  mortgageEarlySettlement: 1,
  nocFromDeveloper: 1500,
  mortgageReleaseFee: 1065,
};

// Area-specific service charges (AED per sqft per year)
export const AREA_SERVICE_CHARGES: Record<string, number> = {
  // Premium Areas
  'Dubai Marina': 18,
  'Downtown Dubai': 25,
  'Palm Jumeirah': 35,
  'JBR': 22,
  'DIFC': 30,
  'Bluewaters Island': 32,
  'City Walk': 28,
  'Emirates Hills': 10,
  'Dubai Creek Harbour': 20,
  
  // Mid-Range Areas
  'Business Bay': 16,
  'Dubai Hills': 14,
  'MBR City': 16,
  'Sobha Hartland': 18,
  'JLT': 14,
  'Meydan': 14,
  'The Greens': 15,
  'The Views': 15,
  'Jumeirah Village Circle': 12,
  'JVC': 12,
  
  // Affordable Areas
  'Arabian Ranches': 8,
  'Sports City': 10,
  'Motor City': 12,
  'Silicon Oasis': 11,
  'Town Square': 10,
  'Damac Hills': 12,
  'Damac Hills 2': 9,
  'Dubai South': 9,
  'Al Furjan': 11,
  'Discovery Gardens': 8,
  'International City': 6,
  'Production City': 8,
  'Dubailand': 10,
  'Remraam': 9,
  'Al Barsha': 12,
  'Jumeirah': 15,
  'Umm Suqeim': 12,
};

// Area-specific district cooling (AED per month average)
export const AREA_CHILLER_FEES: Record<string, number> = {
  // Premium Areas (high district cooling)
  'Dubai Marina': 800,
  'Downtown Dubai': 1200,
  'Palm Jumeirah': 1500,
  'JBR': 1000,
  'DIFC': 1500,
  'Bluewaters Island': 1400,
  'City Walk': 1200,
  'Dubai Creek Harbour': 900,
  
  // Mid-Range Areas
  'Business Bay': 900,
  'Dubai Hills': 600,
  'MBR City': 700,
  'Sobha Hartland': 800,
  'JLT': 700,
  'Meydan': 650,
  'The Greens': 600,
  'The Views': 600,
  
  // Areas without district cooling (included in DEWA)
  'JVC': 0,
  'Jumeirah Village Circle': 0,
  'Arabian Ranches': 0,
  'Sports City': 0,
  'Motor City': 0,
  'Silicon Oasis': 0,
  'Town Square': 0,
  'Damac Hills': 0,
  'Damac Hills 2': 0,
  'Dubai South': 0,
  'Al Furjan': 0,
  'Discovery Gardens': 0,
  'International City': 0,
  'Production City': 0,
  'Dubailand': 0,
  'Remraam': 0,
  'Al Barsha': 0,
  'Emirates Hills': 0,
  'Jumeirah': 0,
  'Umm Suqeim': 0,
};

// Calculator helper functions
export function calculateAcquisitionCosts(
  propertyPrice: number,
  fees: AcquisitionFees = DEFAULT_ACQUISITION_FEES,
  isMortgage: boolean = false,
  loanAmount: number = 0
) {
  const dldFee = propertyPrice * (fees.dldRegistration / 100);
  const agentFee = propertyPrice * (fees.agentCommission / 100);
  
  const baseCosts = {
    dldFee,
    dldAdminFee: fees.dldAdminFee,
    trusteeFee: fees.trusteeFee,
    titleDeedFee: fees.titleDeedFee,
    agentFee,
    nocFee: fees.nocFee,
    valuationFee: fees.valuationFee,
  };

  let mortgageCosts = {
    mortgageRegistration: 0,
    mortgageAdminFee: 0,
    bankValuation: 0,
    bankProcessing: 0,
  };

  if (isMortgage && loanAmount > 0) {
    mortgageCosts = {
      mortgageRegistration: loanAmount * (DEFAULT_MORTGAGE_FEES.mortgageRegistration / 100),
      mortgageAdminFee: DEFAULT_MORTGAGE_FEES.mortgageAdminFee,
      bankValuation: DEFAULT_MORTGAGE_FEES.bankValuation,
      bankProcessing: loanAmount * (DEFAULT_MORTGAGE_FEES.bankProcessing / 100),
    };
  }

  const totalBaseCosts = Object.values(baseCosts).reduce((a, b) => a + b, 0);
  const totalMortgageCosts = Object.values(mortgageCosts).reduce((a, b) => a + b, 0);

  return {
    ...baseCosts,
    ...mortgageCosts,
    totalBaseCosts,
    totalMortgageCosts,
    grandTotal: totalBaseCosts + totalMortgageCosts,
    percentageOfProperty: ((totalBaseCosts + totalMortgageCosts) / propertyPrice) * 100,
  };
}

export function calculateAnnualOngoingCosts(
  propertyPrice: number,
  propertySizeSqft: number,
  area: string,
  isRentedOut: boolean = false
) {
  const serviceChargeRate = AREA_SERVICE_CHARGES[area] || 15;
  const chillerFee = AREA_CHILLER_FEES[area] || 0;
  
  const serviceCharges = propertySizeSqft * serviceChargeRate;
  const chillerAnnual = chillerFee * 12;
  const dewaEstimate = 12000; // Average annual
  const maintenance = propertyPrice * (DEFAULT_ONGOING_COSTS.maintenancePercent / 100);
  const insurance = DEFAULT_ONGOING_COSTS.homeInsurance;

  let rentalCosts = 0;
  if (isRentedOut) {
    rentalCosts = DEFAULT_RENTAL_COSTS.landlordInsurance;
  }

  return {
    serviceCharges,
    chillerAnnual,
    dewaEstimate,
    maintenance,
    insurance,
    rentalCosts,
    total: serviceCharges + chillerAnnual + dewaEstimate + maintenance + insurance + rentalCosts,
  };
}

export function calculateExitCosts(
  salePrice: number,
  outstandingMortgage: number = 0
) {
  const agentFee = salePrice * (DEFAULT_EXIT_COSTS.agentCommission / 100);
  const earlySettlement = outstandingMortgage > 0 
    ? outstandingMortgage * (DEFAULT_EXIT_COSTS.mortgageEarlySettlement / 100) 
    : 0;
  const mortgageRelease = outstandingMortgage > 0 ? DEFAULT_EXIT_COSTS.mortgageReleaseFee : 0;
  const noc = DEFAULT_EXIT_COSTS.nocFromDeveloper;

  return {
    agentFee,
    earlySettlement,
    mortgageRelease,
    noc,
    total: agentFee + earlySettlement + mortgageRelease + noc,
    percentageOfSale: ((agentFee + earlySettlement + mortgageRelease + noc) / salePrice) * 100,
  };
}

// Fee descriptions for tooltips
export const FEE_DESCRIPTIONS: Record<string, string> = {
  dldRegistration: 'Dubai Land Department registration fee - 4% of property value, split equally between buyer and seller (2% each) in practice, but officially buyer pays.',
  dldAdminFee: 'Fixed administrative fee paid to DLD for processing.',
  trusteeFee: 'Fee for the registered trustee who facilitates the transaction. Includes 5% VAT.',
  titleDeedFee: 'Fee for issuing the title deed (Mulkiya).',
  agentCommission: 'Real estate agent commission, typically 2% paid by buyer.',
  nocFee: 'No Objection Certificate from the developer, required for resale properties.',
  valuationFee: 'Property valuation required by banks for mortgages.',
  mortgageRegistration: '0.25% of loan amount registered with DLD.',
  mortgageAdminFee: 'Fixed DLD admin fee for mortgage registration.',
  bankValuation: 'Bank\'s independent property valuation fee.',
  bankProcessing: 'Bank\'s mortgage processing/arrangement fee (0.5-1% of loan).',
  lifeInsurance: 'Mandatory life insurance for mortgage, covers outstanding loan balance.',
  propertyInsurance: 'Building insurance, often required by banks.',
  serviceCharges: 'Annual maintenance fees to building management, varies by area and building quality.',
  ejariRegistration: 'Official tenancy contract registration with RERA.',
  holidayHomeLicense: 'DTCM license required for short-term rentals in Dubai.',
  dtcmPermit: 'Department of Tourism permit for each property.',
  earlySettlement: 'Penalty for paying off mortgage early (1-3% of outstanding balance).',
};
