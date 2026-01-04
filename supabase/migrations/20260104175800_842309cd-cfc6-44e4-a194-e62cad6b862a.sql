-- Create storage bucket for project documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-documents', 'project-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Public read access for project documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-documents');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload project documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'project-documents' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete project documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'project-documents' AND auth.role() = 'authenticated');

-- Seed sample media URLs for flagship projects
UPDATE developer_projects
SET 
  video_url = 'https://www.youtube.com/watch?v=jFGKJBPFdUA',
  virtual_tour_url = 'https://my.matterport.com/show/?m=SxQL3iGyvsk'
WHERE slug = 'dubai-creek-harbour';

UPDATE developer_projects
SET 
  video_url = 'https://www.youtube.com/watch?v=k_MHk6mKpjE',
  virtual_tour_url = 'https://my.matterport.com/show/?m=WB7S8hfLVGj'
WHERE slug = 'palm-jebel-ali';

UPDATE developer_projects
SET 
  video_url = 'https://www.youtube.com/watch?v=q7TdRBbPJMs',
  virtual_tour_url = 'https://my.matterport.com/show/?m=iR2VKqDR4Uc'
WHERE slug = 'dubai-hills-estate';