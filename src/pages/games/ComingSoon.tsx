import { useParams, Link } from "react-router-dom";
import { findGame } from "@/data/games";
import { GameLayout } from "@/components/GameLayout";
import { Button } from "@/components/ui/button";

const ComingSoon = () => {
  const { slug = "" } = useParams();
  const game = findGame(slug);
  if (!game) return null;
  return (
    <GameLayout title={game.name}>
      <div className="max-w-xl mx-auto bg-card/80 backdrop-blur rounded-2xl border border-border p-8 text-center mt-12">
        <div className="text-7xl mb-4">{game.icon}</div>
        <h2 className="text-2xl font-bold mb-2">{game.name}</h2>
        <p className="text-muted-foreground mb-6">{game.desc}</p>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-sm mb-6">
          🚧 Coming soon
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          We're building this game next. In the meantime, try one of the playable games below.
        </p>
        <Link to="/"><Button>Browse playable games</Button></Link>
      </div>
    </GameLayout>
  );
};

export default ComingSoon;
