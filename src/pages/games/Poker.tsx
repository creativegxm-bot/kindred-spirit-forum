import { useState } from "react";
import { Card, createDeck, shuffle, rankValue } from "@/lib/cards/deck";
import { PlayingCard } from "@/components/PlayingCard";
import { GameLayout } from "@/components/GameLayout";
import { Button } from "@/components/ui/button";

interface State {
  deck: Card[];
  player: Card[];
  cpu: Card[];
  swap: Set<string>;
  phase: "draw" | "showdown";
  result: string | null;
  wins: number; losses: number;
}

const v = (r: Card["rank"]) => rankValue(r) === 1 ? 14 : rankValue(r);

const evalHand = (h: Card[]): { rank: number; tiebreak: number[]; name: string } => {
  const vals = h.map(c => v(c.rank)).sort((a,b) => b - a);
  const counts: Record<number, number> = {};
  vals.forEach(x => counts[x] = (counts[x] || 0) + 1);
  const grouped = Object.entries(counts).sort((a,b) => b[1] - a[1] || +b[0] - +a[0]);
  const suits = h.map(c => c.suit);
  const flush = suits.every(s => s === suits[0]);
  const sortedUniq = [...new Set(vals)].sort((a,b) => a - b);
  const straight = sortedUniq.length === 5 && sortedUniq[4] - sortedUniq[0] === 4;
  const wheel = JSON.stringify(sortedUniq) === JSON.stringify([2,3,4,5,14]);
  if (flush && straight) return { rank: 8, tiebreak: vals, name: "Straight Flush" };
  if (grouped[0][1] === 4) return { rank: 7, tiebreak: [+grouped[0][0]], name: "Four of a Kind" };
  if (grouped[0][1] === 3 && grouped[1][1] === 2) return { rank: 6, tiebreak: [+grouped[0][0]], name: "Full House" };
  if (flush) return { rank: 5, tiebreak: vals, name: "Flush" };
  if (straight || wheel) return { rank: 4, tiebreak: [wheel ? 5 : vals[0]], name: "Straight" };
  if (grouped[0][1] === 3) return { rank: 3, tiebreak: [+grouped[0][0]], name: "Three of a Kind" };
  if (grouped[0][1] === 2 && grouped[1][1] === 2) return { rank: 2, tiebreak: [+grouped[0][0], +grouped[1][0]], name: "Two Pair" };
  if (grouped[0][1] === 2) return { rank: 1, tiebreak: [+grouped[0][0]], name: "Pair" };
  return { rank: 0, tiebreak: vals, name: "High Card" };
};

const compare = (a: ReturnType<typeof evalHand>, b: ReturnType<typeof evalHand>): number => {
  if (a.rank !== b.rank) return a.rank - b.rank;
  for (let i = 0; i < a.tiebreak.length; i++) {
    if ((a.tiebreak[i] ?? 0) !== (b.tiebreak[i] ?? 0)) return (a.tiebreak[i] ?? 0) - (b.tiebreak[i] ?? 0);
  }
  return 0;
};

const deal = (prev?: State): State => {
  const d = shuffle(createDeck(true));
  return {
    deck: d.slice(10), player: d.slice(0, 5), cpu: d.slice(5, 10).map(c => ({ ...c, faceUp: false })),
    swap: new Set(), phase: "draw", result: null,
    wins: prev?.wins ?? 0, losses: prev?.losses ?? 0,
  };
};

const Poker = () => {
  const [s, setS] = useState<State>(deal);

  const toggle = (id: string) => {
    if (s.phase !== "draw") return;
    const next = new Set(s.swap);
    next.has(id) ? next.delete(id) : next.add(id);
    setS({ ...s, swap: next });
  };

  const showdown = () => {
    let deck = [...s.deck];
    const player = s.player.map(c => s.swap.has(c.id) ? { ...deck.shift()!, faceUp: true } : c);
    // cpu swaps non-pair low cards (simple)
    const cpuFace = s.cpu.map(c => ({ ...c, faceUp: true }));
    const cpuVals = cpuFace.map(c => v(c.rank));
    const cpuCounts: Record<number, number> = {};
    cpuVals.forEach(x => cpuCounts[x] = (cpuCounts[x]||0)+1);
    const cpu = cpuFace.map(c => (cpuCounts[v(c.rank)] === 1 && v(c.rank) < 11) ? { ...deck.shift()!, faceUp: true } : c);
    const pe = evalHand(player), ce = evalHand(cpu);
    const diff = compare(pe, ce);
    const result = diff > 0 ? `🎉 You win — ${pe.name} vs ${ce.name}` : diff < 0 ? `CPU wins — ${ce.name} vs ${pe.name}` : `Tie — ${pe.name}`;
    setS({ ...s, deck, player, cpu, phase: "showdown", result, wins: s.wins + (diff > 0 ? 1 : 0), losses: s.losses + (diff < 0 ? 1 : 0) });
  };

  return (
    <GameLayout title="5-Card Draw Poker" onNewGame={() => setS(prev => deal(prev))} status={`Wins ${s.wins} • Losses ${s.losses}`}>
      <div className="max-w-xl mx-auto text-center space-y-6">
        <div>
          <div className="text-xs text-muted-foreground mb-1">CPU</div>
          <div className="flex gap-1 justify-center">{s.cpu.map(c => <PlayingCard key={c.id} card={c} />)}</div>
        </div>
        <div className="text-lg font-semibold">{s.result ?? (s.phase === "draw" ? "Click cards to swap, then Draw" : "")}</div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">You</div>
          <div className="flex gap-1 justify-center">
            {s.player.map(c => (
              <PlayingCard key={c.id} card={c} onClick={() => toggle(c.id)} selected={s.swap.has(c.id)} />
            ))}
          </div>
        </div>
        {s.phase === "draw" ? (
          <Button size="lg" onClick={showdown}>Draw {s.swap.size} & Show</Button>
        ) : (
          <Button size="lg" onClick={() => setS(prev => deal(prev))}>Deal Again</Button>
        )}
      </div>
    </GameLayout>
  );
};

export default Poker;
