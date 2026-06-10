import { useState, useEffect } from "react";
import { GameLayout } from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Tile = [number, number] & { id?: string };

const makeSet = (): { a: number; b: number; id: string }[] => {
  const out: { a: number; b: number; id: string }[] = [];
  for (let a = 0; a <= 6; a++) for (let b = a; b <= 6; b++) out.push({ a, b, id: `${a}-${b}` });
  return out;
};

interface State {
  boneyard: { a: number; b: number; id: string }[];
  player: { a: number; b: number; id: string }[];
  cpu: { a: number; b: number; id: string }[];
  line: { a: number; b: number; id: string }[];
  turn: "player" | "cpu";
  winner: string | null;
}

const deal = (): State => {
  const all = makeSet().sort(() => Math.random() - 0.5);
  return { player: all.slice(0, 7), cpu: all.slice(7, 14), boneyard: all.slice(14), line: [], turn: "player", winner: null };
};

const ends = (line: State["line"]) => line.length === 0 ? null : [line[0].a, line.at(-1)!.b];

const Dominoes = () => {
  const [s, setS] = useState<State>(deal);

  const playable = (t: { a: number; b: number }) => {
    const e = ends(s.line);
    if (!e) return true;
    return [t.a, t.b].includes(e[0]) || [t.a, t.b].includes(e[1]);
  };

  const place = (who: "player" | "cpu", t: { a: number; b: number; id: string }) => {
    setS(prev => {
      const hand = prev[who].filter(x => x.id !== t.id);
      let line = [...prev.line];
      if (line.length === 0) line = [t];
      else {
        const left = line[0].a, right = line.at(-1)!.b;
        if (t.b === left) line = [t, ...line];
        else if (t.a === left) line = [{ ...t, a: t.b, b: t.a }, ...line];
        else if (t.a === right) line = [...line, t];
        else if (t.b === right) line = [...line, { ...t, a: t.b, b: t.a }];
      }
      const winner = hand.length === 0 ? (who === "player" ? "🎉 You win!" : "CPU wins") : null;
      return { ...prev, [who]: hand, line, turn: who === "player" ? "cpu" : "player", winner } as State;
    });
  };

  const draw = (who: "player" | "cpu") => {
    setS(prev => {
      if (prev.boneyard.length === 0) {
        return { ...prev, turn: who === "player" ? "cpu" : "player" } as State;
      }
      const t = prev.boneyard[0];
      return { ...prev, boneyard: prev.boneyard.slice(1), [who]: [...prev[who], t] } as State;
    });
  };

  useEffect(() => {
    if (s.turn !== "cpu" || s.winner) return;
    const t = setTimeout(() => {
      const playableTile = s.cpu.find(playable);
      if (playableTile) place("cpu", playableTile);
      else if (s.boneyard.length > 0) draw("cpu");
      else setS(prev => ({ ...prev, turn: "player" }));
    }, 700);
    return () => clearTimeout(t);
  }, [s.turn, s.cpu, s.line, s.boneyard.length, s.winner]);

  const Tile = ({ t }: { t: { a: number; b: number } }) => (
    <div className="inline-flex border border-slate-700 bg-white text-slate-900 rounded text-sm font-bold">
      <span className="px-2 py-1 border-r border-slate-700">{t.a}</span>
      <span className="px-2 py-1">{t.b}</span>
    </div>
  );

  return (
    <GameLayout title="Dominoes" onNewGame={() => setS(deal())} status={s.winner ?? `You ${s.player.length} • CPU ${s.cpu.length} • Boneyard ${s.boneyard.length}`}>
      <div className="max-w-3xl mx-auto space-y-4">
        <div>
          <div className="text-xs text-muted-foreground mb-1">CPU — {s.cpu.length} tiles</div>
          <div className="flex flex-wrap gap-1">{s.cpu.map(t => <div key={t.id} className="w-14 h-7 bg-slate-700 rounded" />)}</div>
        </div>
        <div className="min-h-[3rem] bg-card/40 rounded-lg p-3 flex flex-wrap gap-1 items-center">
          {s.line.length === 0 ? <span className="text-muted-foreground text-sm">Play your first tile…</span> : s.line.map(t => <Tile key={t.id} t={t} />)}
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">You — {s.player.length}</div>
          <div className="flex flex-wrap gap-1">
            {s.player.map(t => (
              <button key={t.id} onClick={() => s.turn === "player" && playable(t) && place("player", t)}
                className={cn("transition", !playable(t) && "opacity-40")}>
                <Tile t={t} />
              </button>
            ))}
          </div>
          <Button size="sm" className="mt-2" onClick={() => draw("player")} disabled={s.turn !== "player" || s.boneyard.length === 0}>Draw from boneyard ({s.boneyard.length})</Button>
        </div>
      </div>
    </GameLayout>
  );
};

export default Dominoes;
