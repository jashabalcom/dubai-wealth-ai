-- Create email_subscribers table for lead capture
CREATE TABLE public.email_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL DEFAULT 'website', -- where they signed up from (hero, exit_intent, footer, etc.)
  lead_magnet TEXT, -- which lead magnet they downloaded
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe (insert their email)
CREATE POLICY "Anyone can subscribe"
ON public.email_subscribers
FOR INSERT
WITH CHECK (true);

-- Only admins can view all subscribers
CREATE POLICY "Admins can manage subscribers"
ON public.email_subscribers
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for email lookups
CREATE INDEX idx_email_subscribers_email ON public.email_subscribers(email);
CREATE INDEX idx_email_subscribers_source ON public.email_subscribers(source);
CREATE INDEX idx_email_subscribers_subscribed_at ON public.email_subscribers(subscribed_at DESC);

-- Create updated_at trigger
CREATE TRIGGER update_email_subscribers_updated_at
BEFORE UPDATE ON public.email_subscribers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();