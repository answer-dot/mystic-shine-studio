-- Create notifications table for admin alerts
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL, -- 'inquiry', 'enrollment', 'blacklist_alert'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for authenticated users (admins)
CREATE POLICY "Authenticated users can view notifications"
  ON public.notifications FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update notifications"
  ON public.notifications FOR UPDATE
  USING (true);

CREATE POLICY "Authenticated users can delete notifications"
  ON public.notifications FOR DELETE
  USING (true);

-- Enable realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Create function to auto-create notification on new inquiry
CREATE OR REPLACE FUNCTION public.notify_new_inquiry()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (type, title, message, data)
  VALUES (
    'inquiry',
    '새 문의가 등록되었습니다',
    NEW.name || '님이 문의를 남겼습니다.',
    jsonb_build_object('inquiry_id', NEW.id, 'name', NEW.name, 'email', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new inquiries
CREATE TRIGGER on_new_inquiry
  AFTER INSERT ON public.inquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_inquiry();

-- Create function to auto-create notification on new enrollment
CREATE OR REPLACE FUNCTION public.notify_new_enrollment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  course_title TEXT;
  user_name TEXT;
BEGIN
  SELECT title INTO course_title FROM public.courses WHERE id = NEW.course_id;
  SELECT display_name INTO user_name FROM public.profiles WHERE user_id = NEW.user_id;
  
  INSERT INTO public.notifications (type, title, message, data)
  VALUES (
    'enrollment',
    '새 수강 등록이 발생했습니다',
    COALESCE(user_name, '회원') || '님이 ' || COALESCE(course_title, '강의') || '를 등록했습니다.',
    jsonb_build_object('enrollment_id', NEW.id, 'course_id', NEW.course_id, 'user_id', NEW.user_id)
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new enrollments
CREATE TRIGGER on_new_enrollment
  AFTER INSERT ON public.user_courses
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_enrollment();

-- Create function to auto-create notification on blacklist alert
CREATE OR REPLACE FUNCTION public.notify_blacklist_alert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (type, title, message, data)
  VALUES (
    'blacklist_alert',
    '⚠️ 블랙리스트 사용자 로그인 시도',
    COALESCE(NEW.user_name, '알 수 없음') || '님이 로그인을 시도했습니다.',
    jsonb_build_object('alert_id', NEW.id, 'user_id', NEW.user_id, 'user_name', NEW.user_name)
  );
  RETURN NEW;
END;
$$;

-- Create trigger for blacklist alerts
CREATE TRIGGER on_blacklist_alert
  AFTER INSERT ON public.blacklist_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_blacklist_alert();