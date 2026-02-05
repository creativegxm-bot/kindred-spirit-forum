import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/hooks/useLanguage";
import { CountryProvider } from "@/hooks/useCountry";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import SavedPosts from "./pages/SavedPosts";
import Community from "./pages/Community";
import Chat from "./pages/Chat";
import FileConverter from "./pages/FileConverter";
import MatchFinder from "./pages/MatchFinder";
import News from "./pages/News";
import Advertise from "./pages/Advertise";
import Admin from "./pages/Admin";
import Post from "./pages/Post";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <CountryProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/r/:communityName" element={<Community />} />
                <Route path="/u/:username" element={<Profile />} />
                <Route path="/saved" element={<SavedPosts />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/chat/:roomId" element={<Chat />} />
                <Route path="/post/:postId" element={<Post />} />
                <Route path="/tools/converter" element={<FileConverter />} />
                <Route path="/tools/match-finder" element={<MatchFinder />} />
                <Route path="/news" element={<News />} />
                <Route path="/advertise" element={<Advertise />} />
                <Route path="/admin" element={<Admin />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </CountryProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
