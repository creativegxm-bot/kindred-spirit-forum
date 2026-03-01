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
import TechNews from "./pages/TechNews";
import TopApps from "./pages/TopApps";
import EmailAlias from "./pages/EmailAlias";
import Advertise from "./pages/Advertise";
import Admin from "./pages/Admin";
import Post from "./pages/Post";
import Hims from "./pages/Hims";
import Hers from "./pages/Hers";
import RobloxGames from "./pages/RobloxGames";
import RobloxGameDetail from "./pages/RobloxGameDetail";
import AppListing from "./pages/AppListing";
import AppDetail from "./pages/AppDetail";
import AIAppListing from "./pages/AIAppListing";
import AIAppDetail from "./pages/AIAppDetail";
import PrivacyAnalysis from "./pages/PrivacyAnalysis";
import CategoryApps from "./pages/CategoryApps";
import CategoryAppDetail from "./pages/CategoryAppDetail";
import AboutUs from "./pages/AboutUs";
import SecurityTrust from "./pages/SecurityTrust";
import HelpSupport from "./pages/HelpSupport";
import Jobs from "./pages/Jobs";
import EditorialGuidelines from "./pages/EditorialGuidelines";
import AddSoftware from "./pages/AddSoftware";
import MonetizationSolutions from "./pages/MonetizationSolutions";
import SoftwarePolicy from "./pages/SoftwarePolicy";
import DMCA from "./pages/DMCA";
import LegalInfo from "./pages/LegalInfo";
import TermsOfUse from "./pages/TermsOfUse";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import CookiePolicy from "./pages/CookiePolicy";
import AdvertisingOpportunities from "./pages/AdvertisingOpportunities";
import ChineseFolklore from "./pages/ChineseFolklore";
import ChildrenStories from "./pages/ChildrenStories";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Redirects legacy routes without language prefix to /tr/...
const LegacyRedirect = () => {
  const location = useLocation();
  if (typeof window !== 'undefined' && window.location.hostname === 'ondabir.com') {
    window.location.href = `https://ondabir.com/en`;
    return null;
  }
  return <Navigate to="/en" replace />;
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
                {/* Redirect root to /en */}
                <Route path="/" element={<Navigate to="/en" replace />} />

                {/* Redirect legacy routes without language prefix (must be before /:lang) */}
                <Route path="/tools/*" element={<LegacyRedirect />} />
                <Route path="/r/*" element={<LegacyRedirect />} />
                <Route path="/u/*" element={<LegacyRedirect />} />
                <Route path="/post/*" element={<LegacyRedirect />} />
                <Route path="/chat/*" element={<LegacyRedirect />} />
                <Route path="/saved" element={<LegacyRedirect />} />
                <Route path="/news" element={<LegacyRedirect />} />
                <Route path="/advertise" element={<LegacyRedirect />} />
                <Route path="/admin" element={<LegacyRedirect />} />

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
                  <Route path="tech-news" element={<TechNews />} />
                  <Route path="top-apps" element={<TopApps />} />
                  <Route path="email" element={<EmailAlias />} />
                  <Route path="advertise" element={<Advertise />} />
                  <Route path="hims" element={<Hims />} />
                  <Route path="hers" element={<Hers />} />
                  <Route path="roblox" element={<RobloxGames />} />
                  <Route path="roblox/:gameId" element={<RobloxGameDetail />} />
                  <Route path="apps" element={<AppListing />} />
                  <Route path="apps/:appId" element={<AppDetail />} />
                  <Route path="ai-apps" element={<AIAppListing />} />
                  <Route path="ai-apps/:appId" element={<AIAppDetail />} />
                  <Route path="privacy-analysis" element={<PrivacyAnalysis />} />
                  <Route path="category-apps/:category" element={<CategoryApps />} />
                  <Route path="category-apps/:category/:appSlug" element={<CategoryAppDetail />} />
                  <Route path="admin" element={<Admin />} />
                  <Route path="about" element={<AboutUs />} />
                  <Route path="security" element={<SecurityTrust />} />
                  <Route path="help" element={<HelpSupport />} />
                  <Route path="jobs" element={<Jobs />} />
                  <Route path="editorial" element={<EditorialGuidelines />} />
                  <Route path="add-software" element={<AddSoftware />} />
                  <Route path="monetization" element={<MonetizationSolutions />} />
                  <Route path="software-policy" element={<SoftwarePolicy />} />
                  <Route path="dmca" element={<DMCA />} />
                  <Route path="legal" element={<LegalInfo />} />
                  <Route path="terms" element={<TermsOfUse />} />
                  <Route path="privacy" element={<PrivacyPolicyPage />} />
                  <Route path="cookies" element={<CookiePolicy />} />
                  <Route path="ad-opportunities" element={<AdvertisingOpportunities />} />
                  <Route path="folklore/china" element={<ChineseFolklore />} />
                  <Route path="folklore/china/:storyId" element={<ChineseFolklore />} />
                  <Route path="stories" element={<ChildrenStories />} />
                  <Route path="stories/:storyId" element={<ChildrenStories />} />
                </Route>

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
