-- Add preferred country and language columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN preferred_country text DEFAULT 'TR',
ADD COLUMN preferred_language text DEFAULT 'tr';