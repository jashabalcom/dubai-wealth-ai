-- Create user_consents table for immutable audit trail
CREATE TABLE public.user_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  form_type text NOT NULL,
  consent_type text NOT NULL,
  consent_given boolean NOT NULL,
  consent_text text NOT NULL,
  consent_version text NOT NULL DEFAULT '1.0',
  ip_address text,
  user_agent text,
  related_record_id uuid,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;

-- Users can insert their own consents (or anonymous for guests)
CREATE POLICY "Users can insert own consents" ON public.user_consents
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Users can read their own consents
CREATE POLICY "Users can read own consents" ON public.user_consents
  FOR SELECT USING (auth.uid() = user_id);

-- Add consent columns to property_inquiries
ALTER TABLE public.property_inquiries 
  ADD COLUMN IF NOT EXISTS agent_sharing_consent boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS data_consent boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_timestamp timestamptz;

-- Add consent columns to golden_visa_submissions
ALTER TABLE public.golden_visa_submissions 
  ADD COLUMN IF NOT EXISTS ai_processing_consent boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS marketing_consent boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_timestamp timestamptz;