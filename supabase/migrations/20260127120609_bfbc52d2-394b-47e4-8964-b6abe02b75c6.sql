-- SECURITY FIX: Tighten RLS policies to require admin role

-- 1. Fix blacklist_alerts - Only admins should access
DROP POLICY IF EXISTS "Authenticated users can delete blacklist alerts" ON public.blacklist_alerts;
DROP POLICY IF EXISTS "Authenticated users can insert blacklist alerts" ON public.blacklist_alerts;
DROP POLICY IF EXISTS "Authenticated users can update blacklist alerts" ON public.blacklist_alerts;
DROP POLICY IF EXISTS "Authenticated users can view blacklist alerts" ON public.blacklist_alerts;

CREATE POLICY "Admins can view blacklist alerts" ON public.blacklist_alerts
FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert blacklist alerts" ON public.blacklist_alerts
FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update blacklist alerts" ON public.blacklist_alerts
FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete blacklist alerts" ON public.blacklist_alerts
FOR DELETE USING (is_admin(auth.uid()));

-- 2. Fix customer_notes - Only admins should access
DROP POLICY IF EXISTS "Authenticated users can delete customer notes" ON public.customer_notes;
DROP POLICY IF EXISTS "Authenticated users can insert customer notes" ON public.customer_notes;
DROP POLICY IF EXISTS "Authenticated users can update customer notes" ON public.customer_notes;
DROP POLICY IF EXISTS "Authenticated users can view customer notes" ON public.customer_notes;

CREATE POLICY "Admins can view customer notes" ON public.customer_notes
FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert customer notes" ON public.customer_notes
FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update customer notes" ON public.customer_notes
FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete customer notes" ON public.customer_notes
FOR DELETE USING (is_admin(auth.uid()));

-- 3. Fix notifications - Only admins should access
DROP POLICY IF EXISTS "Authenticated users can delete notifications" ON public.notifications;
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Authenticated users can update notifications" ON public.notifications;
DROP POLICY IF EXISTS "Authenticated users can view notifications" ON public.notifications;

CREATE POLICY "Admins can view notifications" ON public.notifications
FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "System can insert notifications" ON public.notifications
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update notifications" ON public.notifications
FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete notifications" ON public.notifications
FOR DELETE USING (is_admin(auth.uid()));

-- 4. Fix course_materials - Only admins can modify, enrolled users can view
DROP POLICY IF EXISTS "Authenticated users can delete materials" ON public.course_materials;
DROP POLICY IF EXISTS "Authenticated users can insert materials" ON public.course_materials;
DROP POLICY IF EXISTS "Authenticated users can update materials" ON public.course_materials;

CREATE POLICY "Admins can insert materials" ON public.course_materials
FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update materials" ON public.course_materials
FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete materials" ON public.course_materials
FOR DELETE USING (is_admin(auth.uid()));

-- 5. Fix courses - Only admins can modify
DROP POLICY IF EXISTS "Allow course insert" ON public.courses;
DROP POLICY IF EXISTS "Allow course update" ON public.courses;

CREATE POLICY "Admins can insert courses" ON public.courses
FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update courses" ON public.courses
FOR UPDATE USING (is_admin(auth.uid()));

-- 6. Fix inquiries - Only admins can update (users can submit)
DROP POLICY IF EXISTS "Authenticated users can update inquiries" ON public.inquiries;

CREATE POLICY "Admins can update inquiries" ON public.inquiries
FOR UPDATE USING (is_admin(auth.uid()));

-- 7. Fix site_settings - Only admins can modify
DROP POLICY IF EXISTS "Allow site settings insert" ON public.site_settings;
DROP POLICY IF EXISTS "Allow site settings update" ON public.site_settings;

CREATE POLICY "Admins can insert site settings" ON public.site_settings
FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update site settings" ON public.site_settings
FOR UPDATE USING (is_admin(auth.uid()));

-- 8. Fix admin_settings - Only admins can update
DROP POLICY IF EXISTS "Authenticated can update admin settings" ON public.admin_settings;

CREATE POLICY "Admins can update admin settings" ON public.admin_settings
FOR UPDATE USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- 9. Fix profiles - Admins can manage all, users can only view/update own
DROP POLICY IF EXISTS "Authenticated users can update profiles for admin" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view all profiles for admin" ON public.profiles;

CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all profiles" ON public.profiles
FOR UPDATE USING (is_admin(auth.uid()));