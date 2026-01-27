-- Create event-images storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-images', 'event-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users (admins) to upload
CREATE POLICY "Admins can upload event images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'event-images' AND is_admin(auth.uid()));

-- Allow authenticated users (admins) to update
CREATE POLICY "Admins can update event images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'event-images' AND is_admin(auth.uid()));

-- Allow authenticated users (admins) to delete
CREATE POLICY "Admins can delete event images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'event-images' AND is_admin(auth.uid()));

-- Allow public viewing
CREATE POLICY "Anyone can view event images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'event-images');