import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useJoinCommunity } from "@/hooks/useCommunities";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import TrendingSidebar from "@/components/TrendingSidebar";
import AuthModal from "@/components/AuthModal";
import PostCard from "@/components/PostCard";
import PostDetail from "@/components/PostDetail";
import CreatePostModal from "@/components/CreatePostModal";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Calendar, Plus, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import type { Post, Community } from "@/hooks/usePosts";

const CommunityPage = () => {
  const { communityName } = useParams<{ communityName: string }>();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const joinCommunity = useJoinCommunity();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [createPostOpen, setCreatePostOpen] = useState(false);

  const openAuth = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  // Fetch community details
  const { data: community, isLoading: communityLoading } = useQuery({
    queryKey: ["community", communityName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("communities")
        .select("*")
        .eq("name", communityName)
        .single();

      if (error) throw error;
      return data as Community;
    },
    enabled: !!communityName,
  });

  // Fetch community posts
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ["community-posts", community?.id, user?.id],
    queryFn: async () => {
      if (!community) return [];

      const { data: postsData, error } = await supabase
        .from("posts")
        .select(`
          *,
          community:communities(name, icon)
        `)
        .eq("community_id", community.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch author profiles
      const authorIds = [...new Set((postsData || []).map(p => p.author_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, avatar_url")
        .in("user_id", authorIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      let postsWithAuthors = (postsData || []).map(post => ({
        ...post,
        author: profileMap.get(post.author_id) || { username: "deleted", avatar_url: null },
      }));

      if (user) {
        const { data: votes } = await supabase
          .from("votes")
          .select("post_id, vote_type")
          .eq("user_id", user.id)
          .not("post_id", "is", null);

        const { data: savedPosts } = await supabase
          .from("saved_posts")
          .select("post_id")
          .eq("user_id", user.id);

        const voteMap = new Map(votes?.map((v) => [v.post_id, v.vote_type]));
        const savedSet = new Set(savedPosts?.map((s) => s.post_id));

        postsWithAuthors = postsWithAuthors.map((post) => ({
          ...post,
          user_vote: voteMap.get(post.id) ?? null,
          is_saved: savedSet.has(post.id),
        }));
      }

      return postsWithAuthors as Post[];
    },
    enabled: !!community?.id,
  });

  // Fetch community members
  const { data: members = [] } = useQuery({
    queryKey: ["community-members", community?.id],
    queryFn: async () => {
      if (!community) return [];

      const { data, error } = await supabase
        .from("community_members")
        .select(`
          user_id,
          joined_at
        `)
        .eq("community_id", community.id)
        .order("joined_at", { ascending: true })
        .limit(10);

      if (error) throw error;

      // Fetch member profiles
      const userIds = data.map(m => m.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, avatar_url")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      return data.map(member => ({
        ...member,
        profile: profileMap.get(member.user_id),
      }));
    },
    enabled: !!community?.id,
  });

  // Check if user is a member
  const { data: isMember = false } = useQuery({
    queryKey: ["community-membership", community?.id, user?.id],
    queryFn: async () => {
      if (!community || !user) return false;

      const { data, error } = await supabase
        .from("community_members")
        .select("id")
        .eq("community_id", community.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!community?.id && !!user,
  });

  const handleJoin = async () => {
    if (!user) {
      openAuth("login");
      return;
    }
    if (!community) return;

    await joinCommunity.mutateAsync({ communityId: community.id, join: !isMember });
  };

  const handleCreatePost = () => {
    if (!user) {
      openAuth("login");
      return;
    }
    setCreatePostOpen(true);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d MMM yyyy", {
      locale: language === "tr" ? tr : enUS,
    });
  };

  if (communityLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          onCreatePost={handleCreatePost}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          onOpenAuth={openAuth}
        />
        <div className="flex">
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onOpenAuth={openAuth}
          />
          <main className="flex-1 px-4 py-4 lg:px-8">
            <Skeleton className="h-48 w-full rounded-lg mb-4" />
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          onCreatePost={handleCreatePost}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          onOpenAuth={openAuth}
        />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <h1 className="text-2xl font-bold">{t("communityNotFound")}</h1>
          <p className="text-muted-foreground">{t("communityNotFoundDesc")}</p>
          <Link to="/">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("backToHome")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        onCreatePost={handleCreatePost}
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        onOpenAuth={openAuth}
      />

      <div className="flex">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onOpenAuth={openAuth}
        />

        <main className="flex-1 max-w-4xl mx-auto px-4 py-4">
          {/* Community Banner */}
          <div className="relative rounded-lg overflow-hidden mb-4">
            <div
              className="h-32 bg-gradient-to-r from-primary/30 to-primary/10"
              style={community.banner_url ? { backgroundImage: `url(${community.banner_url})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background/90 to-transparent">
              <div className="flex items-end gap-4">
                <div className="text-5xl bg-card p-3 rounded-full border-4 border-background shadow-lg">
                  {community.icon || "💬"}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-foreground">r/{community.name}</h1>
                  <p className="text-muted-foreground text-sm">{community.description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Community Stats & Actions */}
          <div className="bg-card rounded-lg p-4 mb-4 border">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span className="font-semibold">{community.member_count}</span>
                  <span className="text-muted-foreground text-sm">{t("members")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <span className="text-muted-foreground text-sm">
                    {t("createdOn")} {formatDate(community.created_at)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={isMember ? "outline" : "default"}
                  onClick={handleJoin}
                  disabled={joinCommunity.isPending}
                >
                  {isMember ? t("leave") : t("join")}
                </Button>
                <Button onClick={handleCreatePost}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t("createPost")}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex gap-6">
            {/* Posts */}
            <div className="flex-1 space-y-4">
              {postsLoading ? (
                <>
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                </>
              ) : posts.length === 0 ? (
                <div className="bg-card rounded-lg p-8 text-center border">
                  <p className="text-muted-foreground">{t("noCommunityPosts")}</p>
                  <Button className="mt-4" onClick={handleCreatePost}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t("createFirstPost")}
                  </Button>
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

            {/* Member List Sidebar */}
            <div className="hidden lg:block w-72">
              <div className="bg-card rounded-lg p-4 border sticky top-20">
                <h3 className="font-semibold mb-4">{t("communityMembers")}</h3>
                <div className="space-y-3">
                  {members.map((member) => (
                    <Link
                      key={member.user_id}
                      to={`/u/${member.profile?.username}`}
                      className="flex items-center gap-3 hover:bg-accent rounded-lg p-2 transition-colors"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.profile?.avatar_url || undefined} />
                        <AvatarFallback>
                          {member.profile?.username?.[0]?.toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {member.profile?.username || t("deletedUser")}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
                {community.member_count > 10 && (
                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    +{community.member_count - 10} {t("moreMembers")}
                  </p>
                )}
              </div>
            </div>
          </div>
        </main>

        <TrendingSidebar />
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authMode}
      />

      {selectedPost && (
        <PostDetail
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onAuthRequired={() => openAuth("login")}
        />
      )}

      <CreatePostModal
        isOpen={createPostOpen}
        onClose={() => setCreatePostOpen(false)}
        onAuthRequired={() => openAuth("login")}
      />
    </div>
  );
};

export default CommunityPage;
