import { useState, useEffect } from "react";
import { Card, createDeck, shuffle, SUITS, Suit } from "@/lib/cards/deck";
import { PlayingCard } from "@/components/PlayingCard";
import { GameLayout } from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface State {
  deck: Card[];
  discard: Card[];
  player: Card[];
  cpu: Card[];
  turn: "player" | "cpu";
  declaredSuit: Suit | null;
  winner: "player" | "cpu" | null;
}

const deal = (): State => {
  const d = shuffle(createDeck(true));
  const player = d.slice(0, 7);
  const cpu = d.slice(7, 14).map(c => ({ ...c, faceUp: false }));
  const discard = [d[14]];
  const deck = d.slice(15);
  return { deck, discard, player, cpu, turn: "player", declaredSuit: null, winner: null };
};

const canPlay = (c: Card, top: Card, declared: Suit | null) => {
  if (c.rank === "8") return true;
  if (declared) return c.suit === declared;
  return c.suit === top.suit || c.rank === top.rank;
};

const CrazyEights = () => {
  const [state, setState] = useState<State>(deal);
  const [pickSuit, setPickSuit] = useState<((s: Suit) => void) | null>(null);

  const top = state.discard[state.discard.length - 1];

  const playCard = (c: Card, hand: "player" | "cpu", chosenSuit?: Suit) => {
    setState(s => {
      const newHand = (hand === "player" ? s.player : s.cpu).filter(x => x.id !== c.id);
      const discard = [...s.discard, { ...c, faceUp: true }];
      const winner = newHand.length === 0 ? hand : null;
      return {
        ...s,
        ...(hand === "player" ? { player: newHand } : { cpu: newHand }),
        discard,
        turn: hand === "player" ? "cpu" : "player",
        declaredSuit: c.rank === "8" ? (chosenSuit ?? null) : null,
        winner,
      };
    });
  };

  const draw = (who: "player" | "cpu"): Card | null => {
    let drawn: Card | null = null;
    setState(s => {
      let deck = s.deck;
      if (deck.length === 0) {
        if (s.discard.length <= 1) return s;
        const keep = s.discard[s.discard.length - 1];
        deck = shuffle(s.discard.slice(0, -1));
        s = { ...s, deck, discard: [keep] };
      }
      const c = { ...deck[0], faceUp: who === "player" };
      drawn = c;
      const rest = deck.slice(1);
      return {
        ...s,
        deck: rest,
        ...(who === "player" ? { player: [...s.player, c] } : { cpu: [...s.cpu, c] }),
      };
    });
    return drawn;
  };

  const handlePlayerPlay = (c: Card) => {
    if (state.turn !== "player" || state.winner) return;
    if (!canPlay(c, top, state.declaredSuit)) {
      toast.error("Card doesn't match");
      return;
    }
    if (c.rank === "8") {
      setPickSuit(() => (s: Suit) => { playCard(c, "player", s); setPickSuit(null); });
      return;
    }
    playCard(c, "player");
  };

  const handlePlayerDraw = () => {
    if (state.turn !== "player" || state.winner) return;
    const c = draw("player");
    if (c && canPlay(c, top, state.declaredSuit)) {
      toast.info("Drew a playable card");
    } else {
      setTimeout(() => setState(s => ({ ...s, turn: "cpu" })), 250);
    }
  };

  // CPU turn
  useEffect(() => {
    if (state.turn !== "cpu" || state.winner) return;
    const t = setTimeout(() => {
      const playable = state.cpu.find(c => canPlay({ ...c, faceUp: true }, top, state.declaredSuit));
      if (playable) {
        const chosen: Suit | undefined =
          playable.rank === "8" ? SUITS[Math.floor(Math.random() * 4)] : undefined;
        playCard({ ...playable, faceUp: true }, "cpu", chosen);
      } else {
        const c = draw("cpu");
        if (c && canPlay({ ...c, faceUp: true }, top, state.declaredSuit)) {
          setTimeout(() => playCard({ ...c, faceUp: true }, "cpu"), 400);
        } else {
          setState(s => ({ ...s, turn: "player" }));
        }
      }
    }, 700);
    return () => clearTimeout(t);
  }, [state.turn, state.cpu, state.winner, top, state.declaredSuit]);

  useEffect(() => {
    if (state.winner) toast(state.winner === "player" ? "🎉 You won!" : "😞 CPU won");
  }, [state.winner]);

  return (
    <GameLayout
      title="Crazy Eights"
      onNewGame={() => { setState(deal()); setPickSuit(null); }}
      status={state.winner ? (state.winner === "player" ? "You won!" : "CPU won") : state.turn === "player" ? "Your turn" : "CPU…"}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* CPU hand */}
        <div>
          <div className="text-xs text-muted-foreground mb-1">CPU — {state.cpu.length} cards</div>
          <div className="flex gap-1 flex-wrap">
            {state.cpu.map(c => <PlayingCard key={c.id} card={c} size="sm" />)}
          </div>
        </div>

        {/* Center */}
        <div className="flex items-center justify-center gap-6">
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Stock ({state.deck.length})</div>
            <PlayingCard card={{ id: "back", suit: "♠", rank: "A", faceUp: false }} onClick={handlePlayerDraw} />
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">
              Top {state.declaredSuit && <span className="text-primary">→ {state.declaredSuit}</span>}
            </div>
            <PlayingCard card={top} />
          </div>
        </div>

        {pickSuit && (
          <div className="text-center">
            <div className="text-sm mb-2">Pick a suit:</div>
            <div className="flex gap-2 justify-center">
              {SUITS.map(s => (
                <Button key={s} variant="secondary" onClick={() => pickSuit(s)}>{s}</Button>
              ))}
            </div>
          </div>
        )}

        {/* Player hand */}
        <div>
          <div className="text-xs text-muted-foreground mb-1">You — {state.player.length} cards</div>
          <div className="flex gap-1 flex-wrap">
            {state.player.map(c => (
              <PlayingCard key={c.id} card={c} onClick={() => handlePlayerPlay(c)} />
            ))}
          </div>
        </div>
      </div>
    </GameLayout>
  );
};

export default CrazyEights;
