import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Language } from "@/i18n/translations";
import { SUPPORTED_LANGUAGES, languageNames } from "@/i18n/languageCountryMapping";

const languageFlags: Record<Language, string> = {
  tr: "🇹🇷",
  en: "🇬🇧",
  de: "🇩🇪",
  fr: "🇫🇷",
  es: "🇪🇸",
  hi: "🇮🇳",
  zh: "🇨🇳",
  ja: "🇯🇵",
  pt: "🇧🇷",
  ru: "🇷🇺",
  it: "🇮🇹",
};

interface LanguageFilterProps {
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
}

const LanguageFilter = ({ selectedLanguage, onLanguageChange }: LanguageFilterProps) => {
  return (
    <div className="flex gap-1 p-1 bg-secondary rounded-lg overflow-x-auto scrollbar-hide">
      {SUPPORTED_LANGUAGES.map((lang) => (
        <Button
          key={lang}
          variant="ghost"
          size="sm"
          className={cn(
            "flex-shrink-0 gap-1.5 px-3",
            selectedLanguage === lang && "bg-card text-primary"
          )}
          onClick={() => onLanguageChange(lang)}
        >
          <span className="text-lg">{languageFlags[lang]}</span>
          <span className="hidden sm:inline">{languageNames[lang].native}</span>
        </Button>
      ))}
    </div>
  );
};

export default LanguageFilter;
