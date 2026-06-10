import { useState } from "react";
import { Card, createDeck, shuffle, rankValue } from "@/lib/cards/deck";
import { PlayingCard } from "@/components/PlayingCard";
import { GameLayout } from "@/components/GameLayout";
import { Button } from "@/components/ui/button";

const v = (r: Card["rank"]) => rankValue(r) === 1 ? 14 : rankValue(r);

const evalBest = (cards: Card[]): { rank: number; tb: number[]; name: string } => {
  // pick best 5 of 7 by brute force
  const combos: Card[][] = [];
  const idxs = [0,1,2,3,4,5,6];
  for (let i = 0; i < 7; i++) for (let j = i+1; j < 7; j++) {
    combos.push(idxs.filter(x => x !== i && x !== j).map(x => cards[x]));
  }
  const evalH = (h: Card[]) => {
    const vals = h.map(c => v(c.rank)).sort((a,b)=>b-a);
    const counts: Record<number,number> = {};
    vals.forEach(x => counts[x] = (counts[x]||0)+1);
    const grouped = Object.entries(counts).sort((a,b) => b[1]-a[1] || +b[0]-+a[0]);
    const flush = h.every(c => c.suit === h[0].suit);
    const u = [...new Set(vals)].sort((a,b)=>a-b);
    const straight = u.length === 5 && u[4]-u[0] === 4;
    const wheel = JSON.stringify(u) === JSON.stringify([2,3,4,5,14]);
    if (flush && straight) return { rank: 8, tb: vals, name: "Straight Flush" };
    if (grouped[0][1] === 4) return { rank: 7, tb: [+grouped[0][0]], name: "Four of a Kind" };
    if (grouped[0][1] === 3 && grouped[1][1] === 2) return { rank: 6, tb: [+grouped[0][0]], name: "Full House" };
    if (flush) return { rank: 5, tb: vals, name: "Flush" };
    if (straight || wheel) return { rank: 4, tb: [wheel?5:vals[0]], name: "Straight" };
    if (grouped[0][1] === 3) return { rank: 3, tb: [+grouped[0][0]], name: "Three of a Kind" };
    if (grouped[0][1] === 2 && grouped[1][1] === 2) return { rank: 2, tb: [+grouped[0][0], +grouped[1][0]], name: "Two Pair" };
    if (grouped[0][1] === 2) return { rank: 1, tb: [+grouped[0][0]], name: "Pair" };
    return { rank: 0, tb: vals, name: "High Card" };
  };
  return combos.map(evalH).reduce((a,b) => {
    if (a.rank !== b.rank) return a.rank > b.rank ? a : b;
    for (let i = 0; i < a.tb.length; i++) if ((a.tb[i]??0) !== (b.tb[i]??0)) return (a.tb[i]??0) > (b.tb[i]??0) ? a : b;
    return a;
  });
};

interface State {
  deck: Card[];
  player: Card[];
  cpu: Card[];
  board: Card[];
  phase: "preflop" | "flop" | "turn" | "river" | "showdown" | "folded";
  pot: number;
  playerChips: number;
  cpuChips: number;
  result: string | null;
}

const start = (prev?: State): State => {
  const d = shuffle(createDeck(true));
  const pc = (prev?.playerChips ?? 1000) - 10;
  const cc = (prev?.cpuChips ?? 1000) - 10;
  return { deck: d.slice(4), player: d.slice(0,2), cpu: d.slice(2,4).map(c => ({...c, faceUp: false})), board: [], phase: "preflop", pot: 20, playerChips: pc, cpuChips: cc, result: null };
};

const TexasHoldem = () => {
  const [s, setS] = useState<State>(start);

  const next = () => {
    setS(prev => {
      let { deck, board, phase } = prev;
      if (phase === "preflop") { board = deck.slice(0, 3); deck = deck.slice(3); phase = "flop"; }
      else if (phase === "flop") { board = [...board, deck[0]]; deck = deck.slice(1); phase = "turn"; }
      else if (phase === "turn") { board = [...board, deck[0]]; deck = deck.slice(1); phase = "river"; }
      else if (phase === "river") {
        const cpuFace = prev.cpu.map(c => ({ ...c, faceUp: true }));
        const pe = evalBest([...prev.player, ...board]);
        const ce = evalBest([...cpuFace, ...board]);
        let result = "Tie";
        let pc = prev.playerChips, cc = prev.cpuChips;
        if (pe.rank > ce.rank || (pe.rank === ce.rank && pe.tb.join(",") > ce.tb.join(","))) { result = `🎉 You win with ${pe.name}`; pc += prev.pot; }
        else if (ce.rank > pe.rank) { result = `CPU wins with ${ce.name}`; cc += prev.pot; }
        else { pc += prev.pot/2; cc += prev.pot/2; }
        return { ...prev, cpu: cpuFace, phase: "showdown", result, playerChips: pc, cpuChips: cc };
      }
      return { ...prev, deck, board, phase };
    });
  };

  const fold = () => setS(prev => ({ ...prev, phase: "folded", result: "You folded.", cpuChips: prev.cpuChips + prev.pot, cpu: prev.cpu.map(c => ({ ...c, faceUp: true })) }));

  return (
    <GameLayout title="Texas Hold'em" onNewGame={() => setS(prev => start(prev))} status={`Pot ${s.pot} • You ${s.playerChips} • CPU ${s.cpuChips}`}>
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <div>
          <div className="text-xs text-muted-foreground mb-1">CPU</div>
          <div className="flex justify-center gap-1">{s.cpu.map(c => <PlayingCard key={c.id} card={c} />)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Board</div>
          <div className="flex justify-center gap-1 min-h-[5rem]">
            {s.board.map(c => <PlayingCard key={c.id} card={{ ...c, faceUp: true }} />)}
            {Array.from({ length: 5 - s.board.length }, (_, i) => <PlayingCard key={i} empty />)}
          </div>
        </div>
        <div className="text-lg font-semibold">{s.result ?? `Phase: ${s.phase}`}</div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">You</div>
          <div className="flex justify-center gap-1">{s.player.map(c => <PlayingCard key={c.id} card={c} />)}</div>
        </div>
        <div className="flex gap-2 justify-center">
          {s.phase !== "showdown" && s.phase !== "folded" ? (
            <>
              <Button onClick={next}>Check / Next</Button>
              <Button variant="secondary" onClick={fold}>Fold</Button>
            </>
          ) : (
            <Button onClick={() => setS(prev => start(prev))}>Next Hand</Button>
          )}
        </div>
      </div>
    </GameLayout>
  );
};

export default TexasHoldem;
