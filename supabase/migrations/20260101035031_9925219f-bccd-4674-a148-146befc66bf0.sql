-- Add PayPal and payout preference columns to affiliates table
ALTER TABLE public.affiliates 
ADD COLUMN IF NOT EXISTS paypal_email TEXT,
ADD COLUMN IF NOT EXISTS preferred_payout_method TEXT DEFAULT 'paypal',
ADD COLUMN IF NOT EXISTS bank_details JSONB DEFAULT '{}'::jsonb;

-- Add constraint for preferred_payout_method
ALTER TABLE public.affiliates 
DROP CONSTRAINT IF EXISTS affiliates_preferred_payout_method_check;

ALTER TABLE public.affiliates 
ADD CONSTRAINT affiliates_preferred_payout_method_check 
CHECK (preferred_payout_method IN ('paypal', 'stripe', 'bank_transfer'));

-- Add new columns to affiliate_payouts table
ALTER TABLE public.affiliate_payouts 
ADD COLUMN IF NOT EXISTS payout_method TEXT DEFAULT 'paypal',
ADD COLUMN IF NOT EXISTS paypal_transaction_id TEXT,
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS processed_by UUID;

-- Add constraint for payout_method
ALTER TABLE public.affiliate_payouts 
DROP CONSTRAINT IF EXISTS affiliate_payouts_payout_method_check;

ALTER TABLE public.affiliate_payouts 
ADD CONSTRAINT affiliate_payouts_payout_method_check 
CHECK (payout_method IN ('paypal', 'stripe', 'bank_transfer', 'other'));