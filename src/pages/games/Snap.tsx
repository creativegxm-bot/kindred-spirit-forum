import { useState, useEffect, useRef } from "react";
import { Card, createDeck, shuffle } from "@/lib/cards/deck";
import { PlayingCard } from "@/components/PlayingCard";
import { GameLayout } from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface State {
  player: Card[];
  cpu: Card[];
  playerPile: Card[];
  cpuPile: Card[];
  turn: "player" | "cpu";
  winner: string | null;
}

const deal = (): State => {
  const d = shuffle(createDeck(true));
  return { player: d.slice(0, 26), cpu: d.slice(26), playerPile: [], cpuPile: [], turn: "player", winner: null };
};

const Snap = () => {
  const [s, setS] = useState<State>(deal);
  const cpuRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flip = () => {
    if (s.winner) return;
    setS(prev => {
      if (prev[prev.turn].length === 0) return { ...prev, winner: prev.turn === "player" ? "CPU wins" : "You win" };
      const hand = [...prev[prev.turn]];
      const pileKey = prev.turn === "player" ? "playerPile" : "cpuPile";
      const card = { ...hand.shift()!, faceUp: true };
      return { ...prev, [prev.turn]: hand, [pileKey]: [...prev[pileKey], card], turn: prev.turn === "player" ? "cpu" : "player" } as State;
    });
  };

  const snap = (by: "player" | "cpu") => {
    setS(prev => {
      const pt = prev.playerPile.at(-1), ct = prev.cpuPile.at(-1);
      if (pt && ct && pt.rank === ct.rank) {
        const all = shuffle([...prev.playerPile, ...prev.cpuPile]);
        toast(by === "player" ? "🎉 SNAP! You took the piles." : "💥 CPU snapped first.");
        if (by === "player") return { ...prev, player: [...prev.player, ...all], playerPile: [], cpuPile: [] };
        return { ...prev, cpu: [...prev.cpu, ...all], playerPile: [], cpuPile: [] };
      }
      toast.error(`${by === "player" ? "You" : "CPU"} snapped wrongly!`);
      // give 1 card from snapper to opponent
      if (by === "player" && prev.player.length) {
        const p = [...prev.player]; const c = p.shift()!;
        return { ...prev, player: p, cpu: [...prev.cpu, c] };
      }
      if (by === "cpu" && prev.cpu.length) {
        const c = [...prev.cpu]; const card = c.shift()!;
        return { ...prev, cpu: c, player: [...prev.player, card] };
      }
      return prev;
    });
  };

  useEffect(() => {
    if (s.winner) return;
    if (cpuRef.current) clearTimeout(cpuRef.current);
    if (s.turn === "cpu") cpuRef.current = setTimeout(flip, 700);
    const pt = s.playerPile.at(-1), ct = s.cpuPile.at(-1);
    if (pt && ct && pt.rank === ct.rank) {
      cpuRef.current = setTimeout(() => snap("cpu"), 400 + Math.random() * 600);
    }
    return () => { if (cpuRef.current) clearTimeout(cpuRef.current); };
  }, [s.turn, s.playerPile.length, s.cpuPile.length, s.winner]);

  useEffect(() => {
    if (s.player.length === 0 && s.playerPile.length === 0) setS(x => ({ ...x, winner: "CPU wins!" }));
    if (s.cpu.length === 0 && s.cpuPile.length === 0) setS(x => ({ ...x, winner: "🎉 You win!" }));
  }, [s.player.length, s.cpu.length, s.playerPile.length, s.cpuPile.length]);

  return (
    <GameLayout title="Snap" onNewGame={() => setS(deal())} status={s.winner ?? `You ${s.player.length + s.playerPile.length} • CPU ${s.cpu.length + s.cpuPile.length}`}>
      <div className="max-w-md mx-auto text-center space-y-6">
        <div className="flex justify-around items-center">
          <div>
            <div className="text-xs text-muted-foreground">CPU pile</div>
            {s.cpuPile.at(-1) ? <PlayingCard card={s.cpuPile.at(-1)!} /> : <PlayingCard empty />}
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Your pile</div>
            {s.playerPile.at(-1) ? <PlayingCard card={s.playerPile.at(-1)!} /> : <PlayingCard empty />}
          </div>
        </div>
        <div className="flex gap-2 justify-center">
          <Button size="lg" onClick={flip} disabled={s.turn !== "player" || !!s.winner}>Flip</Button>
          <Button size="lg" variant="destructive" onClick={() => snap("player")} disabled={!!s.winner}>SNAP!</Button>
        </div>
      </div>
    </GameLayout>
  );
};

export default Snap;
