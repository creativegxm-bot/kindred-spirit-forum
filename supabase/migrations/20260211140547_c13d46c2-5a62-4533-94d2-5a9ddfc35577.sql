
-- Rename and restructure pending_ai_comments table
ALTER TABLE public.pending_ai_comments
  DROP COLUMN IF EXISTS author_id,
  DROP COLUMN IF EXISTS error_message,
  DROP COLUMN IF EXISTS created_at;

ALTER TABLE public.pending_ai_comments
  RENAME COLUMN content TO comment_text;

ALTER TABLE public.pending_ai_comments
  RENAME COLUMN post_id TO target_post_id;

ALTER TABLE public.pending_ai_comments
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS scheduled_at timestamp with time zone;
