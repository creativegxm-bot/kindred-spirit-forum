import { useState, useEffect } from "react";
import { Card, createDeck, shuffle, blackjackValue } from "@/lib/cards/deck";
import { PlayingCard } from "@/components/PlayingCard";
import { GameLayout } from "@/components/GameLayout";
import { Button } from "@/components/ui/button";

interface State {
  deck: Card[];
  player: Card[];
  dealer: Card[];
  phase: "player" | "dealer" | "done";
  msg: string;
  wins: number;
  losses: number;
}

const handValue = (h: Card[]) => {
  let total = h.reduce((a, c) => a + blackjackValue(c.rank), 0);
  let aces = h.filter(c => c.rank === "A").length;
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  return total;
};

const fresh = (prev?: State): State => {
  const d = shuffle(createDeck(true));
  return {
    deck: d.slice(4),
    player: [d[0], d[2]],
    dealer: [d[1], { ...d[3], faceUp: false }],
    phase: "player",
    msg: "Hit or Stand?",
    wins: prev?.wins ?? 0,
    losses: prev?.losses ?? 0,
  };
};

const Blackjack = () => {
  const [s, setS] = useState<State>(fresh);

  const finish = (prev: State, msg: string, result: "win" | "lose" | "push"): State => ({
    ...prev, phase: "done", msg,
    dealer: prev.dealer.map(c => ({ ...c, faceUp: true })),
    wins: prev.wins + (result === "win" ? 1 : 0),
    losses: prev.losses + (result === "lose" ? 1 : 0),
  });

  const hit = () => setS(prev => {
    if (prev.phase !== "player") return prev;
    const player = [...prev.player, prev.deck[0]];
    const deck = prev.deck.slice(1);
    const v = handValue(player);
    if (v > 21) return finish({ ...prev, player, deck }, `Bust! You: ${v}`, "lose");
    return { ...prev, player, deck };
  });

  const stand = () => setS(prev => ({ ...prev, phase: "dealer", dealer: prev.dealer.map(c => ({ ...c, faceUp: true })) }));

  useEffect(() => {
    if (s.phase !== "dealer") return;
    const t = setTimeout(() => {
      setS(prev => {
        let dealer = [...prev.dealer], deck = [...prev.deck];
        while (handValue(dealer) < 17) {
          dealer.push({ ...deck.shift()!, faceUp: true });
        }
        const pv = handValue(prev.player), dv = handValue(dealer);
        let msg = `You: ${pv} • Dealer: ${dv}`;
        let result: "win" | "lose" | "push";
        if (dv > 21 || pv > dv) { msg += " — You win!"; result = "win"; }
        else if (pv < dv) { msg += " — Dealer wins."; result = "lose"; }
        else { msg += " — Push."; result = "push"; }
        return finish({ ...prev, dealer, deck }, msg, result);
      });
    }, 500);
    return () => clearTimeout(t);
  }, [s.phase]);

  return (
    <GameLayout
      title="Blackjack"
      onNewGame={() => setS(prev => fresh(prev))}
      status={`Wins ${s.wins} • Losses ${s.losses}`}
    >
      <div className="max-w-xl mx-auto space-y-6 text-center">
        <div>
          <div className="text-xs text-muted-foreground mb-1">
            Dealer {s.phase !== "player" && `• ${handValue(s.dealer)}`}
          </div>
          <div className="flex gap-2 justify-center">{s.dealer.map(c => <PlayingCard key={c.id} card={c} />)}</div>
        </div>

        <div className="text-lg font-semibold">{s.msg}</div>

        <div>
          <div className="text-xs text-muted-foreground mb-1">You • {handValue(s.player)}</div>
          <div className="flex gap-2 justify-center">{s.player.map(c => <PlayingCard key={c.id} card={c} />)}</div>
        </div>

        <div className="flex gap-2 justify-center">
          {s.phase === "player" ? (
            <>
              <Button onClick={hit} size="lg">Hit</Button>
              <Button onClick={stand} size="lg" variant="secondary">Stand</Button>
            </>
          ) : s.phase === "done" ? (
            <Button onClick={() => setS(prev => fresh(prev))} size="lg">Deal Again</Button>
          ) : null}
        </div>
      </div>
    </GameLayout>
  );
};

export default Blackjack;
