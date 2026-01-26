-- Create storage bucket for review images
INSERT INTO storage.buckets (id, name, public)
VALUES ('review-images', 'review-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload review images
CREATE POLICY "Authenticated users can upload review images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'review-images');

-- Allow public read access to review images
CREATE POLICY "Anyone can view review images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'review-images');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update review images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'review-images');

-- Allow authenticated users to delete review images
CREATE POLICY "Authenticated users can delete review images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'review-images');

-- Add admin_uploaded flag and customer_name to reviews table
ALTER TABLE public.reviews
ADD COLUMN IF NOT EXISTS is_admin_uploaded boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS customer_name text;