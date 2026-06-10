import { useState } from "react";
import { Card, createDeck, shuffle, rankValue } from "@/lib/cards/deck";
import { PlayingCard } from "@/components/PlayingCard";
import { GameLayout } from "@/components/GameLayout";
import { toast } from "sonner";

// Layout: 3 peaks. Rows: 3,6,9,10 (28 cards). Last row face up; rest face down until uncovered.
interface State {
  rows: (Card | null)[][];
  stock: Card[];
  waste: Card[];
  score: number;
  streak: number;
}

const deal = (): State => {
  const d = shuffle(createDeck(false));
  let i = 0;
  const counts = [3, 6, 9, 10];
  const rows: (Card | null)[][] = counts.map((n, r) =>
    Array.from({ length: n }, () => ({ ...d[i++], faceUp: r === 3 }))
  );
  const waste = [{ ...d[i++], faceUp: true }];
  return { rows, stock: d.slice(i).map(c => ({ ...c, faceUp: false })), waste, score: 0, streak: 0 };
};

const TriPeaks = () => {
  const [s, setS] = useState<State>(deal);

  // children indices for each card uncovering it
  const childrenOf = (row: number, col: number): [number, number][] => {
    if (row === 3) return [];
    // peaks layout: row 0 cols [0,1,2]; row 1 cols 0,1 | 2,3 | 4,5; row 2 cols 0..8; row 3 cols 0..9
    if (row === 0) {
      const c1 = col * 2, c2 = col * 2 + 1;
      return [[1, c1], [1, c2]];
    }
    if (row === 1) {
      // row 1 col -> row 2 covers two
      return [[2, col], [2, col + 1]];
    }
    // row 2 -> row 3
    return [[3, col], [3, col + 1]];
  };

  const isFree = (row: number, col: number) => {
    const c = s.rows[row][col];
    if (!c) return false;
    return childrenOf(row, col).every(([r, cc]) => !s.rows[r][cc]);
  };

  const isAdjacent = (a: Card, b: Card) => {
    const av = rankValue(a.rank), bv = rankValue(b.rank);
    const diff = Math.abs(av - bv);
    return diff === 1 || diff === 12;
  };

  const click = (row: number, col: number) => {
    const c = s.rows[row][col];
    if (!c || !isFree(row, col)) return;
    const top = s.waste.at(-1)!;
    if (!isAdjacent(c, top)) { toast.error("Not adjacent rank"); return; }
    const rows = s.rows.map(r => [...r]);
    rows[row][col] = null;
    // uncover parents
    rows.forEach((r, ri) => r.forEach((cc, ci) => {
      if (cc && !cc.faceUp && childrenOf(ri, ci).every(([rr, ccc]) => !rows[rr][ccc])) {
        rows[ri][ci] = { ...cc, faceUp: true };
      }
    }));
    setS({ ...s, rows, waste: [...s.waste, { ...c, faceUp: true }], score: s.score + (s.streak + 1) * 100, streak: s.streak + 1 });
    if (rows.every(r => r.every(x => !x))) toast.success("🎉 Cleared!");
  };

  const draw = () => {
    if (s.stock.length === 0) { toast.info("Out of cards"); return; }
    setS({ ...s, stock: s.stock.slice(1), waste: [...s.waste, { ...s.stock[0], faceUp: true }], streak: 0 });
  };

  return (
    <GameLayout title="TriPeaks" onNewGame={() => setS(deal())} status={`Score ${s.score} • Stock ${s.stock.length}`}>
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col items-center gap-1 mb-6">
          {s.rows.map((row, ri) => (
            <div key={ri} className="flex gap-1" style={{ marginLeft: ri === 0 ? 0 : 0 }}>
              {row.map((c, ci) => c ? (
                <PlayingCard key={c.id} card={c} size="sm" onClick={() => click(ri, ci)} className={isFree(ri, ci) ? "" : ""} />
              ) : <div key={ci} className="w-10 h-14" />)}
            </div>
          ))}
        </div>
        <div className="flex gap-4 justify-center">
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Stock {s.stock.length}</div>
            <PlayingCard card={{ id: "b", suit: "♠", rank: "A", faceUp: false }} onClick={draw} />
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Pile</div>
            {s.waste.at(-1) && <PlayingCard card={s.waste.at(-1)!} />}
          </div>
        </div>
      </div>
    </GameLayout>
  );
};

export default TriPeaks;
