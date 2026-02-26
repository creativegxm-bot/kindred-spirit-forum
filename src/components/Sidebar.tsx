import { useState } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, Flame, Clock, Star, Plus, MessageSquare, FileImage, Heart, Newspaper, Smartphone, Mail, Shield, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCommunities } from "@/hooks/usePosts";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useLocalizedNavigate } from "@/hooks/useLocalizedNavigate";
import CreateCommunityModal from "./CreateCommunityModal";
import { cn } from "@/lib/utils";

const DAILY_LIFE_NAMES = new Set([
  "DailyLife", "VieQuotidienne", "VidaDiaria", "GunlukYasam",
  "Alltagsleben", "NichijouSeikatsu", "DainikJeevan",
  "VidaDiariaPT", "PovsednevnayaZhizn", "VitaQuotidiana",
]);

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: (mode: "login" | "signup") => void;
}

const Sidebar = ({ isOpen, onClose, onOpenAuth }: SidebarProps) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { data: communities = [] } = useCommunities(language);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const { localePath } = useLocalizedNavigate();

  const formatMembers = (count: number) => {
    const suffix = language === "tr" ? " üye" : " members";
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + "M" + suffix;
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(0) + "k" + suffix;
    }
    return count + suffix;
  };

  const handleCreateCommunity = () => {
    if (!user) {
      onOpenAuth("login");
      return;
    }
    setCreateModalOpen(true);
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-14 z-40 h-[calc(100vh-3.5rem)] w-64 bg-sidebar border-r border-border transition-transform duration-300 lg:sticky lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col gap-1 p-3">
          <h3 className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {language === "tr" ? "Akışlar" : "Feeds"}
          </h3>
          <Button variant="ghost" className="justify-start gap-3">
            <Flame className="h-5 w-5 text-upvote" />
            {t("popular")}
          </Button>
          <Button variant="ghost" className="justify-start gap-3">
            <TrendingUp className="h-5 w-5 text-green-500" />
            {language === "tr" ? "Trend" : "Trending"}
          </Button>
          <Button variant="ghost" className="justify-start gap-3">
            <Clock className="h-5 w-5 text-comment" />
            {t("new")}
          </Button>
          <Button variant="ghost" className="justify-start gap-3">
            <Star className="h-5 w-5 text-yellow-500" />
            {t("best")}
          </Button>
          <Link to={localePath("/chat")}>
            <Button variant="ghost" className="w-full justify-start gap-3">
              <MessageSquare className="h-5 w-5 text-primary" />
              {t("chat")}
            </Button>
          </Link>
          <Link to={localePath("/tools/converter")}>
            <Button variant="ghost" className="w-full justify-start gap-3">
              <FileImage className="h-5 w-5 text-orange-500" />
              {t("fileConverter")}
            </Button>
          </Link>
          <Link to={localePath("/tools/match-finder")}>
            <Button variant="ghost" className="w-full justify-start gap-3">
              <Heart className="h-5 w-5 text-pink-500" />
              {language === "tr" ? "Eş Bulucu" : "Match Finder"}
            </Button>
          </Link>
          <Link to={localePath("/tech-news")}>
            <Button variant="ghost" className="w-full justify-start gap-3">
              <Gamepad2 className="h-5 w-5 text-red-500" />
              {language === "tr" ? "Teknoloji Haberleri" : "Tech News"}
            </Button>
          </Link>
          <Link to={localePath("/news")}>
            <Button variant="ghost" className="w-full justify-start gap-3">
              <Newspaper className="h-5 w-5 text-blue-500" />
              {language === "tr" ? "Haber Kaynakları" : "News Sources"}
            </Button>
          </Link>
          <Link to={localePath("/top-apps")}>
            <Button variant="ghost" className="w-full justify-start gap-3">
              <Smartphone className="h-5 w-5 text-emerald-500" />
              {language === "tr" ? "En İyi Uygulamalar" : "Top 100 Apps"}
            </Button>
          </Link>
          <Link to={localePath("/email")}>
            <Button variant="ghost" className="w-full justify-start gap-3">
              <Mail className="h-5 w-5 text-violet-500" />
              {language === "tr" ? "E-posta Al" : "Get Email"}
            </Button>
          </Link>
          <Link to={localePath("/hims")}>
            <Button variant="ghost" className="w-full justify-start gap-3">
              <Shield className="h-5 w-5 text-blue-500" />
              {language === "tr" ? "Erkek Sağlığı" : "Hims"}
            </Button>
          </Link>
          <Link to={localePath("/hers")}>
            <Button variant="ghost" className="w-full justify-start gap-3">
              <Heart className="h-5 w-5 text-pink-500" />
              {language === "tr" ? "Kadın Sağlığı" : "Hers"}
            </Button>
          </Link>
        </div>

        <div className="mt-2 border-t border-border" />

        <div className="flex flex-col gap-1 p-3">
        <div className="flex items-center justify-between px-3 py-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("communities")}
            </h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleCreateCommunity}
              title={t("createCommunity")}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <Button
            variant="ghost"
            className="justify-start gap-3 text-primary hover:text-primary"
            onClick={handleCreateCommunity}
          >
            <Plus className="h-5 w-5" />
            {t("createCommunity")}
          </Button>

          {/* Daily Life communities pinned at top */}
          {communities
            .filter((c) => DAILY_LIFE_NAMES.has(c.name))
            .map((community) => (
              <Link key={community.id} to={localePath(`/r/${community.name}`)}>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 h-auto py-2 bg-primary/5 border border-primary/20 hover:bg-primary/10"
                >
                  <span className="text-xl">🌞</span>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium text-primary">r/{community.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatMembers(community.member_count)}
                    </span>
                  </div>
                </Button>
              </Link>
            ))}

          {/* Other communities */}
          {communities
            .filter((c) => !DAILY_LIFE_NAMES.has(c.name))
            .map((community) => (
              <Link key={community.id} to={localePath(`/r/${community.name}`)}>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 h-auto py-2"
                >
                  <span className="text-xl">{community.icon || "💬"}</span>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">r/{community.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatMembers(community.member_count)}
                    </span>
                  </div>
                </Button>
              </Link>
            ))}
        </div>
      </aside>

      <CreateCommunityModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onAuthRequired={() => onOpenAuth("login")}
      />
    </>
  );
};

export default Sidebar;
