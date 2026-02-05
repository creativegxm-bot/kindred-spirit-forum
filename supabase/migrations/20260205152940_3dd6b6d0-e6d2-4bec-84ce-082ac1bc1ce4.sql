-- Add country column to posts table
ALTER TABLE public.posts 
ADD COLUMN country TEXT DEFAULT 'TR';

-- Add index for faster country-based queries
CREATE INDEX idx_posts_country ON public.posts(country);

-- Update existing posts to have Turkey as default country
UPDATE public.posts SET country = 'TR' WHERE country IS NULL;