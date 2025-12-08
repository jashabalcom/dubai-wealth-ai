-- Add directory visibility and profile fields
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_visible_in_directory boolean DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS linkedin_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS looking_for text;

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create policy for users to view their own profile
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Create policy for authenticated users to view directory-visible profiles
CREATE POLICY "Authenticated users can view directory profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (is_visible_in_directory = true);