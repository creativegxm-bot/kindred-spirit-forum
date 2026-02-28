import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import TrendingSidebar from "@/components/TrendingSidebar";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import PostCard from "@/components/PostCard";
import PostDetail from "@/components/PostDetail";
import CreatePostModal from "@/components/CreatePostModal";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart } from "lucide-react";
import type { Post } from "@/hooks/usePosts";

const HERS_COMMUNITY = "Hers";

const Hers = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [createPostOpen, setCreatePostOpen] = useState(false);

  const openAuth = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const communityName = HERS_COMMUNITY;

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["hers-posts", language, user?.id],
    queryFn: async () => {
      const { data: community } = await supabase
        .from("communities")
        .select("id")
        .eq("name", communityName)
        .single();

      if (!community) return [];

      const { data: postsData, error } = await supabase
        .from("posts")
        .select("*, community:communities(name, icon)")
        .eq("community_id", community.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      const authorIds = [...new Set((postsData || []).map(p => p.author_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, avatar_url")
        .in("user_id", authorIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      let result = (postsData || []).map(post => ({
        ...post,
        author: profileMap.get(post.author_id) || { username: "deleted", avatar_url: null },
      }));

      if (user) {
        const postIds = result.map(p => p.id);
        const { data: votes } = await supabase
          .from("votes")
          .select("post_id, vote_type")
          .eq("user_id", user.id)
          .in("post_id", postIds);

        const { data: savedPosts } = await supabase
          .from("saved_posts")
          .select("post_id")
          .eq("user_id", user.id)
          .in("post_id", postIds);

        const voteMap = new Map(votes?.map(v => [v.post_id, v.vote_type]));
        const savedSet = new Set(savedPosts?.map(s => s.post_id));

        result = result.map(post => ({
          ...post,
          user_vote: voteMap.get(post.id) ?? null,
          is_saved: savedSet.has(post.id),
        }));
      }

      return result as Post[];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Header
        onCreatePost={() => user ? setCreatePostOpen(true) : openAuth("login")}
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        onOpenAuth={openAuth}
      />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onOpenAuth={openAuth} />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-4">
          <div className="bg-gradient-to-r from-pink-600/20 to-rose-400/20 rounded-lg p-6 mb-6 border border-pink-500/30">
            <div className="flex items-center gap-3 mb-2">
              <Heart className="h-8 w-8 text-pink-500" />
              <h1 className="text-2xl font-bold text-foreground">
                {language === "tr" ? "Kadın Sağlığı" : "Hers — Women's Health"}
              </h1>
            </div>
            <p className="text-muted-foreground">
              {language === "tr"
                ? "Kadın sağlığı, wellness, beslenme ve yaşam tarzı hakkında günlük haberler ve tartışmalar."
                : "Daily news and discussions about women's health, wellness, nutrition, and lifestyle."}
            </p>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <>
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </>
            ) : posts.length === 0 ? (
              <div className="bg-card rounded-lg p-8 text-center border">
                <p className="text-muted-foreground">
                  {language === "tr" ? "Henüz gönderi yok. Yakında sağlık haberleri eklenecek!" : "No posts yet. Health news coming soon!"}
                </p>
              </div>
            ) : (
              posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  onClick={() => setSelectedPost(post)}
                  onAuthRequired={() => openAuth("login")}
                />
              ))
            )}
          </div>
        </main>
        <TrendingSidebar />
      </div>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} defaultMode={authMode} />
      {selectedPost && (
        <PostDetail post={selectedPost} onClose={() => setSelectedPost(null)} onAuthRequired={() => openAuth("login")} />
      )}
      <CreatePostModal isOpen={createPostOpen} onClose={() => setCreatePostOpen(false)} onAuthRequired={() => openAuth("login")} />
      <Footer />
    </div>
  );
};

export default Hers;
