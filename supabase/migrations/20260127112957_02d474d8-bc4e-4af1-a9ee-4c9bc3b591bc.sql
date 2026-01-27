-- Allow first admin bootstrap: INSERT only when no admins exist
CREATE POLICY "Allow first admin bootstrap"
ON public.admin_roles
FOR INSERT
TO authenticated
WITH CHECK (
  NOT EXISTS (SELECT 1 FROM public.admin_roles)
);

-- Allow admins to insert new admin roles
CREATE POLICY "Admins can insert admin roles"
ON public.admin_roles
FOR INSERT
TO authenticated
WITH CHECK (
  is_admin(auth.uid())
);