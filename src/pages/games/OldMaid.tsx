import { useState, useEffect } from "react";
import { Card, createDeck, shuffle } from "@/lib/cards/deck";
import { PlayingCard } from "@/components/PlayingCard";
import { GameLayout } from "@/components/GameLayout";
import { toast } from "sonner";

interface State {
  hands: Card[][];
  turn: 0 | 1 | 2;
  loser: number | null;
}

const removePairs = (hand: Card[]): Card[] => {
  const out: Card[] = [];
  const byRank: Record<string, Card[]> = {};
  hand.forEach(c => { (byRank[c.rank] ||= []).push(c); });
  Object.values(byRank).forEach(arr => {
    while (arr.length >= 2) arr.splice(0, 2);
    out.push(...arr);
  });
  return shuffle(out);
};

const deal = (): State => {
  // Remove one queen so there's an odd queen
  const d = shuffle(createDeck(true).filter((c, i, a) => !(c.rank === "Q" && c.suit === "♥")));
  const hands = [[] as Card[], [] as Card[], [] as Card[]];
  d.forEach((c, i) => hands[i % 3].push(c));
  return { hands: hands.map(removePairs), turn: 0, loser: null };
};

const OldMaid = () => {
  const [s, setS] = useState<State>(deal);

  const pickFrom = (taker: 0 | 1 | 2, fromIdx: number) => {
    const from = (taker === 0 ? 2 : taker - 1) as 0 | 1 | 2;
    if (s.hands[from].length === 0) return;
    const card = s.hands[from][fromIdx];
    const hands = s.hands.map(h => [...h]);
    hands[from].splice(fromIdx, 1);
    hands[taker] = removePairs([...hands[taker], card]);
    const remaining = hands.filter(h => h.length > 0).length;
    if (remaining === 1) {
      const loser = hands.findIndex(h => h.length > 0);
      toast(loser === 0 ? "😱 You're the Old Maid!" : `Player ${loser + 1} is the Old Maid!`);
      setS({ hands, turn: taker, loser });
      return;
    }
    let next = ((taker + 1) % 3) as 0 | 1 | 2;
    while (hands[next].length === 0) next = ((next + 1) % 3) as 0 | 1 | 2;
    setS({ hands, turn: next, loser: null });
  };

  useEffect(() => {
    if (s.loser !== null) return;
    if (s.turn === 0) return;
    const t = setTimeout(() => {
      const from = (s.turn === 0 ? 2 : s.turn - 1) as 0 | 1 | 2;
      if (s.hands[from].length === 0) return;
      pickFrom(s.turn, Math.floor(Math.random() * s.hands[from].length));
    }, 800);
    return () => clearTimeout(t);
  }, [s.turn]);

  return (
    <GameLayout title="Old Maid" onNewGame={() => setS(deal())} status={s.loser !== null ? (s.loser === 0 ? "You lost!" : "You survived!") : `Turn: ${s.turn === 0 ? "You" : `P${s.turn + 1}`}`}>
      <div className="max-w-2xl mx-auto space-y-4">
        {[2, 1].map(pi => (
          <div key={pi}>
            <div className="text-xs text-muted-foreground mb-1">Player {pi + 1} — {s.hands[pi].length} {s.turn === 0 && ((0 - 1 + 3) % 3) === pi && "(pick one)"}</div>
            <div className="flex flex-wrap gap-1">
              {s.hands[pi].map((c, i) => (
                <PlayingCard key={c.id} card={{ ...c, faceUp: false }} size="sm"
                  onClick={() => s.turn === 0 && pi === ((0 - 1 + 3) % 3) && pickFrom(0, i)} />
              ))}
            </div>
          </div>
        ))}
        <div>
          <div className="text-xs text-muted-foreground mb-1">You — {s.hands[0].length}</div>
          <div className="flex flex-wrap gap-1">{s.hands[0].map(c => <PlayingCard key={c.id} card={c} size="sm" />)}</div>
        </div>
      </div>
    </GameLayout>
  );
};

export default OldMaid;
