import { useState } from "react";
import { Card, createDeck, shuffle, rankValue, isRed, Suit } from "@/lib/cards/deck";
import { PlayingCard } from "@/components/PlayingCard";
import { GameLayout } from "@/components/GameLayout";
import { toast } from "sonner";

interface State {
  cols: Card[][];
  cells: (Card | null)[];
  found: Record<Suit, Card[]>;
  moves: number;
}

const deal = (): State => {
  const d = shuffle(createDeck(true));
  const cols: Card[][] = Array.from({ length: 8 }, () => []);
  d.forEach((c, i) => cols[i % 8].push(c));
  return { cols, cells: [null, null, null, null], found: { "♠": [], "♥": [], "♦": [], "♣": [] }, moves: 0 };
};

type Loc = { kind: "col"; col: number; idx: number } | { kind: "cell"; idx: number } | { kind: "found"; suit: Suit };

const FreeCell = () => {
  const [s, setS] = useState<State>(deal);
  const [sel, setSel] = useState<Loc | null>(null);

  const getCard = (l: Loc): Card | null => {
    if (l.kind === "col") return s.cols[l.col][l.idx] ?? null;
    if (l.kind === "cell") return s.cells[l.idx];
    return s.found[l.suit].at(-1) ?? null;
  };

  const tryMove = (to: Loc) => {
    if (!sel) return;
    const card = getCard(sel);
    if (!card) { setSel(null); return; }
    // only single card moves (simplified)
    if (sel.kind === "col" && sel.idx !== s.cols[sel.col].length - 1) { toast.error("Only the bottom card"); setSel(null); return; }
    const next = { ...s, cols: s.cols.map(c => [...c]), cells: [...s.cells], found: { ...s.found } };
    let ok = false;
    if (to.kind === "cell") {
      if (next.cells[to.idx]) { ok = false; } else { next.cells[to.idx] = card; ok = true; }
    } else if (to.kind === "found") {
      const top = next.found[card.suit].at(-1);
      if ((!top && card.rank === "A") || (top && rankValue(card.rank) === rankValue(top.rank) + 1)) {
        next.found = { ...next.found, [card.suit]: [...next.found[card.suit], card] };
        ok = true;
      }
    } else {
      const target = next.cols[to.col].at(-1);
      if (!target || (isRed(target.suit) !== isRed(card.suit) && rankValue(target.rank) === rankValue(card.rank) + 1)) {
        next.cols[to.col] = [...next.cols[to.col], card];
        ok = true;
      }
    }
    if (!ok) { toast.error("Invalid move"); setSel(null); return; }
    // remove from source
    if (sel.kind === "col") next.cols[sel.col] = next.cols[sel.col].slice(0, -1);
    else if (sel.kind === "cell") next.cells[sel.idx] = null;
    else next.found[sel.suit] = next.found[sel.suit].slice(0, -1);
    setS({ ...next, moves: s.moves + 1 });
    setSel(null);
    const won = Object.values(next.found).every(f => f.length === 13);
    if (won) toast.success("🎉 You won!");
  };

  const handleClick = (l: Loc) => {
    if (sel) { tryMove(l); return; }
    if (getCard(l)) setSel(l);
  };

  const sameLoc = (a: Loc, b: Loc) => JSON.stringify(a) === JSON.stringify(b);

  return (
    <GameLayout title="FreeCell" onNewGame={() => { setS(deal()); setSel(null); }} status={`Moves ${s.moves}`}>
      <div className="max-w-3xl mx-auto">
        <div className="flex gap-2 justify-center mb-3">
          {s.cells.map((c, i) => (
            <div key={i} onClick={() => handleClick({ kind: "cell", idx: i })}>
              {c ? <PlayingCard card={c} selected={sel ? sameLoc(sel, { kind: "cell", idx: i }) : false} /> : <PlayingCard empty />}
            </div>
          ))}
          <div className="w-2" />
          {(["♠", "♥", "♦", "♣"] as Suit[]).map(suit => {
            const top = s.found[suit].at(-1);
            return (
              <div key={suit} onClick={() => handleClick({ kind: "found", suit })}>
                {top ? <PlayingCard card={top} /> : <div className="pile-slot w-14 h-20 flex items-center justify-center text-white/30 text-xl">{suit}</div>}
              </div>
            );
          })}
        </div>
        <div className="flex gap-1 justify-center">
          {s.cols.map((col, ci) => (
            <div key={ci} className="flex flex-col min-h-[5rem]" onClick={() => col.length === 0 && handleClick({ kind: "col", col: ci, idx: 0 })}>
              {col.length === 0 && <PlayingCard empty size="sm" />}
              {col.map((c, i) => (
                <div key={c.id} style={{ marginTop: i === 0 ? 0 : -55 }}>
                  <PlayingCard card={c} size="sm" onClick={() => handleClick({ kind: "col", col: ci, idx: i })} selected={sel ? sameLoc(sel, { kind: "col", col: ci, idx: i }) : false} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </GameLayout>
  );
};

export default FreeCell;
