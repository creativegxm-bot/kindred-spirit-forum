import { Link, useParams, Navigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowLeft, Clock } from "lucide-react";
import { blogPosts } from "@/data/blogPosts";
import SEO from "@/components/SEO";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) return <Navigate to="/blog" replace />;

  const canonical = `https://ondabir.com/blog/${post.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: { "@type": "Organization", name: "AI Content Detector" },
    mainEntityOfPage: canonical,
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${post.title} | AI Detection Blog`}
        description={post.excerpt}
        canonical={canonical}
        ogType="article"
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
        </article>
      </main>
    </div>
  );
};

export default BlogPost;
