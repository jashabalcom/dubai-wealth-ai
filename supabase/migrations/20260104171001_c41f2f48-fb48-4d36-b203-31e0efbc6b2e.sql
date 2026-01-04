-- Create a function to update developer project counts
CREATE OR REPLACE FUNCTION public.update_developer_project_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update the count based on the operation
  IF TG_OP = 'INSERT' THEN
    UPDATE public.developers 
    SET total_projects = (
      SELECT COUNT(*) FROM public.developer_projects WHERE developer_id = NEW.developer_id
    ),
    updated_at = now()
    WHERE id = NEW.developer_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.developers 
    SET total_projects = (
      SELECT COUNT(*) FROM public.developer_projects WHERE developer_id = OLD.developer_id
    ),
    updated_at = now()
    WHERE id = OLD.developer_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' AND OLD.developer_id != NEW.developer_id THEN
    -- Update both old and new developer counts if developer changed
    UPDATE public.developers 
    SET total_projects = (
      SELECT COUNT(*) FROM public.developer_projects WHERE developer_id = OLD.developer_id
    ),
    updated_at = now()
    WHERE id = OLD.developer_id;
    
    UPDATE public.developers 
    SET total_projects = (
      SELECT COUNT(*) FROM public.developer_projects WHERE developer_id = NEW.developer_id
    ),
    updated_at = now()
    WHERE id = NEW.developer_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger for auto-updating project counts
DROP TRIGGER IF EXISTS trigger_update_developer_project_count ON public.developer_projects;
CREATE TRIGGER trigger_update_developer_project_count
AFTER INSERT OR UPDATE OR DELETE ON public.developer_projects
FOR EACH ROW
EXECUTE FUNCTION public.update_developer_project_count();

-- Sync all existing developer counts with actual project data
UPDATE public.developers d
SET total_projects = (
  SELECT COUNT(*) FROM public.developer_projects dp WHERE dp.developer_id = d.id
);