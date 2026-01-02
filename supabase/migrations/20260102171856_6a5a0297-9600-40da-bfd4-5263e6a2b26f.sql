-- Fix security warning: add search_path to function
CREATE OR REPLACE FUNCTION public.update_days_on_market()
RETURNS trigger AS $$
BEGIN
  NEW.days_on_market := EXTRACT(DAY FROM (now() - NEW.created_at));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;