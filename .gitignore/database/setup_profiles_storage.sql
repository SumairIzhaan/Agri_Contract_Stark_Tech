-- Create and configure the 'profiles' storage bucket for profile images
-- This fixes the "row-level security policy" error when uploading profile images

-- 1. Create the 'profiles' bucket (public access for viewing images)
INSERT INTO storage.buckets (id, name, public)
VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public Profile Image Read" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Profile Image Upload" ON storage.objects;
DROP POLICY IF EXISTS "Users Can Update Own Profile Images" ON storage.objects;
DROP POLICY IF EXISTS "Users Can Delete Own Profile Images" ON storage.objects;

-- 3. Create Storage Policies for 'profiles' bucket

-- Policy: Allow everyone to view profile images (public read)
CREATE POLICY "Public Profile Image Read"
ON storage.objects FOR SELECT
USING ( bucket_id = 'profiles' );

-- Policy: Allow authenticated users to upload profile images
CREATE POLICY "Authenticated Profile Image Upload"
ON storage.objects FOR INSERT
WITH CHECK ( 
    bucket_id = 'profiles' 
    AND auth.role() = 'authenticated'
);

-- Policy: Allow users to update their own profile images
-- The filename is user_id.extension, so we check if the name starts with their user ID
CREATE POLICY "Users Can Update Own Profile Images"
ON storage.objects FOR UPDATE
USING ( 
    bucket_id = 'profiles' 
    AND auth.uid()::text = split_part(name, '.', 1)
);

-- Policy: Allow users to delete their own profile images
CREATE POLICY "Users Can Delete Own Profile Images"
ON storage.objects FOR DELETE
USING ( 
    bucket_id = 'profiles' 
    AND auth.uid()::text = split_part(name, '.', 1)
);
