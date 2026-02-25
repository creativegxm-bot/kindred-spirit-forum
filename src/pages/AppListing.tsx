import { useState } from "react";
import { trendingApps } from "@/data/trendingApps";
import { useLocalizedNavigate } from "@/hooks/useLocalizedNavigate";
import { useLanguage } from "@/hooks/useLanguage";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import AuthModal from "@/components/AuthModal";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Smartphone, Search, Star, Download, ExternalLink } from "lucide-react";

const categories = [
  "All", "Messaging", "Social Media", "Entertainment", "Video", "Music", "AI",
  "Streaming", "Navigation", "Shopping", "Communication", "Transportation",
  "Productivity", "Finance", "Design", "Education", "Creative", "Utility",
  "Professional", "Health", "Travel",
];

const categoriesTr: Record<string, string> = {
  All: "Tümü", Messaging: "Mesajlaşma", "Social Media": "Sosyal Medya",
  Entertainment: "Eğlence", Video: "Video", Music: "Müzik", AI: "Yapay Zeka",
  Streaming: "Yayın", Navigation: "Navigasyon", Shopping: "Alışveriş",
  Communication: "İletişim", Transportation: "Ulaşım", Productivity: "Verimlilik",
  Finance: "Finans", Design: "Tasarım", Education: "Eğitim", Creative: "Yaratıcı",
  Utility: "Araç", Professional: "Profesyonel", Health: "Sağlık", Travel: "Seyahat",
};

const AppListing = () => {
  const { navigate } = useLocalizedNavigate();
  const { language } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredApps = trendingApps.filter((app) => {
    const matchesSearch = app.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const availableCategories = categories.filter(
    (cat) => cat === "All" || trendingApps.some((app) => app.category === cat)
  );

  return (
    <div className="min-h-screen bg-background">
      <Header
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        onOpenAuth={() => setAuthModalOpen(true)}
        onCreatePost={() => {}}
      />

      <div className="flex">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onOpenAuth={() => setAuthModalOpen(true)}
        />

        <main className="flex-1 p-4 lg:p-6 max-w-6xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <Smartphone className="h-8 w-8 text-primary" />
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                {language === "tr" ? "Trend 30 Uygulama" : "Top 30 Trending Apps"}
              </h1>
            </div>
            <p className="text-muted-foreground">
              {language === "tr"
                ? "En popüler uygulamaları keşfedin ve indirin"
                : "Discover and download the most popular apps"}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={language === "tr" ? "Uygulama ara..." : "Search apps..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {availableCategories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
              >
                {language === "tr" ? categoriesTr[cat] || cat : cat}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredApps.map((app) => (
              <button
                key={app.id}
                onClick={() => navigate(`/apps/${app.id}`)}
                className="text-left group"
              >
                <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-primary/50 group-hover:bg-accent/50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-3xl shrink-0 mt-0.5">{app.icon}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                          {app.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {language === "tr" ? app.categoryTr : app.category} • {app.developer}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-0.5">
                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                            {app.rating}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <Download className="h-3 w-3" />
                            {app.downloads}
                          </span>
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
                    </div>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>

          {filteredApps.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              {language === "tr" ? "Uygulama bulunamadı" : "No apps found"}
            </div>
          )}
        </main>
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode="login"
      />
    </div>
  );
};

export default AppListing;
