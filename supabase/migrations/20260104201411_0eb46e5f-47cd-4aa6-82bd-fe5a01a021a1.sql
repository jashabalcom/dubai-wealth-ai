-- Create enums for report status and reasons
CREATE TYPE public.report_status AS ENUM ('pending', 'reviewed', 'resolved', 'dismissed');
CREATE TYPE public.report_reason AS ENUM (
  'spam', 
  'harassment', 
  'hate_speech', 
  'misinformation', 
  'inappropriate_content', 
  'scam', 
  'other'
);

-- Create content_reports table
CREATE TABLE public.content_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'comment')),
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.community_comments(id) ON DELETE CASCADE,
  reason public.report_reason NOT NULL,
  details TEXT,
  status public.report_status DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Ensure either post_id or comment_id is set based on content_type
  CONSTRAINT valid_content_reference CHECK (
    (content_type = 'post' AND post_id IS NOT NULL AND comment_id IS NULL) OR
    (content_type = 'comment' AND comment_id IS NOT NULL)
  )
);

-- Create unique index to prevent duplicate reports (allowing NULL values)
CREATE UNIQUE INDEX unique_post_report ON public.content_reports (reporter_id, post_id) 
  WHERE content_type = 'post' AND reporter_id IS NOT NULL;
CREATE UNIQUE INDEX unique_comment_report ON public.content_reports (reporter_id, comment_id) 
  WHERE content_type = 'comment' AND reporter_id IS NOT NULL;

-- Create indexes for performance
CREATE INDEX idx_content_reports_status ON public.content_reports(status);
CREATE INDEX idx_content_reports_created ON public.content_reports(created_at DESC);
CREATE INDEX idx_content_reports_post ON public.content_reports(post_id) WHERE post_id IS NOT NULL;
CREATE INDEX idx_content_reports_comment ON public.content_reports(comment_id) WHERE comment_id IS NOT NULL;

-- Enable RLS
ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;

-- Users can create reports (authenticated)
CREATE POLICY "Users can create reports"
  ON public.content_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

-- Users can view their own reports
CREATE POLICY "Users can view own reports"
  ON public.content_reports
  FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_id);

-- Admins can view all reports
CREATE POLICY "Admins can view all reports"
  ON public.content_reports
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update reports
CREATE POLICY "Admins can update reports"
  ON public.content_reports
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins can delete reports
CREATE POLICY "Admins can delete reports"
  ON public.content_reports
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.content_reports;

-- Add trigger for updated_at
CREATE TRIGGER update_content_reports_updated_at
  BEFORE UPDATE ON public.content_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();