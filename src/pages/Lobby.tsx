import { Link } from "react-router-dom";
import { GAMES } from "@/data/games";
import { Badge } from "@/components/ui/badge";
import { Spade } from "lucide-react";

const Lobby = () => {
  const categories = Array.from(new Set(GAMES.map(g => g.category)));

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/40 bg-background/70 backdrop-blur sticky top-0 z-10">
        <div className="container flex items-center gap-3 h-16">
          <div className="flex items-center gap-2">
            <Spade className="h-6 w-6 text-primary fill-primary" />
            <span className="text-xl font-extrabold tracking-tight">CardTable</span>
          </div>
          <span className="text-sm text-muted-foreground hidden sm:inline ml-2">
            Free card games. No download. Play in your browser.
          </span>
        </div>
      </header>

      <main className="container py-8">
        <section className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
            Play <span className="text-primary">Card Games</span> Online
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            32 classic card and board games — Solitaire, Hearts, Spades, Blackjack, Poker and more.
            Single-player against the computer, no signup needed.
          </p>
        </section>

        {categories.map(cat => {
          const games = GAMES.filter(g => g.category === cat);
          return (
            <section key={cat} className="mb-10">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                {cat}
                <span className="text-sm font-normal text-muted-foreground">({games.length})</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {games.map(g => (
                  <Link
                    key={g.slug}
                    to={`/games/${g.slug}`}
                    className="group relative rounded-xl border border-border bg-card p-4 hover:border-primary/60 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5 transition-all"
                  >
                    {g.status === "soon" && (
                      <Badge variant="secondary" className="absolute top-2 right-2 text-[9px]">SOON</Badge>
                    )}
                    {g.status === "playable" && (
                      <Badge className="absolute top-2 right-2 text-[9px] bg-emerald-500 text-emerald-950">PLAY</Badge>
                    )}
                    <div className="text-4xl mb-2">{g.icon}</div>
                    <div className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors">
                      {g.name}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1">{g.players}</div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}

        <footer className="text-center text-xs text-muted-foreground pt-8 border-t border-border/40">
          CardTable — built with ❤️ for card game lovers.
        </footer>
      </main>
    </div>
  );
};

export default Lobby;
