-- Add composite indexes for optimized property filtering and pagination
-- These indexes improve query performance for the most common filter combinations

-- Index for status + location_area (most common filter combination)
CREATE INDEX IF NOT EXISTS idx_properties_status_location 
ON public.properties (status, location_area);

-- Index for status + property_type + bedrooms
CREATE INDEX IF NOT EXISTS idx_properties_status_type_beds 
ON public.properties (status, property_type, bedrooms);

-- Index for status + price range queries
CREATE INDEX IF NOT EXISTS idx_properties_status_price 
ON public.properties (status, price_aed);

-- Index for rental yield filtering
CREATE INDEX IF NOT EXISTS idx_properties_status_yield 
ON public.properties (status, rental_yield_estimate);

-- Index for off-plan filtering
CREATE INDEX IF NOT EXISTS idx_properties_status_offplan 
ON public.properties (status, is_off_plan);

-- Index for sorting by created_at (newest)
CREATE INDEX IF NOT EXISTS idx_properties_status_created 
ON public.properties (status, created_at DESC);

-- Index for sorting by featured then created
CREATE INDEX IF NOT EXISTS idx_properties_status_featured_created 
ON public.properties (status, is_featured DESC, created_at DESC);

-- Index for Golden Visa eligible properties (price >= 2M)
CREATE INDEX IF NOT EXISTS idx_properties_golden_visa 
ON public.properties (status, price_aed) 
WHERE price_aed >= 2000000;

-- Index for developer filtering
CREATE INDEX IF NOT EXISTS idx_properties_status_developer 
ON public.properties (status, developer_name);