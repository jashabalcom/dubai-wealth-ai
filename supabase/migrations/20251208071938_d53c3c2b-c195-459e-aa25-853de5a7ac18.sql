-- Add latitude and longitude columns to properties table
ALTER TABLE public.properties 
  ADD COLUMN IF NOT EXISTS latitude NUMERIC,
  ADD COLUMN IF NOT EXISTS longitude NUMERIC;

-- Create index for geospatial queries
CREATE INDEX IF NOT EXISTS idx_properties_coordinates ON public.properties (latitude, longitude);

-- Populate with approximate Dubai area coordinates
UPDATE public.properties SET latitude = 25.0805, longitude = 55.1403 WHERE location_area = 'Dubai Marina' AND latitude IS NULL;
UPDATE public.properties SET latitude = 25.1972, longitude = 55.2744 WHERE location_area = 'Downtown Dubai' AND latitude IS NULL;
UPDATE public.properties SET latitude = 25.1124, longitude = 55.1390 WHERE location_area = 'Palm Jumeirah' AND latitude IS NULL;
UPDATE public.properties SET latitude = 25.1880, longitude = 55.2650 WHERE location_area = 'Business Bay' AND latitude IS NULL;
UPDATE public.properties SET latitude = 25.0540, longitude = 55.2094 WHERE location_area = 'JVC' AND latitude IS NULL;
UPDATE public.properties SET latitude = 25.2010, longitude = 55.3350 WHERE location_area = 'Dubai Creek Harbour' AND latitude IS NULL;
UPDATE public.properties SET latitude = 25.0780, longitude = 55.1200 WHERE location_area = 'Emaar Beachfront' AND latitude IS NULL;
UPDATE public.properties SET latitude = 25.1700, longitude = 55.3200 WHERE location_area = 'MBR City' AND latitude IS NULL;
UPDATE public.properties SET latitude = 25.0050, longitude = 55.2600 WHERE location_area = 'Damac Lagoons' AND latitude IS NULL;
UPDATE public.properties SET latitude = 25.0200, longitude = 55.4000 WHERE location_area = 'The Valley' AND latitude IS NULL;
UPDATE public.properties SET latitude = 25.0300, longitude = 55.1900 WHERE location_area = 'Tilal Al Ghaf' AND latitude IS NULL;