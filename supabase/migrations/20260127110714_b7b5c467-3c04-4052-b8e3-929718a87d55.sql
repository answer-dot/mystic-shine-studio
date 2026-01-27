-- Create admin role enum and admin_roles table for proper role management
CREATE TYPE public.admin_role AS ENUM ('admin', 'super_admin');

-- Create admin roles table (NOT on profiles to prevent privilege escalation)
CREATE TABLE public.admin_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role admin_role NOT NULL DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check admin role
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_roles
    WHERE user_id = _user_id
  )
$$;

-- RLS policies for admin_roles (only admins can view, no self-management)
CREATE POLICY "Admins can view admin roles"
ON public.admin_roles
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Now fix the storage policies: Remove anon access, keep authenticated only
DROP POLICY IF EXISTS "Allow video uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow video updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow video viewing" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload videos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view course videos" ON storage.objects;

-- Recreate with authenticated-only access
CREATE POLICY "Authenticated users can upload videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'course-videos');

CREATE POLICY "Authenticated users can update videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'course-videos')
WITH CHECK (bucket_id = 'course-videos');

CREATE POLICY "Anyone can view course videos"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'course-videos');

-- Trigger for updated_at
CREATE TRIGGER update_admin_roles_updated_at
BEFORE UPDATE ON public.admin_roles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();