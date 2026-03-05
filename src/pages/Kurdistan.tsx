import { Link } from "react-router-dom";
import { useLocalizedNavigate } from "@/hooks/useLocalizedNavigate";
import { useLanguage } from "@/hooks/useLanguage";
import { ArrowLeft, MapPin, Users, Mountain, Globe, Ruler, SquareStack, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Footer from "@/components/Footer";
import {
  kurdistanCities,
  regionColors,
  regionDotColor,
  formatPop,
} from "@/data/kurdistanCities";

const Kurdistan = () => {
  const { localePath } = useLocalizedNavigate();
  const { language } = useLanguage();
  const isTr = language === "tr";

  const totalPop = kurdistanCities.reduce((s, c) => s + c.population, 0);
  const regions = [...new Set(kurdistanCities.map((c) => c.region))];

  // SVG map boundaries
  const minLat = 33.0, maxLat = 41.0, minLng = 36.0, maxLng = 48.0;
  const svgW = 800, svgH = 600;

  const project = (lat: number, lng: number) => ({
    x: ((lng - minLng) / (maxLng - minLng)) * svgW,
    y: ((maxLat - lat) / (maxLat - minLat)) * svgH,
  });

  const boundaryPoints = [
    { lat: 39.8, lng: 38.5 }, { lat: 40.5, lng: 40.0 }, { lat: 40.0, lng: 41.5 },
    { lat: 39.5, lng: 43.5 }, { lat: 38.5, lng: 44.5 }, { lat: 37.5, lng: 44.5 },
    { lat: 37.0, lng: 45.5 }, { lat: 36.5, lng: 46.5 }, { lat: 35.5, lng: 47.2 },
    { lat: 35.0, lng: 47.5 }, { lat: 34.0, lng: 47.5 }, { lat: 33.5, lng: 46.5 },
    { lat: 34.0, lng: 45.5 }, { lat: 35.0, lng: 44.5 }, { lat: 35.5, lng: 44.0 },
    { lat: 36.0, lng: 43.0 }, { lat: 36.5, lng: 42.0 }, { lat: 37.0, lng: 41.0 },
    { lat: 36.5, lng: 40.0 }, { lat: 36.5, lng: 38.5 }, { lat: 36.8, lng: 37.0 },
    { lat: 37.0, lng: 37.0 }, { lat: 38.0, lng: 37.5 }, { lat: 39.0, lng: 38.0 },
  ];

  const boundaryPath =
    boundaryPoints
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
              ? "Kürdistan bölgesindeki şehirler, nüfus, yükseklik ve kültürel bilgiler. Tahmini toplam nüfus yaklaşık 30-45 milyon."
              : "Cities, population, elevation, and cultural data across the Kurdistan region. Estimated total population approximately 30-45 million."}
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
              <rect width={svgW} height={svgH} fill="hsl(var(--muted))" rx={12} opacity={0.3} />
              <path d={boundaryPath} fill="hsl(var(--primary) / 0.08)" stroke="hsl(var(--primary))" strokeWidth={2} strokeDasharray="6 3" />

              {kurdistanCities.map((city) => {
                const { x, y } = project(city.lat, city.lng);
                const r = Math.max(3, Math.min(12, city.population / 200000));
                const color = regionDotColor[city.region] || "#888";
                return (
                  <g key={city.name + city.region}>
                    <circle cx={x} cy={y} r={r} fill={color} opacity={0.7} stroke={color} strokeWidth={1.5} />
                    {city.population > 300000 && (
                      <text
                        x={x + r + 3} y={y + 3}
                        fontSize={city.population > 800000 ? 10 : 8}
                        fontWeight={city.population > 800000 ? 600 : 400}
                        fill="hsl(var(--foreground))"
                        className="select-none"
                      >
                        {city.nameKu}
                      </text>
                    )}
                  </g>
                );
              })}

              {Object.entries(regionDotColor).map(([region, color], i) => (
                <g key={region} transform={`translate(16, ${svgH - 100 + i * 22})`}>
                  <circle cx={6} cy={-4} r={5} fill={color} opacity={0.8} />
                  <text x={16} y={0} fontSize={10} fill="hsl(var(--foreground))" opacity={0.8}>
                    {isTr ? kurdistanCities.find((c) => c.region === region)?.regionTr || region : region}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Cities by region */}
        {regions.map((region) => {
          const regionCities = kurdistanCities
            .filter((c) => c.region === region)
            .sort((a, b) => b.population - a.population);
          const regionPop = regionCities.reduce((s, c) => s + c.population, 0);
          const colorClass = regionColors[region] || "";

          return (
            <div key={region} className="mb-10">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <h2 className="text-xl font-bold">
                  {isTr ? regionCities[0]?.regionTr : region}
                </h2>
                <Badge variant="outline" className={colorClass}>
                  {isTr ? regionCities[0]?.countryTr : regionCities[0]?.country}
                </Badge>
                <Badge variant="secondary" className="text-xs font-mono">
                  {regionCities.length} {isTr ? "şehir" : "cities"}
                </Badge>
                <span className="text-sm text-muted-foreground ml-auto">
                  {formatPop(regionPop)} {isTr ? "nüfus" : "pop."}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {regionCities.map((city) => (
                  <div key={city.name + city.region} className="rounded-xl border border-border bg-card p-4 hover:border-primary/40 transition-colors space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{isTr ? city.nameTr : city.name}</h3>
                        <p className="text-xs text-muted-foreground">{city.nameKu}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs font-mono">
                        {formatPop(city.population)}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {isTr ? city.countryTr : city.country}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {city.population.toLocaleString()}
                      </span>
                      {city.elevation && (
                        <span className="flex items-center gap-1">
                          <Ruler className="h-3 w-3" />
                          {city.elevation.toLocaleString()}m
                        </span>
                      )}
                      {city.area && (
                        <span className="flex items-center gap-1">
                          <SquareStack className="h-3 w-3" />
                          {city.area.toLocaleString()} km²
                        </span>
                      )}
                    </div>

                    {(city.notable || city.notableTr) && (
                      <p className="text-xs text-muted-foreground/80 flex gap-1 items-start">
                        <Info className="h-3 w-3 mt-0.5 shrink-0" />
                        {isTr ? city.notableTr : city.notable}
                      </p>
                    )}

                    {/* Population bar */}
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
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
