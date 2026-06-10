import { useState } from "react";
import { Card, createDeck, shuffle, blackjackValue, rankValue } from "@/lib/cards/deck";
import { PlayingCard } from "@/components/PlayingCard";
import { GameLayout } from "@/components/GameLayout";
import { toast } from "sonner";

interface State {
  pyramid: (Card | null)[][];
  stock: Card[];
  waste: Card[];
  selected: { row: number; col: number } | { waste: true } | null;
  pairs: number;
}

const pyramidValue = (r: Card["rank"]) => {
  if (r === "A") return 1;
  if (r === "J") return 11;
  if (r === "Q") return 12;
  if (r === "K") return 13;
  return parseInt(r, 10);
};

const deal = (): State => {
  const d = shuffle(createDeck(true));
  const pyramid: (Card | null)[][] = [];
  let i = 0;
  for (let r = 0; r < 7; r++) {
    pyramid.push(Array.from({ length: r + 1 }, () => d[i++]));
  }
  return { pyramid, stock: d.slice(i), waste: [], selected: null, pairs: 0 };
};

const Pyramid = () => {
  const [s, setS] = useState<State>(deal);

  const isFree = (row: number, col: number) => {
    if (row === 6) return s.pyramid[row][col] !== null;
    const b1 = s.pyramid[row + 1]?.[col];
    const b2 = s.pyramid[row + 1]?.[col + 1];
    return !b1 && !b2 && s.pyramid[row][col] !== null;
  };

  const removeAt = (row: number, col: number) => {
    const p = s.pyramid.map(r => [...r]);
    p[row][col] = null;
    return p;
  };

  const click = (row: number, col: number) => {
    const card = s.pyramid[row][col];
    if (!card || !isFree(row, col)) return;
    if (pyramidValue(card.rank) === 13) {
      setS({ ...s, pyramid: removeAt(row, col), pairs: s.pairs + 1, selected: null });
      return;
    }
    if (!s.selected) { setS({ ...s, selected: { row, col } }); return; }
    if ("waste" in s.selected) {
      const w = s.waste.at(-1)!;
      if (pyramidValue(w.rank) + pyramidValue(card.rank) === 13) {
        setS({ ...s, pyramid: removeAt(row, col), waste: s.waste.slice(0, -1), selected: null, pairs: s.pairs + 1 });
      } else { toast.error("Must sum to 13"); setS({ ...s, selected: null }); }
    } else {
      const other = s.pyramid[s.selected.row][s.selected.col]!;
      if (pyramidValue(other.rank) + pyramidValue(card.rank) === 13) {
        let p = removeAt(row, col);
        p[s.selected.row][s.selected.col] = null;
        setS({ ...s, pyramid: p, selected: null, pairs: s.pairs + 1 });
      } else { setS({ ...s, selected: { row, col } }); }
    }
  };

  const clickWaste = () => {
    const w = s.waste.at(-1);
    if (!w) return;
    if (pyramidValue(w.rank) === 13) { setS({ ...s, waste: s.waste.slice(0, -1), pairs: s.pairs + 1 }); return; }
    if (!s.selected) { setS({ ...s, selected: { waste: true } }); return; }
    if ("waste" in s.selected) { setS({ ...s, selected: null }); return; }
    const other = s.pyramid[s.selected.row][s.selected.col]!;
    if (pyramidValue(other.rank) + pyramidValue(w.rank) === 13) {
      const p = removeAt(s.selected.row, s.selected.col);
      setS({ ...s, pyramid: p, waste: s.waste.slice(0, -1), selected: null, pairs: s.pairs + 1 });
    } else { toast.error("Must sum to 13"); setS({ ...s, selected: null }); }
  };

  const draw = () => {
    if (s.stock.length === 0) { toast.info("Out of stock"); return; }
    setS({ ...s, stock: s.stock.slice(1), waste: [...s.waste, s.stock[0]], selected: null });
  };

  const won = s.pyramid.every(r => r.every(c => c === null));

  return (
    <GameLayout title="Pyramid" onNewGame={() => setS(deal())} status={won ? "🎉 You won!" : `Pairs ${s.pairs} • Stock ${s.stock.length}`}>
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col items-center gap-1 mb-6">
          {s.pyramid.map((row, ri) => (
            <div key={ri} className="flex gap-1">
              {row.map((c, ci) => c ? (
                <PlayingCard key={c.id} card={c} size="sm" onClick={() => click(ri, ci)}
                  selected={s.selected && !("waste" in s.selected) && s.selected.row === ri && s.selected.col === ci}
                  className={isFree(ri, ci) ? "" : "opacity-60"} />
              ) : <div key={ci} className="w-10 h-14" />)}
            </div>
          ))}
        </div>
        <div className="flex gap-4 justify-center">
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Stock</div>
            <PlayingCard card={{ id: "b", suit: "♠", rank: "A", faceUp: false }} onClick={draw} />
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Waste</div>
            {s.waste.at(-1) ? (
              <PlayingCard card={s.waste.at(-1)!} onClick={clickWaste} selected={s.selected && "waste" in s.selected} />
            ) : <PlayingCard empty />}
          </div>
        </div>
      </div>
    </GameLayout>
  );
};

export default Pyramid;
