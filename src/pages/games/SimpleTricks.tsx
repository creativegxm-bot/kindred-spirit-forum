import { useState, useEffect } from "react";
import { Card, createDeck, shuffle, rankValue, Suit } from "@/lib/cards/deck";
import { PlayingCard } from "@/components/PlayingCard";
import { GameLayout } from "@/components/GameLayout";
import { toast } from "sonner";

type P = 0 | 1 | 2 | 3;

interface Props {
  title: string;
  trumpSuit?: Suit | "random" | null;
  cardsPerHand?: number; // default 13
  description?: string;
}

const cmp = (r: Card["rank"]) => rankValue(r) === 1 ? 14 : rankValue(r);

export const SimpleTricks = ({ title, trumpSuit = "random", cardsPerHand = 13, description }: Props) => {
  const init = () => {
    const d = shuffle(createDeck(true));
    const n = cardsPerHand;
    const hands: Card[][] = [d.slice(0,n), d.slice(n,2*n), d.slice(2*n,3*n), d.slice(3*n,4*n)];
    hands.forEach(h => h.sort((a,b) => a.suit.localeCompare(b.suit) || cmp(a.rank) - cmp(b.rank)));
    const suits: Suit[] = ["♠","♥","♦","♣"];
    const trump: Suit | null = trumpSuit === "random" ? suits[Math.floor(Math.random()*4)] : (trumpSuit ?? null);
    return { hands, trick: [] as { p: P; c: Card }[], turn: 0 as P, tricks: [0,0,0,0], trump };
  };
  const [s, setS] = useState(init);

  const canPlay = (p: P, c: Card) => {
    if (s.trick.length === 0) return true;
    const lead = s.trick[0].c.suit;
    if (s.hands[p].some(x => x.suit === lead)) return c.suit === lead;
    return true;
  };

  const play = (p: P, c: Card) => setS(prev => {
    const hands = prev.hands.map(h => [...h]);
    hands[p] = hands[p].filter(x => x.id !== c.id);
    const trick = [...prev.trick, { p, c }];
    if (trick.length === 4) {
      const lead = trick[0].c.suit;
      const trumps = prev.trump ? trick.filter(t => t.c.suit === prev.trump) : [];
      const winner = trumps.length
        ? trumps.reduce((a,b) => cmp(a.c.rank) > cmp(b.c.rank) ? a : b)
        : trick.filter(t => t.c.suit === lead).reduce((a,b) => cmp(a.c.rank) > cmp(b.c.rank) ? a : b);
      const tricks = [...prev.tricks]; tricks[winner.p]++;
      if (hands.every(h => h.length === 0)) {
        const us = tricks[0] + tricks[2], them = tricks[1] + tricks[3];
        setTimeout(() => toast(`Round over — Us ${us} • Them ${them}`), 100);
      }
      return { ...prev, hands, trick: [], turn: winner.p, tricks };
    }
    return { ...prev, hands, trick, turn: ((p+1)%4) as P };
  });

  const cpuPick = (p: P): Card => {
    const legal = s.hands[p].filter(c => canPlay(p, c));
    if (s.trick.length === 0) return legal.reduce((a,b) => cmp(a.rank) > cmp(b.rank) ? a : b);
    const lead = s.trick[0].c.suit;
    const same = legal.filter(c => c.suit === lead);
    if (same.length) return same.reduce((a,b) => cmp(a.rank) > cmp(b.rank) ? a : b);
    const trumps = s.trump ? legal.filter(c => c.suit === s.trump) : [];
    if (trumps.length) return trumps.reduce((a,b) => cmp(a.rank) < cmp(b.rank) ? a : b);
    return legal.reduce((a,b) => cmp(a.rank) < cmp(b.rank) ? a : b);
  };

  useEffect(() => {
    if (s.turn === 0 || s.hands.every(h => h.length === 0)) return;
    const t = setTimeout(() => play(s.turn, cpuPick(s.turn)), 600);
    return () => clearTimeout(t);
  }, [s.turn, s.trick.length]);

  return (
    <GameLayout title={title} onNewGame={() => setS(init())} status={`Trump: ${s.trump ?? "none"} • Tricks ${s.tricks.join("/")}`}>
      <div className="max-w-3xl mx-auto space-y-4">
        {description && <p className="text-xs text-center text-muted-foreground">{description}</p>}
        <div className="text-center text-xs text-muted-foreground">North (Partner) — {s.hands[2].length}</div>
        <div className="grid grid-cols-3 gap-2 place-items-center min-h-[6rem]">
          <div /><div>{s.trick.find(t => t.p === 2) && <PlayingCard card={s.trick.find(t => t.p === 2)!.c} />}</div><div />
          <div>{s.trick.find(t => t.p === 1) && <PlayingCard card={s.trick.find(t => t.p === 1)!.c} />}</div>
          <div className="text-xs text-muted-foreground">{s.turn === 0 ? "Your turn" : "CPU..."}</div>
          <div>{s.trick.find(t => t.p === 3) && <PlayingCard card={s.trick.find(t => t.p === 3)!.c} />}</div>
          <div /><div>{s.trick.find(t => t.p === 0) && <PlayingCard card={s.trick.find(t => t.p === 0)!.c} />}</div><div />
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">You</div>
          <div className="flex flex-wrap gap-1">
            {s.hands[0].map(c => (
              <PlayingCard key={c.id} card={c} size="sm"
                onClick={() => s.turn === 0 && canPlay(0, c) && play(0, c)}
                className={s.turn === 0 && canPlay(0, c) ? "" : "opacity-40"} />
            ))}
          </div>
        </div>
      </div>
    </GameLayout>
  );
};
