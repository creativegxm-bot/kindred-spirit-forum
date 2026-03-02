
CREATE TABLE public.iq_test_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 20,
  iq_estimate INTEGER NOT NULL DEFAULT 100,
  time_taken_seconds INTEGER,
  language_code TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.iq_test_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own results" ON public.iq_test_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own results" ON public.iq_test_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view top scores" ON public.iq_test_results
  FOR SELECT USING (true);
