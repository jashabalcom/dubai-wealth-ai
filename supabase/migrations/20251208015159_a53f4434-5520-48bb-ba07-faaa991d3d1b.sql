-- Create properties table
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  location_area TEXT NOT NULL,
  property_type TEXT NOT NULL DEFAULT 'apartment',
  developer_name TEXT,
  is_off_plan BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'available',
  price_aed NUMERIC NOT NULL,
  bedrooms INTEGER NOT NULL DEFAULT 1,
  bathrooms INTEGER NOT NULL DEFAULT 1,
  size_sqft NUMERIC NOT NULL,
  rental_yield_estimate NUMERIC,
  images JSONB DEFAULT '[]'::jsonb,
  completion_date DATE,
  payment_plan_json JSONB,
  description TEXT,
  amenities JSONB DEFAULT '[]'::jsonb,
  highlights JSONB DEFAULT '[]'::jsonb,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Everyone can view properties
CREATE POLICY "Anyone can view properties"
ON public.properties FOR SELECT
USING (true);

-- Admins can manage properties
CREATE POLICY "Admins can manage properties"
ON public.properties FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create indexes
CREATE INDEX idx_properties_slug ON public.properties(slug);
CREATE INDEX idx_properties_location ON public.properties(location_area);
CREATE INDEX idx_properties_type ON public.properties(property_type);
CREATE INDEX idx_properties_price ON public.properties(price_aed);
CREATE INDEX idx_properties_bedrooms ON public.properties(bedrooms);

-- Trigger for updated_at
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert demo properties
INSERT INTO public.properties (title, slug, location_area, property_type, developer_name, is_off_plan, status, price_aed, bedrooms, bathrooms, size_sqft, rental_yield_estimate, images, completion_date, payment_plan_json, description, amenities, highlights, is_featured) VALUES
-- Dubai Marina
('Marina Gate Tower 2 - 2BR', 'marina-gate-tower-2-2br', 'Dubai Marina', 'apartment', 'Select Group', false, 'available', 2850000, 2, 3, 1450, 7.2, '["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"]', null, null, 'Stunning 2-bedroom apartment in Marina Gate Tower 2 with panoramic marina views. Premium finishes throughout, fully fitted kitchen, and access to world-class amenities.', '["Swimming Pool", "Gym", "Concierge", "Covered Parking", "Kids Play Area"]', '["Full Marina View", "High Floor", "Vacant on Transfer", "Premium Finishes"]', true),

('Damac Heights Studio', 'damac-heights-studio', 'Dubai Marina', 'apartment', 'DAMAC Properties', false, 'available', 950000, 0, 1, 550, 8.1, '["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"]', null, null, 'Fully furnished studio in Damac Heights with stunning sea views. Perfect for investors seeking high rental yields.', '["Swimming Pool", "Gym", "Sauna", "Covered Parking"]', '["Sea View", "Fully Furnished", "High ROI"]', false),

('Marina Pinnacle 3BR', 'marina-pinnacle-3br', 'Dubai Marina', 'apartment', 'Pinnacle Developments', false, 'available', 4200000, 3, 4, 2100, 6.8, '["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800", "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800"]', null, null, 'Luxurious 3-bedroom apartment with upgraded finishes and spectacular views of the marina and sea.', '["Swimming Pool", "Gym", "Tennis Court", "Concierge", "Beach Access"]', '["Upgraded", "Corner Unit", "Marina + Sea View"]', true),

-- Downtown Dubai
('Burj Vista Tower 1 - 2BR', 'burj-vista-tower-1-2br', 'Downtown Dubai', 'apartment', 'Emaar Properties', false, 'available', 3500000, 2, 3, 1380, 6.5, '["https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800"]', null, null, 'Elegant 2-bedroom apartment with direct Burj Khalifa views. Prime location in the heart of Downtown Dubai.', '["Swimming Pool", "Gym", "Concierge", "Valet Parking", "Kids Club"]', '["Burj Khalifa View", "Walking Distance to Dubai Mall", "Premium Address"]', true),

('Address Residences Sky View 1BR', 'address-sky-view-1br', 'Downtown Dubai', 'apartment', 'Emaar Properties', false, 'available', 2400000, 1, 2, 920, 7.0, '["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"]', null, null, 'Iconic 1-bedroom residence in Address Sky View with hotel amenities and stunning city views.', '["Hotel Services", "Swimming Pool", "Spa", "Fine Dining", "Concierge"]', '["Hotel Amenities", "Burj Khalifa View", "High-end Finishes"]', false),

('Boulevard Point 3BR', 'boulevard-point-3br', 'Downtown Dubai', 'apartment', 'Emaar Properties', false, 'available', 5800000, 3, 4, 2400, 6.2, '["https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800"]', null, null, 'Spacious 3-bedroom apartment overlooking the Dubai Fountain and Burj Khalifa. Premium Downtown living.', '["Swimming Pool", "Gym", "Kids Pool", "BBQ Area", "Covered Parking"]', '["Fountain View", "Large Terrace", "Corner Unit"]', false),

-- Palm Jumeirah
('Atlantis The Royal Residences', 'atlantis-royal-residences-2br', 'Palm Jumeirah', 'apartment', 'Kerzner International', false, 'available', 12000000, 2, 3, 2200, 5.5, '["https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800"]', null, null, 'Ultra-luxury residence in the iconic Atlantis The Royal. Unparalleled amenities and service.', '["Private Beach", "Infinity Pool", "Spa", "Fine Dining", "Butler Service"]', '["Ultra Luxury", "Hotel Services", "Iconic Location"]', true),

('Shoreline Apartments 2BR', 'shoreline-2br', 'Palm Jumeirah', 'apartment', 'Nakheel', false, 'available', 2800000, 2, 2, 1650, 6.8, '["https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800"]', null, null, 'Beachfront 2-bedroom apartment in Shoreline with private beach access and stunning sea views.', '["Private Beach", "Swimming Pool", "Gym", "Tennis Court", "Retail"]', '["Beachfront", "Sea View", "Ground Floor"]', false),

('Signature Villas Frond G', 'signature-villa-frond-g', 'Palm Jumeirah', 'villa', 'Nakheel', false, 'available', 35000000, 6, 7, 12000, 4.2, '["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"]', null, null, 'Exceptional 6-bedroom signature villa on the fronds of Palm Jumeirah with private beach and infinity pool.', '["Private Beach", "Private Pool", "Garden", "Staff Quarters", "Cinema Room"]', '["Signature Villa", "Private Beach", "Upgraded"]', true),

-- Business Bay
('Paramount Tower Hotel & Residences 1BR', 'paramount-tower-1br', 'Business Bay', 'apartment', 'DAMAC Properties', false, 'available', 1450000, 1, 2, 850, 7.8, '["https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800"]', null, null, 'Hollywood-inspired 1-bedroom apartment in Paramount Tower with canal views and hotel amenities.', '["Hotel Services", "Swimming Pool", "Gym", "Spa", "Screening Room"]', '["Canal View", "Hotel Amenities", "High Rental Yield"]', false),

('Executive Towers Lofts', 'executive-towers-lofts', 'Business Bay', 'apartment', 'Dubai Properties', false, 'available', 1100000, 1, 1, 1200, 7.5, '["https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800"]', null, null, 'Unique loft-style apartment with double-height ceilings and canal views in Executive Towers.', '["Swimming Pool", "Gym", "Retail", "Metro Access"]', '["Loft Style", "Double Height", "Canal View"]', false),

-- JVC
('Bloom Towers 2BR', 'bloom-towers-2br', 'JVC', 'apartment', 'Bloom Properties', false, 'available', 850000, 2, 2, 1100, 8.5, '["https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800"]', null, null, 'Modern 2-bedroom apartment in Bloom Towers JVC. Excellent value with high rental yields.', '["Swimming Pool", "Gym", "Kids Play Area", "Covered Parking"]', '["High Yield", "New Building", "Family Community"]', false),

('Binghatti Stars 1BR', 'binghatti-stars-1br', 'JVC', 'apartment', 'Binghatti Developers', false, 'available', 650000, 1, 1, 700, 8.8, '["https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800"]', null, null, 'Brand new 1-bedroom in Binghatti Stars with modern design and excellent rental potential.', '["Swimming Pool", "Gym", "Retail Podium"]', '["Brand New", "Modern Design", "High Yield"]', false),

-- Off-Plan Projects
('Emaar Beachfront - Beach Isle', 'emaar-beachfront-beach-isle-2br', 'Emaar Beachfront', 'apartment', 'Emaar Properties', true, 'available', 3200000, 2, 3, 1500, 6.5, '["https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800"]', '2026-06-30', '{"down_payment": 20, "during_construction": 50, "on_handover": 30, "post_handover": 0, "post_handover_years": 0}', 'Premium beachfront living at Emaar Beachfront. 2-bedroom apartment with beach access and Dubai Marina views.', '["Private Beach", "Swimming Pool", "Gym", "Retail", "Marina Access"]', '["Beachfront", "Off-Plan Discount", "60/40 Payment Plan"]', true),

('Dubai Creek Harbour - Creek Waters', 'creek-harbour-creek-waters-3br', 'Dubai Creek Harbour', 'apartment', 'Emaar Properties', true, 'available', 4500000, 3, 4, 2000, 6.0, '["https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800"]', '2027-03-31', '{"down_payment": 10, "during_construction": 60, "on_handover": 30, "post_handover": 0, "post_handover_years": 0}', 'Stunning 3-bedroom apartment in Creek Waters with views of Dubai Creek Tower and wildlife sanctuary.', '["Swimming Pool", "Gym", "Parks", "Retail", "Marina"]', '["Creek Tower View", "10% Down Payment", "Premium Location"]', true),

('Sobha Hartland 2 - 2BR', 'sobha-hartland-2-2br', 'MBR City', 'apartment', 'Sobha Realty', true, 'available', 2100000, 2, 3, 1350, 7.0, '["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"]', '2025-12-31', '{"down_payment": 20, "during_construction": 60, "on_handover": 20, "post_handover": 0, "post_handover_years": 0}', 'Luxury 2-bedroom in Sobha Hartland 2 with lush green views and premium Sobha quality finishes.', '["Swimming Pool", "Gym", "Tennis Court", "Jogging Track", "Parks"]', '["Premium Quality", "Green Community", "Near Downtown"]', false),

('Damac Lagoons - Malta', 'damac-lagoons-malta-4br', 'Damac Lagoons', 'townhouse', 'DAMAC Properties', true, 'available', 2400000, 4, 5, 2800, 6.5, '["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"]', '2026-09-30', '{"down_payment": 20, "during_construction": 50, "on_handover": 10, "post_handover": 20, "post_handover_years": 4}', 'Mediterranean-inspired 4-bedroom townhouse in Damac Lagoons with crystal lagoon access.', '["Crystal Lagoon", "Private Garden", "Community Pool", "Kids Areas", "Retail"]', '["Lagoon Living", "Post-Handover Payment", "Family Community"]', false),

('The Valley - Nara', 'the-valley-nara-3br', 'The Valley', 'townhouse', 'Emaar Properties', true, 'available', 1800000, 3, 4, 2200, 7.2, '["https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800"]', '2026-03-31', '{"down_payment": 10, "during_construction": 50, "on_handover": 40, "post_handover": 0, "post_handover_years": 0}', 'Contemporary 3-bedroom townhouse in The Valley by Emaar. Perfect blend of nature and modern living.', '["Swimming Pool", "Sports Courts", "Parks", "Retail", "School Nearby"]', '["Emaar Quality", "Nature Community", "10% Down Payment"]', true),

('Tilal Al Ghaf - Elan', 'tilal-al-ghaf-elan-4br', 'Tilal Al Ghaf', 'villa', 'Majid Al Futtaim', true, 'available', 5500000, 4, 5, 4500, 5.8, '["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"]', '2025-06-30', '{"down_payment": 10, "during_construction": 50, "on_handover": 40, "post_handover": 0, "post_handover_years": 0}', 'Premium 4-bedroom villa in Tilal Al Ghaf with lagoon views and private garden.', '["Crystal Lagoon", "Private Garden", "Community Pool", "Parks", "Retail"]', '["Lagoon Front", "Premium Community", "MAF Quality"]', true);