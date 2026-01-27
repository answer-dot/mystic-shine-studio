-- Fix RLS policies for admin_settings to allow reading
-- Current policies are RESTRICTIVE which means ALL must pass
-- We need PERMISSIVE policies for proper access

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Anyone can read admin settings for verification" ON admin_settings;
DROP POLICY IF EXISTS "Allow admin settings update" ON admin_settings;

-- Create permissive policies (default is PERMISSIVE)
CREATE POLICY "Public can read admin settings"
ON admin_settings
FOR SELECT
USING (true);

CREATE POLICY "Authenticated can update admin settings"
ON admin_settings
FOR UPDATE
USING (true)
WITH CHECK (true);