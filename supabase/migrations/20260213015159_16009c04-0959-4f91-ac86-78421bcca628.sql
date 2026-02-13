
-- Create email aliases table
CREATE TABLE public.email_aliases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  alias TEXT NOT NULL UNIQUE,
  forward_to TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_aliases ENABLE ROW LEVEL SECURITY;

-- Users can view their own aliases
CREATE POLICY "Users can view their own aliases"
ON public.email_aliases FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own aliases
CREATE POLICY "Users can create their own aliases"
ON public.email_aliases FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own aliases
CREATE POLICY "Users can update their own aliases"
ON public.email_aliases FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own aliases
CREATE POLICY "Users can delete their own aliases"
ON public.email_aliases FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_email_aliases_updated_at
BEFORE UPDATE ON public.email_aliases
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- One alias per user
CREATE UNIQUE INDEX idx_email_aliases_user_id ON public.email_aliases(user_id);
