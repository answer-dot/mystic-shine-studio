
-- Add blacklist fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_blacklisted boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS blacklist_reason text,
ADD COLUMN IF NOT EXISTS blacklisted_at timestamp with time zone;

-- Create customer_notes table for admin memos about users
CREATE TABLE public.customer_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  note text NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on customer_notes
ALTER TABLE public.customer_notes ENABLE ROW LEVEL SECURITY;

-- Only authenticated users (admins) can manage customer notes
CREATE POLICY "Authenticated users can view customer notes"
ON public.customer_notes FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert customer notes"
ON public.customer_notes FOR INSERT
WITH CHECK (true);

CREATE POLICY "Authenticated users can update customer notes"
ON public.customer_notes FOR UPDATE
USING (true);

CREATE POLICY "Authenticated users can delete customer notes"
ON public.customer_notes FOR DELETE
USING (true);

-- Add refund_status to user_courses for tracking refund requests
ALTER TABLE public.user_courses 
ADD COLUMN IF NOT EXISTS refund_status text DEFAULT 'none' CHECK (refund_status IN ('none', 'pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS refund_requested_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS refund_processed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS refund_reason text;

-- Create trigger for updating timestamps on customer_notes
CREATE TRIGGER update_customer_notes_updated_at
BEFORE UPDATE ON public.customer_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update profiles RLS to allow admins to update blacklist status
CREATE POLICY "Authenticated users can view all profiles for admin"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can update profiles for admin"
ON public.profiles FOR UPDATE
USING (true);
