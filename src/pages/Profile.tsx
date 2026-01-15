import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import ProfileHeader from "@/components/ProfileHeader";
import ProfileTabs from "@/components/ProfileTabs";
import ProfileSettings from "@/components/ProfileSettings";
import AuthModal from "@/components/AuthModal";
import { useUserProfile, useUserPosts, useUserComments, useUserKarma } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

const Profile = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user, profile: currentUserProfile } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  const { data: profile, isLoading: profileLoading, error } = useUserProfile(username || "");
  const { data: posts, isLoading: postsLoading } = useUserPosts(profile?.user_id);
  const { data: comments, isLoading: commentsLoading } = useUserComments(profile?.user_id);
  const { data: karma } = useUserKarma(profile?.user_id);

  const isOwnProfile = user && currentUserProfile?.username === username;

  const openAuth = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          onCreatePost={() => {}}
          onMenuToggle={() => {}}
          onOpenAuth={openAuth}
        />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          onCreatePost={() => {}}
          onMenuToggle={() => {}}
          onOpenAuth={openAuth}
        />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-2">Kullanıcı bulunamadı</h1>
          <p className="text-muted-foreground mb-6">
            u/{username} kullanıcısı mevcut değil veya silinmiş.
          </p>
          <Button onClick={() => navigate("/")} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Ana Sayfaya Dön
          </Button>
        </div>
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          defaultMode={authMode}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        onCreatePost={() => navigate("/")}
        onMenuToggle={() => {}}
        onOpenAuth={openAuth}
      />

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Geri
          </Button>
          {isOwnProfile && <ProfileSettings />}
        </div>

        <div className="space-y-6">
          <ProfileHeader profile={profile} karma={karma} />
          <ProfileTabs
            posts={posts}
            comments={comments}
            isLoading={postsLoading || commentsLoading}
          />
        </div>
      </main>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authMode}
      />
    </div>
  );
};

export default Profile;
