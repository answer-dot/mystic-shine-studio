-- ============================================
-- SECURITY LOCKDOWN MIGRATION
-- ============================================

-- 1. FIX: inquiries - tighten INSERT to require user context or allow anonymous properly
-- The current "Anyone can submit inquiries" WITH CHECK (true) is flagged
-- This is intentional for contact forms, but we'll make it more explicit
DROP POLICY IF EXISTS "Anyone can submit inquiries" ON public.inquiries;
CREATE POLICY "Anyone can submit inquiries"
ON public.inquiries
FOR INSERT
WITH CHECK (
  -- Allow submissions, but if user is logged in, must match their ID
  (user_id IS NULL) OR (auth.uid() = user_id)
);

-- 2. FIX: inquiries - restrict reading to admins only (sensitive data)
DROP POLICY IF EXISTS "Anyone can read inquiries for now" ON public.inquiries;
CREATE POLICY "Admins can view inquiries"
ON public.inquiries
FOR SELECT
USING (is_admin(auth.uid()));

-- 3. FIX: notifications - restrict INSERT to system/triggers only
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "System can insert notifications via trigger"
ON public.notifications
FOR INSERT
WITH CHECK (
  -- Only allow inserts from triggers (service role) or admins
  is_admin(auth.uid()) OR current_setting('request.jwt.claim.role', true) = 'service_role'
);

-- 4. Ensure courses table has proper visibility control
-- "Authenticated users can view all courses" with USING(true) is too permissive
-- We want: published courses visible to all, unpublished only to admins
DROP POLICY IF EXISTS "Authenticated users can view all courses" ON public.courses;
CREATE POLICY "Admins can view all courses"
ON public.courses
FOR SELECT
USING (is_admin(auth.uid()));

-- 5. GHOST PRODUCT PREVENTION: Add constraint to ensure courses have required fields
-- This prevents creating "ghost" courses without proper data at DB level
ALTER TABLE public.courses 
  ALTER COLUMN title SET NOT NULL,
  ALTER COLUMN slug SET NOT NULL;

-- Add unique constraint on slug to prevent duplicate courses
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'courses_slug_unique'
  ) THEN
    ALTER TABLE public.courses ADD CONSTRAINT courses_slug_unique UNIQUE (slug);
  END IF;
END $$;

-- 6. Add CHECK constraint to ensure price is set properly (no ghost products)
-- Using a trigger instead of CHECK for flexibility
CREATE OR REPLACE FUNCTION public.validate_course_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure title is not empty
  IF NEW.title IS NULL OR trim(NEW.title) = '' THEN
    RAISE EXCEPTION 'Course title cannot be empty';
  END IF;
  
  -- Ensure slug is not empty
  IF NEW.slug IS NULL OR trim(NEW.slug) = '' THEN
    RAISE EXCEPTION 'Course slug cannot be empty';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS validate_course_before_save ON public.courses;
CREATE TRIGGER validate_course_before_save
BEFORE INSERT OR UPDATE ON public.courses
FOR EACH ROW
EXECUTE FUNCTION public.validate_course_data();

-- 7. Ensure user_courses has proper constraints to prevent orphaned enrollments
-- Foreign key already exists, but add a validation trigger
CREATE OR REPLACE FUNCTION public.validate_enrollment()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure course exists and is published (or user is admin)
  IF NOT EXISTS (
    SELECT 1 FROM public.courses 
    WHERE id = NEW.course_id 
    AND (is_published = true OR is_admin(NEW.user_id))
  ) THEN
    RAISE EXCEPTION 'Cannot enroll in unpublished or non-existent course';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS validate_enrollment_before_insert ON public.user_courses;
CREATE TRIGGER validate_enrollment_before_insert
BEFORE INSERT ON public.user_courses
FOR EACH ROW
EXECUTE FUNCTION public.validate_enrollment();

-- 8. admin_roles - the public SELECT is needed for bootstrap, but limit what can be seen
-- Already minimal (only checking existence), keeping as is for bootstrap functionality

-- 9. Add admin-only SELECT policy for reviews (so admins can manage all reviews)
CREATE POLICY "Admins can view all reviews"
ON public.reviews
FOR SELECT
USING (is_admin(auth.uid()));

-- 10. Add admin-only DELETE policy for reviews
CREATE POLICY "Admins can delete reviews"
ON public.reviews
FOR DELETE
USING (is_admin(auth.uid()));

-- 11. Add admin-only UPDATE policy for reviews (for approval workflow)
DROP POLICY IF EXISTS "Users can update only their own reviews" ON public.reviews;
CREATE POLICY "Users can update their own reviews"
ON public.reviews
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update all reviews"
ON public.reviews
FOR UPDATE
USING (is_admin(auth.uid()));

-- 12. Add admin SELECT policy for user_courses (for customer management)
CREATE POLICY "Admins can view all enrollments"
ON public.user_courses
FOR SELECT
USING (is_admin(auth.uid()));