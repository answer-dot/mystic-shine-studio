-- Fix overly permissive RLS policies for reviews

-- Drop the problematic policies
DROP POLICY IF EXISTS "Authenticated users can view all reviews for admin" ON public.reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;

-- Create proper admin check function
CREATE OR REPLACE FUNCTION public.is_admin_by_pin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_settings 
    WHERE key = 'admin_pin' 
    AND value IS NOT NULL
  )
$$;

-- Recreate policies with proper restrictions
-- Admin can view all reviews (for admin dashboard - will use service role or edge function)
CREATE POLICY "Users can view their own reviews"
  ON public.reviews FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_approved = true);

-- Only users can update their own reviews (not admin approve - that needs edge function)
CREATE POLICY "Users can update only their own reviews"
  ON public.reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);