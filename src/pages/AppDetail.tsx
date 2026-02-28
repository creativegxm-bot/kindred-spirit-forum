import { useParams } from "react-router-dom";
import { useState } from "react";
import { trendingApps } from "@/data/trendingApps";
import { useLocalizedNavigate } from "@/hooks/useLocalizedNavigate";
import { useLanguage } from "@/hooks/useLanguage";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import AuthModal from "@/components/AuthModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/components/Footer";
import { ArrowLeft, Download, Star, ExternalLink, Check } from "lucide-react";

const AppDetail = () => {
  const { appId } = useParams();
  const { navigate } = useLocalizedNavigate();
  const { language } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const app = trendingApps.find((a) => a.id === appId);

  if (!app) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">
            {language === "tr" ? "Uygulama bulunamadı" : "App not found"}
          </h1>
          <Button onClick={() => navigate("/apps")} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {language === "tr" ? "Uygulamalara Dön" : "Back to Apps"}
          </Button>
        </div>
      </div>
    );
  }

  const description = language === "tr" ? app.descriptionTr : app.description;
  const features = language === "tr" ? app.featuresTr : app.features;
  const category = language === "tr" ? app.categoryTr : app.category;

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
            onClick={() => navigate("/apps")}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {language === "tr" ? "Tüm Uygulamalar" : "All Apps"}
          </Button>

          <div className="grid gap-6 md:grid-cols-[1fr_300px]">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <span className="text-6xl">{app.icon}</span>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                    {app.name}
                  </h1>
                  <p className="text-muted-foreground mt-1">{app.developer}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      {app.rating}
                    </span>
                    <span className="flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      {app.downloads} {language === "tr" ? "indirme" : "downloads"}
                    </span>
                    <span className="bg-accent text-accent-foreground px-2 py-0.5 rounded text-xs">
                      {category}
                    </span>
                  </div>
                </div>
              </div>

              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-3">
                    {language === "tr" ? "Hakkında" : "About"}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {description}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-3">
                    {language === "tr" ? "Özellikler" : "Features"}
                  </h2>
                  <ul className="space-y-2">
                    {features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-muted-foreground">
                        <Check className="h-4 w-4 text-primary shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <a href={app.url} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full gap-2" size="lg">
                      <ExternalLink className="h-5 w-5" />
                      {language === "tr" ? "İndir / Aç" : "Download / Open"}
                    </Button>
                  </a>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{language === "tr" ? "Geliştirici" : "Developer"}</span>
                      <span className="font-medium text-foreground">{app.developer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{language === "tr" ? "Kategori" : "Category"}</span>
                      <span className="font-medium text-foreground">{category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{language === "tr" ? "Puan" : "Rating"}</span>
                      <span className="font-medium text-foreground flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        {app.rating}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{language === "tr" ? "İndirmeler" : "Downloads"}</span>
                      <span className="font-medium text-foreground">{app.downloads}</span>
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
      <Footer />
    </div>
  );
};

export default AppDetail;
