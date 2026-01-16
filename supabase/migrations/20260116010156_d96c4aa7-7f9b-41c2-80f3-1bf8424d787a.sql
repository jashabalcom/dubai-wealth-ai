-- Create the private schema first
CREATE SCHEMA IF NOT EXISTS private;

-- Enable pgcrypto extension for encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create a secure encryption key storage table (only accessible via functions)
CREATE TABLE IF NOT EXISTS private.encryption_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key_name text UNIQUE NOT NULL,
  key_value bytea NOT NULL,
  created_at timestamptz DEFAULT now(),
  rotated_at timestamptz
);

-- Generate a master encryption key (stored securely)
INSERT INTO private.encryption_keys (key_name, key_value)
VALUES ('master_key', gen_random_bytes(32))
ON CONFLICT (key_name) DO NOTHING;

-- Revoke all access to private schema from public
REVOKE ALL ON SCHEMA private FROM public;
REVOKE ALL ON ALL TABLES IN SCHEMA private FROM public;

-- Create encryption function (security definer to access private key)
CREATE OR REPLACE FUNCTION public.encrypt_sensitive(plaintext text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  key_bytes bytea;
  encrypted bytea;
BEGIN
  IF plaintext IS NULL OR plaintext = '' THEN
    RETURN NULL;
  END IF;
  
  SELECT key_value INTO key_bytes 
  FROM private.encryption_keys 
  WHERE key_name = 'master_key';
  
  -- Use AES-256 encryption with random IV
  encrypted := pgp_sym_encrypt(plaintext, encode(key_bytes, 'hex'));
  RETURN encode(encrypted, 'base64');
END;
$$;

-- Create decryption function (security definer)
CREATE OR REPLACE FUNCTION public.decrypt_sensitive(ciphertext text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  key_bytes bytea;
  decrypted text;
BEGIN
  IF ciphertext IS NULL OR ciphertext = '' THEN
    RETURN NULL;
  END IF;
  
  SELECT key_value INTO key_bytes 
  FROM private.encryption_keys 
  WHERE key_name = 'master_key';
  
  BEGIN
    decrypted := pgp_sym_decrypt(decode(ciphertext, 'base64'), encode(key_bytes, 'hex'));
    RETURN decrypted;
  EXCEPTION WHEN OTHERS THEN
    RETURN '[DECRYPTION_ERROR]';
  END;
END;
$$;

-- Add encrypted columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email_encrypted text,
ADD COLUMN IF NOT EXISTS phone_encrypted text,
ADD COLUMN IF NOT EXISTS stripe_customer_id_encrypted text;

-- Add encrypted columns to affiliates table
ALTER TABLE public.affiliates
ADD COLUMN IF NOT EXISTS bank_details_encrypted text,
ADD COLUMN IF NOT EXISTS paypal_email_encrypted text;

-- Add encrypted columns to mortgage_leads table
ALTER TABLE public.mortgage_leads
ADD COLUMN IF NOT EXISTS email_encrypted text,
ADD COLUMN IF NOT EXISTS phone_encrypted text,
ADD COLUMN IF NOT EXISTS monthly_income_encrypted text;

-- Add encrypted columns to golden_visa_submissions table
ALTER TABLE public.golden_visa_submissions
ADD COLUMN IF NOT EXISTS email_encrypted text,
ADD COLUMN IF NOT EXISTS phone_encrypted text,
ADD COLUMN IF NOT EXISTS investment_budget_encrypted text;

-- Add encrypted columns to property_inquiries table
ALTER TABLE public.property_inquiries
ADD COLUMN IF NOT EXISTS email_encrypted text,
ADD COLUMN IF NOT EXISTS phone_encrypted text;

-- Create trigger function to auto-encrypt on insert/update for profiles
CREATE OR REPLACE FUNCTION public.encrypt_profile_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Encrypt email if changed and not already masked
  IF NEW.email IS NOT NULL AND NEW.email != '' AND NEW.email NOT LIKE '***%' THEN
    NEW.email_encrypted := public.encrypt_sensitive(NEW.email);
    NEW.email := SUBSTRING(NEW.email FROM 1 FOR 2) || '***@***.' || SUBSTRING(NEW.email FROM POSITION('@' IN NEW.email) + LENGTH(SUBSTRING(NEW.email FROM POSITION('@' IN NEW.email))) - 2);
  END IF;
  
  -- Encrypt stripe_customer_id if changed and not already masked
  IF NEW.stripe_customer_id IS NOT NULL AND NEW.stripe_customer_id != '' AND NEW.stripe_customer_id NOT LIKE 'cus_***%' THEN
    NEW.stripe_customer_id_encrypted := public.encrypt_sensitive(NEW.stripe_customer_id);
    NEW.stripe_customer_id := 'cus_***masked***';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for profiles
DROP TRIGGER IF EXISTS encrypt_profile_trigger ON public.profiles;
CREATE TRIGGER encrypt_profile_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.encrypt_profile_fields();

-- Create trigger function for mortgage_leads
CREATE OR REPLACE FUNCTION public.encrypt_mortgage_lead_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email IS NOT NULL AND NEW.email != '' AND NEW.email_encrypted IS NULL THEN
    NEW.email_encrypted := public.encrypt_sensitive(NEW.email);
  END IF;
  
  IF NEW.phone IS NOT NULL AND NEW.phone != '' AND NEW.phone_encrypted IS NULL THEN
    NEW.phone_encrypted := public.encrypt_sensitive(NEW.phone);
  END IF;
  
  IF NEW.monthly_income_range IS NOT NULL AND NEW.monthly_income_encrypted IS NULL THEN
    NEW.monthly_income_encrypted := public.encrypt_sensitive(NEW.monthly_income_range);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for mortgage_leads
DROP TRIGGER IF EXISTS encrypt_mortgage_lead_trigger ON public.mortgage_leads;
CREATE TRIGGER encrypt_mortgage_lead_trigger
  BEFORE INSERT OR UPDATE ON public.mortgage_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.encrypt_mortgage_lead_fields();

-- Create trigger function for affiliates
CREATE OR REPLACE FUNCTION public.encrypt_affiliate_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.bank_details IS NOT NULL AND NEW.bank_details::text != '{"masked": true}' AND NEW.bank_details_encrypted IS NULL THEN
    NEW.bank_details_encrypted := public.encrypt_sensitive(NEW.bank_details::text);
    NEW.bank_details := '{"masked": true}'::jsonb;
  END IF;
  
  IF NEW.paypal_email IS NOT NULL AND NEW.paypal_email != '' AND NEW.paypal_email NOT LIKE '***%' THEN
    NEW.paypal_email_encrypted := public.encrypt_sensitive(NEW.paypal_email);
    NEW.paypal_email := '***@***.***';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for affiliates
DROP TRIGGER IF EXISTS encrypt_affiliate_trigger ON public.affiliates;
CREATE TRIGGER encrypt_affiliate_trigger
  BEFORE INSERT OR UPDATE ON public.affiliates
  FOR EACH ROW
  EXECUTE FUNCTION public.encrypt_affiliate_fields();

-- Create trigger function for property_inquiries
CREATE OR REPLACE FUNCTION public.encrypt_inquiry_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email IS NOT NULL AND NEW.email != '' AND NEW.email_encrypted IS NULL THEN
    NEW.email_encrypted := public.encrypt_sensitive(NEW.email);
  END IF;
  
  IF NEW.phone IS NOT NULL AND NEW.phone != '' AND NEW.phone_encrypted IS NULL THEN
    NEW.phone_encrypted := public.encrypt_sensitive(NEW.phone);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for property_inquiries
DROP TRIGGER IF EXISTS encrypt_inquiry_trigger ON public.property_inquiries;
CREATE TRIGGER encrypt_inquiry_trigger
  BEFORE INSERT OR UPDATE ON public.property_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.encrypt_inquiry_fields();

-- Create audit log for sensitive data access
CREATE TABLE IF NOT EXISTS public.sensitive_data_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  table_name text NOT NULL,
  record_id uuid,
  action text NOT NULL,
  accessed_at timestamptz DEFAULT now(),
  ip_address text,
  user_agent text
);

-- Enable RLS on audit log
ALTER TABLE public.sensitive_data_access_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
  ON public.sensitive_data_access_log
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- System can insert audit logs
CREATE POLICY "System can insert audit logs"
  ON public.sensitive_data_access_log
  FOR INSERT
  WITH CHECK (true);

-- Create function to get decrypted data (only for authorized users)
CREATE OR REPLACE FUNCTION public.get_decrypted_profile_email(profile_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email_encrypted text;
  v_decrypted text;
BEGIN
  -- Only allow access to own data or admin
  IF auth.uid() != profile_id AND NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN NULL;
  END IF;
  
  SELECT email_encrypted INTO v_email_encrypted
  FROM public.profiles
  WHERE id = profile_id;
  
  IF v_email_encrypted IS NULL THEN
    RETURN NULL;
  END IF;
  
  v_decrypted := public.decrypt_sensitive(v_email_encrypted);
  
  -- Log access
  INSERT INTO public.sensitive_data_access_log (user_id, table_name, record_id, action)
  VALUES (auth.uid(), 'profiles', profile_id, 'decrypt_email');
  
  RETURN v_decrypted;
END;
$$;

-- Create function to get decrypted affiliate bank details (admin only)
CREATE OR REPLACE FUNCTION public.get_decrypted_affiliate_bank_details(affiliate_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_encrypted text;
  v_decrypted text;
  v_user_id uuid;
BEGIN
  -- Get the affiliate's user_id
  SELECT user_id INTO v_user_id FROM public.affiliates WHERE id = affiliate_id;
  
  -- Only allow access to own data or admin
  IF auth.uid() != v_user_id AND NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN NULL;
  END IF;
  
  SELECT bank_details_encrypted INTO v_encrypted
  FROM public.affiliates
  WHERE id = affiliate_id;
  
  IF v_encrypted IS NULL THEN
    RETURN NULL;
  END IF;
  
  v_decrypted := public.decrypt_sensitive(v_encrypted);
  
  -- Log access
  INSERT INTO public.sensitive_data_access_log (user_id, table_name, record_id, action)
  VALUES (auth.uid(), 'affiliates', affiliate_id, 'decrypt_bank_details');
  
  RETURN v_decrypted::jsonb;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$;