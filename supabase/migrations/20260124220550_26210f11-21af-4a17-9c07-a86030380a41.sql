-- Add media columns to comments table
ALTER TABLE public.comments
ADD COLUMN image_url TEXT,
ADD COLUMN video_url TEXT;

-- Create storage bucket for comment media
INSERT INTO storage.buckets (id, name, public)
VALUES ('comment-media', 'comment-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for comment media
CREATE POLICY "Anyone can view comment media"
ON storage.objects FOR SELECT
USING (bucket_id = 'comment-media');

CREATE POLICY "Authenticated users can upload comment media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'comment-media' 
  AND auth.uid() IS NOT NULL
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own comment media"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'comment-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own comment media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'comment-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);