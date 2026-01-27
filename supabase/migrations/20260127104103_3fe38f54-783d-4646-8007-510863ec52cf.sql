-- Create storage bucket for course videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-videos', 'course-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload videos
CREATE POLICY "Authenticated users can upload videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'course-videos' 
  AND auth.role() = 'authenticated'
);

-- Allow anyone to view videos (for playback)
CREATE POLICY "Anyone can view course videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'course-videos');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update videos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'course-videos' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete videos
CREATE POLICY "Authenticated users can delete videos"
ON storage.objects FOR DELETE
USING (bucket_id = 'course-videos' AND auth.role() = 'authenticated');