
-- Roommate listings table
CREATE TABLE public.roommate_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  budget_min INTEGER,
  budget_max INTEGER,
  currency TEXT NOT NULL DEFAULT 'USD',
  move_in_date DATE,
  listing_type TEXT NOT NULL DEFAULT 'seeking', -- 'seeking' or 'offering'
  language_code TEXT NOT NULL DEFAULT 'en',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.roommate_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Roommate listings viewable by everyone" ON public.roommate_listings FOR SELECT USING (true);
CREATE POLICY "Users can create their own listings" ON public.roommate_listings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own listings" ON public.roommate_listings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own listings" ON public.roommate_listings FOR DELETE USING (auth.uid() = user_id);

-- Job listings table
CREATE TABLE public.job_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  company TEXT,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  job_type TEXT NOT NULL DEFAULT 'full-time', -- full-time, part-time, contract, freelance
  salary_min INTEGER,
  salary_max INTEGER,
  currency TEXT NOT NULL DEFAULT 'USD',
  listing_type TEXT NOT NULL DEFAULT 'seeking', -- 'seeking' (looking for job) or 'hiring'
  language_code TEXT NOT NULL DEFAULT 'en',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.job_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Job listings viewable by everyone" ON public.job_listings FOR SELECT USING (true);
CREATE POLICY "Users can create their own job listings" ON public.job_listings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own job listings" ON public.job_listings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own job listings" ON public.job_listings FOR DELETE USING (auth.uid() = user_id);
