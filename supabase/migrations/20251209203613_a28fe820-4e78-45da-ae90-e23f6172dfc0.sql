-- Allow admins to upload agent avatars to avatars/agents/ folder
CREATE POLICY "Admins can upload agent avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = 'agents'
  AND public.has_role(auth.uid(), 'admin')
);

-- Allow admins to update agent avatars
CREATE POLICY "Admins can update agent avatars"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = 'agents'
  AND public.has_role(auth.uid(), 'admin')
);

-- Allow admins to delete agent avatars
CREATE POLICY "Admins can delete agent avatars"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = 'agents'
  AND public.has_role(auth.uid(), 'admin')
);