-- Create table for advertise inquiries
CREATE TABLE public.advertise_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.advertise_inquiries ENABLE ROW LEVEL SECURITY;

-- Allow anyone to submit an inquiry (public form)
CREATE POLICY "Anyone can submit advertise inquiries"
ON public.advertise_inquiries
FOR INSERT
WITH CHECK (true);

-- Only allow viewing by authenticated admins (for now, no one can view via client)
CREATE POLICY "No public read access"
ON public.advertise_inquiries
FOR SELECT
USING (false);