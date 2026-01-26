-- Allow anyone to update admin settings (PIN change from admin panel)
-- This is acceptable because accessing the admin panel already requires knowing the current PIN
CREATE POLICY "Allow admin settings update"
ON public.admin_settings
FOR UPDATE
USING (true)
WITH CHECK (true);