import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/hooks/useLanguage";

const LanguageSwitcher = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">
            {language === "tr" ? "TR" : language === "en" ? "EN" : language === "fr" ? "FR" : language === "de" ? "DE" : language === "es" ? "ES" : language === "zh" ? "中" : language === "hi" ? "हि" : language === "ja" ? "日" : language === "pt" ? "PT" : language === "ru" ? "RU" : language === "it" ? "IT" : "EN"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto">
        <DropdownMenuItem
          onClick={() => setLanguage("tr")}
          className={language === "tr" ? "bg-accent" : ""}
        >
          🇹🇷 Türkçe
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage("en")}
          className={language === "en" ? "bg-accent" : ""}
        >
          🇬🇧 English
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage("de")}
          className={language === "de" ? "bg-accent" : ""}
        >
          🇩🇪 Deutsch
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage("fr")}
          className={language === "fr" ? "bg-accent" : ""}
        >
          🇫🇷 Français
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage("es")}
          className={language === "es" ? "bg-accent" : ""}
        >
          🇪🇸 Español
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage("it")}
          className={language === "it" ? "bg-accent" : ""}
        >
          🇮🇹 Italiano
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage("pt")}
          className={language === "pt" ? "bg-accent" : ""}
        >
          🇧🇷 Português
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage("ru")}
          className={language === "ru" ? "bg-accent" : ""}
        >
          🇷🇺 Русский
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage("ja")}
          className={language === "ja" ? "bg-accent" : ""}
        >
          🇯🇵 日本語
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage("zh")}
          className={language === "zh" ? "bg-accent" : ""}
        >
          🇨🇳 中文
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage("hi")}
          className={language === "hi" ? "bg-accent" : ""}
        >
          🇮🇳 हिंदी
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
