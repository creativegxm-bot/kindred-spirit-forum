-- Fix the overly permissive "Admins can manage roles" policy by making it more specific
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

-- Separate policies for INSERT, UPDATE, DELETE
CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));