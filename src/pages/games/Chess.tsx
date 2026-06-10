import { useState, useEffect } from "react";
import { GameLayout } from "@/components/GameLayout";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Piece = { t: "K"|"Q"|"R"|"B"|"N"|"P"; c: "w"|"b" } | null;
const N = 8;

const initBoard = (): Piece[][] => {
  const back: Piece["t"][] = ["R","N","B","Q","K","B","N","R"];
  const b: Piece[][] = Array.from({ length: N }, () => Array(N).fill(null));
  for (let c = 0; c < 8; c++) {
    b[0][c] = { t: back[c], c: "b" };
    b[1][c] = { t: "P", c: "b" };
    b[6][c] = { t: "P", c: "w" };
    b[7][c] = { t: back[c], c: "w" };
  }
  return b;
};

const inB = (r: number, c: number) => r >= 0 && r < N && c >= 0 && c < N;

const moves = (b: Piece[][], r: number, c: number): [number, number][] => {
  const pc = b[r][c]; if (!pc) return [];
  const out: [number, number][] = [];
  const add = (rr: number, cc: number) => {
    if (!inB(rr, cc)) return false;
    const tgt = b[rr][cc];
    if (!tgt) { out.push([rr, cc]); return true; }
    if (tgt.c !== pc.c) out.push([rr, cc]);
    return false;
  };
  const ray = (dr: number, dc: number) => {
    let rr = r + dr, cc = c + dc;
    while (inB(rr, cc)) { if (!add(rr, cc)) break; rr += dr; cc += dc; }
  };
  switch (pc.t) {
    case "P": {
      const d = pc.c === "w" ? -1 : 1;
      if (inB(r+d, c) && !b[r+d][c]) {
        out.push([r+d, c]);
        const start = pc.c === "w" ? 6 : 1;
        if (r === start && !b[r+2*d][c]) out.push([r+2*d, c]);
      }
      for (const dc of [-1, 1]) {
        if (inB(r+d, c+dc) && b[r+d][c+dc]?.c === (pc.c === "w" ? "b" : "w")) out.push([r+d, c+dc]);
      }
      break;
    }
    case "N": {
      for (const [dr, dc] of [[-2,-1],[-2,1],[2,-1],[2,1],[-1,-2],[-1,2],[1,-2],[1,2]]) add(r+dr, c+dc);
      break;
    }
    case "B": for (const [dr,dc] of [[-1,-1],[-1,1],[1,-1],[1,1]]) ray(dr,dc); break;
    case "R": for (const [dr,dc] of [[-1,0],[1,0],[0,-1],[0,1]]) ray(dr,dc); break;
    case "Q": for (const [dr,dc] of [[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]]) ray(dr,dc); break;
    case "K": for (const [dr,dc] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]) add(r+dr, c+dc); break;
  }
  return out;
};

const allMoves = (b: Piece[][], col: "w"|"b") => {
  const list: { r: number; c: number; tr: number; tc: number; cap?: Piece }[] = [];
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    if (b[r][c]?.c === col) moves(b, r, c).forEach(([tr, tc]) => list.push({ r, c, tr, tc, cap: b[tr][tc] }));
  }
  return list;
};

const GLYPH = { K: ["♔","♚"], Q: ["♕","♛"], R: ["♖","♜"], B: ["♗","♝"], N: ["♘","♞"], P: ["♙","♟"] } as const;

const Chess = () => {
  const [board, setBoard] = useState<Piece[][]>(initBoard);
  const [turn, setTurn] = useState<"w"|"b">("w");
  const [sel, setSel] = useState<{ r: number; c: number } | null>(null);

  const apply = (m: { r: number; c: number; tr: number; tc: number }) => {
    const nb = board.map(r => [...r]);
    let pc = nb[m.r][m.c]!;
    if (pc.t === "P" && (m.tr === 0 || m.tr === 7)) pc = { ...pc, t: "Q" };
    nb[m.r][m.c] = null; nb[m.tr][m.tc] = pc;
    setBoard(nb); setSel(null);
    setTurn(turn === "w" ? "b" : "w");
  };

  const click = (r: number, c: number) => {
    if (turn !== "w") return;
    if (sel) {
      const ms = moves(board, sel.r, sel.c);
      if (ms.some(([tr, tc]) => tr === r && tc === c)) { apply({ ...sel, tr: r, tc: c }); return; }
      setSel(null);
    }
    if (board[r][c]?.c === "w") setSel({ r, c });
  };

  useEffect(() => {
    if (turn !== "b") return;
    const t = setTimeout(() => {
      const list = allMoves(board, "b");
      if (list.length === 0) { toast("Stalemate / You win!"); return; }
      // simple: prefer captures, weight by piece value
      const val: Record<string, number> = { P: 1, N: 3, B: 3, R: 5, Q: 9, K: 100 };
      const best = list.reduce((a, b) => ((b.cap ? val[b.cap.t] : 0) > (a.cap ? val[a.cap.t] : 0) ? b : a));
      if (best.cap?.t === "K") toast("Check & mate — but king capture not enforced");
      apply(best);
    }, 500);
    return () => clearTimeout(t);
  }, [turn, board]);

  const hl = sel ? moves(board, sel.r, sel.c) : [];

  return (
    <GameLayout title="Chess (basic)" onNewGame={() => { setBoard(initBoard()); setTurn("w"); setSel(null); }} status={turn === "w" ? "Your turn (white)" : "CPU thinking..."}>
      <div className="max-w-md mx-auto">
        <div className="grid grid-cols-8 gap-0 border-2 border-slate-700 rounded">
          {board.map((row, r) => row.map((pc, c) => {
            const dark = (r + c) % 2 === 1;
            const isHl = hl.some(([rr, cc]) => rr === r && cc === c);
            const isSel = sel?.r === r && sel.c === c;
            return (
              <button key={`${r}-${c}`} onClick={() => click(r, c)}
                className={cn("aspect-square flex items-center justify-center text-3xl transition",
                  dark ? "bg-emerald-700" : "bg-emerald-50",
                  isHl && "ring-2 ring-yellow-400 ring-inset", isSel && "ring-2 ring-amber-400 ring-inset")}>
                {pc && <span className={pc.c === "w" ? "text-white drop-shadow" : "text-slate-900"}>{GLYPH[pc.t][pc.c === "w" ? 0 : 1]}</span>}
              </button>
            );
          }))}
        </div>
        <p className="text-xs text-muted-foreground text-center mt-3">Basic moves only. No castling, en-passant, or check enforcement.</p>
      </div>
    </GameLayout>
  );
};

export default Chess;
