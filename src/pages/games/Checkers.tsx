import { useState, useEffect } from "react";
import { GameLayout } from "@/components/GameLayout";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Piece = { p: 1 | 2; king: boolean } | null;
const N = 8;

const initBoard = (): Piece[][] => {
  const b: Piece[][] = Array.from({ length: N }, () => Array(N).fill(null));
  for (let r = 0; r < 3; r++) for (let c = 0; c < N; c++) if ((r + c) % 2 === 1) b[r][c] = { p: 2, king: false };
  for (let r = 5; r < 8; r++) for (let c = 0; c < N; c++) if ((r + c) % 2 === 1) b[r][c] = { p: 1, king: false };
  return b;
};

const dirs = (pc: Piece) => {
  if (!pc) return [];
  if (pc.king) return [[-1,-1],[-1,1],[1,-1],[1,1]];
  return pc.p === 1 ? [[-1,-1],[-1,1]] : [[1,-1],[1,1]];
};

const getMoves = (b: Piece[][], r: number, c: number) => {
  const pc = b[r][c]; if (!pc) return [];
  const moves: { tr: number; tc: number; cap?: [number, number] }[] = [];
  for (const [dr, dc] of dirs(pc)) {
    const r1 = r + dr, c1 = c + dc;
    if (r1 < 0 || r1 >= N || c1 < 0 || c1 >= N) continue;
    if (!b[r1][c1]) moves.push({ tr: r1, tc: c1 });
    else if (b[r1][c1]!.p !== pc.p) {
      const r2 = r + 2*dr, c2 = c + 2*dc;
      if (r2 >= 0 && r2 < N && c2 >= 0 && c2 < N && !b[r2][c2]) moves.push({ tr: r2, tc: c2, cap: [r1, c1] });
    }
  }
  return moves;
};

const allMoves = (b: Piece[][], p: 1 | 2) => {
  const list: { r: number; c: number; tr: number; tc: number; cap?: [number, number] }[] = [];
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (b[r][c]?.p === p) {
    getMoves(b, r, c).forEach(m => list.push({ r, c, ...m }));
  }
  const captures = list.filter(m => m.cap);
  return captures.length ? captures : list;
};

const Checkers = () => {
  const [board, setBoard] = useState<Piece[][]>(initBoard);
  const [turn, setTurn] = useState<1 | 2>(1);
  const [sel, setSel] = useState<{ r: number; c: number } | null>(null);

  const apply = (m: { r: number; c: number; tr: number; tc: number; cap?: [number, number] }) => {
    const b = board.map(r => [...r]);
    const pc = b[m.r][m.c]!;
    b[m.r][m.c] = null;
    b[m.tr][m.tc] = { ...pc, king: pc.king || (pc.p === 1 && m.tr === 0) || (pc.p === 2 && m.tr === N - 1) };
    if (m.cap) b[m.cap[0]][m.cap[1]] = null;
    setBoard(b);
    setSel(null);
    setTurn(turn === 1 ? 2 : 1);
  };

  const handleClick = (r: number, c: number) => {
    if (turn !== 1) return;
    if (sel) {
      const moves = getMoves(board, sel.r, sel.c);
      const m = moves.find(x => x.tr === r && x.tc === c);
      if (m) { apply({ ...sel, ...m }); return; }
      setSel(null);
    }
    if (board[r][c]?.p === 1) setSel({ r, c });
  };

  useEffect(() => {
    if (turn !== 2) return;
    const t = setTimeout(() => {
      const moves = allMoves(board, 2);
      if (moves.length === 0) { toast("🎉 You win!"); return; }
      const m = moves[Math.floor(Math.random() * moves.length)];
      apply(m);
    }, 500);
    return () => clearTimeout(t);
  }, [turn, board]);

  useEffect(() => {
    if (allMoves(board, 1).length === 0 && turn === 1) toast("CPU wins!");
  }, [turn, board]);

  const highlights = sel ? getMoves(board, sel.r, sel.c).map(m => `${m.tr}-${m.tc}`) : [];

  return (
    <GameLayout title="Checkers" onNewGame={() => { setBoard(initBoard()); setTurn(1); setSel(null); }} status={turn === 1 ? "Your turn" : "CPU..."}>
      <div className="max-w-md mx-auto">
        <div className="grid grid-cols-8 gap-0 border-2 border-amber-900 rounded">
          {board.map((row, r) => row.map((pc, c) => {
            const dark = (r + c) % 2 === 1;
            const hl = highlights.includes(`${r}-${c}`);
            const isSel = sel?.r === r && sel.c === c;
            return (
              <button key={`${r}-${c}`} onClick={() => dark && handleClick(r, c)}
                className={cn("aspect-square flex items-center justify-center transition", dark ? "bg-amber-900" : "bg-amber-100", hl && "ring-2 ring-yellow-300 ring-inset")}>
                {pc && (
                  <div className={cn("w-[75%] h-[75%] rounded-full shadow-inner flex items-center justify-center text-xs font-bold",
                    pc.p === 1 ? "bg-red-500 text-white" : "bg-slate-900 text-white",
                    isSel && "ring-2 ring-yellow-300")}>
                    {pc.king ? "♛" : ""}
                  </div>
                )}
              </button>
            );
          }))}
        </div>
      </div>
    </GameLayout>
  );
};

export default Checkers;
