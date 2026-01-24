import { Calendar, Award, FileText, MessageSquare, Mail } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { useStartDirectMessage } from "@/hooks/useDirectMessage";
import { useLanguage } from "@/hooks/useLanguage";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { toast } from "sonner";

interface ProfileHeaderProps {
  profile: UserProfile;
  karma: {
    total: number;
    postKarma: number;
    commentKarma: number;
    postCount: number;
    commentCount: number;
  } | undefined;
  onOpenAuth?: (mode: "login" | "signup") => void;
}

const ProfileHeader = ({ profile, karma, onOpenAuth }: ProfileHeaderProps) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const startDM = useStartDirectMessage();
  const memberSince = format(new Date(profile.created_at), "MMMM yyyy", { locale: tr });

  const isOwnProfile = user?.id === profile.user_id;

  const handleSendMessage = async () => {
    if (!user) {
      onOpenAuth?.("login");
      return;
    }

    try {
      await startDM.mutateAsync(profile.user_id);
      toast.success(t("dmStarted"));
    } catch (error) {
      toast.error(t("dmStartError"));
    }
  };

  return (
    <div className="card-gradient rounded-lg border border-border p-6">
      <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
        <Avatar className="h-24 w-24 border-4 border-primary/20">
          <AvatarImage src={profile.avatar_url || undefined} />
          <AvatarFallback className="text-2xl bg-primary/10 text-primary">
            {profile.username[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div>
              <h1 className="text-2xl font-bold">
                {profile.display_name || profile.username}
              </h1>
              <p className="text-muted-foreground">u/{profile.username}</p>
            </div>
            
            {!isOwnProfile && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleSendMessage}
                disabled={startDM.isPending}
                className="sm:ml-auto"
              >
                <Mail className="h-4 w-4 mr-2" />
                {t("startDM")}
              </Button>
            )}
          </div>
          
          {profile.bio && (
            <p className="mt-3 text-sm text-foreground">{profile.bio}</p>
          )}

          <div className="flex flex-wrap gap-4 mt-4 justify-center sm:justify-start">
            <div className="flex items-center gap-2 text-sm">
              <Award className="h-4 w-4 text-primary" />
              <span className="font-semibold">{karma?.total ?? 0}</span>
              <span className="text-muted-foreground">karma</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{memberSince} tarihinde katıldı</span>
            </div>
          </div>
        </div>
      </div>

      {/* Karma Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">{karma?.postKarma ?? 0}</p>
          <p className="text-xs text-muted-foreground">Gönderi Karması</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">{karma?.commentKarma ?? 0}</p>
          <p className="text-xs text-muted-foreground">Yorum Karması</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <p className="text-2xl font-bold">{karma?.postCount ?? 0}</p>
          </div>
          <p className="text-xs text-muted-foreground">Gönderi</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <p className="text-2xl font-bold">{karma?.commentCount ?? 0}</p>
          </div>
          <p className="text-xs text-muted-foreground">Yorum</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
