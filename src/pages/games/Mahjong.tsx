import { useState } from "react";
import { GameLayout } from "@/components/GameLayout";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Simplified Mahjong solitaire: 36 tiles in a 6x6 grid layered, match pairs.
const TILES = ["🀇","🀈","🀉","🀊","🀋","🀌","🀍","🀎","🀏","🀐","🀑","🀒","🀓","🀔","🀕","🀖","🀗","🀘"];

interface Tile { id: string; sym: string; r: number; c: number; removed: boolean; }

const deal = (): Tile[] => {
  const syms = [...TILES, ...TILES]; // 36
  for (let i = syms.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i+1)); [syms[i], syms[j]] = [syms[j], syms[i]]; }
  return syms.map((sym, i) => ({ id: `t${i}`, sym, r: Math.floor(i/6), c: i%6, removed: false }));
};

const Mahjong = () => {
  const [tiles, setTiles] = useState<Tile[]>(deal);
  const [sel, setSel] = useState<string | null>(null);

  const isFree = (t: Tile) => {
    // free if no tile left or right adjacent (simplified)
    const left = tiles.find(x => !x.removed && x.r === t.r && x.c === t.c - 1);
    const right = tiles.find(x => !x.removed && x.r === t.r && x.c === t.c + 1);
    return !left || !right;
  };

  const click = (id: string) => {
    const t = tiles.find(x => x.id === id);
    if (!t || t.removed || !isFree(t)) return;
    if (!sel) { setSel(id); return; }
    if (sel === id) { setSel(null); return; }
    const other = tiles.find(x => x.id === sel)!;
    if (other.sym === t.sym) {
      setTiles(prev => prev.map(x => x.id === id || x.id === sel ? { ...x, removed: true } : x));
      setSel(null);
      const left = tiles.filter(x => !x.removed && x.id !== id && x.id !== sel).length;
      if (left === 0) toast.success("🎉 Cleared!");
    } else {
      toast.error("Not a match");
      setSel(id);
    }
  };

  return (
    <GameLayout title="Mahjong" onNewGame={() => { setTiles(deal()); setSel(null); }} status={`Remaining ${tiles.filter(t => !t.removed).length}`}>
      <div className="max-w-md mx-auto">
        <div className="grid grid-cols-6 gap-1">
          {tiles.map(t => (
            <button key={t.id} disabled={t.removed} onClick={() => click(t.id)}
              className={cn("aspect-square rounded-md text-3xl flex items-center justify-center transition",
                t.removed ? "invisible" : "bg-amber-50 text-amber-900 hover:bg-amber-100",
                !isFree(t) && !t.removed && "opacity-50",
                sel === t.id && "ring-2 ring-primary scale-95")}>{t.sym}</button>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground mt-4">Simplified — match pairs of free tiles (no neighbor on left or right).</p>
      </div>
    </GameLayout>
  );
};

export default Mahjong;
