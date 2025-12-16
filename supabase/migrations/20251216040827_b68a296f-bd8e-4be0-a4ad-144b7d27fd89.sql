-- Drop the partial unique index (doesn't work with ON CONFLICT)
DROP INDEX IF EXISTS properties_external_source_external_id_uidx;

-- Create a proper UNIQUE CONSTRAINT that works with ON CONFLICT
-- First, we need to handle NULLs by setting a default for external_source where external_id exists
UPDATE public.properties 
SET external_source = 'unknown' 
WHERE external_id IS NOT NULL AND external_source IS NULL;

-- Add the actual unique constraint
ALTER TABLE public.properties 
ADD CONSTRAINT properties_external_source_external_id_unique 
UNIQUE (external_source, external_id);