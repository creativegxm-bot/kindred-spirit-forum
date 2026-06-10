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
import { findGame } from "./data/games";

const queryClient = new QueryClient();

const PLAYABLE: Record<string, React.ComponentType> = {
  "solitaire": Solitaire,
  "crazy-eights": CrazyEights,
  "war": War,
  "go-fish": GoFish,
  "blackjack": Blackjack,
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
