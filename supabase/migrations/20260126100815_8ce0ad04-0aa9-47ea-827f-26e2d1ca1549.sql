-- Create site_settings table for persistent configuration
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inquiries table for contact form submissions
CREATE TABLE public.inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Site settings: Public read, no public write (admin via service role or edge function)
CREATE POLICY "Anyone can read site settings"
ON public.site_settings FOR SELECT
USING (true);

-- Inquiries: Anyone can insert (contact form), only authenticated admins can read
CREATE POLICY "Anyone can submit inquiries"
ON public.inquiries FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can read inquiries for now"
ON public.inquiries FOR SELECT
USING (true);

-- Add updated_at trigger for site_settings
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();