-- Create community_rules table
CREATE TABLE public.community_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  rule_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT community_rules_title_length CHECK (char_length(title) > 0 AND char_length(title) <= 100),
  CONSTRAINT community_rules_description_length CHECK (description IS NULL OR char_length(description) <= 500),
  UNIQUE(community_id, rule_number)
);

-- Enable RLS
ALTER TABLE public.community_rules ENABLE ROW LEVEL SECURITY;

-- Everyone can view rules
CREATE POLICY "Rules are viewable by everyone"
ON public.community_rules
FOR SELECT
USING (true);

-- Only community creator can manage rules
CREATE POLICY "Community creators can insert rules"
ON public.community_rules
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.communities 
    WHERE id = community_id AND created_by = auth.uid()
  )
);

CREATE POLICY "Community creators can update rules"
ON public.community_rules
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.communities 
    WHERE id = community_id AND created_by = auth.uid()
  )
);

CREATE POLICY "Community creators can delete rules"
ON public.community_rules
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.communities 
    WHERE id = community_id AND created_by = auth.uid()
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_community_rules_updated_at
BEFORE UPDATE ON public.community_rules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();