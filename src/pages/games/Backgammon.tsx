import { useState, useEffect } from "react";
import { GameLayout } from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Simplified backgammon: 24 points, no doubling cube, no bar/bear-off (simplified race game).
// You: pos +. CPU: pos -.
type Board = number[]; // 24 entries; positive=you, negative=cpu

const initBoard = (): Board => {
  const b = Array(24).fill(0);
  b[0]=2; b[11]=5; b[16]=3; b[18]=5;
  b[23]=-2; b[12]=-5; b[7]=-3; b[5]=-5;
  return b;
};

const Backgammon = () => {
  const [board, setBoard] = useState<Board>(initBoard);
  const [dice, setDice] = useState<[number, number] | null>(null);
  const [remaining, setRemaining] = useState<number[]>([]);
  const [turn, setTurn] = useState<"player" | "cpu">("player");
  const [sel, setSel] = useState<number | null>(null);

  const roll = () => {
    const d: [number, number] = [Math.ceil(Math.random()*6), Math.ceil(Math.random()*6)];
    setDice(d);
    setRemaining(d[0] === d[1] ? [d[0], d[0], d[0], d[0]] : [...d]);
  };

  const tryMove = (from: number, steps: number) => {
    const dir = turn === "player" ? 1 : -1;
    const to = from + dir * steps;
    if (to < 0 || to > 23) { toast.error("Off board (bearing off not supported)"); return false; }
    const tgt = board[to];
    if (turn === "player" && tgt < -1) { toast.error("Blocked"); return false; }
    if (turn === "cpu" && tgt > 1) return false;
    const nb = [...board];
    nb[from] -= dir;
    if ((turn === "player" && tgt === -1) || (turn === "cpu" && tgt === 1)) nb[to] = dir;
    else nb[to] += dir;
    setBoard(nb);
    setRemaining(r => { const i = r.indexOf(steps); const nr = [...r]; nr.splice(i, 1); return nr; });
    return true;
  };

  const click = (i: number) => {
    if (turn !== "player" || remaining.length === 0) return;
    if (sel === null) {
      if (board[i] > 0) setSel(i);
      return;
    }
    const steps = i - sel;
    if (steps > 0 && remaining.includes(steps)) tryMove(sel, steps);
    setSel(null);
  };

  useEffect(() => {
    if (turn !== "cpu" || remaining.length === 0) return;
    const t = setTimeout(() => {
      // pick a random valid CPU move
      for (const step of [...remaining]) {
        for (let i = 23; i >= 0; i--) {
          if (board[i] < 0) {
            const to = i - step;
            if (to >= 0 && board[to] <= 1) { tryMove(i, step); return; }
          }
        }
      }
      setRemaining([]);
    }, 700);
    return () => clearTimeout(t);
  }, [turn, remaining, board]);

  useEffect(() => {
    if (dice && remaining.length === 0) {
      const next = turn === "player" ? "cpu" : "player";
      setTurn(next); setDice(null);
    }
  }, [remaining, dice, turn]);

  return (
    <GameLayout title="Backgammon (lite)" onNewGame={() => { setBoard(initBoard()); setDice(null); setRemaining([]); setTurn("player"); setSel(null); }}
      status={dice ? `Dice ${dice[0]}-${dice[1]} • Remaining: ${remaining.join(", ")}` : `${turn === "player" ? "Your" : "CPU's"} turn — roll`}>
      <div className="max-w-3xl mx-auto">
        <div className="bg-amber-900 p-2 rounded-lg">
          <div className="grid grid-cols-12 gap-0.5">
            {board.slice(0, 12).map((v, i) => (
              <button key={i} onClick={() => click(i)}
                className={cn("h-32 flex flex-col items-center justify-end p-1 transition", i % 2 ? "bg-amber-100" : "bg-amber-200", sel === i && "ring-2 ring-yellow-400")}>
                {Array.from({ length: Math.abs(v) }, (_, j) => (
                  <div key={j} className={cn("w-5 h-5 rounded-full", v > 0 ? "bg-slate-100" : "bg-slate-900")} />
                ))}
              </button>
            ))}
            {board.slice(12, 24).map((v, i) => (
              <button key={i+12} onClick={() => click(i+12)}
                className={cn("h-32 flex flex-col items-start justify-start p-1 transition", i % 2 ? "bg-amber-200" : "bg-amber-100", sel === i+12 && "ring-2 ring-yellow-400")}>
                {Array.from({ length: Math.abs(v) }, (_, j) => (
                  <div key={j} className={cn("w-5 h-5 rounded-full", v > 0 ? "bg-slate-100" : "bg-slate-900")} />
                ))}
              </button>
            ))}
          </div>
        </div>
        <div className="text-center mt-4">
          {!dice && turn === "player" && <Button onClick={roll}>Roll Dice</Button>}
        </div>
        <p className="text-xs text-muted-foreground text-center mt-3">Simplified — no bar, bearing off, or doubling.</p>
      </div>
    </GameLayout>
  );
};

export default Backgammon;
