-- Add new investment intelligence fields to developers table
ALTER TABLE public.developers
ADD COLUMN IF NOT EXISTS target_buyer_profile text,
ADD COLUMN IF NOT EXISTS investment_reputation text,
ADD COLUMN IF NOT EXISTS total_value_delivered numeric,
ADD COLUMN IF NOT EXISTS market_share_percent numeric,
ADD COLUMN IF NOT EXISTS avg_delivery_months integer,
ADD COLUMN IF NOT EXISTS on_time_delivery_rate numeric,
ADD COLUMN IF NOT EXISTS brand_partnerships jsonb DEFAULT '[]'::jsonb;

-- Add new investment intelligence fields to developer_projects table
ALTER TABLE public.developer_projects
ADD COLUMN IF NOT EXISTS investment_thesis text,
ADD COLUMN IF NOT EXISTS ideal_buyer_persona text,
ADD COLUMN IF NOT EXISTS capital_appreciation_rating text,
ADD COLUMN IF NOT EXISTS rental_yield_rating text,
ADD COLUMN IF NOT EXISTS comparable_project_ids uuid[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS risks_considerations text,
ADD COLUMN IF NOT EXISTS sales_deck_url text,
ADD COLUMN IF NOT EXISTS min_investment_aed numeric,
ADD COLUMN IF NOT EXISTS payment_plan_structure text,
ADD COLUMN IF NOT EXISTS unit_types jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS amenities jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS gallery_images jsonb DEFAULT '[]'::jsonb;

-- Add comments for documentation
COMMENT ON COLUMN public.developers.investment_reputation IS 'ultra_luxury, premium, value, mass_market';
COMMENT ON COLUMN public.developers.target_buyer_profile IS 'Description of target investor/buyer demographic';
COMMENT ON COLUMN public.developer_projects.capital_appreciation_rating IS 'high, medium, low';
COMMENT ON COLUMN public.developer_projects.rental_yield_rating IS 'high, medium, low';