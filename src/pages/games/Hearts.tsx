import { useState, useEffect } from "react";
import { Card, createDeck, shuffle, rankValue } from "@/lib/cards/deck";
import { PlayingCard } from "@/components/PlayingCard";
import { GameLayout } from "@/components/GameLayout";
import { toast } from "sonner";

type Player = 0 | 1 | 2 | 3;
interface State {
  hands: Card[][];
  trick: { player: Player; card: Card }[];
  leader: Player;
  turn: Player;
  scores: number[];
  heartsBroken: boolean;
}

const cmp = (r: Card["rank"]) => rankValue(r) === 1 ? 14 : rankValue(r);

const deal = (): State => {
  const d = shuffle(createDeck(true));
  const hands: Card[][] = [d.slice(0,13), d.slice(13,26), d.slice(26,39), d.slice(39,52)];
  hands.forEach(h => h.sort((a,b) => a.suit.localeCompare(b.suit) || cmp(a.rank) - cmp(b.rank)));
  // 2 of clubs leads
  const leader = hands.findIndex(h => h.some(c => c.suit === "♣" && c.rank === "2")) as Player;
  return { hands, trick: [], leader, turn: leader, scores: [0,0,0,0], heartsBroken: false };
};

const Hearts = () => {
  const [s, setS] = useState<State>(deal);

  const canPlay = (p: Player, c: Card): boolean => {
    const hand = s.hands[p];
    if (s.trick.length === 0) {
      if (s.scores.every(x => x === 0) && s.trick.length === 0 && !s.heartsBroken && hand.some(x => x.suit === "♣" && x.rank === "2")) {
        return c.suit === "♣" && c.rank === "2";
      }
      if (!s.heartsBroken && c.suit === "♥" && hand.some(x => x.suit !== "♥")) return false;
      return true;
    }
    const lead = s.trick[0].card.suit;
    if (hand.some(x => x.suit === lead)) return c.suit === lead;
    return true;
  };

  const cpuPick = (p: Player): Card => {
    const hand = s.hands[p];
    const legal = hand.filter(c => canPlay(p, c));
    if (s.trick.length === 0) return legal.reduce((a,b) => cmp(a.rank) < cmp(b.rank) ? a : b);
    const lead = s.trick[0].card.suit;
    const sameSuit = legal.filter(c => c.suit === lead);
    if (sameSuit.length > 0) {
      const highInTrick = Math.max(...s.trick.filter(t => t.card.suit === lead).map(t => cmp(t.card.rank)));
      const safe = sameSuit.filter(c => cmp(c.rank) < highInTrick);
      if (safe.length) return safe.reduce((a,b) => cmp(a.rank) > cmp(b.rank) ? a : b);
      return sameSuit.reduce((a,b) => cmp(a.rank) < cmp(b.rank) ? a : b);
    }
    // dump high
    const qs = legal.find(c => c.suit === "♠" && c.rank === "Q");
    if (qs) return qs;
    const hearts = legal.filter(c => c.suit === "♥").sort((a,b) => cmp(b.rank) - cmp(a.rank));
    if (hearts.length) return hearts[0];
    return legal.reduce((a,b) => cmp(a.rank) > cmp(b.rank) ? a : b);
  };

  const play = (p: Player, c: Card) => {
    setS(prev => {
      const hands = prev.hands.map(h => [...h]);
      hands[p] = hands[p].filter(x => x.id !== c.id);
      const trick = [...prev.trick, { player: p, card: c }];
      const heartsBroken = prev.heartsBroken || c.suit === "♥" || (c.suit === "♠" && c.rank === "Q");
      if (trick.length === 4) {
        const lead = trick[0].card.suit;
        const winnerEntry = trick.filter(t => t.card.suit === lead).reduce((a,b) => cmp(a.card.rank) > cmp(b.card.rank) ? a : b);
        const pts = trick.reduce((sum, t) => sum + (t.card.suit === "♥" ? 1 : 0) + (t.card.suit === "♠" && t.card.rank === "Q" ? 13 : 0), 0);
        const scores = [...prev.scores];
        scores[winnerEntry.player] += pts;
        const handsEmpty = hands.every(h => h.length === 0);
        setTimeout(() => {
          if (handsEmpty) toast(`Round over! Scores: You ${scores[0]} • W ${scores[1]} • N ${scores[2]} • E ${scores[3]}`);
        }, 100);
        return { ...prev, hands, trick: [], leader: winnerEntry.player, turn: winnerEntry.player, scores, heartsBroken };
      }
      return { ...prev, hands, trick, turn: ((p + 1) % 4) as Player, heartsBroken };
    });
  };

  useEffect(() => {
    if (s.turn === 0 || s.hands.every(h => h.length === 0)) return;
    const t = setTimeout(() => play(s.turn, cpuPick(s.turn)), 600);
    return () => clearTimeout(t);
  }, [s.turn, s.trick.length]);

  const handlePlay = (c: Card) => {
    if (s.turn !== 0) return;
    if (!canPlay(0, c)) { toast.error("Illegal play"); return; }
    play(0, c);
  };

  const positions = ["You", "West", "North", "East"];
  return (
    <GameLayout title="Hearts" onNewGame={() => setS(deal())} status={`Scores: ${s.scores.map((v,i)=>`${positions[i]} ${v}`).join(" • ")}`}>
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="text-center text-xs text-muted-foreground">North — {s.hands[2].length}</div>
        <div className="flex justify-between items-center">
          <div className="text-xs text-muted-foreground">West<br/>{s.hands[1].length}</div>
          <div className="min-h-[6rem] grid grid-cols-3 gap-1 place-items-center">
            <div /><div>{s.trick.find(t => t.player === 2) && <PlayingCard card={s.trick.find(t => t.player === 2)!.card} />}</div><div />
            <div>{s.trick.find(t => t.player === 1) && <PlayingCard card={s.trick.find(t => t.player === 1)!.card} />}</div>
            <div className="text-xs text-muted-foreground">{positions[s.turn]}'s turn</div>
            <div>{s.trick.find(t => t.player === 3) && <PlayingCard card={s.trick.find(t => t.player === 3)!.card} />}</div>
            <div /><div>{s.trick.find(t => t.player === 0) && <PlayingCard card={s.trick.find(t => t.player === 0)!.card} />}</div><div />
          </div>
          <div className="text-xs text-muted-foreground">East<br/>{s.hands[3].length}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">You</div>
          <div className="flex flex-wrap gap-1">
            {s.hands[0].map(c => (
              <PlayingCard key={c.id} card={c} size="sm" onClick={() => handlePlay(c)} className={canPlay(0, c) ? "" : "opacity-40"} />
            ))}
          </div>
        </div>
      </div>
    </GameLayout>
  );
};

export default Hearts;
