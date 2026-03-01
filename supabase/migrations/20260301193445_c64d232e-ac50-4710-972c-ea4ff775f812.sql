
CREATE TABLE public.children_stories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  story_number integer NOT NULL,
  title text NOT NULL,
  summary text NOT NULL,
  content text NOT NULL,
  moral text NOT NULL,
  image_url text,
  language_code text NOT NULL DEFAULT 'en',
  age_range text NOT NULL DEFAULT '4-10',
  read_time integer NOT NULL DEFAULT 3,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(story_number, language_code)
);

ALTER TABLE public.children_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Children stories are viewable by everyone"
  ON public.children_stories
  FOR SELECT
  USING (true);
