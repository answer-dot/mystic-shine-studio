-- Enable realtime for site_settings table to allow instant updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.site_settings;