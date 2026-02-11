import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/hooks/useLanguage";
import { useNavigate, useLocation } from "react-router-dom";
import { Language } from "@/i18n/translations";
import { SUPPORTED_LANGUAGES } from "@/i18n/languageCountryMapping";

const languageLabels: Record<Language, { flag: string; name: string; short: string }> = {
  tr: { flag: "🇹🇷", name: "Türkçe", short: "TR" },
  en: { flag: "🇬🇧", name: "English", short: "EN" },
  de: { flag: "🇩🇪", name: "Deutsch", short: "DE" },
  fr: { flag: "🇫🇷", name: "Français", short: "FR" },
  es: { flag: "🇪🇸", name: "Español", short: "ES" },
  it: { flag: "🇮🇹", name: "Italiano", short: "IT" },
  pt: { flag: "🇧🇷", name: "Português", short: "PT" },
  ru: { flag: "🇷🇺", name: "Русский", short: "RU" },
  ja: { flag: "🇯🇵", name: "日本語", short: "日" },
  zh: { flag: "🇨🇳", name: "中文", short: "中" },
  hi: { flag: "🇮🇳", name: "हिंदी", short: "हि" },
};

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    // Replace the language prefix in the current URL
    const pathParts = location.pathname.split("/");
    if (pathParts.length >= 2 && SUPPORTED_LANGUAGES.includes(pathParts[1] as Language)) {
      pathParts[1] = lang;
      navigate(pathParts.join("/") || `/${lang}`, { replace: true });
    } else {
      navigate(`/${lang}`, { replace: true });
    }
  };

  const current = languageLabels[language];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{current.short}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto">
        {SUPPORTED_LANGUAGES.map((lang) => {
          const info = languageLabels[lang];
          return (
            <DropdownMenuItem
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={language === lang ? "bg-accent" : ""}
            >
              {info.flag} {info.name}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
