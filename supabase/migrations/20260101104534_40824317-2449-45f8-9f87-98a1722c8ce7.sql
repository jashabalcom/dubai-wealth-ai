-- Create enum for data confidence levels
CREATE TYPE data_confidence_level AS ENUM ('official', 'verified', 'industry', 'estimated', 'unverified');

-- Create enum for data source types
CREATE TYPE data_source_type AS ENUM ('government', 'regulatory', 'industry', 'aggregated', 'manual');

-- Create enum for data categories
CREATE TYPE data_category AS ENUM (
  'dld_fees', 
  'mortgage_fees', 
  'service_charges', 
  'chiller_fees', 
  'golden_visa', 
  'area_benchmarks', 
  'exit_costs', 
  'rental_costs', 
  'str_costs',
  'developer_data'
);

-- Create data_sources table - Registry of all data sources
CREATE TABLE public.data_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  source_type data_source_type NOT NULL DEFAULT 'manual',
  url TEXT,
  description TEXT,
  credibility_score INTEGER DEFAULT 50 CHECK (credibility_score >= 0 AND credibility_score <= 100),
  update_frequency TEXT, -- 'daily', 'weekly', 'monthly', 'quarterly', 'annual'
  contact_info TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dubai_data_registry table - Central registry for all configurable data
CREATE TABLE public.dubai_data_registry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  data_key TEXT NOT NULL,
  data_category data_category NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  value_json JSONB NOT NULL,
  unit TEXT, -- 'percent', 'aed', 'aed_per_sqft', etc.
  source_id UUID REFERENCES public.data_sources(id),
  source_url TEXT,
  source_name TEXT,
  confidence_level data_confidence_level NOT NULL DEFAULT 'unverified',
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID,
  expires_at TIMESTAMP WITH TIME ZONE,
  update_frequency TEXT, -- Expected update frequency
  is_critical BOOLEAN DEFAULT false, -- If true, alerts are higher priority
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(data_key, data_category)
);

-- Create data_verification_logs table - Audit trail for all changes
CREATE TABLE public.data_verification_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  data_registry_id UUID NOT NULL REFERENCES public.dubai_data_registry(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'create', 'update', 'verify', 'expire', 'deactivate'
  old_value JSONB,
  new_value JSONB,
  changed_fields TEXT[],
  verified_by UUID,
  verification_method TEXT, -- 'official_document', 'website_check', 'api_sync', 'manual_entry'
  source_document_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create area_market_data table - Replaces hardcoded AREA_BENCHMARKS
CREATE TABLE public.area_market_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  area_name TEXT NOT NULL,
  area_slug TEXT NOT NULL,
  avg_price_sqft NUMERIC,
  avg_yield NUMERIC,
  service_charge_sqft NUMERIC,
  chiller_monthly NUMERIC,
  has_district_cooling BOOLEAN DEFAULT false,
  total_transactions_ytd INTEGER,
  avg_property_price NUMERIC,
  price_trend_percent NUMERIC, -- YoY change
  source_id UUID REFERENCES public.data_sources(id),
  confidence_level data_confidence_level NOT NULL DEFAULT 'estimated',
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(area_name)
);

-- Create indexes for performance
CREATE INDEX idx_dubai_data_registry_category ON public.dubai_data_registry(data_category);
CREATE INDEX idx_dubai_data_registry_key ON public.dubai_data_registry(data_key);
CREATE INDEX idx_dubai_data_registry_expires ON public.dubai_data_registry(expires_at) WHERE is_active = true;
CREATE INDEX idx_data_verification_logs_registry ON public.data_verification_logs(data_registry_id);
CREATE INDEX idx_area_market_data_slug ON public.area_market_data(area_slug);
CREATE INDEX idx_area_market_data_expires ON public.area_market_data(expires_at) WHERE is_active = true;

-- Enable RLS on all tables
ALTER TABLE public.data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dubai_data_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_verification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.area_market_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies for data_sources
CREATE POLICY "Anyone can view active data sources"
  ON public.data_sources FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage data sources"
  ON public.data_sources FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for dubai_data_registry
CREATE POLICY "Anyone can view active registry data"
  ON public.dubai_data_registry FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage registry data"
  ON public.dubai_data_registry FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for data_verification_logs
CREATE POLICY "Admins can view verification logs"
  ON public.data_verification_logs FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can create verification logs"
  ON public.data_verification_logs FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for area_market_data
CREATE POLICY "Anyone can view active area data"
  ON public.area_market_data FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage area data"
  ON public.area_market_data FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_data_sources_updated_at
  BEFORE UPDATE ON public.data_sources
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dubai_data_registry_updated_at
  BEFORE UPDATE ON public.dubai_data_registry
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_area_market_data_updated_at
  BEFORE UPDATE ON public.area_market_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial data sources
INSERT INTO public.data_sources (name, source_type, url, description, credibility_score, update_frequency) VALUES
('Dubai Land Department', 'government', 'https://www.dubailand.gov.ae', 'Official Dubai Land Department - Primary source for property fees and regulations', 100, 'annual'),
('RERA Dubai', 'regulatory', 'https://www.rera.gov.ae', 'Real Estate Regulatory Agency - Service charges and rental regulations', 100, 'annual'),
('UAE ICP', 'government', 'https://icp.gov.ae', 'Federal Authority for Identity and Citizenship - Golden Visa regulations', 100, 'quarterly'),
('Central Bank UAE', 'government', 'https://www.centralbank.ae', 'UAE Central Bank - Mortgage regulations and limits', 100, 'quarterly'),
('Property Finder', 'industry', 'https://www.propertyfinder.ae', 'Industry aggregator for market data and trends', 75, 'monthly'),
('Bayut', 'industry', 'https://www.bayut.com', 'Industry aggregator for property listings and analytics', 75, 'monthly'),
('DXB Interact', 'government', 'https://dxbinteract.com', 'Dubai Land Department transactions data portal', 95, 'daily'),
('Manual Entry', 'manual', NULL, 'Manually entered data requiring verification', 50, 'as_needed');

-- Insert initial DLD fees data
INSERT INTO public.dubai_data_registry (data_key, data_category, display_name, description, value_json, unit, source_name, source_url, confidence_level, verified_at, expires_at, is_critical, update_frequency) VALUES
('dld_registration_fee', 'dld_fees', 'DLD Registration Fee', 'Dubai Land Department property registration fee', '{"value": 4, "min": 4, "max": 4}', 'percent', 'Dubai Land Department', 'https://www.dubailand.gov.ae', 'official', now(), now() + interval '1 year', true, 'annual'),
('dld_admin_fee', 'dld_fees', 'DLD Admin Fee', 'Administrative fee for property registration', '{"value": 580}', 'aed', 'Dubai Land Department', 'https://www.dubailand.gov.ae', 'official', now(), now() + interval '1 year', false, 'annual'),
('trustee_fee', 'dld_fees', 'Trustee Office Fee', 'Fee for trustee office services', '{"value": 4200, "vat_inclusive": false}', 'aed', 'Dubai Land Department', 'https://www.dubailand.gov.ae', 'official', now(), now() + interval '1 year', false, 'annual'),
('title_deed_fee', 'dld_fees', 'Title Deed Issuance Fee', 'Fee for issuing property title deed', '{"value": 520}', 'aed', 'Dubai Land Department', 'https://www.dubailand.gov.ae', 'official', now(), now() + interval '1 year', false, 'annual'),
('broker_commission', 'dld_fees', 'Broker Commission', 'Standard real estate agent commission', '{"value": 2, "min": 1, "max": 2}', 'percent', 'RERA Dubai', 'https://www.rera.gov.ae', 'official', now(), now() + interval '1 year', false, 'annual');

-- Insert mortgage fees
INSERT INTO public.dubai_data_registry (data_key, data_category, display_name, description, value_json, unit, source_name, source_url, confidence_level, verified_at, expires_at, is_critical, update_frequency) VALUES
('mortgage_registration_fee', 'mortgage_fees', 'Mortgage Registration Fee', 'DLD fee for registering mortgage', '{"value": 0.25}', 'percent', 'Dubai Land Department', 'https://www.dubailand.gov.ae', 'official', now(), now() + interval '1 year', true, 'annual'),
('mortgage_admin_fee', 'mortgage_fees', 'Mortgage Admin Fee', 'Administrative fee for mortgage registration', '{"value": 290}', 'aed', 'Dubai Land Department', 'https://www.dubailand.gov.ae', 'official', now(), now() + interval '1 year', false, 'annual'),
('bank_arrangement_fee', 'mortgage_fees', 'Bank Arrangement Fee', 'Bank processing fee for mortgage', '{"value": 1, "min": 0.5, "max": 1}', 'percent', 'Central Bank UAE', 'https://www.centralbank.ae', 'industry', now(), now() + interval '6 months', false, 'quarterly'),
('property_valuation_fee', 'mortgage_fees', 'Property Valuation Fee', 'Bank-required property valuation', '{"value": 3000, "min": 2500, "max": 5000}', 'aed', 'Industry Standard', NULL, 'industry', now(), now() + interval '6 months', false, 'quarterly'),
('max_ltv_expat', 'mortgage_fees', 'Max LTV for Expats', 'Maximum loan-to-value ratio for expatriates', '{"value": 80, "first_property": 80, "second_property": 65}', 'percent', 'Central Bank UAE', 'https://www.centralbank.ae', 'official', now(), now() + interval '1 year', true, 'annual'),
('max_ltv_uae_national', 'mortgage_fees', 'Max LTV for UAE Nationals', 'Maximum loan-to-value ratio for UAE nationals', '{"value": 85, "first_property": 85, "second_property": 70}', 'percent', 'Central Bank UAE', 'https://www.centralbank.ae', 'official', now(), now() + interval '1 year', true, 'annual');

-- Insert Golden Visa data
INSERT INTO public.dubai_data_registry (data_key, data_category, display_name, description, value_json, unit, source_name, source_url, confidence_level, verified_at, expires_at, is_critical, update_frequency) VALUES
('golden_visa_property_threshold', 'golden_visa', 'Property Investment Threshold', 'Minimum property value for Golden Visa eligibility', '{"value": 2000000}', 'aed', 'UAE ICP', 'https://icp.gov.ae', 'official', now(), now() + interval '6 months', true, 'quarterly'),
('golden_visa_duration', 'golden_visa', 'Visa Duration', 'Duration of Golden Visa for property investors', '{"value": 10}', 'years', 'UAE ICP', 'https://icp.gov.ae', 'official', now(), now() + interval '6 months', true, 'quarterly'),
('golden_visa_multiple_properties', 'golden_visa', 'Multiple Properties Allowed', 'Whether multiple properties can combine for threshold', '{"value": true}', 'boolean', 'UAE ICP', 'https://icp.gov.ae', 'official', now(), now() + interval '6 months', false, 'quarterly'),
('golden_visa_offplan_eligible', 'golden_visa', 'Off-Plan Eligibility', 'Whether off-plan properties qualify', '{"value": false, "note": "Must be completed/handed over"}', 'boolean', 'UAE ICP', 'https://icp.gov.ae', 'official', now(), now() + interval '6 months', true, 'quarterly'),
('golden_visa_mortgage_allowed', 'golden_visa', 'Mortgage Restrictions', 'Mortgage restrictions for Golden Visa eligibility', '{"value": false, "note": "Property must be fully paid off"}', 'boolean', 'UAE ICP', 'https://icp.gov.ae', 'official', now(), now() + interval '6 months', true, 'quarterly');

-- Insert exit costs
INSERT INTO public.dubai_data_registry (data_key, data_category, display_name, description, value_json, unit, source_name, source_url, confidence_level, verified_at, expires_at, is_critical, update_frequency) VALUES
('seller_agent_commission', 'exit_costs', 'Seller Agent Commission', 'Commission paid by seller to agent', '{"value": 2, "min": 1, "max": 2}', 'percent', 'RERA Dubai', 'https://www.rera.gov.ae', 'official', now(), now() + interval '1 year', false, 'annual'),
('noc_fee', 'exit_costs', 'NOC Fee', 'No Objection Certificate fee from developer', '{"value": 5000, "min": 500, "max": 5000}', 'aed', 'Industry Standard', NULL, 'industry', now(), now() + interval '6 months', false, 'quarterly'),
('mortgage_release_fee', 'exit_costs', 'Mortgage Release Fee', 'Fee for releasing mortgage from property', '{"value": 1290}', 'aed', 'Dubai Land Department', 'https://www.dubailand.gov.ae', 'official', now(), now() + interval '1 year', false, 'annual'),
('early_settlement_fee', 'exit_costs', 'Early Mortgage Settlement', 'Bank fee for early mortgage settlement', '{"value": 1, "max": 1}', 'percent', 'Central Bank UAE', 'https://www.centralbank.ae', 'official', now(), now() + interval '1 year', true, 'annual');

-- Insert rental costs
INSERT INTO public.dubai_data_registry (data_key, data_category, display_name, description, value_json, unit, source_name, source_url, confidence_level, verified_at, expires_at, is_critical, update_frequency) VALUES
('rental_commission', 'rental_costs', 'Rental Commission', 'Agent commission for rental properties', '{"value": 5}', 'percent', 'RERA Dubai', 'https://www.rera.gov.ae', 'official', now(), now() + interval '1 year', false, 'annual'),
('ejari_fee', 'rental_costs', 'Ejari Registration Fee', 'Mandatory rental contract registration', '{"value": 220}', 'aed', 'RERA Dubai', 'https://www.rera.gov.ae', 'official', now(), now() + interval '1 year', false, 'annual'),
('security_deposit', 'rental_costs', 'Security Deposit', 'Standard security deposit', '{"value": 5, "furnished": 10}', 'percent', 'RERA Dubai', 'https://www.rera.gov.ae', 'official', now(), now() + interval '1 year', false, 'annual'),
('housing_fee', 'rental_costs', 'Housing Fee', 'Annual municipal housing fee', '{"value": 5}', 'percent', 'Dubai Municipality', 'https://www.dm.gov.ae', 'official', now(), now() + interval '1 year', true, 'annual');

-- Insert STR costs
INSERT INTO public.dubai_data_registry (data_key, data_category, display_name, description, value_json, unit, source_name, source_url, confidence_level, verified_at, expires_at, is_critical, update_frequency) VALUES
('dtcm_permit_fee', 'str_costs', 'DTCM Holiday Home Permit', 'Annual permit for short-term rentals', '{"value": 1520}', 'aed', 'DTCM', 'https://www.visitdubai.com', 'official', now(), now() + interval '1 year', true, 'annual'),
('tourism_dirham_fee', 'str_costs', 'Tourism Dirham Fee', 'Per night tourism fee', '{"value": 15, "min": 7, "max": 20}', 'aed_per_night', 'DTCM', 'https://www.visitdubai.com', 'official', now(), now() + interval '1 year', false, 'annual'),
('str_vat', 'str_costs', 'VAT on Short-Term Rentals', 'VAT applicable to holiday home rentals', '{"value": 5}', 'percent', 'Federal Tax Authority', 'https://www.tax.gov.ae', 'official', now(), now() + interval '1 year', true, 'annual'),
('platform_commission', 'str_costs', 'Platform Commission', 'Airbnb/Booking.com commission', '{"value": 15, "min": 3, "max": 20}', 'percent', 'Industry Standard', NULL, 'industry', now(), now() + interval '6 months', false, 'quarterly');

-- Insert sample area market data
INSERT INTO public.area_market_data (area_name, area_slug, avg_price_sqft, avg_yield, service_charge_sqft, chiller_monthly, has_district_cooling, confidence_level, verified_at, expires_at) VALUES
('Downtown Dubai', 'downtown-dubai', 2800, 5.2, 18, 1500, true, 'verified', now(), now() + interval '3 months'),
('Dubai Marina', 'dubai-marina', 1800, 6.0, 16, 1200, true, 'verified', now(), now() + interval '3 months'),
('Palm Jumeirah', 'palm-jumeirah', 3200, 4.8, 22, 2000, true, 'verified', now(), now() + interval '3 months'),
('Business Bay', 'business-bay', 1600, 6.5, 14, 1000, true, 'verified', now(), now() + interval '3 months'),
('JBR', 'jbr', 2000, 5.8, 18, 1300, true, 'verified', now(), now() + interval '3 months'),
('DIFC', 'difc', 3000, 4.5, 25, 1800, true, 'verified', now(), now() + interval '3 months'),
('Dubai Hills Estate', 'dubai-hills-estate', 1400, 5.5, 12, 0, false, 'estimated', now(), now() + interval '3 months'),
('Arabian Ranches', 'arabian-ranches', 1200, 4.8, 10, 0, false, 'estimated', now(), now() + interval '3 months'),
('Jumeirah Village Circle', 'jvc', 900, 7.5, 10, 800, true, 'estimated', now(), now() + interval '3 months'),
('Dubai Creek Harbour', 'dubai-creek-harbour', 2200, 5.0, 16, 1400, true, 'estimated', now(), now() + interval '3 months'),
('Mohammed Bin Rashid City', 'mbr-city', 1800, 5.2, 14, 0, false, 'estimated', now(), now() + interval '3 months'),
('Jumeirah Lake Towers', 'jlt', 1100, 7.0, 12, 900, true, 'verified', now(), now() + interval '3 months'),
('Al Barsha', 'al-barsha', 1000, 6.5, 10, 0, false, 'estimated', now(), now() + interval '3 months'),
('Meydan', 'meydan', 1500, 5.8, 14, 1100, true, 'estimated', now(), now() + interval '3 months'),
('City Walk', 'city-walk', 2500, 5.0, 20, 1600, true, 'verified', now(), now() + interval '3 months');