import { useState } from "react";
import { Search, Plus, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserMenu from "./UserMenu";
import LanguageSwitcher from "./LanguageSwitcher";
import NotificationDropdown from "./NotificationDropdown";
import AgeProgressionTool from "./AgeProgressionTool";
import SearchModal from "./SearchModal";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useLocalizedNavigate } from "@/hooks/useLocalizedNavigate";
import ondabirLogo from "@/assets/ondabir-logo.png";

interface HeaderProps {
  onCreatePost: () => void;
  onMenuToggle: () => void;
  onOpenAuth: (mode: "login" | "signup") => void;
}

const Header = ({ onCreatePost, onMenuToggle, onOpenAuth }: HeaderProps) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { localePath } = useLocalizedNavigate();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuToggle}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <a href={localePath("/")} className="flex items-center gap-2 shrink-0">
            <img src={ondabirLogo} alt="ondabir" className="h-8 w-8 rounded" />
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gradient leading-tight">
                ondabir
              </span>
              <span className="text-[10px] text-muted-foreground hidden sm:block leading-none">
                {t("slogan")}
              </span>
            </div>
          </a>

          <div className="flex flex-1 items-center justify-center px-4">
            <button
              onClick={() => setSearchOpen(true)}
              className="relative w-full max-w-xl"
            >
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t("searchPlaceholder")}
                  className="w-full bg-secondary border-none pl-10 focus-visible:ring-primary cursor-pointer"
                  readOnly
                />
              </div>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <AgeProgressionTool />
            <Button
              variant="create"
              size="sm"
              className="hidden gap-1.5 sm:flex"
              onClick={onCreatePost}
            >
              <Plus className="h-4 w-4" />
              {t("create")}
            </Button>
            <Button
              variant="create"
              size="icon"
              className="sm:hidden"
              onClick={onCreatePost}
            >
              <Plus className="h-5 w-5" />
            </Button>
            {user && (
              <div className="hidden sm:block">
                <NotificationDropdown />
              </div>
            )}
            <LanguageSwitcher />
            <UserMenu onOpenAuth={onOpenAuth} />
          </div>
        </div>
      </header>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default Header;
