-- Add POI sync tracking columns to neighborhood_pois
ALTER TABLE neighborhood_pois ADD COLUMN IF NOT EXISTS external_id TEXT;
ALTER TABLE neighborhood_pois ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';
ALTER TABLE neighborhood_pois ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ;
ALTER TABLE neighborhood_pois ADD COLUMN IF NOT EXISTS opening_hours JSONB;

-- Create unique index on external_id for upsert operations
CREATE UNIQUE INDEX IF NOT EXISTS idx_neighborhood_pois_external_id ON neighborhood_pois(external_id) WHERE external_id IS NOT NULL;