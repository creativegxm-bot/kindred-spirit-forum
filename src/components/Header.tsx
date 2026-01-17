import { Search, Plus, Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserMenu from "./UserMenu";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "@/hooks/useLanguage";
import ondabirLogo from "@/assets/ondabir-logo.png";

interface HeaderProps {
  onCreatePost: () => void;
  onMenuToggle: () => void;
  onOpenAuth: (mode: "login" | "signup") => void;
}

const Header = ({ onCreatePost, onMenuToggle, onOpenAuth }: HeaderProps) => {
  const { t } = useLanguage();

  return (
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

        <a href="/" className="flex items-center gap-2">
          <img src={ondabirLogo} alt="ondabir" className="h-8 w-8 rounded" />
          <span className="hidden text-xl font-bold text-gradient sm:block">
            ondabir
          </span>
        </a>

        <div className="flex flex-1 items-center justify-center px-4">
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("searchPlaceholder")}
              className="w-full bg-secondary border-none pl-10 focus-visible:ring-primary"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
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
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Bell className="h-5 w-5" />
          </Button>
          <LanguageSwitcher />
          <UserMenu onOpenAuth={onOpenAuth} />
        </div>
      </div>
    </header>
  );
};

export default Header;
