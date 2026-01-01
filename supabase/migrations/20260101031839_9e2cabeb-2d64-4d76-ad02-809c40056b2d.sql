-- =============================================
-- AFFILIATE PROGRAM DATABASE SCHEMA
-- =============================================

-- Enum for affiliate types
CREATE TYPE public.affiliate_type AS ENUM ('member', 'agent_basic', 'agent_preferred', 'agent_premium');

-- Enum for affiliate status
CREATE TYPE public.affiliate_status AS ENUM ('pending', 'approved', 'suspended', 'rejected');

-- Enum for referral status
CREATE TYPE public.referral_status AS ENUM ('pending', 'qualified', 'churned', 'fraudulent');

-- Enum for commission status
CREATE TYPE public.commission_status AS ENUM ('pending', 'approved', 'paid', 'voided');

-- Enum for payout status
CREATE TYPE public.payout_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- =============================================
-- 1. AFFILIATE SETTINGS (Global Configuration)
-- =============================================
CREATE TABLE public.affiliate_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Insert default settings
INSERT INTO public.affiliate_settings (setting_key, setting_value, description) VALUES
  ('default_commission_rate', '{"rate": 0.50}', 'Default 50% commission rate'),
  ('qualification_period_days', '{"days": 60}', 'Days before commission qualifies'),
  ('minimum_payout_amount', '{"amount": 50, "currency": "USD"}', 'Minimum payout threshold'),
  ('cookie_duration_days', '{"days": 90}', 'Referral cookie duration'),
  ('commission_rates', '{
    "dubai_investor_monthly": {"rate": 0.50, "amount": 49.50},
    "dubai_investor_annual": {"rate": 0.50, "amount": 534},
    "dubai_elite_monthly": {"rate": 0.50, "amount": 199.50},
    "dubai_elite_annual": {"rate": 0.50, "amount": 2154},
    "dubai_private": {"rate": 0.50, "amount": 12500},
    "agent_preferred_monthly": {"rate": 0.50, "amount": 49.50},
    "agent_premium_monthly": {"rate": 0.50, "amount": 149.50}
  }', 'Commission rates per product');

ALTER TABLE public.affiliate_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage affiliate settings"
  ON public.affiliate_settings FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can read affiliate settings"
  ON public.affiliate_settings FOR SELECT
  USING (true);

-- =============================================
-- 2. AFFILIATES (Affiliate Profiles)
-- =============================================
CREATE TABLE public.affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  referral_code TEXT UNIQUE NOT NULL,
  affiliate_type public.affiliate_type NOT NULL DEFAULT 'member',
  commission_rate DECIMAL(5,4) DEFAULT NULL, -- Override global rate if set
  stripe_connect_id TEXT,
  stripe_connect_status TEXT DEFAULT 'not_connected',
  status public.affiliate_status NOT NULL DEFAULT 'pending',
  total_clicks INTEGER DEFAULT 0,
  total_signups INTEGER DEFAULT 0,
  total_qualified INTEGER DEFAULT 0,
  total_earnings DECIMAL(12,2) DEFAULT 0,
  pending_earnings DECIMAL(12,2) DEFAULT 0,
  application_notes TEXT,
  admin_notes TEXT,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_affiliate UNIQUE (user_id)
);

CREATE INDEX idx_affiliates_referral_code ON public.affiliates(referral_code);
CREATE INDEX idx_affiliates_user_id ON public.affiliates(user_id);
CREATE INDEX idx_affiliates_status ON public.affiliates(status);
CREATE INDEX idx_affiliates_agent_id ON public.affiliates(agent_id);

ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own affiliate profile"
  ON public.affiliates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own affiliate profile"
  ON public.affiliates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own affiliate profile"
  ON public.affiliates FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all affiliates"
  ON public.affiliates FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- =============================================
-- 3. AFFILIATE CLICKS (Track Link Clicks)
-- =============================================
CREATE TABLE public.affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  ip_hash TEXT, -- Hashed for privacy
  user_agent TEXT,
  referrer_url TEXT,
  landing_page TEXT,
  country_code TEXT,
  converted BOOLEAN DEFAULT false,
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_affiliate_clicks_affiliate_id ON public.affiliate_clicks(affiliate_id);
CREATE INDEX idx_affiliate_clicks_created_at ON public.affiliate_clicks(created_at);
CREATE INDEX idx_affiliate_clicks_ip_hash ON public.affiliate_clicks(ip_hash);

ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Affiliates can view own clicks"
  ON public.affiliate_clicks FOR SELECT
  USING (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));

CREATE POLICY "System can insert clicks"
  ON public.affiliate_clicks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage all clicks"
  ON public.affiliate_clicks FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- =============================================
-- 4. REFERRALS (Link Affiliates to Referred Users)
-- =============================================
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  click_id UUID REFERENCES public.affiliate_clicks(id),
  referred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  qualification_date TIMESTAMPTZ NOT NULL,
  qualified_at TIMESTAMPTZ,
  status public.referral_status NOT NULL DEFAULT 'pending',
  first_subscription_id TEXT,
  first_subscription_product TEXT,
  first_subscription_amount DECIMAL(10,2),
  churned_at TIMESTAMPTZ,
  churn_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_referred_user UNIQUE (referred_user_id)
);

CREATE INDEX idx_referrals_affiliate_id ON public.referrals(affiliate_id);
CREATE INDEX idx_referrals_referred_user_id ON public.referrals(referred_user_id);
CREATE INDEX idx_referrals_status ON public.referrals(status);
CREATE INDEX idx_referrals_qualification_date ON public.referrals(qualification_date);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Affiliates can view own referrals"
  ON public.referrals FOR SELECT
  USING (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));

CREATE POLICY "System can manage referrals"
  ON public.referrals FOR ALL
  USING (true);

CREATE POLICY "Admins can manage all referrals"
  ON public.referrals FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- =============================================
-- 5. COMMISSIONS (Track All Commission Events)
-- =============================================
CREATE TABLE public.commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  referral_id UUID NOT NULL REFERENCES public.referrals(id) ON DELETE CASCADE,
  product_type TEXT NOT NULL,
  billing_period TEXT NOT NULL, -- monthly, annual, one-time
  gross_amount DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,4) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status public.commission_status NOT NULL DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  voided_at TIMESTAMPTZ,
  void_reason TEXT,
  payout_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_commissions_affiliate_id ON public.commissions(affiliate_id);
CREATE INDEX idx_commissions_referral_id ON public.commissions(referral_id);
CREATE INDEX idx_commissions_status ON public.commissions(status);
CREATE INDEX idx_commissions_payout_id ON public.commissions(payout_id);

ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Affiliates can view own commissions"
  ON public.commissions FOR SELECT
  USING (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all commissions"
  ON public.commissions FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- =============================================
-- 6. AFFILIATE PAYOUTS (Payout Records)
-- =============================================
CREATE TABLE public.affiliate_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  commission_count INTEGER NOT NULL DEFAULT 0,
  stripe_transfer_id TEXT,
  stripe_payout_id TEXT,
  status public.payout_status NOT NULL DEFAULT 'pending',
  failure_reason TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_affiliate_payouts_affiliate_id ON public.affiliate_payouts(affiliate_id);
CREATE INDEX idx_affiliate_payouts_status ON public.affiliate_payouts(status);

ALTER TABLE public.affiliate_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Affiliates can view own payouts"
  ON public.affiliate_payouts FOR SELECT
  USING (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all payouts"
  ON public.affiliate_payouts FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- =============================================
-- 7. REFERRAL ACTIVITY (Activity Tracking for Agent Notifications)
-- =============================================
CREATE TABLE public.referral_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id UUID NOT NULL REFERENCES public.referrals(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- property_view, property_save, inquiry, tier_upgrade, login
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_referral_activity_referral_id ON public.referral_activity(referral_id);
CREATE INDEX idx_referral_activity_type ON public.referral_activity(activity_type);
CREATE INDEX idx_referral_activity_created_at ON public.referral_activity(created_at);

ALTER TABLE public.referral_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Affiliates can view referral activity based on tier"
  ON public.referral_activity FOR SELECT
  USING (
    referral_id IN (
      SELECT r.id FROM public.referrals r
      JOIN public.affiliates a ON a.id = r.affiliate_id
      WHERE a.user_id = auth.uid()
      AND a.affiliate_type IN ('agent_preferred', 'agent_premium')
    )
  );

CREATE POLICY "System can insert activity"
  ON public.referral_activity FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage all activity"
  ON public.referral_activity FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- =============================================
-- 8. AFFILIATE NOTIFICATIONS (Notification Queue)
-- =============================================
CREATE TABLE public.affiliate_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  delivery_method TEXT DEFAULT 'in_app', -- in_app, email, both
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_affiliate_notifications_affiliate_id ON public.affiliate_notifications(affiliate_id);
CREATE INDEX idx_affiliate_notifications_is_read ON public.affiliate_notifications(is_read);

ALTER TABLE public.affiliate_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Affiliates can view own notifications"
  ON public.affiliate_notifications FOR SELECT
  USING (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));

CREATE POLICY "Affiliates can update own notifications"
  ON public.affiliate_notifications FOR UPDATE
  USING (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all notifications"
  ON public.affiliate_notifications FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Generate unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code(prefix TEXT DEFAULT NULL)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  code TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    IF prefix IS NOT NULL THEN
      code := UPPER(prefix) || '-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
    ELSE
      code := 'REF-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    END IF;
    
    SELECT EXISTS(SELECT 1 FROM public.affiliates WHERE referral_code = code) INTO exists_check;
    EXIT WHEN NOT exists_check;
  END LOOP;
  
  RETURN code;
END;
$$;

-- Get affiliate by referral code
CREATE OR REPLACE FUNCTION public.get_affiliate_by_code(code TEXT)
RETURNS TABLE(
  id UUID,
  user_id UUID,
  referral_code TEXT,
  affiliate_type public.affiliate_type,
  status public.affiliate_status
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    a.id,
    a.user_id,
    a.referral_code,
    a.affiliate_type,
    a.status
  FROM public.affiliates a
  WHERE a.referral_code = UPPER(code)
  AND a.status = 'approved';
$$;

-- Check if user was referred
CREATE OR REPLACE FUNCTION public.get_user_referral(user_uuid UUID)
RETURNS TABLE(
  referral_id UUID,
  affiliate_id UUID,
  referral_code TEXT,
  status public.referral_status
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    r.id as referral_id,
    r.affiliate_id,
    a.referral_code,
    r.status
  FROM public.referrals r
  JOIN public.affiliates a ON a.id = r.affiliate_id
  WHERE r.referred_user_id = user_uuid;
$$;

-- Update affiliate stats trigger
CREATE OR REPLACE FUNCTION public.update_affiliate_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update click count
  IF TG_TABLE_NAME = 'affiliate_clicks' THEN
    UPDATE public.affiliates 
    SET total_clicks = total_clicks + 1,
        updated_at = now()
    WHERE id = NEW.affiliate_id;
  END IF;
  
  -- Update signup count
  IF TG_TABLE_NAME = 'referrals' AND TG_OP = 'INSERT' THEN
    UPDATE public.affiliates 
    SET total_signups = total_signups + 1,
        updated_at = now()
    WHERE id = NEW.affiliate_id;
  END IF;
  
  -- Update qualified count
  IF TG_TABLE_NAME = 'referrals' AND TG_OP = 'UPDATE' THEN
    IF OLD.status = 'pending' AND NEW.status = 'qualified' THEN
      UPDATE public.affiliates 
      SET total_qualified = total_qualified + 1,
          updated_at = now()
      WHERE id = NEW.affiliate_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_affiliate_clicks
  AFTER INSERT ON public.affiliate_clicks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_affiliate_stats();

CREATE TRIGGER trigger_update_affiliate_referrals
  AFTER INSERT OR UPDATE ON public.referrals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_affiliate_stats();

-- Update commission earnings trigger
CREATE OR REPLACE FUNCTION public.update_affiliate_earnings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.affiliates 
    SET pending_earnings = pending_earnings + NEW.commission_amount,
        updated_at = now()
    WHERE id = NEW.affiliate_id;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Commission approved
    IF OLD.status = 'pending' AND NEW.status = 'approved' THEN
      -- Pending stays same, will move to paid when payout happens
      NULL;
    -- Commission paid
    ELSIF OLD.status = 'approved' AND NEW.status = 'paid' THEN
      UPDATE public.affiliates 
      SET pending_earnings = pending_earnings - NEW.commission_amount,
          total_earnings = total_earnings + NEW.commission_amount,
          updated_at = now()
      WHERE id = NEW.affiliate_id;
    -- Commission voided
    ELSIF NEW.status = 'voided' AND OLD.status IN ('pending', 'approved') THEN
      UPDATE public.affiliates 
      SET pending_earnings = pending_earnings - NEW.commission_amount,
          updated_at = now()
      WHERE id = NEW.affiliate_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_affiliate_earnings
  AFTER INSERT OR UPDATE ON public.commissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_affiliate_earnings();

-- Updated at trigger for affiliates
CREATE TRIGGER update_affiliates_updated_at
  BEFORE UPDATE ON public.affiliates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_referrals_updated_at
  BEFORE UPDATE ON public.referrals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_commissions_updated_at
  BEFORE UPDATE ON public.commissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_affiliate_payouts_updated_at
  BEFORE UPDATE ON public.affiliate_payouts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();