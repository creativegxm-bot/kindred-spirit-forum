import { useState, useEffect, useRef } from "react";
import { Card, createDeck, shuffle } from "@/lib/cards/deck";
import { PlayingCard } from "@/components/PlayingCard";
import { GameLayout } from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface State {
  player: Card[];
  cpu: Card[];
  pile: Card[];
  turn: "player" | "cpu";
  winner: string | null;
}

const deal = (): State => {
  const d = shuffle(createDeck(true));
  return { player: d.slice(0, 26), cpu: d.slice(26), pile: [], turn: "player", winner: null };
};

const Slapjack = () => {
  const [s, setS] = useState<State>(deal);
  const cpuTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flip = () => {
    if (s.winner) return;
    setS(prev => {
      if (prev[prev.turn].length === 0) return { ...prev, winner: prev.turn === "player" ? "CPU wins" : "You win!" };
      const handKey = prev.turn;
      const hand = [...prev[handKey]];
      const card = { ...hand.shift()!, faceUp: true };
      const pile = [...prev.pile, card];
      return { ...prev, [handKey]: hand, pile, turn: prev.turn === "player" ? "cpu" : "player" } as State;
    });
  };

  const slap = (by: "player" | "cpu") => {
    setS(prev => {
      if (prev.pile.length === 0 || prev.winner) return prev;
      const top = prev.pile.at(-1)!;
      if (top.rank === "J") {
        const hand = [...prev[by], ...shuffle(prev.pile)];
        toast(by === "player" ? "🖐️ You slapped the Jack!" : "CPU slapped first!");
        return { ...prev, [by]: hand, pile: [] } as State;
      } else {
        // false slap — give 1 card to other
        const other = by === "player" ? "cpu" : "player";
        if (prev[by].length === 0) return prev;
        const fromHand = [...prev[by]];
        const card = fromHand.shift()!;
        toast.error(`${by === "player" ? "You" : "CPU"} slapped wrong!`);
        return { ...prev, [by]: fromHand, [other]: [...prev[other], card] } as State;
      }
    });
  };

  useEffect(() => {
    if (s.winner) return;
    if (cpuTimer.current) clearTimeout(cpuTimer.current);
    if (s.turn === "cpu") {
      cpuTimer.current = setTimeout(flip, 700);
    }
    // CPU slap chance
    if (s.pile.at(-1)?.rank === "J") {
      const reaction = 300 + Math.random() * 700;
      cpuTimer.current = setTimeout(() => slap("cpu"), reaction);
    }
    return () => { if (cpuTimer.current) clearTimeout(cpuTimer.current); };
  }, [s.turn, s.pile.length, s.winner]);

  useEffect(() => {
    if (s.player.length === 0) setS(x => ({ ...x, winner: "CPU wins!" }));
    if (s.cpu.length === 0) setS(x => ({ ...x, winner: "🎉 You win!" }));
  }, [s.player.length, s.cpu.length]);

  return (
    <GameLayout title="Slapjack" onNewGame={() => setS(deal())} status={s.winner ?? `You ${s.player.length} • CPU ${s.cpu.length}`}>
      <div className="max-w-md mx-auto text-center space-y-6">
        <div>
          <div className="text-xs text-muted-foreground">CPU — {s.cpu.length}</div>
          <PlayingCard card={{id:"b",suit:"♠",rank:"A",faceUp:false}} />
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Pile — {s.pile.length}</div>
          {s.pile.at(-1) ? <PlayingCard card={s.pile.at(-1)!} size="lg" /> : <PlayingCard empty size="lg" />}
        </div>
        <div className="flex gap-2 justify-center">
          <Button size="lg" onClick={flip} disabled={s.turn !== "player" || !!s.winner}>Flip</Button>
          <Button size="lg" variant="destructive" onClick={() => slap("player")} disabled={!!s.winner}>🖐️ Slap!</Button>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">You — {s.player.length}</div>
        </div>
      </div>
    </GameLayout>
  );
};

export default Slapjack;
