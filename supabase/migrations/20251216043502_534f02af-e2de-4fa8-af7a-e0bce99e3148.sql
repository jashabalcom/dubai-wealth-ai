-- Fix size_sqft constraint to handle NULL values from Bayut API
ALTER TABLE public.properties 
ALTER COLUMN size_sqft SET DEFAULT 0;

-- Also ensure bedrooms and bathrooms have defaults
ALTER TABLE public.properties 
ALTER COLUMN bedrooms SET DEFAULT 0;

ALTER TABLE public.properties 
ALTER COLUMN bathrooms SET DEFAULT 0;

-- Also ensure price_aed has a default
ALTER TABLE public.properties 
ALTER COLUMN price_aed SET DEFAULT 0;