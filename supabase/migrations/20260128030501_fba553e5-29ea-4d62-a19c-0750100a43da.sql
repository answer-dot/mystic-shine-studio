-- Enable realtime for inquiries table (for webinar registration notifications)
ALTER PUBLICATION supabase_realtime ADD TABLE public.inquiries;