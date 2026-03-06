-- Drop the overly broad SELECT policy that exposes PII
DROP POLICY IF EXISTS "Anyone can view entry count" ON public.draw_entries;

-- Create a security definer RPC to safely expose only the count
CREATE OR REPLACE FUNCTION public.get_draw_entry_count()
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*) FROM draw_entries;
$$;