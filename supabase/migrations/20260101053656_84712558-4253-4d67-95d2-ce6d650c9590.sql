-- Add encryption support columns to direct_messages
ALTER TABLE public.direct_messages 
ADD COLUMN IF NOT EXISTS encrypted_content TEXT,
ADD COLUMN IF NOT EXISTS content_nonce TEXT,
ADD COLUMN IF NOT EXISTS sender_public_key TEXT,
ADD COLUMN IF NOT EXISTS encryption_version SMALLINT DEFAULT 1;

-- Add encryption support columns to group_messages  
ALTER TABLE public.group_messages
ADD COLUMN IF NOT EXISTS encrypted_content TEXT,
ADD COLUMN IF NOT EXISTS content_nonce TEXT,
ADD COLUMN IF NOT EXISTS encryption_version SMALLINT DEFAULT 1;

-- Add public key to profiles for key exchange
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS public_key TEXT,
ADD COLUMN IF NOT EXISTS key_created_at TIMESTAMPTZ;

-- Create user encryption keys table for secure key storage
CREATE TABLE IF NOT EXISTS public.user_encryption_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  encrypted_private_key TEXT NOT NULL,
  key_version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, key_version)
);

-- Enable RLS on encryption keys table
ALTER TABLE public.user_encryption_keys ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own keys
CREATE POLICY "Users can view their own encryption keys"
ON public.user_encryption_keys FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own encryption keys"
ON public.user_encryption_keys FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own encryption keys"
ON public.user_encryption_keys FOR UPDATE
USING (auth.uid() = user_id);

-- Create index for faster key lookups
CREATE INDEX IF NOT EXISTS idx_encryption_keys_user_id ON public.user_encryption_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_public_key ON public.profiles(id) WHERE public_key IS NOT NULL;

-- Add trigger for updated_at
CREATE TRIGGER update_encryption_keys_updated_at
  BEFORE UPDATE ON public.user_encryption_keys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();