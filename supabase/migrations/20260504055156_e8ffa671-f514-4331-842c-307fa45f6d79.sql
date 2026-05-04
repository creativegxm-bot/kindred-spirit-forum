
CREATE TABLE public.blog_post_seo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  robots text NOT NULL DEFAULT 'index,follow' CHECK (robots IN ('index,follow','noindex,follow')),
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_post_seo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Blog SEO settings are viewable by everyone"
  ON public.blog_post_seo FOR SELECT USING (true);

CREATE POLICY "Admins can insert blog SEO settings"
  ON public.blog_post_seo FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update blog SEO settings"
  ON public.blog_post_seo FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete blog SEO settings"
  ON public.blog_post_seo FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_blog_post_seo_updated_at
  BEFORE UPDATE ON public.blog_post_seo
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
