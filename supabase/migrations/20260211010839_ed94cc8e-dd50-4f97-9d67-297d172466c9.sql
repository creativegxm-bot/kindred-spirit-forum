
-- Add language_code column to communities table
ALTER TABLE public.communities
ADD COLUMN language_code text NOT NULL DEFAULT 'tr';

-- Add index for filtering
CREATE INDEX idx_communities_language_code ON public.communities (language_code);
