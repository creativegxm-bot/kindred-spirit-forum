import { Link } from "react-router-dom";
import { Flame } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useLocalizedNavigate } from "@/hooks/useLocalizedNavigate";
import { techNewsArticles } from "@/data/techNews";
import { Badge } from "@/components/ui/badge";

const categoryColors: Record<string, string> = {
  game: "bg-red-500/10 text-red-500 border-red-500/20",
  app: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  ai: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  space: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
};

const categoryLabels: Record<string, { en: string; tr: string }> = {
  game: { en: "Game", tr: "Oyun" },
  app: { en: "App", tr: "Uygulama" },
  ai: { en: "AI", tr: "YZ" },
  space: { en: "Space", tr: "Uzay" },
};

const TrendingNews = () => {
  const { language } = useLanguage();
  const { localePath } = useLocalizedNavigate();

  const topNews = techNewsArticles.slice(0, 5);

  return (
    <div className="card-gradient rounded-lg border border-border overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          <h3 className="font-bold text-sm uppercase tracking-wide">
            {language === "tr" ? "Gündem Haberler" : "Trending News"}
          </h3>
        </div>
        <Link
          to={localePath("/tech-news")}
          className="text-xs text-primary hover:underline font-medium"
        >
          {language === "tr" ? "Tümünü Gör" : "See All"}
        </Link>
      </div>

      <div className="divide-y divide-border">
        {topNews.map((article, index) => (
          <Link
            key={article.id}
            to={localePath(`/tech-news/${article.id}`)}
            className="flex gap-3 px-4 py-2.5 hover:bg-accent/50 transition-colors group"
          >
            <div className="relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden">
              <img
                src={article.imageUrl}
                alt={language === "tr" ? article.titleTr : article.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                loading="lazy"
              />
              <span className="absolute top-0.5 left-0.5 bg-black/70 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded">
                {index + 1}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                {language === "tr" ? article.titleTr : article.title}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="outline"
                  className={`text-[10px] px-1.5 py-0 h-4 ${categoryColors[article.category]}`}
                >
                  {language === "tr"
                    ? categoryLabels[article.category].tr
                    : categoryLabels[article.category].en}
                </Badge>
                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                  {article.sourceName}
                  <ExternalLink className="h-2.5 w-2.5" />
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default TrendingNews;
