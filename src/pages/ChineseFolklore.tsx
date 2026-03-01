import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import { useLanguage } from "@/hooks/useLanguage";
import { useLocalizedNavigate } from "@/hooks/useLocalizedNavigate";
import { chineseFolkloreStories, folkloreCategories, FolkloreStory } from "@/data/chineseFolklore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, ArrowLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const ChineseFolklore = () => {
  const { storyId } = useParams();
  const { language } = useLanguage();
  const { navigate, localePath } = useLocalizedNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const isZh = language === "zh";

  const openAuth = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  // If storyId is present, show detail view
  if (storyId) {
    const story = chineseFolkloreStories.find((s) => s.id === storyId);
    if (!story) {
      return (
        <div className="min-h-screen bg-background flex flex-col">
          <Header onCreatePost={() => {}} onMenuToggle={() => {}} onOpenAuth={openAuth} />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2">{isZh ? "故事未找到" : "Story Not Found"}</h1>
              <Button variant="outline" onClick={() => navigate("/folklore/china")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {isZh ? "返回故事列表" : "Back to Stories"}
              </Button>
            </div>
          </main>
          <Footer />
          <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} defaultMode={authMode} />
        </div>
      );
    }

    const otherStories = chineseFolkloreStories.filter((s) => s.id !== storyId).slice(0, 3);

    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header onCreatePost={() => {}} onMenuToggle={() => {}} onOpenAuth={openAuth} />
        <main className="flex-1 py-6 px-4 lg:px-6">
          <div className="max-w-3xl mx-auto">
            <Button variant="ghost" size="sm" onClick={() => navigate("/folklore/china")} className="mb-4 text-muted-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {isZh ? "返回故事列表" : "Back to Stories"}
            </Button>

            <article>
              <img
                src={story.imageUrl}
                alt={isZh ? story.titleZh : story.title}
                className="w-full h-64 sm:h-80 object-cover rounded-xl mb-6"
                loading="lazy"
              />
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="secondary" className="capitalize">{isZh ? folkloreCategories.find(c => c.id === story.category)?.labelZh : story.category}</Badge>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {story.readTime} {isZh ? "分钟阅读" : "min read"}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">{isZh ? story.titleZh : story.title}</h1>
              {isZh && <p className="text-lg text-muted-foreground mb-6">{story.title}</p>}
              {!isZh && <p className="text-lg text-muted-foreground mb-6">{story.titleZh}</p>}

              <div className="prose prose-lg dark:prose-invert max-w-none">
                {(isZh ? story.contentZh : story.content).split("\n\n").map((paragraph, i) => (
                  <p key={i} className="text-foreground/90 leading-relaxed mb-4">{paragraph}</p>
                ))}
              </div>
            </article>

            {otherStories.length > 0 && (
              <section className="mt-12 pt-8 border-t border-border">
                <h2 className="text-xl font-semibold mb-4">{isZh ? "更多故事" : "More Stories"}</h2>
                <div className="grid gap-4 sm:grid-cols-3">
                  {otherStories.map((s) => (
                    <Link key={s.id} to={localePath(`/folklore/china/${s.id}`)} className="group">
                      <div className="rounded-lg border border-border overflow-hidden bg-card hover:shadow-md transition-shadow">
                        <img src={s.imageUrl} alt={isZh ? s.titleZh : s.title} className="w-full h-32 object-cover" loading="lazy" />
                        <div className="p-3">
                          <h3 className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-1">{isZh ? s.titleZh : s.title}</h3>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        </main>
        <Footer />
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} defaultMode={authMode} />
      </div>
    );
  }

  // Listing view
  const filteredStories = selectedCategory === "all"
    ? chineseFolkloreStories
    : chineseFolkloreStories.filter((s) => s.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header onCreatePost={() => {}} onMenuToggle={() => {}} onOpenAuth={openAuth} />
      <main className="flex-1 py-6 px-4 lg:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🐉</div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              {isZh ? "中国民间故事" : "Chinese Folklore"}
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              {isZh
                ? "探索流传千年的中国经典神话、传说与民间故事"
                : "Explore timeless myths, legends, and folk tales that have been passed down through thousands of years of Chinese civilization"}
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            {folkloreCategories.map((cat) => (
              <Button
                key={cat.id}
                variant="ghost"
                size="sm"
                className={cn(
                  "flex-shrink-0 rounded-full",
                  selectedCategory === cat.id && "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {isZh ? cat.labelZh : cat.label}
              </Button>
            ))}
          </div>

          {/* Stories Grid */}
          <div className="grid gap-6 sm:grid-cols-2">
            {filteredStories.map((story) => (
              <Link key={story.id} to={localePath(`/folklore/china/${story.id}`)} className="group">
                <div className="rounded-xl border border-border overflow-hidden bg-card hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
                  <div className="relative">
                    <img
                      src={story.imageUrl}
                      alt={isZh ? story.titleZh : story.title}
                      className="w-full h-48 object-cover"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge variant="secondary" className="capitalize backdrop-blur-sm bg-background/80">
                        {isZh ? folkloreCategories.find(c => c.id === story.category)?.labelZh : story.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4">
                    <h2 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
                      {isZh ? story.titleZh : story.title}
                    </h2>
                    <p className="text-xs text-muted-foreground mb-2">{isZh ? story.title : story.titleZh}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {isZh ? story.summaryZh : story.summary}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {story.readTime} {isZh ? "分钟" : "min"}
                      </span>
                      <span className="text-xs text-primary flex items-center gap-0.5 group-hover:gap-1.5 transition-all">
                        {isZh ? "阅读全文" : "Read"} <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} defaultMode={authMode} />
    </div>
  );
};

export default ChineseFolklore;
