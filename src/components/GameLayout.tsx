import { Link } from "react-router-dom";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface Props {
  title: string;
  onNewGame?: () => void;
  status?: string;
  children: ReactNode;
}

export const GameLayout = ({ title, onNewGame, status, children }: Props) => (
  <div className="min-h-screen flex flex-col">
    <header className="border-b border-border/40 bg-background/70 backdrop-blur">
      <div className="container flex items-center gap-3 h-14">
        <Link to="/">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ArrowLeft className="h-4 w-4" /> Lobby
          </Button>
        </Link>
        <h1 className="text-lg font-bold flex-1 truncate">{title}</h1>
        {status && <span className="text-sm text-muted-foreground hidden sm:inline">{status}</span>}
        {onNewGame && (
          <Button size="sm" onClick={onNewGame} className="gap-1.5">
            <RotateCcw className="h-4 w-4" /> New Game
          </Button>
        )}
      </div>
    </header>
    <main className="flex-1 felt p-4 overflow-auto">
      {status && <div className="sm:hidden text-center text-sm text-muted-foreground mb-2">{status}</div>}
      {children}
    </main>
  </div>
);
