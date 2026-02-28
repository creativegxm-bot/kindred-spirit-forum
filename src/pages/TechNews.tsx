import { useState } from "react";
import { ExternalLink, Gamepad2, Smartphone, Bot, Clock, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import AuthModal from "@/components/AuthModal";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import { techNewsArticles, type TechNewsArticle } from "@/data/techNews";

type CategoryFilter = "all" | "game" | "app" | "ai";

const categoryConfig: Record<string, { icon: React.ReactNode; label: string; labelTr: string; color: string }> = {
  game: { icon: <Gamepad2 className="h-4 w-4" />, label: "Games", labelTr: "Oyunlar", color: "bg-red-500/10 text-red-500 border-red-500/20" },
  app: { icon: <Smartphone className="h-4 w-4" />, label: "Apps", labelTr: "Uygulamalar", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  ai: { icon: <Bot className="h-4 w-4" />, label: "AI", labelTr: "Yapay Zeka", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
};

const TechNews = () => {
  const { language } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [filter, setFilter] = useState<CategoryFilter>("all");

  const filtered = filter === "all" ? techNewsArticles : techNewsArticles.filter((a) => a.category === filter);

  const featured = filtered[0];
  const rest = filtered.slice(1);

  const texts = {
    title: language === "tr" ? "Teknoloji Haberleri" : "Tech News",
    subtitle: language === "tr"
      ? "Oyun ve uygulama dünyasından en son haberler"
      : "Latest news from the world of games and apps",
    all: language === "tr" ? "Tümü" : "All",
    readMore: language === "tr" ? "Devamını Oku" : "Read More",
  };

  const NewsCard = ({ article, featured = false }: { article: TechNewsArticle; featured?: boolean }) => {
    const cat = categoryConfig[article.category];
    return (
      <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className="block group">
        <Card className={`overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/40 ${featured ? "" : "h-full"}`}>
          <div className={featured ? "md:flex" : ""}>
            <div className={`relative overflow-hidden ${featured ? "md:w-1/2 h-64 md:h-auto" : "h-48"}`}>
              <img
                src={article.imageUrl}
                alt={language === "tr" ? article.titleTr : article.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <Badge className={`absolute top-3 left-3 ${cat.color} border backdrop-blur-sm`}>
                <span className="flex items-center gap-1">
                  {cat.icon}
                  {language === "tr" ? cat.labelTr : cat.label}
                </span>
              </Badge>
            </div>
            <CardContent className={`p-4 ${featured ? "md:w-1/2 md:p-6 flex flex-col justify-center" : ""}`}>
              <h3 className={`font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 ${featured ? "text-xl md:text-2xl mb-3" : "text-base mb-2"}`}>
                {language === "tr" ? article.titleTr : article.title}
              </h3>
              <p className={`text-muted-foreground line-clamp-3 ${featured ? "text-base mb-4" : "text-sm mb-3"}`}>
                {language === "tr" ? article.summaryTr : article.summary}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  <span>{format(new Date(article.publishedAt), "MMM d, yyyy")}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">{article.sourceName}</span>
                  <ExternalLink className="h-3 w-3" />
                </div>
              </div>
              {featured && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {article.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </div>
        </Card>
      </a>
    );
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
        <main className="flex-1 p-4 lg:p-6 max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-8 w-8 text-primary" />
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{texts.title}</h1>
            </div>
            <p className="text-muted-foreground">{texts.subtitle}</p>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              {texts.all}
            </Button>
            {Object.entries(categoryConfig).map(([key, val]) => (
              <Button
                key={key}
                variant={filter === key ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(key as CategoryFilter)}
                className="gap-1.5"
              >
                {val.icon}
                {language === "tr" ? val.labelTr : val.label}
              </Button>
            ))}
          </div>

          {/* Featured Article */}
          {featured && (
            <div className="mb-6">
              <NewsCard article={featured} featured />
            </div>
          )}

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rest.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        </main>
      </div>
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} defaultMode="login" />
      <Footer />
    </div>
  );
};

export default TechNews;
