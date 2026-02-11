
-- Table to store AI-generated comments before posting
CREATE TABLE public.pending_ai_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL, -- existing user_id to attribute the comment to
  content TEXT NOT NULL,
  language_code TEXT NOT NULL DEFAULT 'tr',
  status TEXT NOT NULL DEFAULT 'pending', -- pending, posted, failed
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  posted_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT
);

-- Index for efficient querying of pending comments
CREATE INDEX idx_pending_ai_comments_status ON public.pending_ai_comments(status);
CREATE INDEX idx_pending_ai_comments_created_at ON public.pending_ai_comments(created_at);

-- Enable RLS
ALTER TABLE public.pending_ai_comments ENABLE ROW LEVEL SECURITY;

-- Only service role (edge functions) should access this table
-- No public access needed
CREATE POLICY "Service role only" ON public.pending_ai_comments
  FOR ALL USING (false);

-- Enable pg_cron and pg_net extensions
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
