CREATE TABLE public.detection_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('text','image','video')),
  ai_probability numeric NOT NULL,
  verdict text NOT NULL,
  confidence text NOT NULL,
  signals jsonb NOT NULL DEFAULT '[]'::jsonb,
  summary text NOT NULL,
  text_snippet text,
  preview_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.detection_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read detection results"
  ON public.detection_results FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create detection results"
  ON public.detection_results FOR INSERT
  WITH CHECK (true);

CREATE INDEX idx_detection_results_created_at ON public.detection_results(created_at DESC);