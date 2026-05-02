import { Link, useParams, Navigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Clock, Calculator } from "lucide-react";
import { blogPosts } from "@/data/blogPosts";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) return <Navigate to="/blog" replace />;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link to="/blog" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> All articles
          </Link>
          <div className="flex items-center gap-2 ml-4">
            <Home className="h-6 w-6 text-primary" />
            <span className="font-bold">Mortgage Blog</span>
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
                <h3 className="font-bold mb-1">Ready to run the numbers?</h3>
                <p className="text-sm text-muted-foreground">Use our free calculator to see your monthly payment.</p>
              </div>
              <Link to="/">
                <Button><Calculator className="h-4 w-4 mr-2" /> Open Calculator</Button>
              </Link>
            </CardContent>
          </Card>
        </article>
      </main>
    </div>
  );
};

export default BlogPost;
