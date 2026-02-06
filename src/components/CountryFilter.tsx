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
