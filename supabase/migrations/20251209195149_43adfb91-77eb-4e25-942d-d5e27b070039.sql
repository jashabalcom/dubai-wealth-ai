
-- =============================================
-- PHASE 1: CORE SCHEMA & AGENTS
-- =============================================

-- Create agents table for real estate agents
CREATE TABLE public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  whatsapp TEXT,
  rera_brn TEXT, -- RERA Broker Registration Number
  languages TEXT[] DEFAULT '{}',
  specializations TEXT[] DEFAULT '{}', -- e.g., ['off-plan', 'luxury', 'commercial']
  areas_covered TEXT[] DEFAULT '{}', -- e.g., ['Dubai Marina', 'Downtown']
  bio TEXT,
  avatar_url TEXT,
  years_experience INTEGER DEFAULT 0,
  total_listings INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create brokerages table for real estate companies
CREATE TABLE public.brokerages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  rera_orn TEXT, -- RERA Office Registration Number
  logo_url TEXT,
  cover_image_url TEXT,
  description TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  address TEXT,
  city TEXT DEFAULT 'Dubai',
  total_agents INTEGER DEFAULT 0,
  total_listings INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add brokerage_id to agents
ALTER TABLE public.agents ADD COLUMN brokerage_id UUID REFERENCES public.brokerages(id) ON DELETE SET NULL;

-- Create property_images table (replaces JSONB array)
CREATE TABLE public.property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  storage_path TEXT,
  category TEXT DEFAULT 'interior', -- exterior, interior, bathroom, kitchen, bedroom, view, amenity
  caption TEXT,
  order_index INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create property_floor_plans table
CREATE TABLE public.property_floor_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  storage_path TEXT,
  title TEXT,
  floor_number INTEGER,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- PHASE 2: LOCATION HIERARCHY
-- =============================================

-- Create developers table
CREATE TABLE public.developers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  cover_image_url TEXT,
  description TEXT,
  website TEXT,
  established_year INTEGER,
  headquarters TEXT,
  total_projects INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create areas table (high-level regions)
CREATE TABLE public.areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  country TEXT DEFAULT 'UAE',
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create communities table (neighborhoods within areas)
CREATE TABLE public.communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area_id UUID REFERENCES public.areas(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  avg_price_per_sqft NUMERIC,
  avg_rental_yield NUMERIC,
  total_properties INTEGER DEFAULT 0,
  walkability_score INTEGER,
  transit_score INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create buildings table
CREATE TABLE public.buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES public.communities(id) ON DELETE SET NULL,
  developer_id UUID REFERENCES public.developers(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  address TEXT,
  description TEXT,
  image_url TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  year_built INTEGER,
  total_floors INTEGER,
  total_units INTEGER,
  parking_floors INTEGER,
  service_charge_per_sqft NUMERIC,
  has_district_cooling BOOLEAN DEFAULT false,
  amenities JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- PHASE 3: EXTEND PROPERTIES TABLE
-- =============================================

-- Add new columns to properties table
ALTER TABLE public.properties 
  ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS brokerage_id UUID REFERENCES public.brokerages(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS building_id UUID REFERENCES public.buildings(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS community_id UUID REFERENCES public.communities(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS developer_id UUID REFERENCES public.developers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS listing_type TEXT DEFAULT 'sale', -- sale, rent
  ADD COLUMN IF NOT EXISTS rera_permit_number TEXT,
  ADD COLUMN IF NOT EXISTS rera_permit_expiry DATE,
  ADD COLUMN IF NOT EXISTS service_charge_per_sqft NUMERIC,
  ADD COLUMN IF NOT EXISTS furnishing TEXT DEFAULT 'unfurnished', -- unfurnished, furnished, semi-furnished
  ADD COLUMN IF NOT EXISTS view_type TEXT, -- sea, city, garden, pool, landmark
  ADD COLUMN IF NOT EXISTS floor_number INTEGER,
  ADD COLUMN IF NOT EXISTS total_floors INTEGER,
  ADD COLUMN IF NOT EXISTS year_built INTEGER,
  ADD COLUMN IF NOT EXISTS parking_spaces INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS virtual_tour_url TEXT,
  ADD COLUMN IF NOT EXISTS video_url TEXT,
  ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS inquiries_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rental_frequency TEXT DEFAULT 'yearly'; -- yearly, monthly, weekly, daily

-- =============================================
-- PHASE 4: FEATURES & ANALYTICS
-- =============================================

-- Create feature_definitions table (predefined amenities/features)
CREATE TABLE public.feature_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL, -- amenity, facility, nearby, safety
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create property_features junction table
CREATE TABLE public.property_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  feature_id UUID NOT NULL REFERENCES public.feature_definitions(id) ON DELETE CASCADE,
  UNIQUE(property_id, feature_id)
);

-- Create property_inquiries table (enhanced leads)
CREATE TABLE public.property_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  inquiry_type TEXT DEFAULT 'general', -- general, viewing, price, availability
  source TEXT DEFAULT 'website', -- website, app, referral
  status TEXT DEFAULT 'new', -- new, contacted, qualified, converted, closed
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create property_views table (analytics)
CREATE TABLE public.property_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  source TEXT, -- direct, search, listing, referral
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_agents_brokerage ON public.agents(brokerage_id);
CREATE INDEX idx_agents_user ON public.agents(user_id);
CREATE INDEX idx_property_images_property ON public.property_images(property_id);
CREATE INDEX idx_property_floor_plans_property ON public.property_floor_plans(property_id);
CREATE INDEX idx_buildings_community ON public.buildings(community_id);
CREATE INDEX idx_buildings_developer ON public.buildings(developer_id);
CREATE INDEX idx_communities_area ON public.communities(area_id);
CREATE INDEX idx_properties_agent ON public.properties(agent_id);
CREATE INDEX idx_properties_building ON public.properties(building_id);
CREATE INDEX idx_properties_community ON public.properties(community_id);
CREATE INDEX idx_properties_listing_type ON public.properties(listing_type);
CREATE INDEX idx_property_inquiries_property ON public.property_inquiries(property_id);
CREATE INDEX idx_property_inquiries_agent ON public.property_inquiries(agent_id);
CREATE INDEX idx_property_views_property ON public.property_views(property_id);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Agents RLS
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active agents"
  ON public.agents FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage agents"
  ON public.agents FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update their own agent profile"
  ON public.agents FOR UPDATE
  USING (auth.uid() = user_id);

-- Brokerages RLS
ALTER TABLE public.brokerages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active brokerages"
  ON public.brokerages FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage brokerages"
  ON public.brokerages FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Developers RLS
ALTER TABLE public.developers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active developers"
  ON public.developers FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage developers"
  ON public.developers FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Areas RLS
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view areas"
  ON public.areas FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage areas"
  ON public.areas FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Communities RLS
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view communities"
  ON public.communities FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage communities"
  ON public.communities FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Buildings RLS
ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view buildings"
  ON public.buildings FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage buildings"
  ON public.buildings FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Property Images RLS
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view property images"
  ON public.property_images FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage property images"
  ON public.property_images FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Property Floor Plans RLS
ALTER TABLE public.property_floor_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view floor plans"
  ON public.property_floor_plans FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage floor plans"
  ON public.property_floor_plans FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Feature Definitions RLS
ALTER TABLE public.feature_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view features"
  ON public.feature_definitions FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage features"
  ON public.feature_definitions FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Property Features RLS
ALTER TABLE public.property_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view property features"
  ON public.property_features FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage property features"
  ON public.property_features FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Property Inquiries RLS
ALTER TABLE public.property_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create inquiries"
  ON public.property_inquiries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own inquiries"
  ON public.property_inquiries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Agents can view inquiries for their properties"
  ON public.property_inquiries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = property_inquiries.property_id
      AND p.agent_id IN (
        SELECT id FROM public.agents WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins can manage all inquiries"
  ON public.property_inquiries FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Property Views RLS
ALTER TABLE public.property_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create views"
  ON public.property_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all property views"
  ON public.property_views FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- =============================================
-- STORAGE BUCKET FOR PROPERTY MEDIA
-- =============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('property-media', 'property-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for property-media bucket
CREATE POLICY "Anyone can view property media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-media');

CREATE POLICY "Admins can upload property media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'property-media' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update property media"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'property-media' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete property media"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'property-media' AND has_role(auth.uid(), 'admin'));

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================

CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON public.agents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_brokerages_updated_at
  BEFORE UPDATE ON public.brokerages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_developers_updated_at
  BEFORE UPDATE ON public.developers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_communities_updated_at
  BEFORE UPDATE ON public.communities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_buildings_updated_at
  BEFORE UPDATE ON public.buildings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_property_inquiries_updated_at
  BEFORE UPDATE ON public.property_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- SEED DATA: FEATURE DEFINITIONS
-- =============================================

INSERT INTO public.feature_definitions (name, slug, category, icon) VALUES
-- Amenities
('Swimming Pool', 'swimming-pool', 'amenity', 'waves'),
('Gym', 'gym', 'amenity', 'dumbbell'),
('Spa', 'spa', 'amenity', 'sparkles'),
('Sauna', 'sauna', 'amenity', 'thermometer'),
('Jacuzzi', 'jacuzzi', 'amenity', 'bath'),
('Kids Play Area', 'kids-play-area', 'amenity', 'baby'),
('BBQ Area', 'bbq-area', 'amenity', 'flame'),
('Rooftop Terrace', 'rooftop-terrace', 'amenity', 'building'),
('Garden', 'garden', 'amenity', 'tree-pine'),
('Beach Access', 'beach-access', 'amenity', 'sun'),
-- Facilities
('Concierge', 'concierge', 'facility', 'bell'),
('Valet Parking', 'valet-parking', 'facility', 'car'),
('Covered Parking', 'covered-parking', 'facility', 'car'),
('Storage Room', 'storage-room', 'facility', 'box'),
('Maid Room', 'maid-room', 'facility', 'door-open'),
('Study Room', 'study-room', 'facility', 'book-open'),
('Balcony', 'balcony', 'facility', 'layout'),
('Private Pool', 'private-pool', 'facility', 'waves'),
('Private Garden', 'private-garden', 'facility', 'tree-pine'),
('Built-in Wardrobes', 'built-in-wardrobes', 'facility', 'archive'),
('Central AC', 'central-ac', 'facility', 'wind'),
('District Cooling', 'district-cooling', 'facility', 'snowflake'),
-- Nearby
('Metro Station', 'metro-station', 'nearby', 'train'),
('Shopping Mall', 'shopping-mall', 'nearby', 'shopping-bag'),
('Schools', 'schools', 'nearby', 'graduation-cap'),
('Hospital', 'hospital', 'nearby', 'heart-pulse'),
('Supermarket', 'supermarket', 'nearby', 'shopping-cart'),
('Mosque', 'mosque', 'nearby', 'building'),
('Beach', 'beach', 'nearby', 'umbrella'),
('Golf Course', 'golf-course', 'nearby', 'flag'),
-- Safety
('24/7 Security', '24-7-security', 'safety', 'shield'),
('CCTV', 'cctv', 'safety', 'video'),
('Intercom', 'intercom', 'safety', 'phone'),
('Fire Alarm', 'fire-alarm', 'safety', 'alarm-check'),
('Smoke Detector', 'smoke-detector', 'safety', 'cloud');

-- =============================================
-- SEED DATA: DUBAI AREAS & COMMUNITIES
-- =============================================

INSERT INTO public.areas (name, slug, country, description) VALUES
('Dubai', 'dubai', 'UAE', 'The most populous city in the United Arab Emirates'),
('Abu Dhabi', 'abu-dhabi', 'UAE', 'The capital and second most populous city of the UAE');

-- Get Dubai area ID for communities
WITH dubai AS (SELECT id FROM public.areas WHERE slug = 'dubai')
INSERT INTO public.communities (area_id, name, slug, description, avg_price_per_sqft, avg_rental_yield) VALUES
((SELECT id FROM dubai), 'Dubai Marina', 'dubai-marina', 'Waterfront living with stunning views of the marina and Arabian Gulf', 1800, 6.5),
((SELECT id FROM dubai), 'Downtown Dubai', 'downtown-dubai', 'Home to Burj Khalifa and Dubai Mall, the heart of modern Dubai', 2200, 5.8),
((SELECT id FROM dubai), 'Palm Jumeirah', 'palm-jumeirah', 'Iconic man-made island with luxury beachfront properties', 2800, 5.2),
((SELECT id FROM dubai), 'Jumeirah Village Circle', 'jvc', 'Family-friendly community with affordable options', 900, 7.2),
((SELECT id FROM dubai), 'Business Bay', 'business-bay', 'Commercial and residential hub along Dubai Canal', 1600, 6.8),
((SELECT id FROM dubai), 'Dubai Hills Estate', 'dubai-hills-estate', 'Master-planned community with golf course and parks', 1400, 5.5),
((SELECT id FROM dubai), 'Arabian Ranches', 'arabian-ranches', 'Premium villa community with golf course', 1200, 4.8),
((SELECT id FROM dubai), 'DIFC', 'difc', 'Dubai International Financial Centre with premium offices and residences', 2400, 5.0),
((SELECT id FROM dubai), 'Jumeirah Beach Residence', 'jbr', 'Beachfront living with The Walk promenade', 1900, 6.2),
((SELECT id FROM dubai), 'Emirates Hills', 'emirates-hills', 'Ultra-luxury villa community known as Beverly Hills of Dubai', 3500, 3.5),
((SELECT id FROM dubai), 'Bluewaters Island', 'bluewaters-island', 'Exclusive island community home to Ain Dubai', 2600, 5.0),
((SELECT id FROM dubai), 'City Walk', 'city-walk', 'Urban lifestyle destination with contemporary residences', 2100, 5.5),
((SELECT id FROM dubai), 'Meydan', 'meydan', 'Home to Meydan Racecourse with luxury developments', 1300, 6.0),
((SELECT id FROM dubai), 'Dubai Creek Harbour', 'dubai-creek-harbour', 'Waterfront development with Dubai Creek Tower', 1500, 6.5),
((SELECT id FROM dubai), 'Mohammed Bin Rashid City', 'mbr-city', 'Mega development with District One villas and lagoons', 1800, 5.0);

-- =============================================
-- SEED DATA: MAJOR DEVELOPERS
-- =============================================

INSERT INTO public.developers (name, slug, description, website, established_year, headquarters) VALUES
('Emaar Properties', 'emaar', 'Leading global property developer behind Burj Khalifa and Dubai Mall', 'https://www.emaar.com', 1997, 'Dubai, UAE'),
('DAMAC Properties', 'damac', 'Luxury real estate developer known for branded residences', 'https://www.damacproperties.com', 2002, 'Dubai, UAE'),
('Nakheel', 'nakheel', 'Developer of Palm Jumeirah and The World islands', 'https://www.nakheel.com', 2000, 'Dubai, UAE'),
('Meraas', 'meraas', 'Developer of Bluewaters Island, City Walk, and La Mer', 'https://www.meraas.com', 2007, 'Dubai, UAE'),
('Dubai Properties', 'dubai-properties', 'Master developer of Business Bay and JBR', 'https://www.dp.ae', 2002, 'Dubai, UAE'),
('Sobha Realty', 'sobha', 'Known for quality craftsmanship and Sobha Hartland', 'https://www.sobharealty.com', 1976, 'Dubai, UAE'),
('Azizi Developments', 'azizi', 'Fast-growing developer with projects across Dubai', 'https://www.azizidevelopments.com', 2007, 'Dubai, UAE'),
('Omniyat', 'omniyat', 'Boutique luxury developer known for iconic designs', 'https://www.omniyat.com', 2005, 'Dubai, UAE'),
('Select Group', 'select-group', 'Developer of Marina Gate and Peninsula projects', 'https://www.select-group.ae', 2002, 'Dubai, UAE'),
('Binghatti Developers', 'binghatti', 'Known for distinctive architectural designs', 'https://www.binghatti.com', 2008, 'Dubai, UAE');
