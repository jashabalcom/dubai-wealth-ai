-- Add weekly digest preference columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS notify_email_digest boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS last_digest_sent_at timestamp with time zone;