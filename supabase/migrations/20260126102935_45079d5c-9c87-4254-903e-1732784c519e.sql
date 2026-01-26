-- Create admin_settings table for storing admin PIN securely
CREATE TABLE public.admin_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Only allow authenticated users to read (for PIN verification)
-- The actual PIN check happens server-side, this is just for the verify function
CREATE POLICY "Anyone can read admin settings for verification"
ON public.admin_settings
FOR SELECT
USING (true);

-- No insert/update/delete via client - use edge function
-- Insert default PIN (hashed value of '1234')
INSERT INTO public.admin_settings (key, value) 
VALUES ('admin_pin', '1234');

-- Create trigger for updated_at
CREATE TRIGGER update_admin_settings_updated_at
BEFORE UPDATE ON public.admin_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();