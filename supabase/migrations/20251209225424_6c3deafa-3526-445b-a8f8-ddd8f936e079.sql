-- Create market_transactions table for Dubai Pulse transaction data
CREATE TABLE public.market_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id TEXT UNIQUE,
  instance_date DATE NOT NULL,
  trans_group TEXT NOT NULL,
  property_type TEXT,
  property_sub_type TEXT,
  property_usage TEXT,
  area_name TEXT NOT NULL,
  building_name TEXT,
  project_name TEXT,
  developer_name TEXT,
  rooms TEXT,
  has_parking BOOLEAN,
  procedure_area_sqm NUMERIC,
  procedure_area_sqft NUMERIC GENERATED ALWAYS AS (procedure_area_sqm * 10.764) STORED,
  actual_worth NUMERIC,
  meter_sale_price NUMERIC,
  sqft_sale_price NUMERIC GENERATED ALWAYS AS (meter_sale_price / 10.764) STORED,
  reg_type TEXT,
  nearest_metro TEXT,
  nearest_mall TEXT,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for common queries
CREATE INDEX idx_market_transactions_date ON public.market_transactions(instance_date DESC);
CREATE INDEX idx_market_transactions_area ON public.market_transactions(area_name);
CREATE INDEX idx_market_transactions_type ON public.market_transactions(property_type);
CREATE INDEX idx_market_transactions_group ON public.market_transactions(trans_group);
CREATE INDEX idx_market_transactions_area_date ON public.market_transactions(area_name, instance_date DESC);

-- Enable RLS
ALTER TABLE public.market_transactions ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can view market transactions"
ON public.market_transactions FOR SELECT
USING (true);

-- Admin write access
CREATE POLICY "Admins can manage market transactions"
ON public.market_transactions FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create area_market_stats table for aggregated statistics
CREATE TABLE public.area_market_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  area_name TEXT NOT NULL,
  period_type TEXT NOT NULL CHECK (period_type IN ('monthly', 'quarterly', 'yearly')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  avg_price_sqm NUMERIC,
  avg_price_sqft NUMERIC,
  median_price_sqm NUMERIC,
  min_price_sqm NUMERIC,
  max_price_sqm NUMERIC,
  total_transactions INTEGER DEFAULT 0,
  total_sales_value NUMERIC DEFAULT 0,
  apartment_avg_price NUMERIC,
  apartment_count INTEGER DEFAULT 0,
  villa_avg_price NUMERIC,
  villa_count INTEGER DEFAULT 0,
  townhouse_avg_price NUMERIC,
  townhouse_count INTEGER DEFAULT 0,
  offplan_count INTEGER DEFAULT 0,
  ready_count INTEGER DEFAULT 0,
  offplan_avg_price NUMERIC,
  ready_avg_price NUMERIC,
  yoy_price_change NUMERIC,
  mom_price_change NUMERIC,
  qoq_price_change NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(area_name, period_type, period_start)
);

-- Create indexes
CREATE INDEX idx_area_market_stats_area ON public.area_market_stats(area_name);
CREATE INDEX idx_area_market_stats_period ON public.area_market_stats(period_type, period_start DESC);

-- Enable RLS
ALTER TABLE public.area_market_stats ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can view area market stats"
ON public.area_market_stats FOR SELECT
USING (true);

-- Admin write access
CREATE POLICY "Admins can manage area market stats"
ON public.area_market_stats FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add update trigger
CREATE TRIGGER update_market_transactions_updated_at
BEFORE UPDATE ON public.market_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_area_market_stats_updated_at
BEFORE UPDATE ON public.area_market_stats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();