import { useState } from "react";
import { Card, createDeck, shuffle, rankValue, isRed, Suit } from "@/lib/cards/deck";
import { PlayingCard } from "@/components/PlayingCard";
import { GameLayout } from "@/components/GameLayout";
import { toast } from "sonner";

interface State {
  cols: Card[][];
  found: Record<Suit, Card[]>;
}

const deal = (): State => {
  const d = shuffle(createDeck(false));
  const cols: Card[][] = Array.from({ length: 7 }, () => []);
  let i = 0;
  // Yukon: col k has k+1 face-down (col 0 has 0) + 4 face-up on top, except col 0 just 1 card
  // Simplified: col k has k cards face-down + 5 face-up (except col 0: just 1 face-up)
  for (let k = 0; k < 7; k++) {
    for (let j = 0; j < k; j++) cols[k].push({ ...d[i++], faceUp: false });
    const up = k === 0 ? 1 : 5;
    for (let j = 0; j < up; j++) cols[k].push({ ...d[i++], faceUp: true });
  }
  return { cols, found: { "♠": [], "♥": [], "♦": [], "♣": [] } };
};

const Yukon = () => {
  const [s, setS] = useState<State>(deal);
  const [sel, setSel] = useState<{ col: number; idx: number } | null>(null);

  const click = (col: number, idx: number) => {
    const c = s.cols[col][idx];
    if (!c) { if (sel) move(col); return; }
    if (sel) {
      if (sel.col === col && sel.idx === idx) { setSel(null); return; }
      move(col);
    } else {
      if (!c.faceUp) {
        if (idx === s.cols[col].length - 1) {
          const cols = s.cols.map(r => [...r]);
          cols[col][idx] = { ...c, faceUp: true };
          setS({ ...s, cols });
        }
        return;
      }
      setSel({ col, idx });
    }
  };

  const move = (toCol: number) => {
    if (!sel) return;
    const moving = s.cols[sel.col].slice(sel.idx);
    if (!moving.every(c => c.faceUp)) { setSel(null); return; }
    const target = s.cols[toCol].at(-1);
    const ok = !target
      ? moving[0].rank === "K"
      : (isRed(target.suit) !== isRed(moving[0].suit) && rankValue(target.rank) === rankValue(moving[0].rank) + 1);
    if (!ok) { toast.error("Invalid"); setSel(null); return; }
    const cols = s.cols.map(c => [...c]);
    cols[sel.col] = cols[sel.col].slice(0, sel.idx);
    if (cols[sel.col].length && !cols[sel.col].at(-1)!.faceUp) {
      cols[sel.col][cols[sel.col].length - 1] = { ...cols[sel.col].at(-1)!, faceUp: true };
    }
    cols[toCol] = [...cols[toCol], ...moving];
    setS({ ...s, cols });
    setSel(null);
  };

  const toFound = (suit: Suit) => {
    if (!sel) return;
    if (sel.idx !== s.cols[sel.col].length - 1) return;
    const c = s.cols[sel.col][sel.idx];
    if (c.suit !== suit) return;
    const top = s.found[suit].at(-1);
    if ((!top && c.rank === "A") || (top && rankValue(c.rank) === rankValue(top.rank) + 1)) {
      const cols = s.cols.map(c => [...c]);
      cols[sel.col] = cols[sel.col].slice(0, -1);
      if (cols[sel.col].length && !cols[sel.col].at(-1)!.faceUp) cols[sel.col][cols[sel.col].length - 1] = { ...cols[sel.col].at(-1)!, faceUp: true };
      setS({ ...s, cols, found: { ...s.found, [suit]: [...s.found[suit], c] } });
      setSel(null);
    }
  };

  return (
    <GameLayout title="Yukon" onNewGame={() => { setS(deal()); setSel(null); }}>
      <div className="max-w-3xl mx-auto">
        <div className="flex gap-2 justify-center mb-4">
          {(["♠", "♥", "♦", "♣"] as Suit[]).map(suit => {
            const top = s.found[suit].at(-1);
            return (
              <div key={suit} onClick={() => toFound(suit)}>
                {top ? <PlayingCard card={top} /> : <div className="pile-slot w-14 h-20 flex items-center justify-center text-white/30 text-xl">{suit}</div>}
              </div>
            );
          })}
        </div>
        <div className="flex gap-1 justify-center">
          {s.cols.map((col, ci) => (
            <div key={ci} className="flex flex-col min-h-[5rem]" onClick={() => col.length === 0 && sel && move(ci)}>
              {col.length === 0 && <PlayingCard empty size="sm" />}
              {col.map((c, i) => (
                <div key={c.id} style={{ marginTop: i === 0 ? 0 : -55 }}>
                  <PlayingCard card={c} size="sm" onClick={() => click(ci, i)} selected={sel?.col === ci && sel.idx === i} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </GameLayout>
  );
};

export default Yukon;
