-- Create dedicated webinar_registrations table
CREATE TABLE public.webinar_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  agreed_terms BOOLEAN NOT NULL DEFAULT true,
  agreed_privacy BOOLEAN NOT NULL DEFAULT true,
  webinar_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique constraint to prevent duplicate registrations
CREATE UNIQUE INDEX idx_webinar_registrations_email ON public.webinar_registrations(email);

-- Enable Row Level Security
ALTER TABLE public.webinar_registrations ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public registration without login)
CREATE POLICY "Anyone can register for webinar"
ON public.webinar_registrations
FOR INSERT
TO public
WITH CHECK (true);

-- Only admins can view registrations
CREATE POLICY "Admins can view webinar registrations"
ON public.webinar_registrations
FOR SELECT
USING (is_admin(auth.uid()));

-- Only admins can delete registrations
CREATE POLICY "Admins can delete webinar registrations"
ON public.webinar_registrations
FOR DELETE
USING (is_admin(auth.uid()));

-- Enable realtime for the new table
ALTER PUBLICATION supabase_realtime ADD TABLE public.webinar_registrations;

-- Create trigger to notify on new registration
CREATE OR REPLACE FUNCTION public.notify_webinar_registration()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (type, title, message, data)
  VALUES (
    'webinar_registration',
    '🎉 새 웨비나 신청',
    NEW.name || '님이 웨비나에 신청했습니다.',
    jsonb_build_object('registration_id', NEW.id, 'name', NEW.name, 'email', NEW.email, 'phone', NEW.phone)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_webinar_registration
AFTER INSERT ON public.webinar_registrations
FOR EACH ROW
EXECUTE FUNCTION public.notify_webinar_registration();