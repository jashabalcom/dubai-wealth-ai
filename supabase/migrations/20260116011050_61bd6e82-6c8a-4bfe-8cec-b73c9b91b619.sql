
-- Create decryption function for profile phone
CREATE OR REPLACE FUNCTION public.get_decrypted_profile_phone(profile_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_phone_encrypted text;
  v_decrypted text;
BEGIN
  -- Only allow access to own data or admin
  IF auth.uid() != profile_id AND NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN NULL;
  END IF;
  
  SELECT phone_encrypted INTO v_phone_encrypted
  FROM public.profiles
  WHERE id = profile_id;
  
  IF v_phone_encrypted IS NULL THEN
    RETURN NULL;
  END IF;
  
  v_decrypted := public.decrypt_sensitive(v_phone_encrypted);
  
  -- Log access
  INSERT INTO public.sensitive_data_access_log (user_id, table_name, record_id, action)
  VALUES (auth.uid(), 'profiles', profile_id, 'decrypt_phone');
  
  RETURN v_decrypted;
END;
$$;

-- Create decryption function for mortgage lead contact info
CREATE OR REPLACE FUNCTION public.get_decrypted_mortgage_lead_contact(lead_id uuid)
RETURNS TABLE(email text, phone text, monthly_income text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email_encrypted text;
  v_phone_encrypted text;
  v_income_encrypted text;
BEGIN
  -- Only admin can access
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN;
  END IF;
  
  SELECT 
    ml.email_encrypted,
    ml.phone_encrypted,
    ml.monthly_income_encrypted
  INTO v_email_encrypted, v_phone_encrypted, v_income_encrypted
  FROM public.mortgage_leads ml
  WHERE ml.id = lead_id;
  
  -- Log access
  INSERT INTO public.sensitive_data_access_log (user_id, table_name, record_id, action)
  VALUES (auth.uid(), 'mortgage_leads', lead_id, 'decrypt_contact');
  
  RETURN QUERY SELECT 
    public.decrypt_sensitive(v_email_encrypted),
    public.decrypt_sensitive(v_phone_encrypted),
    public.decrypt_sensitive(v_income_encrypted);
END;
$$;

-- Create decryption function for property inquiry contact info
CREATE OR REPLACE FUNCTION public.get_decrypted_inquiry_contact(inquiry_id uuid)
RETURNS TABLE(email text, phone text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email_encrypted text;
  v_phone_encrypted text;
BEGIN
  -- Only admin can access
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN;
  END IF;
  
  SELECT 
    pi.email_encrypted,
    pi.phone_encrypted
  INTO v_email_encrypted, v_phone_encrypted
  FROM public.property_inquiries pi
  WHERE pi.id = inquiry_id;
  
  -- Log access
  INSERT INTO public.sensitive_data_access_log (user_id, table_name, record_id, action)
  VALUES (auth.uid(), 'property_inquiries', inquiry_id, 'decrypt_contact');
  
  RETURN QUERY SELECT 
    public.decrypt_sensitive(v_email_encrypted),
    public.decrypt_sensitive(v_phone_encrypted);
END;
$$;

-- Create decryption function for golden visa contact info
CREATE OR REPLACE FUNCTION public.get_decrypted_golden_visa_contact(submission_id uuid)
RETURNS TABLE(email text, phone text, investment_budget text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email_encrypted text;
  v_phone_encrypted text;
  v_budget_encrypted text;
BEGIN
  -- Only admin can access
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN;
  END IF;
  
  SELECT 
    gv.email_encrypted,
    gv.phone_encrypted,
    gv.investment_budget_encrypted
  INTO v_email_encrypted, v_phone_encrypted, v_budget_encrypted
  FROM public.golden_visa_submissions gv
  WHERE gv.id = submission_id;
  
  -- Log access
  INSERT INTO public.sensitive_data_access_log (user_id, table_name, record_id, action)
  VALUES (auth.uid(), 'golden_visa_submissions', submission_id, 'decrypt_contact');
  
  RETURN QUERY SELECT 
    public.decrypt_sensitive(v_email_encrypted),
    public.decrypt_sensitive(v_phone_encrypted),
    public.decrypt_sensitive(v_budget_encrypted);
END;
$$;

-- Create decryption function for affiliate PayPal email
CREATE OR REPLACE FUNCTION public.get_decrypted_affiliate_paypal(affiliate_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_paypal_encrypted text;
  v_user_id uuid;
BEGIN
  -- Get the affiliate's user_id
  SELECT user_id INTO v_user_id FROM public.affiliates WHERE id = affiliate_id;
  
  -- Only allow access to own data or admin
  IF auth.uid() != v_user_id AND NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN NULL;
  END IF;
  
  SELECT paypal_email_encrypted INTO v_paypal_encrypted
  FROM public.affiliates
  WHERE id = affiliate_id;
  
  IF v_paypal_encrypted IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Log access
  INSERT INTO public.sensitive_data_access_log (user_id, table_name, record_id, action)
  VALUES (auth.uid(), 'affiliates', affiliate_id, 'decrypt_paypal');
  
  RETURN public.decrypt_sensitive(v_paypal_encrypted);
END;
$$;
