import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, ArrowLeft, Clock } from "lucide-react";
import { blogPosts } from "@/data/blogPosts";
import SEO from "@/components/SEO";

const Blog = () => (
  <div className="min-h-screen bg-background">
    <SEO
      title="Mortgage Blog - Insights & Guides"
      description="Practical mortgage advice: rates, affordability, extra payments, PMI, and more to help you make smarter home loan decisions."
      canonical="https://ondabir.com/blog"
    />
    <header className="border-b border-border bg-card">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <div className="flex items-center gap-2 ml-4">
          <Home className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">Mortgage Blog</h1>
        </div>
      </div>
    </header>

    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold mb-2">Mortgage Insights & Guides</h2>
        <p className="text-muted-foreground">
          Practical advice to help you make smarter home loan decisions.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {blogPosts.map((post) => (
          <Link key={post.slug} to={`/blog/${post.slug}`}>
            <Card className="h-full hover:border-primary transition-colors">
              <CardHeader>
                <CardTitle className="text-lg">{post.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{post.excerpt}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {post.readTime}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  </div>
);

export default Blog;
