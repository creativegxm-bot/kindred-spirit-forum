import { useState, lazy, Suspense } from "react";
import { useLocalizedNavigate } from "@/hooks/useLocalizedNavigate";
import Header from "@/components/Header";
import PromoBanner from "@/components/PromoBanner";
import AirbnbBanner from "@/components/AirbnbBanner";
import Sidebar from "@/components/Sidebar";
import PostCard from "@/components/PostCard";
import CreatePostModal from "@/components/CreatePostModal";
import AuthModal from "@/components/AuthModal";
import LanguageFilter from "@/components/LanguageFilter";
import { usePosts } from "@/hooks/usePosts";
import { useRealtimePosts } from "@/hooks/useRealtimeSubscription";
import { useLanguage } from "@/hooks/useLanguage";
import { Loader2 } from "lucide-react";

const TrendingSidebar = lazy(() => import("@/components/TrendingSidebar"));
const TrendingGames = lazy(() => import("@/components/TrendingGames"));
const TrendingApps = lazy(() => import("@/components/TrendingApps"));
const TrendingAIApps = lazy(() => import("@/components/TrendingAIApps"));

const Index = () => {
  const { navigate } = useLocalizedNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  const { language } = useLanguage();
  const { data: posts = [], isLoading, error } = usePosts(language);
  
  // Enable real-time updates for posts and votes
  useRealtimePosts();

  const openAuth = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <AirbnbBanner />
      <PromoBanner />
      <Header
        onCreatePost={() => setCreateModalOpen(true)}
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        onOpenAuth={openAuth}
      />

      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onOpenAuth={openAuth} />

        <main className="flex-1 py-4 px-4 lg:px-6">
          <div className="flex gap-6 justify-center">
            <div className="w-full max-w-2xl space-y-4">
              <Suspense fallback={null}>
                <TrendingGames />
                <TrendingApps />
                <TrendingAIApps />
              </Suspense>
              <LanguageFilter />
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="text-center py-20">
                  <p className="text-destructive">
                    {language === "tr" ? "Gönderiler yüklenemedi" : "Failed to load posts"}
                  </p>
                </div>
              ) : posts.length === 0 ? (
                <div className="card-gradient rounded-lg border border-border p-8 text-center">
                  <h3 className="text-lg font-semibold mb-2">
                    {language === "tr" ? "Henüz gönderi yok" : "No posts yet"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {language === "tr" ? "Toplulukla bir şeyler paylaşan ilk kişi ol!" : "Be the first to share something!"}
                  </p>
                </div>
              ) : (
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onClick={() => navigate(`/post/${post.id}`)}
                    onAuthRequired={() => openAuth("login")}
                  />
                ))
              )}
            </div>

            <Suspense fallback={null}>
              <TrendingSidebar />
            </Suspense>
          </div>
        </main>
      </div>

      <CreatePostModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onAuthRequired={() => openAuth("login")}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authMode}
      />
    </div>
  );
};

export default Index;
