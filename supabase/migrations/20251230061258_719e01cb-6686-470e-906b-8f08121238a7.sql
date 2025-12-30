-- Create calendar_events table for market events (admin-managed)
CREATE TABLE public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('launch', 'handover', 'conference', 'report', 'regulatory', 'economic')),
  event_date DATE NOT NULL,
  end_date DATE,
  developer_id UUID REFERENCES public.developers(id) ON DELETE SET NULL,
  location_area TEXT,
  project_name TEXT,
  importance TEXT DEFAULT 'normal' CHECK (importance IN ('high', 'normal', 'low')),
  external_url TEXT,
  image_url TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_property_events table for personal reminders
CREATE TABLE public.user_property_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  portfolio_property_id UUID REFERENCES public.portfolio_properties(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  notes TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('service_charge', 'rental_renewal', 'mortgage_payment', 'inspection', 'visa_renewal', 'custom')),
  event_date DATE NOT NULL,
  reminder_days_before INTEGER DEFAULT 7,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_interval TEXT CHECK (recurrence_interval IN ('monthly', 'quarterly', 'yearly')),
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_calendar_events_date ON public.calendar_events(event_date);
CREATE INDEX idx_calendar_events_type ON public.calendar_events(event_type);
CREATE INDEX idx_calendar_events_developer ON public.calendar_events(developer_id);
CREATE INDEX idx_user_property_events_user ON public.user_property_events(user_id);
CREATE INDEX idx_user_property_events_date ON public.user_property_events(event_date);

-- Enable RLS
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_property_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for calendar_events (public read, admin write)
CREATE POLICY "Anyone can view published calendar events"
  ON public.calendar_events FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can manage calendar events"
  ON public.calendar_events FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for user_property_events (user owns their events)
CREATE POLICY "Users can view their own property events"
  ON public.user_property_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own property events"
  ON public.user_property_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own property events"
  ON public.user_property_events FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own property events"
  ON public.user_property_events FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_calendar_events_updated_at
  BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_property_events_updated_at
  BEFORE UPDATE ON public.user_property_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed data: Industry Conferences 2026
INSERT INTO public.calendar_events (title, description, event_type, event_date, end_date, location_area, importance, external_url, is_published) VALUES
('RISE Summit 2026', 'Premier real estate investment summit bringing together industry leaders, developers, and investors to discuss Dubai market trends and opportunities.', 'conference', '2026-01-13', '2026-01-15', 'Dubai World Trade Centre', 'high', 'https://risesummit.ae', true),
('International Property Show 2026', 'One of the largest property exhibitions in the Middle East showcasing residential and commercial properties from leading developers.', 'conference', '2026-04-13', '2026-04-15', 'Dubai World Trade Centre', 'high', 'https://internationalpropertyshow.ae', true),
('Cityscape Global 2026', 'The flagship real estate event for the MENA region featuring property launches, investment opportunities, and market insights.', 'conference', '2026-11-09', '2026-11-12', 'Dubai World Trade Centre', 'high', 'https://cityscape-global.com', true),
('Dubai Real Estate Forum 2026', 'Annual forum discussing regulatory updates, market performance, and future outlook for Dubai real estate.', 'conference', '2026-03-18', '2026-03-19', 'Madinat Jumeirah', 'normal', NULL, true),
('PropTech Middle East 2026', 'Technology and innovation conference focused on digital transformation in real estate.', 'conference', '2026-05-20', '2026-05-21', 'Dubai Internet City', 'normal', NULL, true);

-- Seed data: Q1 2026 Handovers
INSERT INTO public.calendar_events (title, description, event_type, event_date, project_name, location_area, importance, is_published) VALUES
('Ramada Residences Handover', 'Wyndham-branded serviced residences with hotel amenities and guaranteed rental returns.', 'handover', '2026-01-15', 'Ramada Residences', 'Business Bay', 'normal', true),
('Sobha Crest Grande Completion', 'Premium luxury apartments with Sobha signature quality and finishes.', 'handover', '2026-01-20', 'Sobha Crest Grande', 'Sobha Hartland', 'high', true),
('Creek Vistas Heights Handover', 'Waterfront living with stunning views of Dubai Creek and downtown skyline.', 'handover', '2026-02-01', 'Creek Vistas Heights', 'Dubai Creek Harbour', 'normal', true),
('The Highbury by Sobha Ready', 'Contemporary tower with premium specifications and community amenities.', 'handover', '2026-02-15', 'The Highbury', 'Sobha Hartland', 'normal', true),
('Binghatti Ivory Completion', 'Architectural masterpiece with unique facade design and premium interiors.', 'handover', '2026-03-01', 'Binghatti Ivory', 'Al Jaddaf', 'normal', true),
('Ellington Ocean House Ready', 'Beachfront boutique residences with designer interiors and private beach access.', 'handover', '2026-03-15', 'Ellington Ocean House', 'Palm Jumeirah', 'high', true);

-- Seed data: Q2 2026 Handovers
INSERT INTO public.calendar_events (title, description, event_type, event_date, project_name, location_area, importance, is_published) VALUES
('Vayla Residences Handover', 'Smart living apartments with integrated technology and sustainable features.', 'handover', '2026-04-01', 'Vayla Residences', 'Dubai Marina', 'normal', true),
('Queen Sheba Tower Completion', 'Iconic tower with panoramic views and world-class facilities.', 'handover', '2026-04-15', 'Queen Sheba Tower', 'Downtown Dubai', 'normal', true),
('Dalmore Tower Ready', 'Premium residential tower with exceptional amenities and finishes.', 'handover', '2026-05-01', 'Dalmore Tower', 'JLT', 'normal', true),
('Carmel Residences Handover', 'Mediterranean-inspired living with lush landscapes and resort amenities.', 'handover', '2026-05-15', 'Carmel Residences', 'Motor City', 'normal', true),
('The Manor by Emaar Ready', 'Ultra-luxury residences with bespoke interiors and private services.', 'handover', '2026-06-01', 'The Manor', 'Downtown Dubai', 'high', true),
('Azizi Creek Views Completion', 'Contemporary waterfront apartments with direct creek access.', 'handover', '2026-06-15', 'Azizi Creek Views', 'Dubai Healthcare City', 'normal', true);

-- Seed data: Q3 2026 Handovers
INSERT INTO public.calendar_events (title, description, event_type, event_date, project_name, location_area, importance, is_published) VALUES
('Azizi Vista Handover', 'Modern urban living with stunning city views and premium amenities.', 'handover', '2026-07-01', 'Azizi Vista', 'Studio City', 'normal', true),
('Sobha Verde Completion', 'Green living concept with sustainable features and lush landscaping.', 'handover', '2026-07-15', 'Sobha Verde', 'JLT', 'normal', true),
('Ellington Belgrove Residences Ready', 'Boutique development with curated design and exclusive amenities.', 'handover', '2026-08-01', 'Belgrove Residences', 'MBR City', 'normal', true),
('Binghatti Luna Handover', 'Distinctive architecture with innovative living spaces.', 'handover', '2026-08-15', 'Binghatti Luna', 'JVC', 'normal', true),
('Nakheel Palm Beach Towers 3 Ready', 'Beachfront living on Palm Jumeirah with exclusive beach club access.', 'handover', '2026-09-01', 'Palm Beach Towers 3', 'Palm Jumeirah', 'high', true);

-- Seed data: Q4 2026 Handovers
INSERT INTO public.calendar_events (title, description, event_type, event_date, project_name, location_area, importance, is_published) VALUES
('DAMAC Safa One Completion', 'Twin tower development with de Grisogono designed interiors and sky bridge.', 'handover', '2026-10-01', 'DAMAC Safa One', 'Safa Park', 'high', true),
('Azizi Aura 2 Handover', 'Second phase of successful Aura development with enhanced amenities.', 'handover', '2026-10-15', 'Azizi Aura 2', 'Dubai Studio City', 'normal', true),
('Binghatti Hillcrest Ready', 'Hillside living with terraced gardens and panoramic views.', 'handover', '2026-11-01', 'Binghatti Hillcrest', 'Dubai Hills', 'normal', true),
('Emaar Grande at The Opera District', 'Flagship luxury development overlooking Dubai Opera and Burj Khalifa.', 'handover', '2026-11-15', 'Grande', 'Downtown Dubai', 'high', true),
('Meraas Port de La Mer Phase 3 Completion', 'Mediterranean-style waterfront community with yacht club and marina.', 'handover', '2026-12-01', 'Port de La Mer Phase 3', 'La Mer', 'high', true);

-- Seed data: Major Project Launches 2026
INSERT INTO public.calendar_events (title, description, event_type, event_date, project_name, location_area, importance, is_published) VALUES
('Palm Jebel Ali Phase 2 Launch', 'Nakheel unveils next phase of the iconic Palm Jebel Ali development with exclusive beachfront plots and villas.', 'launch', '2026-02-20', 'Palm Jebel Ali Phase 2', 'Palm Jebel Ali', 'high', true),
('Dubai Mansions by Emaar Launch', 'AED 100 billion mega-project featuring ultra-luxury mansions in a gated community.', 'launch', '2026-03-05', 'Dubai Mansions', 'Dubai South', 'high', true),
('DAMAC Islands Phase 2 Reveal', 'Expansion of the islands concept with new waterfront villas and townhouses.', 'launch', '2026-04-10', 'DAMAC Islands Phase 2', 'DAMAC Islands', 'high', true),
('The Acres Final Phase by Meraas', 'Last phase of The Acres community with premium villas and exclusive amenities.', 'launch', '2026-05-25', 'The Acres Final Phase', 'Dubailand', 'normal', true),
('Emaar Beachfront Tower Collection', 'New tower collection in the exclusive Emaar Beachfront community.', 'launch', '2026-06-08', 'Beachfront Tower Collection', 'Emaar Beachfront', 'normal', true),
('Sobha Reserve Phase 2 Launch', 'Expansion of the ultra-luxury Sobha Reserve community with new villa plots.', 'launch', '2026-09-15', 'Sobha Reserve Phase 2', 'Wadi Al Safa', 'high', true);

-- Seed data: DLD Reports & Regulatory Events
INSERT INTO public.calendar_events (title, description, event_type, event_date, location_area, importance, is_published) VALUES
('DLD Q4 2025 Market Report', 'Dubai Land Department releases comprehensive Q4 2025 transaction data and market analysis.', 'report', '2026-01-20', 'Dubai', 'normal', true),
('RERA Annual Industry Report 2025', 'Real Estate Regulatory Agency publishes annual industry performance and compliance report.', 'report', '2026-02-28', 'Dubai', 'normal', true),
('DLD Q1 2026 Market Report', 'First quarter 2026 transaction data and market trends analysis.', 'report', '2026-04-20', 'Dubai', 'normal', true),
('DLD Half-Year 2026 Report', 'Comprehensive mid-year analysis of Dubai real estate market performance.', 'report', '2026-07-20', 'Dubai', 'high', true),
('DLD Q3 2026 Market Report', 'Third quarter transaction data and market insights.', 'report', '2026-10-20', 'Dubai', 'normal', true),
('Dubai Economic Outlook 2027', 'Government releases economic forecast impacting real estate sector.', 'economic', '2026-12-15', 'Dubai', 'high', true);