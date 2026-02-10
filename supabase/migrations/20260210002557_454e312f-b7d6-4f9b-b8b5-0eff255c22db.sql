
-- Create post_media table for multiple media per post
CREATE TABLE public.post_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.post_media ENABLE ROW LEVEL SECURITY;

-- Everyone can view post media
CREATE POLICY "Post media is viewable by everyone"
ON public.post_media FOR SELECT USING (true);

-- Authors can insert media for their own posts
CREATE POLICY "Users can add media to their own posts"
ON public.post_media FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM public.posts WHERE id = post_id AND author_id = auth.uid())
);

-- Authors can delete media from their own posts
CREATE POLICY "Users can delete media from their own posts"
ON public.post_media FOR DELETE
USING (
  EXISTS (SELECT 1 FROM public.posts WHERE id = post_id AND author_id = auth.uid())
);

-- Index for fast lookups
CREATE INDEX idx_post_media_post_id ON public.post_media(post_id, sort_order);
