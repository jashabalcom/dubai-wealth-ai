-- Add missing columns to properties table for Bayut hybrid sync
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS gallery_urls TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS floor_plan_urls TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS bayut_agent_data JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS bayut_agency_data JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS bayut_building_info JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS completion_percent INTEGER DEFAULT NULL;

-- Create composite indexes for common filter queries
CREATE INDEX IF NOT EXISTS idx_properties_filter_combo 
ON public.properties (is_published, listing_type, location_area);

CREATE INDEX IF NOT EXISTS idx_properties_offplan 
ON public.properties (is_published, is_off_plan, completion_percent);

CREATE INDEX IF NOT EXISTS idx_properties_geo_partial 
ON public.properties (latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_properties_external_id 
ON public.properties (external_id) 
WHERE external_id IS NOT NULL;

-- Create bayut_agents table for agent intelligence
CREATE TABLE IF NOT EXISTS public.bayut_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_l1 TEXT,
  phone TEXT,
  phone_numbers JSONB DEFAULT '[]',
  email TEXT,
  photo_url TEXT,
  languages JSONB DEFAULT '[]',
  user_image_url TEXT,
  roles JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  is_trakheesi_verified BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  product_score NUMERIC,
  agent_rating NUMERIC,
  review_count INTEGER DEFAULT 0,
  specializations JSONB DEFAULT '[]',
  service_areas JSONB DEFAULT '[]',
  experience_since INTEGER,
  agency_external_id TEXT,
  raw_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create bayut_agencies table for agency intelligence
CREATE TABLE IF NOT EXISTS public.bayut_agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_l1 TEXT,
  slug TEXT,
  logo_url TEXT,
  phone TEXT,
  phone_numbers JSONB DEFAULT '[]',
  license_number TEXT,
  product_score NUMERIC,
  average_agent_score NUMERIC,
  review_score NUMERIC,
  total_reviews INTEGER DEFAULT 0,
  total_agents INTEGER DEFAULT 0,
  active_listings INTEGER DEFAULT 0,
  specializations JSONB DEFAULT '[]',
  service_areas JSONB DEFAULT '[]',
  is_verified BOOLEAN DEFAULT false,
  raw_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.bayut_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bayut_agencies ENABLE ROW LEVEL SECURITY;

-- RLS policies for bayut_agents
CREATE POLICY "Anyone can view bayut agents" ON public.bayut_agents
FOR SELECT USING (true);

CREATE POLICY "Admins can manage bayut agents" ON public.bayut_agents
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for bayut_agencies
CREATE POLICY "Anyone can view bayut agencies" ON public.bayut_agencies
FOR SELECT USING (true);

CREATE POLICY "Admins can manage bayut agencies" ON public.bayut_agencies
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Add indexes to new tables
CREATE INDEX IF NOT EXISTS idx_bayut_agents_agency ON public.bayut_agents (agency_external_id);
CREATE INDEX IF NOT EXISTS idx_bayut_agencies_license ON public.bayut_agencies (license_number);