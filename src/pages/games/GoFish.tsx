import { useState, useEffect } from "react";
import { Card, createDeck, shuffle, RANKS, Rank } from "@/lib/cards/deck";
import { PlayingCard } from "@/components/PlayingCard";
import { GameLayout } from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface State {
  deck: Card[];
  player: Card[];
  cpu: Card[];
  playerBooks: Rank[];
  cpuBooks: Rank[];
  turn: "player" | "cpu";
  log: string[];
  winner: "player" | "cpu" | "tie" | null;
}

const deal = (): State => {
  const d = shuffle(createDeck(true));
  return {
    deck: d.slice(14),
    player: d.slice(0, 7),
    cpu: d.slice(7, 14).map(c => ({ ...c, faceUp: false })),
    playerBooks: [], cpuBooks: [],
    turn: "player", log: ["Game started"], winner: null,
  };
};

const checkBooks = (hand: Card[]): { hand: Card[]; books: Rank[] } => {
  const counts: Record<string, Card[]> = {};
  hand.forEach(c => { (counts[c.rank] ??= []).push(c); });
  const books: Rank[] = [];
  const kept: Card[] = [];
  for (const r of Object.keys(counts)) {
    if (counts[r].length === 4) books.push(r as Rank);
    else kept.push(...counts[r]);
  }
  return { hand: kept, books };
};

const GoFish = () => {
  const [s, setS] = useState<State>(deal);
  const log = (m: string) => setS(p => ({ ...p, log: [m, ...p.log].slice(0, 8) }));

  const ask = (rank: Rank) => {
    if (s.turn !== "player" || s.winner) return;
    if (!s.player.some(c => c.rank === rank)) {
      toast.error("You must have the rank you ask for.");
      return;
    }
    setS(prev => {
      const give = prev.cpu.filter(c => c.rank === rank);
      let player = [...prev.player], cpu = prev.cpu, deck = prev.deck;
      const newLog = [...prev.log];
      if (give.length) {
        cpu = cpu.filter(c => c.rank !== rank);
        player = [...player, ...give.map(c => ({ ...c, faceUp: true }))];
        newLog.unshift(`You asked for ${rank} — CPU handed over ${give.length}.`);
      } else {
        newLog.unshift(`You asked for ${rank} — Go fish!`);
        if (deck.length) {
          const c = { ...deck[0], faceUp: true };
          deck = deck.slice(1);
          player = [...player, c];
          if (c.rank === rank) newLog.unshift(`Lucky! You drew the ${rank}.`);
        }
      }
      const pb = checkBooks(player);
      return {
        ...prev,
        player: pb.hand,
        cpu, deck,
        playerBooks: [...prev.playerBooks, ...pb.books],
        log: newLog.slice(0, 8),
        turn: give.length ? "player" : "cpu",
      };
    });
  };

  // CPU turn
  useEffect(() => {
    if (s.turn !== "cpu" || s.winner) return;
    const t = setTimeout(() => {
      setS(prev => {
        if (prev.cpu.length === 0) return { ...prev, turn: "player" };
        const rank = prev.cpu[Math.floor(Math.random() * prev.cpu.length)].rank;
        const give = prev.player.filter(c => c.rank === rank);
        let player = prev.player, cpu = [...prev.cpu], deck = prev.deck;
        const newLog = [...prev.log];
        if (give.length) {
          player = player.filter(c => c.rank !== rank);
          cpu = [...cpu, ...give.map(c => ({ ...c, faceUp: false }))];
          newLog.unshift(`CPU asked for ${rank} — you gave ${give.length}.`);
        } else {
          newLog.unshift(`CPU asked for ${rank} — Go fish!`);
          if (deck.length) {
            const c = { ...deck[0], faceUp: false };
            deck = deck.slice(1);
            cpu = [...cpu, c];
          }
        }
        const cb = checkBooks(cpu);
        return {
          ...prev,
          player, deck,
          cpu: cb.hand,
          cpuBooks: [...prev.cpuBooks, ...cb.books],
          log: newLog.slice(0, 8),
          turn: give.length ? "cpu" : "player",
        };
      });
    }, 900);
    return () => clearTimeout(t);
  }, [s.turn, s.winner]);

  // refill empty hand
  useEffect(() => {
    setS(prev => {
      if (prev.winner) return prev;
      let { player, cpu, deck } = prev;
      if (player.length === 0 && deck.length) {
        player = [{ ...deck[0], faceUp: true }];
        deck = deck.slice(1);
      }
      if (cpu.length === 0 && deck.length) {
        cpu = [{ ...deck[0], faceUp: false }];
        deck = deck.slice(1);
      }
      if (prev.playerBooks.length + prev.cpuBooks.length === 13) {
        const winner = prev.playerBooks.length > prev.cpuBooks.length ? "player" : prev.playerBooks.length < prev.cpuBooks.length ? "cpu" : "tie";
        return { ...prev, winner };
      }
      if (player === prev.player && cpu === prev.cpu) return prev;
      return { ...prev, player, cpu, deck };
    });
  }, [s.player, s.cpu, s.deck, s.playerBooks, s.cpuBooks]);

  const uniqueRanks = Array.from(new Set(s.player.map(c => c.rank))) as Rank[];

  return (
    <GameLayout
      title="Go Fish"
      onNewGame={() => setS(deal())}
      status={`Books — You: ${s.playerBooks.length} • CPU: ${s.cpuBooks.length} • Deck: ${s.deck.length}`}
    >
      <div className="max-w-2xl mx-auto space-y-4">
        <div>
          <div className="text-xs text-muted-foreground mb-1">CPU — {s.cpu.length} cards • Books: {s.cpuBooks.join(", ") || "—"}</div>
          <div className="flex gap-1 flex-wrap">{s.cpu.map(c => <PlayingCard key={c.id} card={c} size="sm" />)}</div>
        </div>

        <div className="bg-background/40 rounded-lg p-3 text-sm space-y-1 min-h-[80px]">
          {s.log.map((l, i) => <div key={i} className={i === 0 ? "font-semibold" : "text-muted-foreground"}>{l}</div>)}
        </div>

        <div>
          <div className="text-xs text-muted-foreground mb-1">You — Books: {s.playerBooks.join(", ") || "—"}</div>
          <div className="flex gap-1 flex-wrap mb-3">{s.player.map(c => <PlayingCard key={c.id} card={c} />)}</div>
          {s.turn === "player" && !s.winner && (
            <div className="flex gap-1 flex-wrap">
              <span className="text-sm self-center mr-2">Ask for:</span>
              {RANKS.filter(r => uniqueRanks.includes(r)).map(r => (
                <Button key={r} size="sm" variant="secondary" onClick={() => ask(r)}>{r}</Button>
              ))}
            </div>
          )}
          {s.winner && (
            <div className="text-center text-xl font-bold mt-4">
              {s.winner === "player" ? "🎉 You won!" : s.winner === "cpu" ? "CPU won" : "Tie!"}
            </div>
          )}
        </div>
      </div>
    </GameLayout>
  );
};

export default GoFish;
