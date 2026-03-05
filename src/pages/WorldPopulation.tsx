import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { WORLD_COUNTRIES, formatPopulation } from "@/data/worldPopulation";
import { useLanguage } from "@/hooks/useLanguage";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Globe, Users, Building2, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const WorldPopulation = () => {
  const { language } = useLanguage();
  const [search, setSearch] = useState("");
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null);

  const filtered = WORLD_COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.cities.some((city) => city.name.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleCountry = (code: string) => {
    setExpandedCountry((prev) => (prev === code ? null : code));
  };

  const title = language === "tr" ? "Dünya Nüfus Verileri" : "World Population Data";
  const subtitle =
    language === "tr"
      ? "En kalabalık 30 ülke ve şehirleri"
      : "Top 30 most populated countries and their cities";

  return (
    <div className="min-h-screen bg-background">
      <Header onOpenAuth={() => {}} onCreatePost={() => {}} onMenuToggle={() => {}} />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Globe className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          </div>
          <p className="text-muted-foreground">{subtitle}</p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <Badge variant="secondary" className="gap-1">
              <Users className="h-3 w-3" />
              {language === "tr" ? "30 Ülke" : "30 Countries"}
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Building2 className="h-3 w-3" />
              {language === "tr" ? "300 Şehir" : "300 Cities"}
            </Badge>
          </div>
        </div>

        <div className="relative mb-6 max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={language === "tr" ? "Ülke veya şehir ara..." : "Search country or city..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12">#</TableHead>
                <TableHead>{language === "tr" ? "Ülke" : "Country"}</TableHead>
                <TableHead className="text-right">
                  {language === "tr" ? "Nüfus" : "Population"}
                </TableHead>
                <TableHead className="text-right w-20">
                  {language === "tr" ? "Şehirler" : "Cities"}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((country, idx) => (
                <>
                  <TableRow
                    key={country.code}
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => toggleCountry(country.code)}
                  >
                    <TableCell className="font-medium text-muted-foreground">
                      {idx + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {expandedCountry === country.code ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        )}
                        <span className="text-xl">{country.flag}</span>
                        <span className="font-medium">{country.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {country.population.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="text-xs">
                        {country.cities.length}
                      </Badge>
                    </TableCell>
                  </TableRow>
                  {expandedCountry === country.code &&
                    country.cities.map((city, cityIdx) => (
                      <TableRow
                        key={`${country.code}-${city.name}`}
                        className="bg-muted/20"
                      >
                        <TableCell />
                        <TableCell>
                          <div className="flex items-center gap-2 pl-10">
                            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm">{city.name}</span>
                            {cityIdx === 0 && (
                              <Badge className="text-[10px] h-4 bg-primary/10 text-primary border-0">
                                {language === "tr" ? "En büyük" : "Largest"}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm text-muted-foreground">
                          {city.population.toLocaleString()}
                        </TableCell>
                        <TableCell />
                      </TableRow>
                    ))}
                </>
              ))}
            </TableBody>
          </Table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            {language === "tr" ? "Sonuç bulunamadı" : "No results found"}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default WorldPopulation;
