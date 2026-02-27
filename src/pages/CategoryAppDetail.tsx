import { useParams } from "react-router-dom";
import { useState } from "react";
import { findCategoryApp, getAppSlug } from "@/data/categoryApps";
import { useLocalizedNavigate } from "@/hooks/useLocalizedNavigate";
import { useLanguage } from "@/hooks/useLanguage";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import AuthModal from "@/components/AuthModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Star, ExternalLink } from "lucide-react";

const CategoryAppDetail = () => {
  const { category, appSlug } = useParams();
  const { navigate } = useLocalizedNavigate();
  const { language } = useLanguage();
  const isTr = language === "tr";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const { category: cat, app } = findCategoryApp(category || "", appSlug || "");

  if (!cat || !app) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">
            {isTr ? "Uygulama bulunamadı" : "App not found"}
          </h1>
          <Button onClick={() => navigate(`/category-apps/${category || ""}`)} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {isTr ? "Geri Dön" : "Go Back"}
          </Button>
        </div>
      </div>
    );
  }

  const description = isTr ? app.descriptionTr : app.description;

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

        <main className="flex-1 p-4 lg:p-6 max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate(`/category-apps/${category}`)}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {isTr ? `${cat.nameTr} Uygulamaları` : `${cat.name} Apps`}
          </Button>

          <div className="grid gap-6 md:grid-cols-[1fr_300px]">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <img
                  src={app.imageUrl}
                  alt={app.name}
                  className="w-20 h-20 rounded-2xl object-cover shrink-0"
                />
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                    {app.name}
                  </h1>
                  <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      {app.rating}
                    </span>
                    <Badge variant="secondary">{app.platform}</Badge>
                    <Badge variant="outline">
                      {cat.emoji} {isTr ? cat.nameTr : cat.name}
                    </Badge>
                  </div>
                </div>
              </div>

              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-3">
                    {isTr ? "Hakkında" : "About"}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {description}
                  </p>
                </CardContent>
              </Card>

              {/* Related apps from same category */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-3">
                    {isTr ? `Diğer ${cat.nameTr} Uygulamaları` : `More ${cat.name} Apps`}
                  </h2>
                  <div className="space-y-3">
                    {cat.apps
                      .filter((a) => a.name !== app.name)
                      .slice(0, 5)
                      .map((related, i) => (
                        <button
                          key={i}
                          onClick={() => navigate(`/category-apps/${category}/${getAppSlug(related.name)}`)}
                          className="flex items-center gap-3 w-full text-left p-2 rounded-lg hover:bg-muted transition-colors"
                        >
                          <img
                            src={related.imageUrl}
                            alt={related.name}
                            className="w-10 h-10 rounded-lg object-cover shrink-0"
                            loading="lazy"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground text-sm truncate">{related.name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {isTr ? related.descriptionTr : related.description}
                            </p>
                          </div>
                          <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                            {related.rating}
                          </span>
                        </button>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <a href={app.downloadUrl} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full gap-2" size="lg">
                      <ExternalLink className="h-5 w-5" />
                      {isTr ? "İndir / Aç" : "Download / Open"}
                    </Button>
                  </a>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{isTr ? "Kategori" : "Category"}</span>
                      <span className="font-medium text-foreground">{isTr ? cat.nameTr : cat.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{isTr ? "Platform" : "Platform"}</span>
                      <span className="font-medium text-foreground">{app.platform}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{isTr ? "Puan" : "Rating"}</span>
                      <span className="font-medium text-foreground flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        {app.rating}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
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

export default CategoryAppDetail;
