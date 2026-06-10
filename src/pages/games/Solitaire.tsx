import { useEffect, useMemo, useState } from "react";
import { Card, createDeck, shuffle, isRed, rankValue, RANKS } from "@/lib/cards/deck";
import { PlayingCard } from "@/components/PlayingCard";
import { GameLayout } from "@/components/GameLayout";
import { toast } from "sonner";

type Sel = { from: "t" | "w" | "f"; idx: number; cardIdx: number } | null;

interface State {
  tableau: Card[][];      // 7 piles
  foundations: Card[][];  // 4 piles by suit order ♠♥♦♣
  stock: Card[];
  waste: Card[];
  moves: number;
  won: boolean;
}

const SUIT_ORDER = ["♠", "♥", "♦", "♣"] as const;

const deal = (): State => {
  const d = shuffle(createDeck(false));
  const tableau: Card[][] = Array.from({ length: 7 }, () => []);
  let i = 0;
  for (let col = 0; col < 7; col++) {
    for (let row = 0; row <= col; row++) {
      const c = { ...d[i++] };
      c.faceUp = row === col;
      tableau[col].push(c);
    }
  }
  const stock = d.slice(i).map(c => ({ ...c, faceUp: false }));
  return { tableau, foundations: [[], [], [], []], stock, waste: [], moves: 0, won: false };
};

const canPlaceOnTableau = (moving: Card, target: Card | undefined) => {
  if (!target) return moving.rank === "K";
  return target.faceUp &&
    isRed(moving.suit) !== isRed(target.suit) &&
    rankValue(moving.rank) === rankValue(target.rank) - 1;
};

const canPlaceOnFoundation = (moving: Card, pile: Card[], suit: typeof SUIT_ORDER[number]) => {
  if (moving.suit !== suit) return false;
  if (pile.length === 0) return moving.rank === "A";
  const top = pile[pile.length - 1];
  return rankValue(moving.rank) === rankValue(top.rank) + 1;
};

const Solitaire = () => {
  const [state, setState] = useState<State>(deal);
  const [sel, setSel] = useState<Sel>(null);

  const newGame = () => { setState(deal()); setSel(null); };

  // Auto-flip facedown tops
  useEffect(() => {
    setState(s => {
      let changed = false;
      const tableau = s.tableau.map(col => {
        if (col.length && !col[col.length - 1].faceUp) {
          changed = true;
          const nc = [...col]; nc[nc.length - 1] = { ...nc[nc.length - 1], faceUp: true };
          return nc;
        }
        return col;
      });
      if (!changed) return s;
      return { ...s, tableau };
    });
  }, [state.tableau, state.waste, state.foundations]);

  const won = state.foundations.every(p => p.length === 13);
  useEffect(() => { if (won && !state.won) { toast.success("You won! 🎉"); setState(s => ({ ...s, won: true })); } }, [won, state.won]);

  const drawStock = () => {
    setState(s => {
      if (s.stock.length === 0) {
        return { ...s, stock: s.waste.slice().reverse().map(c => ({ ...c, faceUp: false })), waste: [], moves: s.moves + 1 };
      }
      const stock = [...s.stock];
      const c = { ...stock.pop()!, faceUp: true };
      return { ...s, stock, waste: [...s.waste, c], moves: s.moves + 1 };
    });
    setSel(null);
  };

  const trySelect = (from: "t" | "w" | "f", idx: number, cardIdx: number) => {
    let pile: Card[] = [];
    if (from === "t") pile = state.tableau[idx];
    if (from === "w") pile = state.waste;
    if (from === "f") pile = state.foundations[idx];
    const c = pile[cardIdx];
    if (!c || !c.faceUp) return;
    setSel({ from, idx, cardIdx });
  };

  const moveTo = (to: "t" | "f", toIdx: number) => {
    if (!sel) return;
    setState(s => {
      const src = sel.from === "t" ? s.tableau[sel.idx] : sel.from === "w" ? s.waste : s.foundations[sel.idx];
      const moving = src.slice(sel.cardIdx);
      if (moving.length === 0) return s;
      if (to === "t") {
        const target = s.tableau[toIdx];
        if (!canPlaceOnTableau(moving[0], target[target.length - 1])) return s;
        const tableau = s.tableau.map(c => [...c]);
        if (sel.from === "t") tableau[sel.idx] = tableau[sel.idx].slice(0, sel.cardIdx);
        tableau[toIdx] = [...tableau[toIdx], ...moving];
        let waste = s.waste, foundations = s.foundations.map(p => [...p]);
        if (sel.from === "w") waste = waste.slice(0, -1);
        if (sel.from === "f") foundations[sel.idx] = foundations[sel.idx].slice(0, -1);
        return { ...s, tableau, waste, foundations, moves: s.moves + 1 };
      }
      // to foundation: only single card
      if (moving.length !== 1) return s;
      const suit = SUIT_ORDER[toIdx];
      if (!canPlaceOnFoundation(moving[0], s.foundations[toIdx], suit)) return s;
      const foundations = s.foundations.map(p => [...p]);
      foundations[toIdx] = [...foundations[toIdx], moving[0]];
      const tableau = s.tableau.map(c => [...c]);
      let waste = s.waste;
      if (sel.from === "t") tableau[sel.idx] = tableau[sel.idx].slice(0, sel.cardIdx);
      if (sel.from === "w") waste = waste.slice(0, -1);
      return { ...s, tableau, foundations, waste, moves: s.moves + 1 };
    });
    setSel(null);
  };

  const isSelected = (from: string, idx: number, cardIdx: number) =>
    sel && sel.from === from && sel.idx === idx && cardIdx >= sel.cardIdx;

  return (
    <GameLayout title="Klondike Solitaire" onNewGame={newGame} status={`Moves: ${state.moves}`}>
      <div className="max-w-3xl mx-auto">
        {/* Top row: stock, waste, foundations */}
        <div className="flex justify-between gap-2 mb-6">
          <div className="flex gap-2">
            <div onClick={drawStock}>
              {state.stock.length > 0
                ? <PlayingCard card={{ ...state.stock[state.stock.length - 1], faceUp: false }} />
                : <PlayingCard empty />}
            </div>
            <div onClick={() => state.waste.length && trySelect("w", 0, state.waste.length - 1)}>
              {state.waste.length > 0
                ? <PlayingCard
                    card={state.waste[state.waste.length - 1]}
                    selected={!!isSelected("w", 0, state.waste.length - 1)}
                  />
                : <PlayingCard empty />}
            </div>
          </div>
          <div className="flex gap-2">
            {SUIT_ORDER.map((s, i) => (
              <div key={s} onClick={() => sel ? moveTo("f", i) : state.foundations[i].length && trySelect("f", i, state.foundations[i].length - 1)}>
                {state.foundations[i].length === 0
                  ? <PlayingCard empty />
                  : <PlayingCard card={state.foundations[i][state.foundations[i].length - 1]} />}
              </div>
            ))}
          </div>
        </div>

        {/* Tableau */}
        <div className="grid grid-cols-7 gap-2">
          {state.tableau.map((pile, col) => (
            <div key={col} className="relative min-h-[120px]" onClick={() => sel && pile.length === 0 && moveTo("t", col)}>
              {pile.length === 0 && <PlayingCard empty />}
              {pile.map((card, i) => (
                <div
                  key={card.id}
                  className="absolute left-0 w-full"
                  style={{ top: `${i * 22}px` }}
                  onClick={(e) => { e.stopPropagation(); sel ? moveTo("t", col) : trySelect("t", col, i); }}
                >
                  <PlayingCard
                    card={card}
                    selected={!!isSelected("t", col, i)}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </GameLayout>
  );
};

export default Solitaire;
