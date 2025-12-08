-- Create golden_visa_submissions table
CREATE TABLE public.golden_visa_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  nationality TEXT NOT NULL,
  current_residence TEXT NOT NULL,
  investment_budget TEXT NOT NULL,
  investment_type TEXT NOT NULL,
  timeline TEXT NOT NULL,
  family_size INTEGER NOT NULL DEFAULT 1,
  additional_notes TEXT,
  ai_summary TEXT,
  ai_recommendations JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.golden_visa_submissions ENABLE ROW LEVEL SECURITY;

-- Users can view their own submissions
CREATE POLICY "Users can view their own submissions"
ON public.golden_visa_submissions
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create submissions
CREATE POLICY "Users can create submissions"
ON public.golden_visa_submissions
FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Index
CREATE INDEX idx_golden_visa_user ON public.golden_visa_submissions(user_id);