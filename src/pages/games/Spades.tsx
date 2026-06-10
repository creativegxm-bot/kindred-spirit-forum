import { useState, useEffect } from "react";
import { Card, createDeck, shuffle, rankValue } from "@/lib/cards/deck";
import { PlayingCard } from "@/components/PlayingCard";
import { GameLayout } from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type P = 0 | 1 | 2 | 3;
const cmp = (r: Card["rank"]) => rankValue(r) === 1 ? 14 : rankValue(r);

interface State {
  hands: Card[][];
  bids: (number | null)[];
  tricks: number[];
  trick: { p: P; c: Card }[];
  turn: P;
  team1: number; // 0+2
  team2: number; // 1+3
  spadesBroken: boolean;
  bidding: boolean;
}

const init = (): State => {
  const d = shuffle(createDeck(true));
  const hands = [d.slice(0,13), d.slice(13,26), d.slice(26,39), d.slice(39,52)];
  hands.forEach(h => h.sort((a,b) => a.suit.localeCompare(b.suit) || cmp(a.rank) - cmp(b.rank)));
  // CPU auto-bids based on aces/kings
  const autoBid = (h: Card[]) => Math.max(1, h.filter(c => c.suit === "♠" || c.rank === "A" || c.rank === "K").length - 2);
  return {
    hands, bids: [null, autoBid(hands[1]), autoBid(hands[2]), autoBid(hands[3])],
    tricks: [0,0,0,0], trick: [], turn: 0, team1: 0, team2: 0, spadesBroken: false, bidding: true,
  };
};

const Spades = () => {
  const [s, setS] = useState<State>(init);

  const submitBid = (b: number) => setS(prev => ({ ...prev, bids: [b, prev.bids[1], prev.bids[2], prev.bids[3]], bidding: false }));

  const canPlay = (p: P, c: Card) => {
    const h = s.hands[p];
    if (s.trick.length === 0) {
      if (!s.spadesBroken && c.suit === "♠" && h.some(x => x.suit !== "♠")) return false;
      return true;
    }
    const lead = s.trick[0].c.suit;
    if (h.some(x => x.suit === lead)) return c.suit === lead;
    return true;
  };

  const play = (p: P, c: Card) => setS(prev => {
    const hands = prev.hands.map(h => [...h]);
    hands[p] = hands[p].filter(x => x.id !== c.id);
    const trick = [...prev.trick, { p, c }];
    const spadesBroken = prev.spadesBroken || c.suit === "♠";
    if (trick.length === 4) {
      const lead = trick[0].c.suit;
      const spadesIn = trick.filter(t => t.c.suit === "♠");
      const winner = spadesIn.length
        ? spadesIn.reduce((a,b) => cmp(a.c.rank) > cmp(b.c.rank) ? a : b)
        : trick.filter(t => t.c.suit === lead).reduce((a,b) => cmp(a.c.rank) > cmp(b.c.rank) ? a : b);
      const tricks = [...prev.tricks]; tricks[winner.p]++;
      if (hands.every(h => h.length === 0)) {
        const t1Bid = (prev.bids[0]||0) + (prev.bids[2]||0);
        const t2Bid = (prev.bids[1]||0) + (prev.bids[3]||0);
        const t1 = tricks[0] + tricks[2], t2 = tricks[1] + tricks[3];
        const score1 = t1 >= t1Bid ? t1Bid * 10 + (t1 - t1Bid) : -t1Bid * 10;
        const score2 = t2 >= t2Bid ? t2Bid * 10 + (t2 - t2Bid) : -t2Bid * 10;
        toast(`Round over: Us ${score1} • Them ${score2}`);
        return { ...prev, hands, trick: [], turn: winner.p, tricks, team1: prev.team1 + score1, team2: prev.team2 + score2, spadesBroken };
      }
      return { ...prev, hands, trick: [], turn: winner.p, tricks, spadesBroken };
    }
    return { ...prev, hands, trick, turn: ((p + 1) % 4) as P, spadesBroken };
  });

  const cpuPick = (p: P): Card => {
    const h = s.hands[p]; const legal = h.filter(c => canPlay(p, c));
    if (s.trick.length === 0) return legal.reduce((a,b) => cmp(a.rank) > cmp(b.rank) ? a : b);
    const lead = s.trick[0].c.suit;
    const same = legal.filter(c => c.suit === lead);
    if (same.length) return same.reduce((a,b) => cmp(a.rank) > cmp(b.rank) ? a : b);
    const spades = legal.filter(c => c.suit === "♠");
    if (spades.length) return spades.reduce((a,b) => cmp(a.rank) < cmp(b.rank) ? a : b);
    return legal.reduce((a,b) => cmp(a.rank) < cmp(b.rank) ? a : b);
  };

  useEffect(() => {
    if (s.bidding || s.turn === 0 || s.hands.every(h => h.length === 0)) return;
    const t = setTimeout(() => play(s.turn, cpuPick(s.turn)), 600);
    return () => clearTimeout(t);
  }, [s.turn, s.trick.length, s.bidding]);

  return (
    <GameLayout title="Spades" onNewGame={() => setS(init())} status={`Us ${s.team1} • Them ${s.team2} • Tricks ${s.tricks.join("/")}`}>
      <div className="max-w-3xl mx-auto space-y-4">
        {s.bidding ? (
          <div className="text-center bg-card/60 rounded-xl p-6">
            <div className="mb-3 font-semibold">Your bid? (CPU bids: {s.bids[1]}, {s.bids[2]}, {s.bids[3]})</div>
            <div className="flex flex-wrap gap-2 justify-center">
              {Array.from({ length: 13 }, (_, i) => i + 1).map(n => (
                <Button key={n} size="sm" onClick={() => submitBid(n)}>{n}</Button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="text-center text-xs text-muted-foreground">North (Partner) — {s.hands[2].length} • Bid {s.bids[2]}</div>
            <div className="grid grid-cols-3 gap-2 place-items-center min-h-[6rem]">
              <div /><div>{s.trick.find(t => t.p === 2) && <PlayingCard card={s.trick.find(t => t.p === 2)!.c} />}</div><div />
              <div>{s.trick.find(t => t.p === 1) && <PlayingCard card={s.trick.find(t => t.p === 1)!.c} />}</div>
              <div className="text-xs text-muted-foreground">{s.turn === 0 ? "Your turn" : "CPU..."}</div>
              <div>{s.trick.find(t => t.p === 3) && <PlayingCard card={s.trick.find(t => t.p === 3)!.c} />}</div>
              <div /><div>{s.trick.find(t => t.p === 0) && <PlayingCard card={s.trick.find(t => t.p === 0)!.c} />}</div><div />
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">You — Bid {s.bids[0]}</div>
              <div className="flex flex-wrap gap-1">
                {s.hands[0].map(c => (
                  <PlayingCard key={c.id} card={c} size="sm" onClick={() => s.turn === 0 && canPlay(0, c) && play(0, c)} className={canPlay(0, c) && s.turn === 0 ? "" : "opacity-40"} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </GameLayout>
  );
};

export default Spades;
