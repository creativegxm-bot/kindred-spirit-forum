import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, Search, Gamepad2, Users } from "lucide-react";
import { robloxGames, gameCategories } from "@/data/robloxGames";
import { useLocalizedNavigate } from "@/hooks/useLocalizedNavigate";
import { useLanguage } from "@/hooks/useLanguage";
import { useState } from "react";

const RobloxGames = () => {
  const { localePath } = useLocalizedNavigate();
  const { language } = useLanguage();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = robloxGames.filter((game) => {
    const matchesSearch =
      !search ||
      game.title.toLowerCase().includes(search.toLowerCase()) ||
      game.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = !activeCategory || game.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container max-w-5xl py-6 space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <Gamepad2 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">
            {language === "tr" ? "Roblox Oyunları" : "Roblox Games"}
          </h1>
        </div>
        <p className="text-muted-foreground">
          {language === "tr"
            ? "En popüler Roblox oyunlarını keşfedin ve indirin."
            : "Discover and download the most popular Roblox games."}
        </p>
      </header>

      {/* Search & filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={language === "tr" ? "Oyun ara..." : "Search games..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={activeCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(null)}
          >
            {language === "tr" ? "Tümü" : "All"}
          </Button>
          {gameCategories.map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Game grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((game) => (
          <Link key={game.id} to={localePath(`/roblox/${game.id}`)}>
            <Card className="h-full hover:shadow-lg hover:border-primary/40 transition-all duration-200 cursor-pointer group">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-4xl">{game.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base group-hover:text-primary transition-colors truncate">
                      {game.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">{game.developer}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {game.shortDescription}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium">{game.rating}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    {game.players}
                  </div>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  <Badge variant="secondary" className="text-[10px]">
                    {game.category}
                  </Badge>
                  {game.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-[10px]">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          {language === "tr" ? "Oyun bulunamadı." : "No games found."}
        </div>
      )}
    </div>
  );
};

export default RobloxGames;
