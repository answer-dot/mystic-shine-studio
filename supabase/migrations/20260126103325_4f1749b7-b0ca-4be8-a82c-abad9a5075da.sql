-- Allow upsert (insert or update) on site_settings for admin use
CREATE POLICY "Allow site settings insert"
ON public.site_settings
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow site settings update"
ON public.site_settings
FOR UPDATE
USING (true)
WITH CHECK (true);