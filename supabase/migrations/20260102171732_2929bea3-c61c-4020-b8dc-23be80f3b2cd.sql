-- Phase 1: Complete Bayut Sync System Rebuild
-- 1.1 Delete all non-Dubai properties (Al Helio, Ajman, etc.)
DELETE FROM properties 
WHERE location_area ILIKE '%helio%' 
   OR location_area ILIKE '%ajman%' 
   OR location_area ILIKE '%sharjah%'
   OR location_area ILIKE '%abu dhabi%'
   OR location_area ILIKE '%ras al%'
   OR location_area ILIKE '%fujairah%'
   OR location_area ILIKE '%umm al%';

-- 1.2 Add completion_status column for Ready vs Off-Plan filtering
ALTER TABLE properties ADD COLUMN IF NOT EXISTS completion_status text DEFAULT 'ready';

-- 1.3 Add estimated_completion_date for off-plan properties
ALTER TABLE properties ADD COLUMN IF NOT EXISTS estimated_completion_date date;

-- 1.4 Add days_on_market for property freshness
ALTER TABLE properties ADD COLUMN IF NOT EXISTS days_on_market integer;

-- 1.5 Add sync_error for tracking individual property sync failures
ALTER TABLE properties ADD COLUMN IF NOT EXISTS sync_error text;

-- 1.6 Create sync_alerts table for admin notifications
CREATE TABLE IF NOT EXISTS sync_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type text NOT NULL, -- 'sync_failed', 'no_new_properties', 'api_error', 'non_dubai_detected'
  severity text NOT NULL DEFAULT 'warning', -- 'info', 'warning', 'error', 'critical'
  message text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  acknowledged boolean DEFAULT false,
  acknowledged_at timestamptz,
  acknowledged_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on sync_alerts
ALTER TABLE sync_alerts ENABLE ROW LEVEL SECURITY;

-- Only admins can manage sync alerts
CREATE POLICY "Admins can manage sync alerts" ON sync_alerts
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- 1.7 Create optimized indexes for completion_status filtering
CREATE INDEX IF NOT EXISTS idx_properties_completion_status ON properties(status, completion_status);
CREATE INDEX IF NOT EXISTS idx_properties_ready ON properties(status, created_at DESC) WHERE completion_status = 'ready';
CREATE INDEX IF NOT EXISTS idx_properties_offplan ON properties(status, created_at DESC) WHERE completion_status = 'off_plan';

-- 1.8 Update existing properties' completion_status based on is_off_plan
UPDATE properties SET completion_status = CASE 
  WHEN is_off_plan = true THEN 'off_plan' 
  ELSE 'ready' 
END WHERE completion_status IS NULL OR completion_status = 'ready';

-- 1.9 Add function to calculate days_on_market
CREATE OR REPLACE FUNCTION update_days_on_market()
RETURNS trigger AS $$
BEGIN
  NEW.days_on_market := EXTRACT(DAY FROM (now() - NEW.created_at));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1.10 Create trigger to auto-update days_on_market
DROP TRIGGER IF EXISTS update_days_on_market_trigger ON properties;
CREATE TRIGGER update_days_on_market_trigger
  BEFORE INSERT OR UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_days_on_market();