-- Create airbnb_market_data table for AirDNA integration
CREATE TABLE public.airbnb_market_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  area_name TEXT NOT NULL,
  property_type TEXT NOT NULL DEFAULT 'apartment',
  bedrooms INTEGER NOT NULL DEFAULT 1,
  avg_daily_rate NUMERIC,
  peak_daily_rate NUMERIC,
  low_daily_rate NUMERIC,
  avg_occupancy NUMERIC,
  peak_occupancy NUMERIC,
  low_occupancy NUMERIC,
  avg_annual_revenue NUMERIC,
  revenue_percentile_25 NUMERIC,
  revenue_percentile_75 NUMERIC,
  active_listings_count INTEGER,
  data_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(area_name, property_type, bedrooms, data_date)
);

-- Enable RLS
ALTER TABLE public.airbnb_market_data ENABLE ROW LEVEL SECURITY;

-- Public read access for market stats
CREATE POLICY "Anyone can view airbnb market data"
ON public.airbnb_market_data
FOR SELECT
USING (true);

-- Admin-only write access
CREATE POLICY "Admins can manage airbnb market data"
ON public.airbnb_market_data
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for fast lookups
CREATE INDEX idx_airbnb_market_area_bedrooms ON public.airbnb_market_data(area_name, bedrooms);
CREATE INDEX idx_airbnb_market_data_date ON public.airbnb_market_data(data_date DESC);

-- Create trigger for updated_at
CREATE TRIGGER update_airbnb_market_data_updated_at
BEFORE UPDATE ON public.airbnb_market_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();