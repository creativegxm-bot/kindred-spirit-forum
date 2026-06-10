import { useState, useEffect } from "react";
import { Card, createDeck, shuffle, rankValue } from "@/lib/cards/deck";
import { PlayingCard } from "@/components/PlayingCard";
import { GameLayout } from "@/components/GameLayout";
import { Button } from "@/components/ui/button";

interface State {
  player: Card[];
  cpu: Card[];
  playerPlay: Card[];
  cpuPlay: Card[];
  msg: string;
  winner: "player" | "cpu" | null;
}

const deal = (): State => {
  const d = shuffle(createDeck(false));
  return {
    player: d.slice(0, 26),
    cpu: d.slice(26),
    playerPlay: [], cpuPlay: [],
    msg: "Click Flip to play a card",
    winner: null,
  };
};

const War = () => {
  const [s, setS] = useState<State>(deal);

  const flip = () => {
    if (s.winner) return;
    setS(prev => {
      if (prev.player.length === 0) return { ...prev, winner: "cpu", msg: "CPU wins the war!" };
      if (prev.cpu.length === 0) return { ...prev, winner: "player", msg: "You won the war!" };
      let p = [...prev.player], c = [...prev.cpu];
      const pPlay = [...prev.playerPlay, { ...p.shift()!, faceUp: true }];
      const cPlay = [...prev.cpuPlay, { ...c.shift()!, faceUp: true }];
      const pTop = pPlay[pPlay.length - 1], cTop = cPlay[cPlay.length - 1];
      const pv = rankValue(pTop.rank) === 1 ? 14 : rankValue(pTop.rank);
      const cv = rankValue(cTop.rank) === 1 ? 14 : rankValue(cTop.rank);
      if (pv > cv) {
        return { ...prev, player: [...p, ...shuffle([...pPlay, ...cPlay])], cpu: c, playerPlay: [], cpuPlay: [], msg: "You win the round!" };
      } else if (cv > pv) {
        return { ...prev, player: p, cpu: [...c, ...shuffle([...pPlay, ...cPlay])], playerPlay: [], cpuPlay: [], msg: "CPU wins the round." };
      } else {
        // War: each puts down 1 face-down + reveal next time
        if (p.length === 0 || c.length === 0) {
          return { ...prev, player: p, cpu: c, winner: p.length === 0 ? "cpu" : "player", msg: "Not enough cards for war!" };
        }
        const pBuried = { ...p.shift()!, faceUp: false };
        const cBuried = { ...c.shift()!, faceUp: false };
        return {
          ...prev, player: p, cpu: c,
          playerPlay: [...pPlay, pBuried],
          cpuPlay: [...cPlay, cBuried],
          msg: "⚔️ WAR! Flip again.",
        };
      }
    });
  };

  useEffect(() => {
    if (s.player.length === 0 && !s.winner) setS(x => ({ ...x, winner: "cpu" }));
    if (s.cpu.length === 0 && !s.winner) setS(x => ({ ...x, winner: "player" }));
  }, [s.player.length, s.cpu.length, s.winner]);

  return (
    <GameLayout title="War" onNewGame={() => setS(deal())} status={`You: ${s.player.length} • CPU: ${s.cpu.length}`}>
      <div className="max-w-xl mx-auto text-center">
        <div className="my-4 text-lg font-semibold">{s.msg}</div>
        <div className="flex justify-center gap-8 my-6">
          <div>
            <div className="text-xs text-muted-foreground mb-1">CPU</div>
            <div className="flex">
              {s.cpuPlay.length === 0
                ? <PlayingCard empty />
                : s.cpuPlay.map((c, i) => (
                    <div key={c.id} style={{ marginLeft: i ? -30 : 0 }}><PlayingCard card={c} /></div>
                  ))}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">You</div>
            <div className="flex">
              {s.playerPlay.length === 0
                ? <PlayingCard empty />
                : s.playerPlay.map((c, i) => (
                    <div key={c.id} style={{ marginLeft: i ? -30 : 0 }}><PlayingCard card={c} /></div>
                  ))}
            </div>
          </div>
        </div>
        <Button size="lg" onClick={flip} disabled={!!s.winner}>
          {s.winner ? (s.winner === "player" ? "🎉 You won!" : "CPU won") : "Flip"}
        </Button>
      </div>
    </GameLayout>
  );
};

export default War;
