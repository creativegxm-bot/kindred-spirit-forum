import { useState, useEffect } from "react";
import { Card, createDeck, shuffle, rankValue } from "@/lib/cards/deck";
import { PlayingCard } from "@/components/PlayingCard";
import { GameLayout } from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const deadVal = (r: Card["rank"]) => {
  if (["J","Q","K"].includes(r)) return 10;
  if (r === "A") return 1;
  return parseInt(r, 10);
};

interface State {
  deck: Card[];
  discard: Card[];
  player: Card[];
  cpu: Card[];
  turn: "player" | "cpu";
  phase: "draw" | "discard";
  winner: string | null;
}

const deal = (): State => {
  const d = shuffle(createDeck(true));
  return {
    player: d.slice(0, 10),
    cpu: d.slice(10, 20).map(c => ({ ...c, faceUp: false })),
    discard: [d[20]],
    deck: d.slice(21),
    turn: "player", phase: "draw", winner: null,
  };
};

const computeDeadwood = (hand: Card[]): number => {
  // simplistic: group by rank (sets) and by suit-run; subtract melded
  const usedIds = new Set<string>();
  // sets of 3+ same rank
  const byRank: Record<string, Card[]> = {};
  hand.forEach(c => { (byRank[c.rank] ||= []).push(c); });
  Object.values(byRank).forEach(set => { if (set.length >= 3) set.forEach(c => usedIds.add(c.id)); });
  // runs of 3+ same suit
  const bySuit: Record<string, Card[]> = {};
  hand.forEach(c => { (bySuit[c.suit] ||= []).push(c); });
  Object.values(bySuit).forEach(arr => {
    const sorted = [...arr].sort((a,b) => rankValue(a.rank) - rankValue(b.rank));
    let run: Card[] = [];
    for (let i = 0; i < sorted.length; i++) {
      if (run.length === 0 || rankValue(sorted[i].rank) === rankValue(run.at(-1)!.rank) + 1) run.push(sorted[i]);
      else { if (run.length >= 3) run.forEach(c => usedIds.add(c.id)); run = [sorted[i]]; }
    }
    if (run.length >= 3) run.forEach(c => usedIds.add(c.id));
  });
  return hand.filter(c => !usedIds.has(c.id)).reduce((s,c) => s + deadVal(c.rank), 0);
};

const GinRummy = () => {
  const [s, setS] = useState<State>(deal);

  const drawDeck = () => {
    if (s.turn !== "player" || s.phase !== "draw" || s.deck.length === 0) return;
    setS({ ...s, player: [...s.player, s.deck[0]], deck: s.deck.slice(1), phase: "discard" });
  };
  const drawDiscard = () => {
    if (s.turn !== "player" || s.phase !== "draw" || s.discard.length === 0) return;
    setS({ ...s, player: [...s.player, s.discard.at(-1)!], discard: s.discard.slice(0, -1), phase: "discard" });
  };
  const discardCard = (c: Card) => {
    if (s.turn !== "player" || s.phase !== "discard") return;
    const player = s.player.filter(x => x.id !== c.id);
    setS({ ...s, player, discard: [...s.discard, c], turn: "cpu", phase: "draw" });
  };
  const knock = () => {
    const dw = computeDeadwood(s.player);
    if (dw > 10) { toast.error(`Deadwood ${dw}. Must be ≤10 to knock`); return; }
    const cpuDw = computeDeadwood(s.cpu.map(c => ({ ...c, faceUp: true })));
    const youScore = cpuDw - dw;
    setS({ ...s, winner: youScore > 0 ? `🎉 You knock! +${youScore}` : `Undercut! CPU wins ${dw - cpuDw + 25}` });
  };

  useEffect(() => {
    if (s.turn !== "cpu" || s.winner) return;
    const t = setTimeout(() => {
      // cpu draws deck, discards a random card
      const cpuHand = [...s.cpu, s.deck[0]];
      const deck = s.deck.slice(1);
      const discardIdx = Math.floor(Math.random() * cpuHand.length);
      const out = cpuHand[discardIdx];
      const cpu = cpuHand.filter((_, i) => i !== discardIdx);
      setS(prev => ({ ...prev, cpu, deck, discard: [...prev.discard, { ...out, faceUp: true }], turn: "player", phase: "draw" }));
    }, 800);
    return () => clearTimeout(t);
  }, [s.turn]);

  const dw = computeDeadwood(s.player);

  return (
    <GameLayout title="Gin Rummy" onNewGame={() => setS(deal())} status={s.winner ?? `Deadwood: ${dw} • ${s.turn === "player" ? `Phase: ${s.phase}` : "CPU thinking..."}`}>
      <div className="max-w-2xl mx-auto space-y-4">
        <div>
          <div className="text-xs text-muted-foreground mb-1">CPU — {s.cpu.length}</div>
          <div className="flex flex-wrap gap-1">{s.cpu.map(c => <PlayingCard key={c.id} card={c} size="sm" />)}</div>
        </div>
        <div className="flex justify-center gap-6">
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Stock {s.deck.length}</div>
            <PlayingCard card={{id:"b",suit:"♠",rank:"A",faceUp:false}} onClick={drawDeck} />
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Discard</div>
            {s.discard.at(-1) ? <PlayingCard card={s.discard.at(-1)!} onClick={drawDiscard} /> : <PlayingCard empty />}
          </div>
        </div>
        <div className="flex justify-center gap-2">
          <Button size="sm" disabled={dw > 10 || s.phase !== "discard"} onClick={knock}>Knock ({dw})</Button>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">You — {s.player.length}</div>
          <div className="flex flex-wrap gap-1">{s.player.map(c => <PlayingCard key={c.id} card={c} size="sm" onClick={() => discardCard(c)} />)}</div>
        </div>
      </div>
    </GameLayout>
  );
};

export default GinRummy;
