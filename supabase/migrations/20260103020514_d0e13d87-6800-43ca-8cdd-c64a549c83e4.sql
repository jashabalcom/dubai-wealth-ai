-- Drop the existing partial unique index that doesn't work with ON CONFLICT
DROP INDEX IF EXISTS public.idx_neighborhood_pois_external_id;

-- Create a proper non-partial unique index on external_id
-- This allows ON CONFLICT (external_id) to work correctly
-- Note: NULL values are allowed and multiple NULLs are permitted in unique indexes
CREATE UNIQUE INDEX IF NOT EXISTS neighborhood_pois_external_id_uidx 
ON public.neighborhood_pois (external_id);