import { useState } from "react";
import { Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import PostCard from "@/components/PostCard";
import PostDetail from "@/components/PostDetail";
import AuthModal from "@/components/AuthModal";
import { useSavedPosts } from "@/hooks/useSavedPosts";
import { useRealtimePosts } from "@/hooks/useRealtimeSubscription";
import { useAuth } from "@/hooks/useAuth";
import { Post } from "@/hooks/usePosts";
import { Loader2, Bookmark } from "lucide-react";

const SavedPosts = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  const { user, loading: authLoading } = useAuth();
  const { data: posts = [], isLoading, error } = useSavedPosts();

  // Enable real-time updates
  useRealtimePosts();

  const openAuth = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  // Redirect to home if not logged in
  if (!authLoading && !user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        onCreatePost={() => {}}
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        onOpenAuth={openAuth}
      />

      <div className="flex">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onOpenAuth={openAuth}
        />

        <main className="flex-1 py-4 px-4 lg:px-6">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Bookmark className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Saved Posts</h1>
                <p className="text-sm text-muted-foreground">
                  Posts you've bookmarked for later
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {authLoading || isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="text-center py-20">
                  <p className="text-destructive">Failed to load saved posts</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="card-gradient rounded-lg border border-border p-8 text-center">
                  <Bookmark className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">
                    No saved posts yet
                  </h3>
                  <p className="text-muted-foreground">
                    Click the bookmark icon on any post to save it for later.
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

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authMode}
      />
    </div>
  );
};

export default SavedPosts;
