import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Users, ArrowLeft, Download, ExternalLink, Calendar, HardDrive, Code2 } from "lucide-react";
import { robloxGames } from "@/data/robloxGames";
import { useLocalizedNavigate } from "@/hooks/useLocalizedNavigate";
import { useLanguage } from "@/hooks/useLanguage";
import Footer from "@/components/Footer";

const RobloxGameDetail = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { localePath } = useLocalizedNavigate();
  const { language } = useLanguage();

  const game = robloxGames.find((g) => g.id === gameId);

  if (!game) {
    return (
      <div className="container max-w-3xl py-12 text-center space-y-4">
        <h1 className="text-2xl font-bold">
          {language === "tr" ? "Oyun bulunamadı" : "Game not found"}
        </h1>
        <Link to={localePath("/roblox")}>
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {language === "tr" ? "Oyunlara Dön" : "Back to Games"}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-6 space-y-6">
      {/* Back link */}
      <Link to={localePath("/roblox")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        {language === "tr" ? "Tüm Oyunlar" : "All Games"}
      </Link>

      {/* Hero */}
      <Card>
        <CardContent className="p-6 space-y-5">
          <div className="flex items-start gap-4">
            <span className="text-6xl">{game.icon}</span>
            <div className="flex-1 space-y-1">
              <h1 className="text-2xl font-bold">{game.title}</h1>
              <p className="text-sm text-muted-foreground">{game.developer}</p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold">{game.rating}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {game.players}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge>{game.category}</Badge>
            {game.tags.map((tag) => (
              <Badge key={tag} variant="outline">{tag}</Badge>
            ))}
          </div>

          <p className="text-sm leading-relaxed">{game.description}</p>

          {/* Details grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                {language === "tr" ? "Çıkış Tarihi" : "Release Date"}
              </div>
              <p className="text-sm font-medium">{game.releaseDate}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <HardDrive className="h-3.5 w-3.5" />
                {language === "tr" ? "Boyut" : "Size"}
              </div>
              <p className="text-sm font-medium">{game.size}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Code2 className="h-3.5 w-3.5" />
                {language === "tr" ? "Platform" : "Platform"}
              </div>
              <p className="text-sm font-medium">Roblox</p>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button asChild size="lg" className="flex-1">
              <a href={game.robloxUrl} target="_blank" rel="noopener noreferrer">
                <Download className="h-5 w-5 mr-2" />
                {language === "tr" ? "Roblox'ta İndir" : "Download on Roblox"}
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href={game.robloxUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                {language === "tr" ? "Roblox'ta Aç" : "Open in Roblox"}
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
      <Footer />
    </div>
  );
};

export default RobloxGameDetail;
