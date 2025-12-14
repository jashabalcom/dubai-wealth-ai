
-- Create neighborhoods table with comprehensive data
CREATE TABLE public.neighborhoods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  overview TEXT,
  image_url TEXT,
  cover_image_url TEXT,
  
  -- Location
  latitude NUMERIC,
  longitude NUMERIC,
  area_id UUID REFERENCES public.areas(id),
  
  -- Investment metrics
  avg_price_sqft NUMERIC,
  avg_rental_yield NUMERIC,
  yoy_appreciation NUMERIC,
  avg_rent_studio NUMERIC,
  avg_rent_1br NUMERIC,
  avg_rent_2br NUMERIC,
  avg_rent_3br NUMERIC,
  
  -- Lifestyle data
  lifestyle_type TEXT DEFAULT 'mixed',
  walkability_score INTEGER,
  transit_score INTEGER,
  safety_score INTEGER,
  
  -- Rich content
  pros JSONB DEFAULT '[]'::jsonb,
  cons JSONB DEFAULT '[]'::jsonb,
  best_for JSONB DEFAULT '[]'::jsonb,
  
  -- Features/Eligibility
  is_freehold BOOLEAN DEFAULT true,
  golden_visa_eligible BOOLEAN DEFAULT true,
  has_metro_access BOOLEAN DEFAULT false,
  has_beach_access BOOLEAN DEFAULT false,
  has_mall_access BOOLEAN DEFAULT false,
  
  -- Meta
  population_estimate INTEGER,
  established_year INTEGER,
  developer_name TEXT,
  is_published BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create neighborhood_pois table for schools, restaurants, etc.
CREATE TABLE public.neighborhood_pois (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  neighborhood_id UUID NOT NULL REFERENCES public.neighborhoods(id) ON DELETE CASCADE,
  
  poi_type TEXT NOT NULL, -- 'school', 'restaurant', 'mall', 'gym', 'hospital', 'metro', 'beach', 'park'
  name TEXT NOT NULL,
  description TEXT,
  
  -- Location
  address TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  
  -- Ratings
  rating NUMERIC,
  review_count INTEGER,
  price_level TEXT, -- '$', '$$', '$$$', '$$$$'
  
  -- School-specific
  curriculum TEXT, -- 'IB', 'British', 'American', 'Indian', 'French', etc.
  grade_levels TEXT, -- 'KG-12', 'KG-6', etc.
  annual_fees_from NUMERIC,
  annual_fees_to NUMERIC,
  
  -- Restaurant-specific
  cuisine TEXT,
  is_delivery_available BOOLEAN DEFAULT false,
  
  -- General
  website_url TEXT,
  phone TEXT,
  image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create neighborhood_stats for time-series data
CREATE TABLE public.neighborhood_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  neighborhood_id UUID NOT NULL REFERENCES public.neighborhoods(id) ON DELETE CASCADE,
  stat_date DATE NOT NULL,
  
  avg_sale_price_sqft NUMERIC,
  avg_rent_price NUMERIC,
  transaction_count INTEGER,
  occupancy_rate NUMERIC,
  days_on_market INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(neighborhood_id, stat_date)
);

-- Enable RLS
ALTER TABLE public.neighborhoods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.neighborhood_pois ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.neighborhood_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for neighborhoods
CREATE POLICY "Anyone can view published neighborhoods" 
ON public.neighborhoods FOR SELECT 
USING (is_published = true);

CREATE POLICY "Admins can manage neighborhoods" 
ON public.neighborhoods FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for neighborhood_pois
CREATE POLICY "Anyone can view POIs" 
ON public.neighborhood_pois FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage POIs" 
ON public.neighborhood_pois FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for neighborhood_stats
CREATE POLICY "Anyone can view stats" 
ON public.neighborhood_stats FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage stats" 
ON public.neighborhood_stats FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes
CREATE INDEX idx_neighborhoods_slug ON public.neighborhoods(slug);
CREATE INDEX idx_neighborhoods_published ON public.neighborhoods(is_published);
CREATE INDEX idx_neighborhood_pois_neighborhood ON public.neighborhood_pois(neighborhood_id);
CREATE INDEX idx_neighborhood_pois_type ON public.neighborhood_pois(poi_type);
CREATE INDEX idx_neighborhood_stats_neighborhood ON public.neighborhood_stats(neighborhood_id);

-- Create trigger for updated_at
CREATE TRIGGER update_neighborhoods_updated_at
  BEFORE UPDATE ON public.neighborhoods
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_neighborhood_pois_updated_at
  BEFORE UPDATE ON public.neighborhood_pois
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial neighborhoods from the provided list
INSERT INTO public.neighborhoods (name, slug, is_published, lifestyle_type, is_freehold) VALUES
('Dubai Creek Harbour', 'dubai-creek-harbour', true, 'luxury', true),
('Arjan', 'arjan', true, 'affordable', true),
('Dubai Hills Estate', 'dubai-hills-estate', true, 'family', true),
('Umm Suqeim', 'umm-suqeim', true, 'luxury', true),
('Meydan City', 'meydan-city', true, 'luxury', true),
('Dubai Sports City', 'dubai-sports-city', true, 'affordable', true),
('Al Furjan', 'al-furjan', true, 'family', true),
('Jumeirah Lake Towers', 'jumeirah-lake-towers', true, 'urban', true),
('Dubai South', 'dubai-south', true, 'emerging', true),
('Dubai Harbour', 'dubai-harbour', true, 'luxury', true),
('Al Jaddaf', 'al-jaddaf', true, 'urban', true),
('Sobha Hartland', 'sobha-hartland', true, 'luxury', true),
('Jumeirah Beach Residence', 'jumeirah-beach-residence', true, 'luxury', true),
('Dubai Production City', 'dubai-production-city', true, 'affordable', true),
('Al Wasl', 'al-wasl', true, 'luxury', false),
('Remraam', 'remraam', true, 'affordable', true),
('The Greens', 'the-greens', true, 'family', true),
('Town Square', 'town-square', true, 'family', true),
('Jumeirah', 'jumeirah', true, 'luxury', false),
('Dubai Silicon Oasis', 'dubai-silicon-oasis', true, 'affordable', true),
('Jumeirah Village Triangle', 'jumeirah-village-triangle', true, 'affordable', true),
('The Views', 'the-views', true, 'family', true),
('Dubai Land Residence Complex', 'dubai-land-residence-complex', true, 'affordable', true),
('Mina Rashid', 'mina-rashid', true, 'luxury', true),
('Mirdif', 'mirdif', true, 'family', false),
('Mohammed Bin Rashid City', 'mohammed-bin-rashid-city', true, 'luxury', true),
('Discovery Gardens', 'discovery-gardens', true, 'affordable', true),
('Bluewaters Island', 'bluewaters-island', true, 'luxury', true),
('Arabian Ranches', 'arabian-ranches', true, 'family', true),
('DAMAC Hills 2', 'damac-hills-2', true, 'affordable', true),
('International City', 'international-city', true, 'affordable', true),
('DIFC', 'difc', true, 'urban', true),
('Majan', 'majan', true, 'affordable', true),
('Arabian Ranches 3', 'arabian-ranches-3', true, 'family', true),
('The Springs', 'the-springs', true, 'family', true),
('Jumeirah Golf Estates', 'jumeirah-golf-estates', true, 'luxury', true),
('Bur Dubai', 'bur-dubai', true, 'urban', false),
('The Meadows', 'the-meadows', true, 'family', true),
('Dubailand', 'dubailand', true, 'emerging', true),
('Dubai Studio City', 'dubai-studio-city', true, 'affordable', true),
('Al Barsha', 'al-barsha', true, 'family', false),
('Culture Village', 'culture-village', true, 'urban', true),
('The Lakes', 'the-lakes', true, 'family', true),
('Zaabeel', 'zaabeel', true, 'luxury', false),
('Dubai Maritime City', 'dubai-maritime-city', true, 'emerging', true),
('The Valley', 'the-valley', true, 'family', true),
('Dragon City', 'dragon-city', true, 'affordable', false),
('Dubai Islands', 'dubai-islands', true, 'luxury', true),
('Mudon', 'mudon', true, 'family', true),
('Sobha Hartland 2', 'sobha-hartland-2', true, 'luxury', true),
('Jebel Ali', 'jebel-ali', true, 'industrial', true),
('Dubai Science Park', 'dubai-science-park', true, 'urban', true),
('Sheikh Zayed Road', 'sheikh-zayed-road', true, 'urban', true),
('Motor City', 'motor-city', true, 'family', true),
('Al Quoz', 'al-quoz', true, 'urban', false),
('Dubai Festival City', 'dubai-festival-city', true, 'family', true),
('Reem', 'reem', true, 'affordable', true),
('Al Barari', 'al-barari', true, 'luxury', true),
('Al Safa', 'al-safa', true, 'luxury', false),
('DAMAC Lagoons', 'damac-lagoons', true, 'family', true),
('Expo City', 'expo-city', true, 'emerging', true),
('Barsha Heights', 'barsha-heights', true, 'urban', true),
('Living Legends', 'living-legends', true, 'family', true),
('Tilal Al Ghaf', 'tilal-al-ghaf', true, 'luxury', true),
('Arabian Ranches 2', 'arabian-ranches-2', true, 'family', true),
('Dubai Industrial City', 'dubai-industrial-city', true, 'industrial', true),
('Wasl Gate', 'wasl-gate', true, 'urban', true),
('Al Sufouh', 'al-sufouh', true, 'luxury', true),
('Dubai Investment Park', 'dubai-investment-park', true, 'affordable', true),
('Nad Al Sheba', 'nad-al-sheba', true, 'family', true),
('Al Satwa', 'al-satwa', true, 'urban', false),
('Dubai Media City', 'dubai-media-city', true, 'urban', true),
('Liwan', 'liwan', true, 'affordable', true),
('City of Arabia', 'city-of-arabia', true, 'emerging', true),
('Green Community', 'green-community', true, 'family', true),
('Jumeirah Islands', 'jumeirah-islands', true, 'luxury', true),
('The Hills', 'the-hills', true, 'luxury', true),
('Dubai Design District', 'dubai-design-district', true, 'urban', true),
('The Acres', 'the-acres', true, 'luxury', true),
('Serena', 'serena', true, 'family', true),
('Al Nahda', 'al-nahda', true, 'affordable', false),
('Al Garhoud', 'al-garhoud', true, 'urban', false),
('Jumeirah Park', 'jumeirah-park', true, 'family', true),
('Emirates Hills', 'emirates-hills', true, 'luxury', true),
('World Trade Centre', 'world-trade-centre', true, 'urban', true),
('Dubai Internet City', 'dubai-internet-city', true, 'urban', true),
('The World Islands', 'the-world-islands', true, 'luxury', true),
('The Oasis', 'the-oasis', true, 'luxury', true),
('Palm Jebel Ali', 'palm-jebel-ali', true, 'luxury', true),
('Pearl Jumeirah', 'pearl-jumeirah', true, 'luxury', true),
('Dubai Waterfront', 'dubai-waterfront', true, 'emerging', true),
('Ghaf Woods', 'ghaf-woods', true, 'family', true),
('The Villa', 'the-villa', true, 'family', true),
('Haven by Aldar', 'haven-by-aldar', true, 'luxury', true),
('Muhaisnah', 'muhaisnah', true, 'affordable', false),
('Jumeirah Heights', 'jumeirah-heights', true, 'family', true),
('Falcon City of Wonders', 'falcon-city-of-wonders', true, 'family', true),
('The Sustainable City', 'the-sustainable-city', true, 'family', true),
('Deira', 'deira', true, 'urban', false),
('Downtown Dubai', 'downtown-dubai', true, 'luxury', true),
('Dubai Marina', 'dubai-marina', true, 'luxury', true),
('Palm Jumeirah', 'palm-jumeirah', true, 'luxury', true),
('Business Bay', 'business-bay', true, 'urban', true),
('Jumeirah Village Circle', 'jumeirah-village-circle', true, 'affordable', true),
('City Walk', 'city-walk', true, 'luxury', true),
('DAMAC Hills', 'damac-hills', true, 'family', true);
