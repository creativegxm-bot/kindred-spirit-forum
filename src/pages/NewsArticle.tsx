import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, Tag, Share2, Gamepad2, Smartphone, Bot, Rocket } from "lucide-react";
import { format } from "date-fns";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import AuthModal from "@/components/AuthModal";
import Footer from "@/components/Footer";
import { useLanguage } from "@/hooks/useLanguage";
import { useLocalizedNavigate } from "@/hooks/useLocalizedNavigate";
import { techNewsArticles } from "@/data/techNews";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const categoryConfig: Record<string, { icon: React.ReactNode; label: string; labelTr: string; color: string }> = {
  game: { icon: <Gamepad2 className="h-4 w-4" />, label: "Games", labelTr: "Oyunlar", color: "bg-red-500/10 text-red-500 border-red-500/20" },
  app: { icon: <Smartphone className="h-4 w-4" />, label: "Apps", labelTr: "Uygulamalar", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  ai: { icon: <Bot className="h-4 w-4" />, label: "AI", labelTr: "Yapay Zeka", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  space: { icon: <Rocket className="h-4 w-4" />, label: "Space", labelTr: "Uzay", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
};

const NewsArticle = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const { language } = useLanguage();
  const { localePath } = useLocalizedNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const article = techNewsArticles.find((a) => a.id === articleId);

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} onOpenAuth={() => setAuthModalOpen(true)} onCreatePost={() => {}} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {language === "tr" ? "Haber bulunamadı" : "Article not found"}
            </h1>
            <Link to={localePath("/tech-news")}>
              <Button variant="outline" className="gap-2 mt-4">
                <ArrowLeft className="h-4 w-4" />
                {language === "tr" ? "Haberlere Dön" : "Back to News"}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const cat = categoryConfig[article.category];
  const title = language === "tr" ? article.titleTr : article.title;
  const summary = language === "tr" ? article.summaryTr : article.summary;
  const content = language === "tr" ? (article.contentTr || article.summaryTr) : (article.content || article.summary);

  // Related articles (same category, excluding current)
  const related = techNewsArticles
    .filter((a) => a.category === article.category && a.id !== article.id)
    .slice(0, 4);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        onOpenAuth={(mode) => setAuthModalOpen(true)}
        onCreatePost={() => {}}
      />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onOpenAuth={(mode) => setAuthModalOpen(true)} />
        <main className="flex-1 max-w-4xl mx-auto p-4 lg:p-6">
          {/* Back button */}
          <Link to={localePath("/tech-news")} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            {language === "tr" ? "Haberlere Dön" : "Back to News"}
          </Link>

          {/* Hero image */}
          <div className="relative rounded-xl overflow-hidden mb-6 aspect-video">
            <img
              src={article.imageUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
            <Badge className={`absolute top-4 left-4 ${cat.color} border backdrop-blur-sm text-sm px-3 py-1`}>
              <span className="flex items-center gap-1.5">
                {cat.icon}
                {language === "tr" ? cat.labelTr : cat.label}
              </span>
            </Badge>
          </div>

          {/* Title & meta */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-4">
            {title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{format(new Date(article.publishedAt), "MMMM d, yyyy")}</span>
            </div>
            <span className="font-medium text-foreground">{article.sourceName}</span>
            <Button variant="ghost" size="sm" onClick={handleShare} className="gap-1.5 ml-auto">
              <Share2 className="h-4 w-4" />
              {language === "tr" ? "Paylaş" : "Share"}
            </Button>
          </div>

          <Separator className="mb-6" />

          {/* Article content */}
          <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
            <p className="text-lg text-muted-foreground font-medium leading-relaxed mb-6">
              {summary}
            </p>
            {content.split("\n\n").map((paragraph, i) => (
              <p key={i} className="text-foreground leading-relaxed mb-4">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-8">
            {article.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                <Tag className="h-3 w-3" />
                {tag}
              </Badge>
            ))}
          </div>

          <Separator className="mb-8" />

          {/* Related articles */}
          {related.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-4">
                {language === "tr" ? "İlgili Haberler" : "Related News"}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {related.map((rel) => (
                  <Link key={rel.id} to={localePath(`/tech-news/${rel.id}`)} className="group">
                    <Card className="overflow-hidden h-full transition-all duration-200 hover:shadow-md hover:border-primary/40">
                      <div className="relative h-36 overflow-hidden">
                        <img
                          src={rel.imageUrl}
                          alt={language === "tr" ? rel.titleTr : rel.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                      <CardContent className="p-3">
                        <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
                          {language === "tr" ? rel.titleTr : rel.title}
                        </h3>
                        <span className="text-xs text-muted-foreground mt-1 block">
                          {format(new Date(rel.publishedAt), "MMM d, yyyy")}
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} defaultMode="login" />
      <Footer />
    </div>
  );
};

export default NewsArticle;
