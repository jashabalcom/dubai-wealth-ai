-- =====================================================
-- FIX: Heat Map Clustering Function (array slice syntax fix)
-- =====================================================

DROP FUNCTION IF EXISTS public.get_property_clusters(INTEGER, DECIMAL, DECIMAL, DECIMAL, DECIMAL, TEXT);

CREATE OR REPLACE FUNCTION public.get_property_clusters(
  zoom_level INTEGER,
  bounds_sw_lat DECIMAL,
  bounds_sw_lng DECIMAL,
  bounds_ne_lat DECIMAL,
  bounds_ne_lng DECIMAL,
  listing_type_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
  cluster_lat DECIMAL,
  cluster_lng DECIMAL,
  property_count INTEGER,
  avg_price DECIMAL,
  avg_price_sqft DECIMAL,
  min_price DECIMAL,
  max_price DECIMAL,
  sample_ids UUID[]
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  grid_size DECIMAL;
BEGIN
  -- Calculate grid size based on zoom level (smaller grid = more clusters at higher zoom)
  grid_size := CASE 
    WHEN zoom_level >= 15 THEN 0.001
    WHEN zoom_level >= 13 THEN 0.005
    WHEN zoom_level >= 11 THEN 0.01
    WHEN zoom_level >= 9 THEN 0.05
    ELSE 0.1
  END;

  RETURN QUERY
  SELECT 
    ROUND(p.latitude / grid_size) * grid_size AS cluster_lat,
    ROUND(p.longitude / grid_size) * grid_size AS cluster_lng,
    COUNT(*)::INTEGER AS property_count,
    ROUND(AVG(p.price_aed)::DECIMAL, 0) AS avg_price,
    ROUND(AVG(CASE WHEN p.size_sqft > 0 THEN p.price_aed / p.size_sqft ELSE NULL END)::DECIMAL, 0) AS avg_price_sqft,
    MIN(p.price_aed) AS min_price,
    MAX(p.price_aed) AS max_price,
    (ARRAY_AGG(p.id ORDER BY p.price_aed DESC))[1:5] AS sample_ids
  FROM properties p
  WHERE p.is_published = true
    AND p.latitude IS NOT NULL 
    AND p.longitude IS NOT NULL
    AND p.latitude BETWEEN bounds_sw_lat AND bounds_ne_lat
    AND p.longitude BETWEEN bounds_sw_lng AND bounds_ne_lng
    AND (listing_type_filter IS NULL OR p.listing_type = listing_type_filter)
  GROUP BY 
    ROUND(p.latitude / grid_size) * grid_size,
    ROUND(p.longitude / grid_size) * grid_size
  HAVING COUNT(*) > 0
  ORDER BY property_count DESC;
END;
$$;