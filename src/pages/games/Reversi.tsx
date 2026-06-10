import { useState, useEffect } from "react";
import { GameLayout } from "@/components/GameLayout";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Cell = 0 | 1 | 2; // 0 empty, 1 black (you), 2 white (cpu)
const N = 8;
const DIRS = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];

const initBoard = (): Cell[][] => {
  const b: Cell[][] = Array.from({ length: N }, () => Array(N).fill(0) as Cell[]);
  b[3][3] = 2; b[4][4] = 2; b[3][4] = 1; b[4][3] = 1;
  return b;
};

const flipsAt = (b: Cell[][], r: number, c: number, p: Cell): [number, number][] => {
  if (b[r][c] !== 0) return [];
  const opp: Cell = p === 1 ? 2 : 1;
  const flips: [number, number][] = [];
  for (const [dr, dc] of DIRS) {
    const line: [number, number][] = [];
    let rr = r + dr, cc = c + dc;
    while (rr >= 0 && rr < N && cc >= 0 && cc < N && b[rr][cc] === opp) {
      line.push([rr, cc]); rr += dr; cc += dc;
    }
    if (line.length && rr >= 0 && rr < N && cc >= 0 && cc < N && b[rr][cc] === p) flips.push(...line);
  }
  return flips;
};

const legalMoves = (b: Cell[][], p: Cell) => {
  const moves: { r: number; c: number; flips: [number, number][] }[] = [];
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    const f = flipsAt(b, r, c, p);
    if (f.length) moves.push({ r, c, flips: f });
  }
  return moves;
};

const Reversi = () => {
  const [board, setBoard] = useState<Cell[][]>(initBoard);
  const [turn, setTurn] = useState<Cell>(1);

  const playerMoves = legalMoves(board, 1);
  const counts = board.flat().reduce((acc, c) => { acc[c]++; return acc; }, [0,0,0]);

  const apply = (r: number, c: number, p: Cell) => {
    const f = flipsAt(board, r, c, p);
    if (!f.length) return;
    const nb = board.map(row => [...row]) as Cell[][];
    nb[r][c] = p;
    f.forEach(([rr, cc]) => nb[rr][cc] = p);
    setBoard(nb);
    setTurn(p === 1 ? 2 : 1);
  };

  useEffect(() => {
    if (turn !== 2) return;
    const t = setTimeout(() => {
      const moves = legalMoves(board, 2);
      if (moves.length === 0) {
        if (legalMoves(board, 1).length === 0) {
          const c = board.flat().reduce((acc, c) => { acc[c]++; return acc; }, [0,0,0]);
          toast(c[1] > c[2] ? `🎉 You win ${c[1]}-${c[2]}` : c[1] < c[2] ? `CPU wins ${c[2]}-${c[1]}` : "Tie");
          return;
        }
        toast("CPU passes"); setTurn(1); return;
      }
      const best = moves.reduce((a, b) => b.flips.length > a.flips.length ? b : a);
      apply(best.r, best.c, 2);
    }, 600);
    return () => clearTimeout(t);
  }, [turn, board]);

  return (
    <GameLayout title="Reversi" onNewGame={() => { setBoard(initBoard()); setTurn(1); }} status={`Black ${counts[1]} • White ${counts[2]}`}>
      <div className="max-w-md mx-auto">
        <div className="bg-emerald-800 p-2 rounded-lg">
          <div className="grid grid-cols-8 gap-0.5">
            {board.map((row, r) => row.map((c, ci) => {
              const isLegal = turn === 1 && playerMoves.some(m => m.r === r && m.c === ci);
              return (
                <button key={`${r}-${ci}`} onClick={() => isLegal && apply(r, ci, 1)}
                  className={cn("aspect-square bg-emerald-700 hover:bg-emerald-600 rounded-sm flex items-center justify-center transition",
                    isLegal && "ring-1 ring-yellow-300")}>
                  {c !== 0 && <div className={cn("w-[80%] h-[80%] rounded-full", c === 1 ? "bg-slate-900" : "bg-white")} />}
                </button>
              );
            }))}
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-3">{turn === 1 ? "Your turn (Black)" : "CPU thinking..."}</p>
      </div>
    </GameLayout>
  );
};

export default Reversi;
