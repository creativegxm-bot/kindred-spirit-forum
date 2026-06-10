import { useState } from "react";
import { Card, createDeck, shuffle, rankValue, RANKS } from "@/lib/cards/deck";
import { PlayingCard } from "@/components/PlayingCard";
import { GameLayout } from "@/components/GameLayout";
import { toast } from "sonner";

interface State {
  cols: Card[][];
  stock: Card[][];
  completed: number;
  moves: number;
}

const deal = (): State => {
  // 1-suit Spider: 2 decks of spades only (104 cards)
  const oneSuit = createDeck(false).filter(c => c.suit === "♠");
  const d = shuffle([...oneSuit, ...oneSuit.map(c => ({ ...c, id: c.id + "2" }))]);
  const cols: Card[][] = Array.from({ length: 10 }, () => []);
  let idx = 0;
  for (let i = 0; i < 10; i++) {
    const n = i < 4 ? 6 : 5;
    for (let j = 0; j < n; j++) cols[i].push({ ...d[idx++], faceUp: j === n - 1 });
  }
  const rest = d.slice(idx);
  const stock: Card[][] = [];
  for (let i = 0; i < 5; i++) stock.push(rest.slice(i * 10, i * 10 + 10).map(c => ({ ...c, faceUp: false })));
  return { cols, stock, completed: 0, moves: 0 };
};

const Spider = () => {
  const [s, setS] = useState<State>(deal);
  const [sel, setSel] = useState<{ col: number; idx: number } | null>(null);

  const isRunFromIdx = (col: Card[], idx: number) => {
    for (let i = idx; i < col.length - 1; i++) {
      if (!col[i].faceUp || !col[i + 1].faceUp) return false;
      if (rankValue(col[i].rank) !== rankValue(col[i + 1].rank) + 1) return false;
    }
    return col[idx].faceUp;
  };

  const tryComplete = (cols: Card[][]) => {
    let completed = 0;
    cols.forEach((col, ci) => {
      if (col.length < 13) return;
      const last13 = col.slice(-13);
      const isSeq = last13.every((c, i) => c.faceUp && rankValue(c.rank) === 13 - i);
      if (isSeq) {
        cols[ci] = col.slice(0, -13);
        if (cols[ci].length > 0) cols[ci][cols[ci].length - 1].faceUp = true;
        completed++;
      }
    });
    return completed;
  };

  const handleClick = (col: number, idx: number) => {
    const c = s.cols[col][idx];
    if (!c) {
      if (sel) moveTo(col);
      return;
    }
    if (sel) {
      if (sel.col === col && sel.idx === idx) { setSel(null); return; }
      moveTo(col);
      return;
    }
    if (!c.faceUp) {
      if (idx === s.cols[col].length - 1) {
        const cols = s.cols.map(c => [...c]);
        cols[col][idx] = { ...c, faceUp: true };
        setS({ ...s, cols });
      }
      return;
    }
    if (!isRunFromIdx(s.cols[col], idx)) {
      toast.error("Must be a descending sequence");
      return;
    }
    setSel({ col, idx });
  };

  const moveTo = (toCol: number) => {
    if (!sel) return;
    const cols = s.cols.map(c => [...c]);
    const moving = cols[sel.col].slice(sel.idx);
    const target = cols[toCol];
    const ok = target.length === 0 || rankValue(target[target.length - 1].rank) === rankValue(moving[0].rank) + 1;
    if (!ok) { toast.error("Invalid move"); setSel(null); return; }
    cols[sel.col] = cols[sel.col].slice(0, sel.idx);
    if (cols[sel.col].length > 0) cols[sel.col][cols[sel.col].length - 1].faceUp = true;
    cols[toCol] = [...target, ...moving];
    const completed = s.completed + tryComplete(cols);
    setSel(null);
    setS({ ...s, cols, completed, moves: s.moves + 1 });
    if (completed === 8) toast.success("🎉 You won!");
  };

  const dealStock = () => {
    if (s.stock.length === 0) { toast.error("No more stock"); return; }
    if (s.cols.some(c => c.length === 0)) { toast.error("Fill empty columns first"); return; }
    const cols = s.cols.map(c => [...c]);
    const row = s.stock[0];
    row.forEach((c, i) => cols[i].push({ ...c, faceUp: true }));
    setS({ ...s, cols, stock: s.stock.slice(1) });
  };

  return (
    <GameLayout title="Spider Solitaire" onNewGame={() => { setS(deal()); setSel(null); }} status={`Completed ${s.completed}/8 • Stock ${s.stock.length}`}>
      <div className="flex gap-2 justify-center mb-4">
        <button onClick={dealStock} className="px-3 py-1 rounded bg-primary text-primary-foreground text-sm font-semibold">Deal {s.stock.length}</button>
      </div>
      <div className="flex gap-1 justify-center">
        {s.cols.map((col, ci) => (
          <div key={ci} className="flex flex-col" onClick={() => col.length === 0 && sel && moveTo(ci)}>
            {col.length === 0 && <PlayingCard empty size="sm" />}
            {col.map((c, i) => (
              <div key={c.id} style={{ marginTop: i === 0 ? 0 : -50 }}>
                <PlayingCard card={c} size="sm" onClick={() => handleClick(ci, i)} selected={sel?.col === ci && sel.idx === i} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </GameLayout>
  );
};

export default Spider;
