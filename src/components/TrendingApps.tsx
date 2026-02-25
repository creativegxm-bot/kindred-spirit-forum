import { trendingApps } from "@/data/trendingApps";
import { useLocalizedNavigate } from "@/hooks/useLocalizedNavigate";
import { useLanguage } from "@/hooks/useLanguage";
import { Star, Download, Smartphone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const TrendingApps = () => {
  const { navigate, localePath } = useLocalizedNavigate();
  const { language } = useLanguage();

  const topApps = [...trendingApps]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6);

  return (
    <section className="w-full max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">
            {language === "tr" ? "Trend Uygulamalar" : "Trending Apps"}
          </h2>
        </div>
        <a href={localePath("/apps")}>
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground">
            {language === "tr" ? "Tümünü Gör" : "View All"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </a>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {topApps.map((app) => (
          <button
            key={app.id}
            onClick={() => navigate(`/apps/${app.id}`)}
            className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/40 hover:shadow-md hover:shadow-primary/5"
          >
            <span className="text-4xl">{app.icon}</span>
            <div className="w-full text-center">
              <h3 className="text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                {app.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {language === "tr" ? app.categoryTr : app.category}
              </p>
              <div className="flex items-center justify-center gap-3 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-0.5">
                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                  {app.rating}
                </span>
                <span className="flex items-center gap-0.5">
                  <Download className="h-3 w-3" />
                  {app.downloads}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

export default TrendingApps;
