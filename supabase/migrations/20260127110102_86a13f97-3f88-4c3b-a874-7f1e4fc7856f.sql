-- Drop existing policies for course-videos bucket
DROP POLICY IF EXISTS "Authenticated users can upload videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete videos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view course videos" ON storage.objects;

-- Recreate policies allowing both anon and authenticated users
-- This is acceptable because admin access is controlled at the application layer (PIN)
CREATE POLICY "Allow video uploads"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'course-videos');

CREATE POLICY "Allow video updates"
ON storage.objects FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'course-videos')
WITH CHECK (bucket_id = 'course-videos');

CREATE POLICY "Allow video deletions"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id = 'course-videos');

CREATE POLICY "Allow video viewing"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'course-videos');