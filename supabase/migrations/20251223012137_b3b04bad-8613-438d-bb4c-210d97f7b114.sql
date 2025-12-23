-- Clean up manual/dummy listings (keep only Bayut-synced properties)
DELETE FROM properties WHERE external_source IS NULL;

-- Fix existing properties with incorrect bedroom count based on title patterns
-- This handles cases like "6 master room" or "5 bedroom" in title but bedrooms = 0
UPDATE properties 
SET bedrooms = (
  SELECT 
    COALESCE(
      (regexp_match(title, '(\d+)\s*(?:bed|br|bedroom)', 'i'))[1]::int,
      (regexp_match(title, '(\d+)\s*master\s*room', 'i'))[1]::int,
      bedrooms
    )
)
WHERE bedrooms = 0 
  AND (
    title ~* '\d+\s*(?:bed|br|bedroom)' 
    OR title ~* '\d+\s*master\s*room'
  );

-- Fix property types that are incorrectly set to 'apartment' when title says 'villa'
UPDATE properties 
SET property_type = 'villa'
WHERE property_type = 'apartment' 
  AND title ILIKE '%villa%';

-- Fix property types for townhouses
UPDATE properties 
SET property_type = 'townhouse'
WHERE property_type = 'apartment' 
  AND title ILIKE '%townhouse%';

-- Fix property types for penthouses  
UPDATE properties 
SET property_type = 'penthouse'
WHERE property_type = 'apartment'
  AND title ILIKE '%penthouse%';

-- Add index for faster duplicate detection if not exists
CREATE INDEX IF NOT EXISTS idx_properties_title_area_beds 
ON properties (location_area, bedrooms, size_sqft);

-- Add index for external_id lookups
CREATE INDEX IF NOT EXISTS idx_properties_external_id 
ON properties (external_source, external_id);