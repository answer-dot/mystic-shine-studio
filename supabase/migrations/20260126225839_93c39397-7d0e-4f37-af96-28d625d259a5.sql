-- Create courses table for multi-course support
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  image_url TEXT,
  price TEXT DEFAULT '₩0',
  original_price TEXT,
  duration TEXT DEFAULT '1주',
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  curriculum JSONB DEFAULT '[]'::jsonb,
  features JSONB DEFAULT '[]'::jsonb,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (published courses only)
CREATE POLICY "Anyone can view published courses"
ON public.courses
FOR SELECT
USING (is_published = true);

-- Create policy for authenticated users to view all courses (for admin purposes later)
CREATE POLICY "Authenticated users can view all courses"
ON public.courses
FOR SELECT
TO authenticated
USING (true);

-- Create policy for insert (will be restricted to admin later)
CREATE POLICY "Allow course insert"
ON public.courses
FOR INSERT
WITH CHECK (true);

-- Create policy for update
CREATE POLICY "Allow course update"
ON public.courses
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_courses_updated_at
BEFORE UPDATE ON public.courses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create user_courses table to track course purchases/enrollments
CREATE TABLE public.user_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  progress JSONB DEFAULT '{}'::jsonb,
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, course_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_courses ENABLE ROW LEVEL SECURITY;

-- Users can view their own enrollments
CREATE POLICY "Users can view their own enrollments"
ON public.user_courses
FOR SELECT
USING (auth.uid() = user_id);

-- Users can enroll themselves
CREATE POLICY "Users can enroll in courses"
ON public.user_courses
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update their own progress"
ON public.user_courses
FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for user_courses
CREATE TRIGGER update_user_courses_updated_at
BEFORE UPDATE ON public.user_courses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert a default featured course based on current site content
INSERT INTO public.courses (title, slug, description, short_description, price, original_price, duration, is_featured, is_published, curriculum, features)
VALUES (
  '타로 마스터 과정',
  'tarot-master',
  '처음 시작하는 분도 전문 리더가 될 수 있도록 설계된 체계적인 14주 커리큘럼',
  '타로의 신비로운 세계에 입문하세요',
  '₩490,000',
  '₩890,000',
  '14주',
  true,
  true,
  '[]'::jsonb,
  '["14주 완성 체계적 커리큘럼", "평생 무제한 영상 시청", "주 2회 라이브 Q&A 세션", "수강생 전용 커뮤니티 접근", "1:1 피드백 무제한", "수료증 발급", "보너스: 비즈니스 가이드북"]'::jsonb
);