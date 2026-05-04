import { Link, useParams, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowLeft, Clock } from "lucide-react";
import { blogPosts } from "@/data/blogPosts";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type RobotsValue = "index,follow" | "noindex,follow";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find((p) => p.slug === slug);
  const { isAdmin } = useAdmin();
  const [robots, setRobots] = useState<RobotsValue>("index,follow");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!slug) return;
    supabase
      .from("blog_post_seo")
      .select("robots")
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.robots === "noindex,follow" || data?.robots === "index,follow") {
          setRobots(data.robots);
        }
      });
  }, [slug]);

  if (!post) return <Navigate to="/blog" replace />;

  const toggleRobots = async (noindex: boolean) => {
    const newVal: RobotsValue = noindex ? "noindex,follow" : "index,follow";
    setSaving(true);
    const { error } = await supabase
      .from("blog_post_seo")
      .upsert({ slug: post.slug, robots: newVal }, { onConflict: "slug" });
    setSaving(false);
    if (error) {
      toast.error("Failed to update SEO setting");
      return;
    }
    setRobots(newVal);
    toast.success(`Robots set to ${newVal}`);
  };

  const related = blogPosts
    .filter((p) => p.slug !== post.slug)
    .map((p) => {
      const sharedTags = p.tags.filter((t) => post.tags.includes(t)).length;
      const recencyBoost = 1 / (1 + Math.abs(new Date(p.date).getTime() - new Date(post.date).getTime()) / (1000 * 60 * 60 * 24 * 30));
      return { post: p, score: sharedTags * 10 + recencyBoost };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.post);

  const canonical = `https://ondabir.com/blog/${post.slug}`;
  const sectionMap: Record<string, string> = {
    text: "AI Text Detection",
    image: "AI Image Detection",
    video: "AI Video Detection",
    deepfake: "Deepfake Detection",
    scams: "AI Safety",
    detection: "Detection Fundamentals",
    "how-it-works": "Detection Fundamentals",
    limits: "Detection Fundamentals",
  };
  const articleSection = post.tags.map((t) => sectionMap[t]).find(Boolean) ?? "AI Detection";
  const wordCount = post.content.split(/\s+/).filter(Boolean).length;

  const publisher = {
    "@type": "Organization",
    name: "AI Content Detector",
    url: "https://ondabir.com",
    logo: { "@type": "ImageObject", url: "https://ondabir.com/favicon.png" },
  };
  const author = {
    "@type": "Organization",
    name: "AI Content Detector Editorial",
    url: "https://ondabir.com/blog",
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    author,
    publisher,
    image: "https://ondabir.com/og-image.png",
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    url: canonical,
    articleSection,
    keywords: post.tags.join(", "),
    wordCount,
    inLanguage: "en",
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${post.title} | AI Detection Blog`}
        description={post.excerpt}
        canonical={canonical}
        ogType="article"
        image="https://ondabir.com/og-image.png"
        robots={robots === "noindex,follow" ? "noindex,follow" : undefined}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link to="/blog" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> All articles
          </Link>
          <div className="flex items-center gap-2 ml-4">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-bold">AI Detection Blog</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <article>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{post.title}</h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-8">
            <span>{new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {post.readTime}</span>
          </div>

          {isAdmin && (
            <Card className="mb-6 border-primary/30">
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div>
                  <Label htmlFor="robots-toggle" className="font-semibold">Hide from search engines</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Current robots: <code>{robots}</code>. Toggle on to set <code>noindex,follow</code>.
                  </p>
                </div>
                <Switch
                  id="robots-toggle"
                  checked={robots === "noindex,follow"}
                  disabled={saving}
                  onCheckedChange={toggleRobots}
                />
              </CardContent>
            </Card>
          )}

          <div className="prose prose-lg max-w-none space-y-4 text-foreground">
            {post.content.split("\n\n").map((para, i) => (
              <p key={i} className="leading-relaxed">{para}</p>
            ))}
          </div>

          <Card className="mt-10 bg-secondary border-primary/20">
            <CardContent className="p-6 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h3 className="font-bold mb-1">Check if your content is AI-generated</h3>
                <p className="text-sm text-muted-foreground">Run text, an image, a video or a video URL through our free detector.</p>
              </div>
              <Link to="/">
                <Button><Sparkles className="h-4 w-4 mr-2" /> Open Detector</Button>
              </Link>
            </CardContent>
          </Card>

          {related.length > 0 && (
            <section className="mt-12">
              <h2 className="text-2xl font-bold mb-4">Related articles</h2>
              <div className="grid gap-4 md:grid-cols-3">
                {related.map((r) => (
                  <Link key={r.slug} to={`/blog/${r.slug}`} className="group">
                    <Card className="h-full hover:border-primary/40 transition-colors">
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2 group-hover:text-primary line-clamp-2">{r.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{r.excerpt}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" /> {r.readTime}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>
      </main>
    </div>
  );
};

export default BlogPost;
