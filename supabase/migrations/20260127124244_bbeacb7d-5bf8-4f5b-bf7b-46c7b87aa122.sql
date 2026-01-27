-- Add a policy to allow anyone to check if admins exist (for bootstrap detection)
-- This is needed so the auth page can determine whether to show first admin setup
CREATE POLICY "Anyone can check if admins exist"
ON public.admin_roles
FOR SELECT
USING (true);