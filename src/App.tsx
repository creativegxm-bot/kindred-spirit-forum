import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams, useLocation } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/hooks/useLanguage";
import { CountryProvider } from "@/hooks/useCountry";
import LanguageRouteLayout from "@/components/LanguageRouteLayout";
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

// Redirects legacy routes without language prefix to /tr/...
const LegacyRedirect = () => {
  const location = useLocation();
  return <Navigate to={`/tr${location.pathname}${location.search}${location.hash}`} replace />;
};

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
                {/* Redirect root to /tr */}
                <Route path="/" element={<Navigate to="/tr" replace />} />

                {/* Language-prefixed routes */}
                <Route path="/:lang" element={<LanguageRouteLayout />}>
                  <Route index element={<Index />} />
                  <Route path="r/:communityName" element={<Community />} />
                  <Route path="u/:username" element={<Profile />} />
                  <Route path="saved" element={<SavedPosts />} />
                  <Route path="chat" element={<Chat />} />
                  <Route path="chat/:roomId" element={<Chat />} />
                  <Route path="post/:postId" element={<Post />} />
                  <Route path="tools/converter" element={<FileConverter />} />
                  <Route path="tools/match-finder" element={<MatchFinder />} />
                  <Route path="news" element={<News />} />
                  <Route path="advertise" element={<Advertise />} />
                  <Route path="admin" element={<Admin />} />
                </Route>

                {/* Redirect legacy routes without language prefix */}
                <Route path="/tools/*" element={<LegacyRedirect />} />
                <Route path="/r/*" element={<LegacyRedirect />} />
                <Route path="/u/*" element={<LegacyRedirect />} />
                <Route path="/post/*" element={<LegacyRedirect />} />
                <Route path="/chat/*" element={<LegacyRedirect />} />
                <Route path="/saved" element={<LegacyRedirect />} />
                <Route path="/news" element={<LegacyRedirect />} />
                <Route path="/advertise" element={<LegacyRedirect />} />
                <Route path="/admin" element={<LegacyRedirect />} />

                {/* Catch-all */}
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
