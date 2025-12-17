-- Create efficient property counts function to fix N+1 query pattern
CREATE OR REPLACE FUNCTION public.get_property_counts()
RETURNS TABLE (
  area_counts jsonb,
  developer_counts jsonb
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (
      SELECT jsonb_object_agg(location_area, cnt)
      FROM (
        SELECT location_area, COUNT(*)::integer as cnt
        FROM properties
        WHERE status = 'available'
        GROUP BY location_area
      ) area_data
    ) as area_counts,
    (
      SELECT jsonb_object_agg(developer_name, cnt)
      FROM (
        SELECT developer_name, COUNT(*)::integer as cnt
        FROM properties
        WHERE status = 'available' AND developer_name IS NOT NULL
        GROUP BY developer_name
      ) dev_data
    ) as developer_counts;
END;
$$;