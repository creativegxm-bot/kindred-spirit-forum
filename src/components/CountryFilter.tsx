import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface Country {
  code: string;
  name: string;
  flag: string;
  language: string;
}

export const COUNTRIES: Country[] = [
  { code: "TR", name: "Türkiye", flag: "🇹🇷", language: "tr" },
  { code: "US", name: "USA", flag: "🇺🇸", language: "en" },
  { code: "GB", name: "UK", flag: "🇬🇧", language: "en" },
  { code: "DE", name: "Deutschland", flag: "🇩🇪", language: "de" },
  { code: "FR", name: "France", flag: "🇫🇷", language: "fr" },
  { code: "ES", name: "España", flag: "🇪🇸", language: "es" },
  { code: "IN", name: "India", flag: "🇮🇳", language: "hi" },
  { code: "CN", name: "China", flag: "🇨🇳", language: "zh" },
  { code: "JP", name: "Japan", flag: "🇯🇵", language: "ja" },
  { code: "BR", name: "Brasil", flag: "🇧🇷", language: "pt" },
  { code: "RU", name: "Россия", flag: "🇷🇺", language: "ru" },
  { code: "IT", name: "Italia", flag: "🇮🇹", language: "it" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩", language: "id" },
  { code: "PK", name: "Pakistan", flag: "🇵🇰", language: "ur" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬", language: "en" },
  { code: "BD", name: "Bangladesh", flag: "🇧🇩", language: "bn" },
  { code: "MX", name: "México", flag: "🇲🇽", language: "es" },
  { code: "ET", name: "Ethiopia", flag: "🇪🇹", language: "am" },
  { code: "PH", name: "Philippines", flag: "🇵🇭", language: "fil" },
  { code: "EG", name: "Egypt", flag: "🇪🇬", language: "ar" },
  { code: "CD", name: "DR Congo", flag: "🇨🇩", language: "fr" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳", language: "vi" },
  { code: "IR", name: "Iran", flag: "🇮🇷", language: "fa" },
  { code: "TH", name: "Thailand", flag: "🇹🇭", language: "th" },
  { code: "ZA", name: "S. Africa", flag: "🇿🇦", language: "en" },
  { code: "TZ", name: "Tanzania", flag: "🇹🇿", language: "sw" },
  { code: "KR", name: "S. Korea", flag: "🇰🇷", language: "ko" },
  { code: "CO", name: "Colombia", flag: "🇨🇴", language: "es" },
  { code: "KE", name: "Kenya", flag: "🇰🇪", language: "en" },
  { code: "AR", name: "Argentina", flag: "🇦🇷", language: "es" },
];

interface CountryFilterProps {
  selectedCountry: string;
  onCountryChange: (country: string) => void;
}

const CountryFilter = ({ selectedCountry, onCountryChange }: CountryFilterProps) => {
  return (
    <div className="flex gap-1 p-1 bg-secondary rounded-lg overflow-x-auto scrollbar-hide">
      {COUNTRIES.map((country) => (
        <Button
          key={country.code}
          variant="ghost"
          size="sm"
          className={cn(
            "flex-shrink-0 gap-1.5 px-3",
            selectedCountry === country.code && "bg-card text-primary"
          )}
          onClick={() => onCountryChange(country.code)}
        >
          <span className="text-lg">{country.flag}</span>
          <span className="hidden sm:inline">{country.name}</span>
        </Button>
      ))}
    </div>
  );
};

export default CountryFilter;
