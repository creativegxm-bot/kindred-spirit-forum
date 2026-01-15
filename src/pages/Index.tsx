import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import TrendingSidebar from "@/components/TrendingSidebar";
import PostCard from "@/components/PostCard";
import PostDetail from "@/components/PostDetail";
import CreatePostModal from "@/components/CreatePostModal";
import AuthModal from "@/components/AuthModal";
import { usePosts, Post } from "@/hooks/usePosts";
import { useRealtimePosts } from "@/hooks/useRealtimeSubscription";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  const { data: posts = [], isLoading, error } = usePosts();
  
  // Enable real-time updates for posts and votes
  useRealtimePosts();

  const openAuth = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
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
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="text-center py-20">
                  <p className="text-destructive">Gönderiler yüklenemedi</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="card-gradient rounded-lg border border-border p-8 text-center">
                  <h3 className="text-lg font-semibold mb-2">Henüz gönderi yok</h3>
                  <p className="text-muted-foreground mb-4">
                    Toplulukla bir şeyler paylaşan ilk kişi ol!
                  </p>
                </div>
              ) : (
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onClick={() => setSelectedPost(post)}
                    onAuthRequired={() => openAuth("login")}
                  />
                ))
              )}
            </div>

            <TrendingSidebar />
          </div>
        </main>
      </div>

      {selectedPost && (
        <PostDetail
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onAuthRequired={() => openAuth("login")}
        />
      )}

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
