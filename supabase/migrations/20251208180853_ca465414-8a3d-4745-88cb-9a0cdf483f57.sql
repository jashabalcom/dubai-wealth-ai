-- Create storage bucket for course content (PDFs, images, resources)
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-content', 'course-content', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for course-content bucket
-- Anyone can view course content (public bucket)
CREATE POLICY "Anyone can view course content"
ON storage.objects FOR SELECT
USING (bucket_id = 'course-content');

-- Only admins can upload course content
CREATE POLICY "Admins can upload course content"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'course-content' 
  AND public.has_role(auth.uid(), 'admin')
);

-- Only admins can update course content
CREATE POLICY "Admins can update course content"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'course-content' 
  AND public.has_role(auth.uid(), 'admin')
);

-- Only admins can delete course content
CREATE POLICY "Admins can delete course content"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'course-content' 
  AND public.has_role(auth.uid(), 'admin')
);