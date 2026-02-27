import { useState } from "react";
import { useParams } from "react-router-dom";
import { getCategoryBySlug, getAppSlug } from "@/data/categoryApps";
import { useLocalizedNavigate } from "@/hooks/useLocalizedNavigate";
import { useLanguage } from "@/hooks/useLanguage";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import AuthModal from "@/components/AuthModal";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Star, Download, ExternalLink } from "lucide-react";

const CategoryApps = () => {
  const { category } = useParams<{ category: string }>();
  const { language } = useLanguage();
  const isTr = language === "tr";

  const { navigate } = useLocalizedNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  const cat = getCategoryBySlug(category || "");

  const filteredApps = (cat?.apps ?? []).filter((app) =>
    app.name.toLowerCase().includes(search.toLowerCase())
  );

  if (!cat) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          onOpenAuth={() => setAuthModalOpen(true)}
          onCreatePost={() => {}}
        />
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-muted-foreground text-lg">
            {isTr ? "Kategori bulunamadı" : "Category not found"}
          </p>
        </div>
      </div>
    );
  }

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
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{cat.emoji}</span>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                {isTr ? `En İyi ${cat.nameTr} Uygulamaları` : `Top ${cat.name} Apps`}
              </h1>
            </div>
            <p className="text-muted-foreground">
              {isTr
                ? `En popüler ${cat.nameTr.toLowerCase()} uygulamalarını keşfedin ve indirin`
                : `Discover and download the best ${cat.name.toLowerCase()} apps`}
            </p>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={isTr ? "Uygulama ara..." : "Search apps..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Apps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredApps.map((app, idx) => (
              <Card
                key={idx}
                className="h-full transition-all duration-200 hover:shadow-md hover:border-primary/50 group cursor-pointer"
                onClick={() => navigate(`/category-apps/${category}/${getAppSlug(app.name)}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <img
                      src={app.imageUrl}
                      alt={app.name}
                      className="w-14 h-14 rounded-xl object-cover shrink-0"
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{app.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {isTr ? app.descriptionTr : app.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-0.5">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          {app.rating}
                        </span>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          {app.platform}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <a
                    href={app.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 block"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button size="sm" variant="default" className="w-full gap-2">
                      <Download className="h-3.5 w-3.5" />
                      {isTr ? "İndir / Ziyaret Et" : "Download / Visit"}
                      <ExternalLink className="h-3 w-3 ml-auto" />
                    </Button>
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredApps.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              {isTr ? "Uygulama bulunamadı" : "No apps found"}
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

export default CategoryApps;
