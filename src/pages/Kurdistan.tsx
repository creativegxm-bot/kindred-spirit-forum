import { Link } from "react-router-dom";
import { useLocalizedNavigate } from "@/hooks/useLocalizedNavigate";
import { useLanguage } from "@/hooks/useLanguage";
import { ArrowLeft, MapPin, Users, Mountain, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Footer from "@/components/Footer";

interface KurdistanCity {
  name: string;
  nameTr: string;
  nameKu: string;
  population: number;
  region: string;
  regionTr: string;
  country: string;
  countryTr: string;
  lat: number;
  lng: number;
}

const kurdistanCities: KurdistanCity[] = [
  { name: "Erbil", nameTr: "Erbil", nameKu: "Hewlêr", population: 1500000, region: "Southern Kurdistan", regionTr: "Güney Kürdistan", country: "Iraq", countryTr: "Irak", lat: 36.19, lng: 44.01 },
  { name: "Sulaymaniyah", nameTr: "Süleymaniye", nameKu: "Silêmanî", population: 900000, region: "Southern Kurdistan", regionTr: "Güney Kürdistan", country: "Iraq", countryTr: "Irak", lat: 35.56, lng: 45.43 },
  { name: "Duhok", nameTr: "Duhok", nameKu: "Dihok", population: 350000, region: "Southern Kurdistan", regionTr: "Güney Kürdistan", country: "Iraq", countryTr: "Irak", lat: 36.87, lng: 42.99 },
  { name: "Kirkuk", nameTr: "Kerkük", nameKu: "Kerkûk", population: 1000000, region: "Southern Kurdistan", regionTr: "Güney Kürdistan", country: "Iraq", countryTr: "Irak", lat: 35.47, lng: 44.39 },
  { name: "Halabja", nameTr: "Halepçe", nameKu: "Helebce", population: 75000, region: "Southern Kurdistan", regionTr: "Güney Kürdistan", country: "Iraq", countryTr: "Irak", lat: 35.18, lng: 45.99 },
  { name: "Diyarbakır", nameTr: "Diyarbakır", nameKu: "Amed", population: 1790000, region: "Northern Kurdistan", regionTr: "Kuzey Kürdistan", country: "Turkey", countryTr: "Türkiye", lat: 37.91, lng: 40.24 },
  { name: "Van", nameTr: "Van", nameKu: "Wan", population: 540000, region: "Northern Kurdistan", regionTr: "Kuzey Kürdistan", country: "Turkey", countryTr: "Türkiye", lat: 38.49, lng: 43.38 },
  { name: "Şanlıurfa", nameTr: "Şanlıurfa", nameKu: "Riha", population: 2070000, region: "Northern Kurdistan", regionTr: "Kuzey Kürdistan", country: "Turkey", countryTr: "Türkiye", lat: 37.16, lng: 38.79 },
  { name: "Batman", nameTr: "Batman", nameKu: "Êlih", population: 620000, region: "Northern Kurdistan", regionTr: "Kuzey Kürdistan", country: "Turkey", countryTr: "Türkiye", lat: 37.89, lng: 41.13 },
  { name: "Mardin", nameTr: "Mardin", nameKu: "Mêrdîn", population: 870000, region: "Northern Kurdistan", regionTr: "Kuzey Kürdistan", country: "Turkey", countryTr: "Türkiye", lat: 37.31, lng: 40.74 },
  { name: "Siirt", nameTr: "Siirt", nameKu: "Sêrt", population: 330000, region: "Northern Kurdistan", regionTr: "Kuzey Kürdistan", country: "Turkey", countryTr: "Türkiye", lat: 37.93, lng: 41.94 },
  { name: "Şırnak", nameTr: "Şırnak", nameKu: "Şirnex", population: 520000, region: "Northern Kurdistan", regionTr: "Kuzey Kürdistan", country: "Turkey", countryTr: "Türkiye", lat: 37.42, lng: 42.46 },
  { name: "Hakkari", nameTr: "Hakkari", nameKu: "Colemêrg", population: 280000, region: "Northern Kurdistan", regionTr: "Kuzey Kürdistan", country: "Turkey", countryTr: "Türkiye", lat: 37.58, lng: 43.74 },
  { name: "Bingöl", nameTr: "Bingöl", nameKu: "Çewlîg", population: 280000, region: "Northern Kurdistan", regionTr: "Kuzey Kürdistan", country: "Turkey", countryTr: "Türkiye", lat: 38.88, lng: 40.49 },
  { name: "Muş", nameTr: "Muş", nameKu: "Mûş", population: 410000, region: "Northern Kurdistan", regionTr: "Kuzey Kürdistan", country: "Turkey", countryTr: "Türkiye", lat: 38.73, lng: 41.51 },
  { name: "Bitlis", nameTr: "Bitlis", nameKu: "Bedlîs", population: 350000, region: "Northern Kurdistan", regionTr: "Kuzey Kürdistan", country: "Turkey", countryTr: "Türkiye", lat: 38.40, lng: 42.12 },
  { name: "Ağrı", nameTr: "Ağrı", nameKu: "Agirî", population: 540000, region: "Northern Kurdistan", regionTr: "Kuzey Kürdistan", country: "Turkey", countryTr: "Türkiye", lat: 39.72, lng: 43.05 },
  { name: "Mahabad", nameTr: "Mehabad", nameKu: "Mehabad", population: 170000, region: "Eastern Kurdistan", regionTr: "Doğu Kürdistan", country: "Iran", countryTr: "İran", lat: 36.76, lng: 45.72 },
  { name: "Sanandaj", nameTr: "Senendec", nameKu: "Sine", population: 430000, region: "Eastern Kurdistan", regionTr: "Doğu Kürdistan", country: "Iran", countryTr: "İran", lat: 35.31, lng: 46.99 },
  { name: "Kermanshah", nameTr: "Kirmanşah", nameKu: "Kirmaşan", population: 950000, region: "Eastern Kurdistan", regionTr: "Doğu Kürdistan", country: "Iran", countryTr: "İran", lat: 34.31, lng: 47.07 },
  { name: "Ilam", nameTr: "İlam", nameKu: "Îlam", population: 195000, region: "Eastern Kurdistan", regionTr: "Doğu Kürdistan", country: "Iran", countryTr: "İran", lat: 33.64, lng: 46.42 },
  { name: "Qamishli", nameTr: "Kamışlı", nameKu: "Qamişlo", population: 250000, region: "Western Kurdistan", regionTr: "Batı Kürdistan", country: "Syria", countryTr: "Suriye", lat: 37.05, lng: 41.22 },
  { name: "Afrin", nameTr: "Afrin", nameKu: "Efrîn", population: 200000, region: "Western Kurdistan", regionTr: "Batı Kürdistan", country: "Syria", countryTr: "Suriye", lat: 36.51, lng: 36.87 },
  { name: "Kobanî", nameTr: "Kobanê", nameKu: "Kobanê", population: 55000, region: "Western Kurdistan", regionTr: "Batı Kürdistan", country: "Syria", countryTr: "Suriye", lat: 36.89, lng: 38.35 },
  { name: "Hasakah", nameTr: "Haseke", nameKu: "Hesekê", population: 250000, region: "Western Kurdistan", regionTr: "Batı Kürdistan", country: "Syria", countryTr: "Suriye", lat: 36.50, lng: 40.75 },
];

const regionColors: Record<string, string> = {
  "Northern Kurdistan": "bg-red-500/10 text-red-600 border-red-500/20",
  "Southern Kurdistan": "bg-green-500/10 text-green-600 border-green-500/20",
  "Eastern Kurdistan": "bg-amber-500/10 text-amber-600 border-amber-500/20",
  "Western Kurdistan": "bg-blue-500/10 text-blue-600 border-blue-500/20",
};

const formatPop = (n: number) => {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(0) + "K";
  return n.toString();
};

const Kurdistan = () => {
  const { localePath } = useLocalizedNavigate();
  const { language } = useLanguage();
  const isTr = language === "tr";

  const totalPop = kurdistanCities.reduce((s, c) => s + c.population, 0);
  const regions = [...new Set(kurdistanCities.map(c => c.region))];

  // SVG map boundaries (approximate bounding box for Kurdistan region)
  const minLat = 33.0, maxLat = 40.5, minLng = 36.0, maxLng = 47.0;
  const svgW = 800, svgH = 600;

  const project = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * svgW;
    const y = ((maxLat - lat) / (maxLat - minLat)) * svgH;
    return { x, y };
  };

  const regionDotColor: Record<string, string> = {
    "Northern Kurdistan": "#ef4444",
    "Southern Kurdistan": "#22c55e",
    "Eastern Kurdistan": "#f59e0b",
    "Western Kurdistan": "#3b82f6",
  };

  // Approximate Kurdistan boundary polygon points
  const boundaryPoints = [
    { lat: 39.8, lng: 38.5 }, { lat: 40.2, lng: 40.0 }, { lat: 39.5, lng: 41.5 },
    { lat: 39.0, lng: 43.5 }, { lat: 38.0, lng: 44.5 }, { lat: 37.5, lng: 44.0 },
    { lat: 37.0, lng: 45.0 }, { lat: 36.5, lng: 46.0 }, { lat: 35.5, lng: 46.5 },
    { lat: 35.0, lng: 47.0 }, { lat: 34.0, lng: 47.0 }, { lat: 33.5, lng: 46.5 },
    { lat: 34.5, lng: 45.5 }, { lat: 35.0, lng: 44.5 }, { lat: 35.5, lng: 44.0 },
    { lat: 36.0, lng: 43.0 }, { lat: 36.5, lng: 42.0 }, { lat: 37.0, lng: 41.0 },
    { lat: 36.5, lng: 40.0 }, { lat: 36.5, lng: 38.5 }, { lat: 36.8, lng: 37.0 },
    { lat: 37.5, lng: 37.5 }, { lat: 38.5, lng: 38.0 },
  ];

  const boundaryPath = boundaryPoints
    .map((p, i) => {
      const { x, y } = project(p.lat, p.lng);
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ") + " Z";

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl py-8 px-4">
        <Link to={localePath("/")}>
          <Button variant="ghost" size="sm" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            {isTr ? "Ana Sayfa" : "Home"}
          </Button>
        </Link>

        <div className="text-center mb-8 space-y-3">
          <h1 className="text-4xl font-bold text-primary flex items-center justify-center gap-3">
            <Mountain className="h-9 w-9" />
            {isTr ? "Kürdistan Haritası" : "Kurdistan Map"}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {isTr
              ? "Kürdistan bölgesindeki şehirler ve nüfus bilgileri. Tahmini toplam nüfus yaklaşık 30-45 milyon."
              : "Cities and population data across the Kurdistan region. Estimated total population approximately 30-45 million."}
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <p className="text-2xl font-bold text-primary">{kurdistanCities.length}</p>
            <p className="text-sm text-muted-foreground">{isTr ? "Şehir" : "Cities"}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <p className="text-2xl font-bold text-primary">{formatPop(totalPop)}</p>
            <p className="text-sm text-muted-foreground">{isTr ? "Listelenen Nüfus" : "Listed Population"}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <p className="text-2xl font-bold text-primary">4</p>
            <p className="text-sm text-muted-foreground">{isTr ? "Bölge" : "Regions"}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <p className="text-2xl font-bold text-primary">4</p>
            <p className="text-sm text-muted-foreground">{isTr ? "Ülke" : "Countries"}</p>
          </div>
        </div>

        {/* SVG Map */}
        <div className="rounded-xl border border-border bg-card p-4 mb-8 overflow-hidden">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            {isTr ? "Bölge Haritası" : "Region Map"}
          </h2>
          <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto min-w-[500px]" style={{ maxHeight: 500 }}>
              {/* Background */}
              <rect width={svgW} height={svgH} fill="hsl(var(--muted))" rx={12} opacity={0.3} />

              {/* Kurdistan boundary */}
              <path d={boundaryPath} fill="hsl(var(--primary) / 0.08)" stroke="hsl(var(--primary))" strokeWidth={2} strokeDasharray="6 3" />

              {/* City dots and labels */}
              {kurdistanCities.map((city) => {
                const { x, y } = project(city.lat, city.lng);
                const r = Math.max(4, Math.min(14, city.population / 200000));
                const color = regionDotColor[city.region] || "#888";
                return (
                  <g key={city.name}>
                    <circle cx={x} cy={y} r={r} fill={color} opacity={0.7} stroke={color} strokeWidth={1.5} />
                    <text
                      x={x + r + 4} y={y + 4}
                      fontSize={city.population > 800000 ? 11 : 9}
                      fontWeight={city.population > 800000 ? 600 : 400}
                      fill="hsl(var(--foreground))"
                      className="select-none"
                    >
                      {city.nameKu}
                    </text>
                  </g>
                );
              })}

              {/* Region legend */}
              {Object.entries(regionDotColor).map(([region, color], i) => (
                <g key={region} transform={`translate(16, ${svgH - 100 + i * 22})`}>
                  <circle cx={6} cy={-4} r={5} fill={color} opacity={0.8} />
                  <text x={16} y={0} fontSize={10} fill="hsl(var(--foreground))" opacity={0.8}>
                    {isTr
                      ? kurdistanCities.find(c => c.region === region)?.regionTr || region
                      : region}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Cities by region */}
        {regions.map(region => {
          const regionCities = kurdistanCities
            .filter(c => c.region === region)
            .sort((a, b) => b.population - a.population);
          const regionPop = regionCities.reduce((s, c) => s + c.population, 0);
          const colorClass = regionColors[region] || "";

          return (
            <div key={region} className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl font-bold">
                  {isTr ? regionCities[0]?.regionTr : region}
                </h2>
                <Badge variant="outline" className={colorClass}>
                  {regionCities[0]?.countryTr && isTr ? regionCities[0].countryTr : regionCities[0]?.country}
                </Badge>
                <span className="text-sm text-muted-foreground ml-auto">
                  {formatPop(regionPop)} {isTr ? "nüfus" : "pop."}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {regionCities.map(city => (
                  <div key={city.name} className="rounded-xl border border-border bg-card p-4 hover:border-primary/40 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{isTr ? city.nameTr : city.name}</h3>
                        <p className="text-xs text-muted-foreground">{city.nameKu}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs font-mono">
                        {formatPop(city.population)}
                      </Badge>
                    </div>
                    <div className="flex gap-3 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{isTr ? city.countryTr : city.country}</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{city.population.toLocaleString()}</span>
                    </div>
                    {/* Population bar */}
                    <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(100, (city.population / 2100000) * 100)}%`,
                          backgroundColor: regionDotColor[city.region],
                          opacity: 0.7,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <Footer />
    </div>
  );
};

export default Kurdistan;
