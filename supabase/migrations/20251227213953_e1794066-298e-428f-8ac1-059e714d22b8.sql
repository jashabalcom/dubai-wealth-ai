-- Email Drip Campaign Tables

-- Create email_drip_sequences table for configurable email sequence definitions
CREATE TABLE public.email_drip_sequences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sequence_name TEXT NOT NULL,
  email_key TEXT NOT NULL UNIQUE,
  target_tier TEXT NOT NULL DEFAULT 'free',
  day_offset INTEGER NOT NULL DEFAULT 0,
  subject TEXT NOT NULL,
  email_type TEXT NOT NULL DEFAULT 'educational',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create email_drip_queue table for scheduled emails per user
CREATE TABLE public.email_drip_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  sequence_id UUID NOT NULL REFERENCES public.email_drip_sequences(id) ON DELETE CASCADE,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, sequence_id)
);

-- Create indexes for efficient querying
CREATE INDEX idx_drip_queue_status_scheduled ON public.email_drip_queue(status, scheduled_for) WHERE status = 'pending';
CREATE INDEX idx_drip_queue_user ON public.email_drip_queue(user_id);
CREATE INDEX idx_drip_sequences_tier ON public.email_drip_sequences(target_tier, is_active);

-- Enable RLS
ALTER TABLE public.email_drip_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_drip_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_drip_sequences
CREATE POLICY "Admins can manage sequences"
ON public.email_drip_sequences
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view active sequences"
ON public.email_drip_sequences
FOR SELECT
USING (is_active = true);

-- RLS Policies for email_drip_queue
CREATE POLICY "Admins can manage queue"
ON public.email_drip_queue
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own queue"
ON public.email_drip_queue
FOR SELECT
USING (auth.uid() = user_id);

-- Seed initial welcome sequence for free users (7 emails over 21 days)
INSERT INTO public.email_drip_sequences (sequence_name, email_key, target_tier, day_offset, subject, email_type) VALUES
('welcome', 'welcome_day0', 'free', 0, 'Welcome to MLA Dubai - Your Investment Journey Starts Now! 🏙️', 'welcome'),
('welcome', 'welcome_day1', 'free', 1, 'Your 5-Step Dubai Investment Roadmap', 'educational'),
('welcome', 'welcome_day3', 'free', 3, '5 Costly Mistakes First-Time Dubai Investors Make', 'educational'),
('welcome', 'welcome_day5', 'free', 5, 'Discover Your Property''s True ROI Potential', 'feature'),
('welcome', 'welcome_day7', 'free', 7, 'Unlock Premium Features - Special Offer Inside', 'upgrade'),
('welcome', 'welcome_day14', 'free', 14, 'How Sarah Made AED 2.4M on Her First Dubai Investment', 'case_study'),
('welcome', 'welcome_day21', 'free', 21, 'Last Chance: 30% Off Investor Membership', 'upgrade');

-- Seed investor upsell sequence (3 emails)
INSERT INTO public.email_drip_sequences (sequence_name, email_key, target_tier, day_offset, subject, email_type) VALUES
('investor_upsell', 'investor_day7', 'investor', 7, 'Tips to Maximize Your Investor Membership', 'onboarding'),
('investor_upsell', 'investor_day30', 'investor', 30, 'Your Monthly Investment Impact Report', 'value'),
('investor_upsell', 'investor_day45', 'investor', 45, 'Exclusive Preview: Elite Member Benefits', 'upgrade');

-- Create trigger for updated_at
CREATE TRIGGER update_email_drip_sequences_updated_at
BEFORE UPDATE ON public.email_drip_sequences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_drip_queue_updated_at
BEFORE UPDATE ON public.email_drip_queue
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();