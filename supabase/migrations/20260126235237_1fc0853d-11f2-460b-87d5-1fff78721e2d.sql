-- Create storage bucket for course materials (PDFs, ZIPs, etc.)
INSERT INTO storage.buckets (id, name, public) VALUES ('course-materials', 'course-materials', false);

-- Create course_materials table to track downloadable files
CREATE TABLE public.course_materials (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  file_url text NOT NULL,
  file_type text NOT NULL DEFAULT 'pdf',
  file_size bigint,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.course_materials ENABLE ROW LEVEL SECURITY;

-- RLS Policies for course_materials

-- Authenticated users can view materials for courses they're enrolled in
CREATE POLICY "Enrolled users can view course materials"
ON public.course_materials
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_courses
    WHERE user_courses.course_id = course_materials.course_id
    AND user_courses.user_id = auth.uid()
  )
);

-- Admin can manage materials (using service role or authenticated users for now)
CREATE POLICY "Authenticated users can insert materials"
ON public.course_materials
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update materials"
ON public.course_materials
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete materials"
ON public.course_materials
FOR DELETE
TO authenticated
USING (true);

-- Storage policies for course-materials bucket

-- Authenticated users can upload course materials
CREATE POLICY "Authenticated users can upload course materials"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'course-materials');

-- Authenticated users can view course materials (enrollment check done at table level)
CREATE POLICY "Authenticated users can view course materials"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'course-materials');

-- Authenticated users can update course materials
CREATE POLICY "Authenticated users can update course materials"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'course-materials');

-- Authenticated users can delete course materials
CREATE POLICY "Authenticated users can delete course materials"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'course-materials');

-- Add trigger for updated_at
CREATE TRIGGER update_course_materials_updated_at
BEFORE UPDATE ON public.course_materials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();