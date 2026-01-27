
-- Add response fields to inquiries table
ALTER TABLE public.inquiries 
ADD COLUMN IF NOT EXISTS response text,
ADD COLUMN IF NOT EXISTS responded_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS responded_by uuid,
ADD COLUMN IF NOT EXISTS user_id uuid;

-- Create blacklist_alerts table for real-time notifications
CREATE TABLE public.blacklist_alerts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  user_name text,
  alert_type text NOT NULL DEFAULT 'login_attempt',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on blacklist_alerts
ALTER TABLE public.blacklist_alerts ENABLE ROW LEVEL SECURITY;

-- Policies for blacklist_alerts (admin only access)
CREATE POLICY "Authenticated users can view blacklist alerts"
ON public.blacklist_alerts FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert blacklist alerts"
ON public.blacklist_alerts FOR INSERT
WITH CHECK (true);

CREATE POLICY "Authenticated users can update blacklist alerts"
ON public.blacklist_alerts FOR UPDATE
USING (true);

CREATE POLICY "Authenticated users can delete blacklist alerts"
ON public.blacklist_alerts FOR DELETE
USING (true);

-- Add RLS policy for inquiries update (for responses)
CREATE POLICY "Authenticated users can update inquiries"
ON public.inquiries FOR UPDATE
USING (true);

-- Enable realtime for blacklist_alerts
ALTER PUBLICATION supabase_realtime ADD TABLE public.blacklist_alerts;
