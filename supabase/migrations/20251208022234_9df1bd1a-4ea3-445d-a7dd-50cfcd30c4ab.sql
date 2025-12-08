-- Create portfolios table
CREATE TABLE public.portfolios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  name TEXT NOT NULL DEFAULT 'My Portfolio',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create portfolio_properties table
CREATE TABLE public.portfolio_properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  property_name TEXT NOT NULL,
  location_area TEXT NOT NULL,
  property_type TEXT NOT NULL DEFAULT 'apartment',
  purchase_price NUMERIC NOT NULL,
  current_value NUMERIC NOT NULL,
  purchase_date DATE NOT NULL,
  monthly_rental_income NUMERIC DEFAULT 0,
  monthly_expenses NUMERIC DEFAULT 0,
  mortgage_balance NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_portfolios_user ON public.portfolios(user_id);
CREATE INDEX idx_portfolio_properties_portfolio ON public.portfolio_properties(portfolio_id);

-- Enable RLS
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_properties ENABLE ROW LEVEL SECURITY;

-- Portfolios policies - Elite members only
CREATE POLICY "Elite users can view their own portfolio"
ON public.portfolios
FOR SELECT
USING (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND membership_tier = 'elite'
  )
);

CREATE POLICY "Elite users can create their own portfolio"
ON public.portfolios
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND membership_tier = 'elite'
  )
);

CREATE POLICY "Elite users can update their own portfolio"
ON public.portfolios
FOR UPDATE
USING (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND membership_tier = 'elite'
  )
);

CREATE POLICY "Elite users can delete their own portfolio"
ON public.portfolios
FOR DELETE
USING (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND membership_tier = 'elite'
  )
);

-- Portfolio properties policies
CREATE POLICY "Users can view their portfolio properties"
ON public.portfolio_properties
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.portfolios p
    WHERE p.id = portfolio_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can add portfolio properties"
ON public.portfolio_properties
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.portfolios p
    WHERE p.id = portfolio_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their portfolio properties"
ON public.portfolio_properties
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.portfolios p
    WHERE p.id = portfolio_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their portfolio properties"
ON public.portfolio_properties
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.portfolios p
    WHERE p.id = portfolio_id
    AND p.user_id = auth.uid()
  )
);

-- Triggers for updated_at
CREATE TRIGGER update_portfolios_updated_at
BEFORE UPDATE ON public.portfolios
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_portfolio_properties_updated_at
BEFORE UPDATE ON public.portfolio_properties
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();