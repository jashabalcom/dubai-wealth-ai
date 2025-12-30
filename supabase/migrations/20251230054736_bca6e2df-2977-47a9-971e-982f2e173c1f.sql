-- Add new columns to portfolio_properties table
ALTER TABLE portfolio_properties 
ADD COLUMN IF NOT EXISTS size_sqft NUMERIC,
ADD COLUMN IF NOT EXISTS bedrooms INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS last_valuation_date DATE,
ADD COLUMN IF NOT EXISTS valuation_source TEXT DEFAULT 'user';

-- Create portfolio_property_valuations table for historical tracking
CREATE TABLE IF NOT EXISTS portfolio_property_valuations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES portfolio_properties(id) ON DELETE CASCADE,
  valuation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  estimated_value NUMERIC NOT NULL,
  valuation_source TEXT NOT NULL DEFAULT 'user',
  confidence_score INTEGER CHECK (confidence_score BETWEEN 0 AND 100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on valuations table
ALTER TABLE portfolio_property_valuations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for valuations
CREATE POLICY "Users can view their property valuations"
  ON portfolio_property_valuations FOR SELECT
  USING (
    property_id IN (
      SELECT pp.id FROM portfolio_properties pp
      JOIN portfolios p ON pp.portfolio_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert valuations for their properties"
  ON portfolio_property_valuations FOR INSERT
  WITH CHECK (
    property_id IN (
      SELECT pp.id FROM portfolio_properties pp
      JOIN portfolios p ON pp.portfolio_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their property valuations"
  ON portfolio_property_valuations FOR UPDATE
  USING (
    property_id IN (
      SELECT pp.id FROM portfolio_properties pp
      JOIN portfolios p ON pp.portfolio_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their property valuations"
  ON portfolio_property_valuations FOR DELETE
  USING (
    property_id IN (
      SELECT pp.id FROM portfolio_properties pp
      JOIN portfolios p ON pp.portfolio_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );