// Dubai Data Registry - Central data management system
// Provides type-safe access to verified Dubai real estate data

export type DataConfidenceLevel = 'official' | 'verified' | 'industry' | 'estimated' | 'unverified';
export type DataSourceType = 'government' | 'regulatory' | 'industry' | 'aggregated' | 'manual';
export type DataCategory = 
  | 'dld_fees' 
  | 'mortgage_fees' 
  | 'service_charges' 
  | 'chiller_fees' 
  | 'golden_visa' 
  | 'area_benchmarks' 
  | 'exit_costs' 
  | 'rental_costs' 
  | 'str_costs'
  | 'developer_data';

export interface DataSource {
  id: string;
  name: string;
  source_type: DataSourceType;
  url: string | null;
  description: string | null;
  credibility_score: number;
  update_frequency: string | null;
  is_active: boolean;
}

export interface DataRegistryEntry {
  id: string;
  data_key: string;
  data_category: DataCategory;
  display_name: string;
  description: string | null;
  value_json: Record<string, unknown>;
  unit: string | null;
  source_id: string | null;
  source_url: string | null;
  source_name: string | null;
  confidence_level: DataConfidenceLevel;
  verified_at: string | null;
  verified_by: string | null;
  expires_at: string | null;
  update_frequency: string | null;
  is_critical: boolean;
  is_active: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface AreaMarketData {
  id: string;
  area_name: string;
  area_slug: string;
  avg_price_sqft: number | null;
  avg_yield: number | null;
  service_charge_sqft: number | null;
  chiller_monthly: number | null;
  has_district_cooling: boolean;
  total_transactions_ytd: number | null;
  avg_property_price: number | null;
  price_trend_percent: number | null;
  source_id: string | null;
  confidence_level: DataConfidenceLevel;
  verified_at: string | null;
  expires_at: string | null;
  is_active: boolean;
}

export interface DataVerificationLog {
  id: string;
  data_registry_id: string;
  action: string;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  changed_fields: string[] | null;
  verified_by: string | null;
  verification_method: string | null;
  source_document_url: string | null;
  notes: string | null;
  created_at: string;
}

// Data freshness utilities
export function isDataStale(expiresAt: string | null): boolean {
  if (!expiresAt) return true;
  return new Date(expiresAt) < new Date();
}

export function isDataExpiringSoon(expiresAt: string | null, daysThreshold: number = 7): boolean {
  if (!expiresAt) return true;
  const expiryDate = new Date(expiresAt);
  const warningDate = new Date();
  warningDate.setDate(warningDate.getDate() + daysThreshold);
  return expiryDate <= warningDate;
}

export function getDataFreshnessStatus(expiresAt: string | null): 'fresh' | 'expiring' | 'stale' {
  if (isDataStale(expiresAt)) return 'stale';
  if (isDataExpiringSoon(expiresAt, 14)) return 'expiring';
  return 'fresh';
}

export function formatVerificationDate(date: string | null): string {
  if (!date) return 'Never verified';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

export function getConfidenceBadgeVariant(level: DataConfidenceLevel): 'official' | 'verified' | 'industry' | 'estimated' | 'stale' {
  switch (level) {
    case 'official':
      return 'official';
    case 'verified':
      return 'verified';
    case 'industry':
      return 'industry';
    case 'estimated':
      return 'estimated';
    case 'unverified':
    default:
      return 'stale';
  }
}

// Extract numeric value from value_json
export function extractValue(valueJson: Record<string, unknown>, key: string = 'value'): number {
  const val = valueJson[key];
  if (typeof val === 'number') return val;
  if (typeof val === 'string') return parseFloat(val) || 0;
  return 0;
}

// Default fallback values (used when database is unavailable)
export const DEFAULT_DLD_FEES = {
  dld_registration_fee: { value: 4, unit: 'percent' },
  dld_admin_fee: { value: 580, unit: 'aed' },
  trustee_fee: { value: 4200, unit: 'aed' },
  title_deed_fee: { value: 520, unit: 'aed' },
  broker_commission: { value: 2, unit: 'percent' },
};

export const DEFAULT_MORTGAGE_FEES = {
  mortgage_registration_fee: { value: 0.25, unit: 'percent' },
  mortgage_admin_fee: { value: 290, unit: 'aed' },
  bank_arrangement_fee: { value: 1, unit: 'percent' },
  property_valuation_fee: { value: 3000, unit: 'aed' },
  max_ltv_expat: { value: 80, unit: 'percent' },
  max_ltv_uae_national: { value: 85, unit: 'percent' },
};

export const DEFAULT_GOLDEN_VISA = {
  golden_visa_property_threshold: { value: 2000000, unit: 'aed' },
  golden_visa_duration: { value: 10, unit: 'years' },
  golden_visa_multiple_properties: { value: true, unit: 'boolean' },
  golden_visa_offplan_eligible: { value: false, unit: 'boolean' },
  golden_visa_mortgage_allowed: { value: false, unit: 'boolean' },
};

export const DEFAULT_EXIT_COSTS = {
  seller_agent_commission: { value: 2, unit: 'percent' },
  noc_fee: { value: 5000, unit: 'aed' },
  mortgage_release_fee: { value: 1290, unit: 'aed' },
  early_settlement_fee: { value: 1, unit: 'percent' },
};

export const DEFAULT_RENTAL_COSTS = {
  rental_commission: { value: 5, unit: 'percent' },
  ejari_fee: { value: 220, unit: 'aed' },
  security_deposit: { value: 5, unit: 'percent' },
  housing_fee: { value: 5, unit: 'percent' },
};

export const DEFAULT_STR_COSTS = {
  dtcm_permit_fee: { value: 1520, unit: 'aed' },
  tourism_dirham_fee: { value: 15, unit: 'aed_per_night' },
  str_vat: { value: 5, unit: 'percent' },
  platform_commission: { value: 15, unit: 'percent' },
};

// Category display info
export const DATA_CATEGORY_INFO: Record<DataCategory, { label: string; description: string; icon: string }> = {
  dld_fees: {
    label: 'DLD Fees',
    description: 'Dubai Land Department registration and administrative fees',
    icon: 'Building2',
  },
  mortgage_fees: {
    label: 'Mortgage Fees',
    description: 'Bank and DLD mortgage-related fees and limits',
    icon: 'Landmark',
  },
  service_charges: {
    label: 'Service Charges',
    description: 'Building service charges by area',
    icon: 'Wrench',
  },
  chiller_fees: {
    label: 'Chiller Fees',
    description: 'District cooling fees by area',
    icon: 'Snowflake',
  },
  golden_visa: {
    label: 'Golden Visa',
    description: 'UAE Golden Visa eligibility requirements',
    icon: 'Award',
  },
  area_benchmarks: {
    label: 'Area Benchmarks',
    description: 'Market averages by area',
    icon: 'MapPin',
  },
  exit_costs: {
    label: 'Exit Costs',
    description: 'Costs associated with selling property',
    icon: 'LogOut',
  },
  rental_costs: {
    label: 'Rental Costs',
    description: 'Long-term rental fees and regulations',
    icon: 'Key',
  },
  str_costs: {
    label: 'Short-Term Rental',
    description: 'Holiday home permit and platform fees',
    icon: 'Calendar',
  },
  developer_data: {
    label: 'Developer Data',
    description: 'Developer-specific information',
    icon: 'Building',
  },
};

// Confidence level display info
export const CONFIDENCE_LEVEL_INFO: Record<DataConfidenceLevel, { label: string; description: string; color: string }> = {
  official: {
    label: 'Official',
    description: 'Verified from government or regulatory sources',
    color: 'emerald',
  },
  verified: {
    label: 'Verified',
    description: 'Cross-referenced and confirmed from multiple sources',
    color: 'blue',
  },
  industry: {
    label: 'Industry',
    description: 'Based on industry standards and common practice',
    color: 'violet',
  },
  estimated: {
    label: 'Estimated',
    description: 'Calculated from available data and trends',
    color: 'amber',
  },
  unverified: {
    label: 'Unverified',
    description: 'Requires verification before use',
    color: 'red',
  },
};
