-- Create mortgage_partners table for bank/broker partnerships
CREATE TABLE public.mortgage_partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  description TEXT,
  base_rate NUMERIC,
  max_ltv NUMERIC DEFAULT 80,
  processing_fee_percent NUMERIC DEFAULT 1,
  min_loan_amount NUMERIC DEFAULT 500000,
  max_loan_amount NUMERIC,
  partnership_type TEXT NOT NULL DEFAULT 'cpl', -- cpl (cost per lead), cpa (cost per application), sponsor
  cpl_amount NUMERIC DEFAULT 0, -- Amount we earn per lead
  cpa_amount NUMERIC DEFAULT 0, -- Amount we earn per funded loan
  sponsorship_monthly NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  contact_email TEXT,
  contact_phone TEXT,
  website_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mortgage_leads table
CREATE TABLE public.mortgage_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  
  -- Calculator inputs (pre-filled from calculator)
  property_price NUMERIC NOT NULL,
  down_payment_percent NUMERIC NOT NULL,
  down_payment_amount NUMERIC NOT NULL,
  loan_amount NUMERIC NOT NULL,
  interest_rate NUMERIC NOT NULL,
  loan_term_years INTEGER NOT NULL,
  monthly_payment NUMERIC NOT NULL,
  
  -- Property context
  property_id UUID REFERENCES public.properties(id),
  property_area TEXT,
  property_type TEXT,
  is_off_plan BOOLEAN DEFAULT false,
  
  -- Lead qualification fields
  employment_status TEXT NOT NULL, -- employed, self_employed, business_owner, retired
  monthly_income_range TEXT NOT NULL, -- Under 15K, 15K-30K, 30K-50K, 50K-100K, 100K+
  purchase_timeline TEXT NOT NULL, -- immediate, 1-3 months, 3-6 months, 6-12 months, researching
  first_time_buyer BOOLEAN DEFAULT false,
  existing_mortgage BOOLEAN DEFAULT false,
  uae_resident BOOLEAN DEFAULT true,
  
  -- Contact information
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  preferred_contact_method TEXT DEFAULT 'phone', -- phone, email, whatsapp
  
  -- Consent and tracking
  consent_bank_contact BOOLEAN NOT NULL DEFAULT false,
  consent_marketing BOOLEAN DEFAULT false,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  referrer_url TEXT,
  
  -- Lead management
  status TEXT NOT NULL DEFAULT 'new', -- new, contacted, qualified, sent_to_partner, converted, lost
  lead_score INTEGER DEFAULT 0, -- 0-100 calculated score
  assigned_partner_id UUID REFERENCES public.mortgage_partners(id),
  admin_notes TEXT,
  
  -- Revenue tracking
  partner_notified_at TIMESTAMP WITH TIME ZONE,
  converted_at TIMESTAMP WITH TIME ZONE,
  revenue_earned NUMERIC DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mortgage_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mortgage_leads ENABLE ROW LEVEL SECURITY;

-- RLS policies for mortgage_partners
CREATE POLICY "Anyone can view active partners"
ON public.mortgage_partners FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage partners"
ON public.mortgage_partners FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for mortgage_leads
CREATE POLICY "Users can view their own leads"
ON public.mortgage_leads FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create leads"
ON public.mortgage_leads FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage all leads"
ON public.mortgage_leads FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Indexes for performance
CREATE INDEX idx_mortgage_leads_status ON public.mortgage_leads(status);
CREATE INDEX idx_mortgage_leads_user_id ON public.mortgage_leads(user_id);
CREATE INDEX idx_mortgage_leads_created_at ON public.mortgage_leads(created_at DESC);
CREATE INDEX idx_mortgage_leads_lead_score ON public.mortgage_leads(lead_score DESC);
CREATE INDEX idx_mortgage_partners_active ON public.mortgage_partners(is_active, display_order);

-- Trigger for updated_at
CREATE TRIGGER update_mortgage_partners_updated_at
BEFORE UPDATE ON public.mortgage_partners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mortgage_leads_updated_at
BEFORE UPDATE ON public.mortgage_leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();