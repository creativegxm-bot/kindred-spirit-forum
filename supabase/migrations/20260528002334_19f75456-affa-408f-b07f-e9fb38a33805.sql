
-- 1. Admin SELECT on draw_entries
CREATE POLICY "Admins can view all draw entries"
ON public.draw_entries
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 2. Remove permissive public IQ leaderboard policy
DROP POLICY IF EXISTS "Anyone can view top scores" ON public.iq_test_results;

-- 3. Fix communities INSERT to bind created_by to auth.uid()
DROP POLICY IF EXISTS "Authenticated users can create communities" ON public.communities;
CREATE POLICY "Authenticated users can create communities"
ON public.communities
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.uid());
