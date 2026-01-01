-- ===================================================
-- PHASE 1: AREA BENCHMARKS TABLE (Move from hardcoded)
-- ===================================================
CREATE TABLE public.area_benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area_name TEXT UNIQUE NOT NULL,
  avg_price_sqft NUMERIC NOT NULL,
  avg_yield NUMERIC NOT NULL,
  data_source TEXT NOT NULL DEFAULT 'DLD Transaction Data',
  source_url TEXT,
  data_as_of DATE NOT NULL DEFAULT CURRENT_DATE,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.area_benchmarks ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Area benchmarks are publicly readable"
ON public.area_benchmarks FOR SELECT
USING (true);

-- Admin write access (via has_role function)
CREATE POLICY "Admins can manage area benchmarks"
ON public.area_benchmarks FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Insert initial benchmark data
INSERT INTO public.area_benchmarks (area_name, avg_price_sqft, avg_yield, data_source, is_verified) VALUES
('Palm Jumeirah', 3200, 5.0, 'DLD Transaction Data', true),
('Emirates Hills', 3500, 3.5, 'DLD Transaction Data', true),
('Bluewaters Island', 2800, 5.2, 'DLD Transaction Data', true),
('Downtown Dubai', 2500, 5.5, 'DLD Transaction Data', true),
('DIFC', 2600, 5.3, 'DLD Transaction Data', true),
('Dubai Marina', 1800, 6.0, 'DLD Transaction Data', true),
('JBR', 2000, 5.8, 'DLD Transaction Data', true),
('City Walk', 2400, 5.4, 'DLD Transaction Data', true),
('Emaar Beachfront', 2200, 5.5, 'DLD Transaction Data', true),
('Dubai Creek Harbour', 1900, 5.8, 'DLD Transaction Data', true),
('Business Bay', 1600, 6.5, 'DLD Transaction Data', true),
('Dubai Hills', 1400, 5.5, 'DLD Transaction Data', true),
('Dubai Hills Estate', 1400, 5.5, 'DLD Transaction Data', true),
('MBR City', 1200, 6.0, 'DLD Transaction Data', true),
('Mohammed Bin Rashid City', 1200, 6.0, 'DLD Transaction Data', true),
('Sobha Hartland', 1500, 5.8, 'DLD Transaction Data', true),
('Meydan', 1300, 6.2, 'DLD Transaction Data', true),
('JLT', 1100, 7.0, 'DLD Transaction Data', true),
('Jumeirah Lake Towers', 1100, 7.0, 'DLD Transaction Data', true),
('The Greens', 1150, 6.8, 'DLD Transaction Data', true),
('The Views', 1200, 6.5, 'DLD Transaction Data', true),
('Jumeirah', 1600, 5.5, 'DLD Transaction Data', true),
('Umm Suqeim', 1500, 5.8, 'DLD Transaction Data', true),
('Al Barsha', 1000, 7.0, 'DLD Transaction Data', true),
('JVC', 900, 8.0, 'DLD Transaction Data', true),
('Jumeirah Village Circle', 900, 8.0, 'DLD Transaction Data', true),
('Damac Hills', 950, 7.5, 'DLD Transaction Data', true),
('Damac Hills 2', 700, 8.5, 'DLD Transaction Data', true),
('Damac Lagoons', 1000, 6.5, 'DLD Transaction Data', true),
('Al Furjan', 850, 7.8, 'DLD Transaction Data', true),
('Arabian Ranches', 1100, 5.5, 'DLD Transaction Data', true),
('Arabian Ranches 2', 950, 6.0, 'DLD Transaction Data', true),
('Arabian Ranches 3', 900, 6.2, 'DLD Transaction Data', true),
('Tilal Al Ghaf', 1100, 6.0, 'DLD Transaction Data', true),
('The Valley', 850, 7.0, 'DLD Transaction Data', true),
('Sports City', 750, 8.5, 'DLD Transaction Data', true),
('Dubai Sports City', 750, 8.5, 'DLD Transaction Data', true),
('Motor City', 800, 8.0, 'DLD Transaction Data', true),
('Silicon Oasis', 700, 9.0, 'DLD Transaction Data', true),
('Dubai Silicon Oasis', 700, 9.0, 'DLD Transaction Data', true),
('Town Square', 750, 8.2, 'DLD Transaction Data', true),
('Dubai South', 650, 8.5, 'DLD Transaction Data', true),
('Discovery Gardens', 550, 9.5, 'DLD Transaction Data', true),
('International City', 450, 10.0, 'DLD Transaction Data', true),
('Production City', 600, 9.0, 'DLD Transaction Data', true),
('Impz', 600, 9.0, 'DLD Transaction Data', true),
('Dubailand', 700, 8.0, 'DLD Transaction Data', true),
('Remraam', 650, 8.5, 'DLD Transaction Data', true),
('Liwan', 600, 9.0, 'DLD Transaction Data', true),
('Arjan', 800, 8.0, 'DLD Transaction Data', true),
('Al Barari', 1400, 4.5, 'DLD Transaction Data', true),
('Dubai Islands', 1800, 5.5, 'DLD Transaction Data', true),
('Ras Al Khaimah', 900, 7.5, 'DLD Transaction Data', true);

-- Create index for area_benchmarks
CREATE INDEX idx_area_benchmarks_name ON public.area_benchmarks(area_name);

-- ===================================================
-- PHASE 4: FEATURE FLAGS SYSTEM
-- ===================================================
CREATE TABLE public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  is_enabled BOOLEAN DEFAULT false,
  enabled_for_users UUID[] DEFAULT '{}',
  enabled_for_roles public.app_role[] DEFAULT '{}',
  percentage_rollout INTEGER DEFAULT 0 CHECK (percentage_rollout >= 0 AND percentage_rollout <= 100),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Public read access for feature flags
CREATE POLICY "Feature flags are publicly readable"
ON public.feature_flags FOR SELECT
USING (true);

-- Admin write access
CREATE POLICY "Admins can manage feature flags"
ON public.feature_flags FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Insert default feature flags
INSERT INTO public.feature_flags (name, description, is_enabled, percentage_rollout) VALUES
('new_checkout_flow', 'New streamlined checkout experience', false, 0),
('ai_property_analysis_v2', 'Enhanced AI property analysis with market comparison', false, 0),
('community_chat', 'Real-time community chat feature', true, 100),
('dark_mode', 'Dark mode theme support', true, 100),
('bloomberg_news_style', 'Bloomberg-style news article layout', true, 100),
('premium_analytics', 'Premium analytics dashboard for Elite members', true, 100);

-- ===================================================
-- PHASE 4: A/B TESTING INFRASTRUCTURE
-- ===================================================
CREATE TABLE public.ab_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  variants JSONB NOT NULL DEFAULT '[{"name": "control", "weight": 50}, {"name": "variant_a", "weight": 50}]',
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMPTZ DEFAULT now(),
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.ab_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID REFERENCES public.ab_experiments(id) ON DELETE CASCADE,
  user_id UUID,
  session_id TEXT,
  variant TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(experiment_id, user_id),
  UNIQUE(experiment_id, session_id)
);

CREATE TABLE public.ab_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID REFERENCES public.ab_experiments(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES public.ab_assignments(id) ON DELETE SET NULL,
  event_name TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ab_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_events ENABLE ROW LEVEL SECURITY;

-- Experiments are publicly readable
CREATE POLICY "Experiments are publicly readable"
ON public.ab_experiments FOR SELECT
USING (true);

-- Admins can manage experiments
CREATE POLICY "Admins can manage experiments"
ON public.ab_experiments FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Users can see their own assignments
CREATE POLICY "Users can view own assignments"
ON public.ab_assignments FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Anyone can create assignments (for anonymous tracking)
CREATE POLICY "Anyone can create assignments"
ON public.ab_assignments FOR INSERT
WITH CHECK (true);

-- Users can view their own events
CREATE POLICY "Users can view own events"
ON public.ab_events FOR SELECT
TO authenticated
USING (
  assignment_id IN (
    SELECT id FROM public.ab_assignments WHERE user_id = auth.uid()
  )
);

-- Anyone can create events
CREATE POLICY "Anyone can create events"
ON public.ab_events FOR INSERT
WITH CHECK (true);

-- Indexes for performance (not concurrent)
CREATE INDEX idx_ab_assignments_experiment ON public.ab_assignments(experiment_id);
CREATE INDEX idx_ab_assignments_user ON public.ab_assignments(user_id);
CREATE INDEX idx_ab_events_experiment ON public.ab_events(experiment_id);
CREATE INDEX idx_ab_events_created ON public.ab_events(created_at DESC);

-- Additional indexes for properties (not concurrent)
CREATE INDEX IF NOT EXISTS idx_properties_area_price ON public.properties(location_area, price_aed);
CREATE INDEX IF NOT EXISTS idx_properties_developer ON public.properties(developer_name);

-- ===================================================
-- ADD DATA SOURCE COLUMNS TO EXISTING TABLES
-- ===================================================
ALTER TABLE public.area_market_stats 
ADD COLUMN IF NOT EXISTS data_source TEXT DEFAULT 'DLD Transaction Data',
ADD COLUMN IF NOT EXISTS source_url TEXT;

-- ===================================================
-- UPDATE TIMESTAMP TRIGGERS
-- ===================================================
CREATE TRIGGER update_area_benchmarks_updated_at
BEFORE UPDATE ON public.area_benchmarks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_feature_flags_updated_at
BEFORE UPDATE ON public.feature_flags
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ab_experiments_updated_at
BEFORE UPDATE ON public.ab_experiments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();