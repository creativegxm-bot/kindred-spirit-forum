import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import Lobby from "./pages/Lobby";
import NotFound from "./pages/NotFound";
import ComingSoon from "./pages/games/ComingSoon";
import Solitaire from "./pages/games/Solitaire";
import CrazyEights from "./pages/games/CrazyEights";
import War from "./pages/games/War";
import GoFish from "./pages/games/GoFish";
import Blackjack from "./pages/games/Blackjack";
import Spider from "./pages/games/Spider";
import FreeCell from "./pages/games/FreeCell";
import Pyramid from "./pages/games/Pyramid";
import TriPeaks from "./pages/games/TriPeaks";
import Yukon from "./pages/games/Yukon";
import Hearts from "./pages/games/Hearts";
import Spades from "./pages/games/Spades";
import Euchre from "./pages/games/Euchre";
import FiveHundred from "./pages/games/FiveHundred";
import Pinochle from "./pages/games/Pinochle";
import Bridge from "./pages/games/Bridge";
import Whist from "./pages/games/Whist";
import GinRummy from "./pages/games/GinRummy";
import Rummy from "./pages/games/Rummy";
import OldMaid from "./pages/games/OldMaid";
import Slapjack from "./pages/games/Slapjack";
import Snap from "./pages/games/Snap";
import Poker from "./pages/games/Poker";
import TexasHoldem from "./pages/games/TexasHoldem";
import Mahjong from "./pages/games/Mahjong";
import Backgammon from "./pages/games/Backgammon";
import Checkers from "./pages/games/Checkers";
import Chess from "./pages/games/Chess";
import Reversi from "./pages/games/Reversi";
import Dominoes from "./pages/games/Dominoes";
import { findGame } from "./data/games";

const queryClient = new QueryClient();

const PLAYABLE: Record<string, React.ComponentType> = {
  "solitaire": Solitaire,
  "crazy-eights": CrazyEights,
  "war": War,
  "go-fish": GoFish,
  "blackjack": Blackjack,
  "spider": Spider,
  "freecell": FreeCell,
  "pyramid": Pyramid,
  "tripeaks": TriPeaks,
  "yukon": Yukon,
  "hearts": Hearts,
  "spades": Spades,
  "euchre": Euchre,
  "five-hundred": FiveHundred,
  "pinochle": Pinochle,
  "bridge": Bridge,
  "whist": Whist,
  "gin-rummy": GinRummy,
  "rummy": Rummy,
  "old-maid": OldMaid,
  "slapjack": Slapjack,
  "snap": Snap,
  "poker": Poker,
  "texas-holdem": TexasHoldem,
  "mahjong": Mahjong,
  "backgammon": Backgammon,
  "checkers": Checkers,
  "chess": Chess,
  "reversi": Reversi,
  "dominoes": Dominoes,
};

const GameRoute = () => {
  const { slug = "" } = useParams();
  const game = findGame(slug);
  if (!game) return <NotFound />;
  const Cmp = PLAYABLE[slug];
  if (Cmp) return <Cmp />;
  return <ComingSoon />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Lobby />} />
          <Route path="/games/:slug" element={<GameRoute />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
