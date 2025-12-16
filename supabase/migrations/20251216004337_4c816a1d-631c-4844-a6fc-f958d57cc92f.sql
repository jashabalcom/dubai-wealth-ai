-- Add external property tracking columns
ALTER TABLE properties ADD COLUMN IF NOT EXISTS external_id text;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS external_source text; -- 'bayut', 'agent_upload', 'admin'
ALTER TABLE properties ADD COLUMN IF NOT EXISTS external_url text;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS last_synced_at timestamptz;

-- Index for efficient external property lookups
CREATE INDEX IF NOT EXISTS idx_properties_external ON properties(external_source, external_id);

-- Bayut sync logs table for tracking sync operations
CREATE TABLE IF NOT EXISTS bayut_sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type text NOT NULL, -- 'test', 'area', 'bulk'
  area_name text,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  properties_found integer DEFAULT 0,
  properties_synced integer DEFAULT 0,
  photos_synced integer DEFAULT 0,
  api_calls_used integer DEFAULT 0,
  errors jsonb DEFAULT '[]',
  status text DEFAULT 'running', -- 'running', 'completed', 'failed'
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE bayut_sync_logs ENABLE ROW LEVEL SECURITY;

-- Admin-only access to sync logs
CREATE POLICY "Admins can manage bayut sync logs"
  ON bayut_sync_logs
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));