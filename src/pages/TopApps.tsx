import { useState } from "react";
import { ExternalLink, ChevronDown, ChevronUp, Smartphone } from "lucide-react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import AuthModal from "@/components/AuthModal";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface AppInfo {
  name: string;
  url: string;
  description: string;
  icon: string;
}

interface AppCategory {
  title: string;
  titleTr: string;
  emoji: string;
  apps: AppInfo[];
}

const appCategories: AppCategory[] = [
  {
    title: "Social Media & Messaging",
    titleTr: "Sosyal Medya ve Mesajlaşma",
    emoji: "💬",
    apps: [
      { name: "WhatsApp", url: "https://whatsapp.com", description: "Free messaging app with 2B+ users", icon: "📱" },
      { name: "Instagram", url: "https://instagram.com", description: "Photo & video sharing by Meta", icon: "📸" },
      { name: "TikTok", url: "https://tiktok.com", description: "Short-form video platform", icon: "🎵" },
      { name: "Facebook", url: "https://facebook.com", description: "World's largest social network", icon: "👥" },
      { name: "Telegram", url: "https://telegram.org", description: "Cloud-based secure messaging", icon: "✈️" },
      { name: "Snapchat", url: "https://snapchat.com", description: "Camera & disappearing messages", icon: "👻" },
      { name: "X (Twitter)", url: "https://x.com", description: "Real-time news & conversations", icon: "🐦" },
      { name: "Threads", url: "https://threads.net", description: "Text-based social app by Meta", icon: "🧵" },
      { name: "Discord", url: "https://discord.com", description: "Voice & text chat for communities", icon: "🎮" },
      { name: "Signal", url: "https://signal.org", description: "Encrypted private messaging", icon: "🔒" },
      { name: "Reddit", url: "https://reddit.com", description: "Community discussion forums", icon: "🤖" },
      { name: "LinkedIn", url: "https://linkedin.com", description: "Professional network with 1B+ members", icon: "💼" },
      { name: "Pinterest", url: "https://pinterest.com", description: "Visual discovery & ideas", icon: "📌" },
    ],
  },
  {
    title: "Video & Streaming",
    titleTr: "Video ve Yayın",
    emoji: "🎬",
    apps: [
      { name: "YouTube", url: "https://youtube.com", description: "World's largest video platform", icon: "▶️" },
      { name: "Netflix", url: "https://netflix.com", description: "Movies, TV shows & originals", icon: "🎬" },
      { name: "Spotify", url: "https://spotify.com", description: "Music & podcast streaming", icon: "🎧" },
      { name: "Apple Music", url: "https://music.apple.com", description: "100M+ songs & spatial audio", icon: "🎵" },
      { name: "Amazon Prime Video", url: "https://primevideo.com", description: "Movies & Amazon Originals", icon: "📺" },
      { name: "Disney+", url: "https://disneyplus.com", description: "Disney, Marvel, Star Wars", icon: "🏰" },
      { name: "HBO Max (Max)", url: "https://max.com", description: "HBO originals & blockbusters", icon: "🎭" },
      { name: "Hulu", url: "https://hulu.com", description: "Current TV & live streaming", icon: "📡" },
      { name: "Twitch", url: "https://twitch.tv", description: "Live streaming for gaming & more", icon: "🟣" },
      { name: "Shazam", url: "https://shazam.com", description: "Music recognition in seconds", icon: "🎤" },
      { name: "Audible", url: "https://audible.com", description: "700K+ audiobooks & podcasts", icon: "🎧" },
    ],
  },
  {
    title: "Productivity & Work",
    titleTr: "Verimlilik ve İş",
    emoji: "💻",
    apps: [
      { name: "Google Chrome", url: "https://google.com/chrome", description: "Most popular web browser", icon: "🌐" },
      { name: "Gmail", url: "https://gmail.com", description: "Free email by Google", icon: "✉️" },
      { name: "Microsoft Teams", url: "https://teams.microsoft.com", description: "Chat, video & collaboration", icon: "👨‍💻" },
      { name: "Zoom", url: "https://zoom.us", description: "Video conferencing platform", icon: "📹" },
      { name: "Slack", url: "https://slack.com", description: "Team communication channels", icon: "💬" },
      { name: "Notion", url: "https://notion.so", description: "All-in-one workspace", icon: "📝" },
      { name: "Google Drive", url: "https://drive.google.com", description: "15GB free cloud storage", icon: "☁️" },
      { name: "Microsoft Outlook", url: "https://outlook.com", description: "Email & calendar by Microsoft", icon: "📧" },
      { name: "Google Meet", url: "https://meet.google.com", description: "Free video conferencing", icon: "🤝" },
      { name: "Google Docs", url: "https://docs.google.com", description: "Collaborative document editing", icon: "📄" },
      { name: "Microsoft Word", url: "https://office.com", description: "Industry-standard word processor", icon: "📃" },
      { name: "Microsoft OneDrive", url: "https://onedrive.com", description: "Cloud storage by Microsoft", icon: "💾" },
      { name: "Dropbox", url: "https://dropbox.com", description: "File sharing & collaboration", icon: "📦" },
      { name: "Trello", url: "https://trello.com", description: "Visual project management", icon: "📋" },
      { name: "Todoist", url: "https://todoist.com", description: "Task management app", icon: "✅" },
      { name: "Evernote", url: "https://evernote.com", description: "Note taking across devices", icon: "🗒️" },
      { name: "Grammarly", url: "https://grammarly.com", description: "AI writing assistant", icon: "✍️" },
      { name: "Adobe Acrobat Reader", url: "https://acrobat.adobe.com", description: "PDF viewer & editor", icon: "📕" },
    ],
  },
  {
    title: "AI & Technology",
    titleTr: "Yapay Zeka ve Teknoloji",
    emoji: "🤖",
    apps: [
      { name: "ChatGPT", url: "https://chat.openai.com", description: "AI assistant by OpenAI", icon: "🧠" },
      { name: "Gemini", url: "https://gemini.google.com", description: "Google's AI assistant", icon: "✨" },
      { name: "Claude AI", url: "https://claude.ai", description: "AI by Anthropic", icon: "🤖" },
      { name: "Perplexity AI", url: "https://perplexity.ai", description: "AI-powered search engine", icon: "🔍" },
      { name: "Google Translate", url: "https://translate.google.com", description: "130+ language translation", icon: "🌍" },
    ],
  },
  {
    title: "Shopping & E-Commerce",
    titleTr: "Alışveriş ve E-Ticaret",
    emoji: "🛒",
    apps: [
      { name: "Amazon", url: "https://amazon.com", description: "World's largest online store", icon: "📦" },
      { name: "Shein", url: "https://shein.com", description: "Affordable fast fashion", icon: "👗" },
      { name: "Temu", url: "https://temu.com", description: "Direct from manufacturers", icon: "🏷️" },
      { name: "Shopify", url: "https://shopify.com", description: "Create your online store", icon: "🏪" },
      { name: "eBay", url: "https://ebay.com", description: "Online marketplace & auctions", icon: "🔨" },
      { name: "Etsy", url: "https://etsy.com", description: "Handmade & vintage items", icon: "🎨" },
      { name: "AliExpress", url: "https://aliexpress.com", description: "Global wholesale shopping", icon: "🌏" },
      { name: "Walmart", url: "https://walmart.com", description: "Retail & grocery shopping", icon: "🏬" },
    ],
  },
  {
    title: "Finance & Payments",
    titleTr: "Finans ve Ödemeler",
    emoji: "💰",
    apps: [
      { name: "PayPal", url: "https://paypal.com", description: "Digital payments worldwide", icon: "💳" },
      { name: "Venmo", url: "https://venmo.com", description: "Social mobile payments", icon: "💸" },
      { name: "Cash App", url: "https://cash.app", description: "Money transfer & Bitcoin", icon: "💵" },
      { name: "Binance", url: "https://binance.com", description: "Largest crypto exchange", icon: "🪙" },
      { name: "Coinbase", url: "https://coinbase.com", description: "Trusted crypto platform", icon: "₿" },
      { name: "Robinhood", url: "https://robinhood.com", description: "Commission-free trading", icon: "📈" },
      { name: "Revolut", url: "https://revolut.com", description: "Digital banking & trading", icon: "🏦" },
      { name: "Wise", url: "https://wise.com", description: "Low-fee international transfers", icon: "🌐" },
    ],
  },
  {
    title: "Food & Delivery",
    titleTr: "Yemek ve Teslimat",
    emoji: "🍕",
    apps: [
      { name: "Uber Eats", url: "https://ubereats.com", description: "Food & grocery delivery", icon: "🍔" },
      { name: "DoorDash", url: "https://doordash.com", description: "Local restaurant delivery", icon: "🚗" },
      { name: "Instacart", url: "https://instacart.com", description: "Grocery delivery in 1 hour", icon: "🛒" },
    ],
  },
  {
    title: "Travel & Navigation",
    titleTr: "Seyahat ve Navigasyon",
    emoji: "✈️",
    apps: [
      { name: "Google Maps", url: "https://maps.google.com", description: "Navigation & local info", icon: "🗺️" },
      { name: "Uber", url: "https://uber.com", description: "Ride sharing worldwide", icon: "🚕" },
      { name: "Lyft", url: "https://lyft.com", description: "Rides, bikes & scooters", icon: "🚙" },
      { name: "Airbnb", url: "https://airbnb.com", description: "Unique stays & experiences", icon: "🏠" },
      { name: "Booking.com", url: "https://booking.com", description: "Hotels & travel bookings", icon: "🏨" },
      { name: "Waze", url: "https://waze.com", description: "Community GPS navigation", icon: "🧭" },
      { name: "Tripadvisor", url: "https://tripadvisor.com", description: "Travel reviews & bookings", icon: "🌴" },
      { name: "Google Earth", url: "https://earth.google.com", description: "Explore the world in 3D", icon: "🌎" },
    ],
  },
  {
    title: "Health & Fitness",
    titleTr: "Sağlık ve Fitness",
    emoji: "💪",
    apps: [
      { name: "Calm", url: "https://calm.com", description: "Meditation & sleep stories", icon: "🧘" },
      { name: "Headspace", url: "https://headspace.com", description: "Guided mindfulness", icon: "🧠" },
      { name: "Strava", url: "https://strava.com", description: "Running & cycling tracker", icon: "🏃" },
      { name: "MyFitnessPal", url: "https://myfitnesspal.com", description: "Calorie & food tracker", icon: "🥗" },
      { name: "Fitbit", url: "https://fitbit.com", description: "Activity & health tracking", icon: "⌚" },
    ],
  },
  {
    title: "Education & Learning",
    titleTr: "Eğitim ve Öğrenme",
    emoji: "📚",
    apps: [
      { name: "Duolingo", url: "https://duolingo.com", description: "Gamified language learning", icon: "🦉" },
      { name: "Coursera", url: "https://coursera.org", description: "University courses online", icon: "🎓" },
      { name: "Khan Academy", url: "https://khanacademy.org", description: "Free education for all", icon: "📐" },
      { name: "Quizlet", url: "https://quizlet.com", description: "Flashcards & study tools", icon: "🃏" },
    ],
  },
  {
    title: "Design & Creative",
    titleTr: "Tasarım ve Yaratıcılık",
    emoji: "🎨",
    apps: [
      { name: "Canva", url: "https://canva.com", description: "Easy graphic design", icon: "🖼️" },
      { name: "Figma", url: "https://figma.com", description: "Collaborative UI design", icon: "✏️" },
      { name: "CapCut", url: "https://capcut.com", description: "Free video editor", icon: "🎞️" },
      { name: "iMovie", url: "https://apple.com/imovie", description: "Video editing for Apple", icon: "🎥" },
    ],
  },
  {
    title: "Security & Utilities",
    titleTr: "Güvenlik ve Araçlar",
    emoji: "🔐",
    apps: [
      { name: "1Password", url: "https://1password.com", description: "Secure password manager", icon: "🔑" },
      { name: "Bitwarden", url: "https://bitwarden.com", description: "Open-source password manager", icon: "🛡️" },
      { name: "VLC Media Player", url: "https://videolan.org", description: "Universal media player", icon: "🎞️" },
      { name: "Google Photos", url: "https://photos.google.com", description: "Smart photo storage", icon: "🖼️" },
      { name: "Kindle", url: "https://amazon.com/kindle", description: "E-book reader app", icon: "📖" },
    ],
  },
  {
    title: "News & Reading",
    titleTr: "Haberler ve Okuma",
    emoji: "📰",
    apps: [
      { name: "Flipboard", url: "https://flipboard.com", description: "Magazine-style news", icon: "📰" },
      { name: "Medium", url: "https://medium.com", description: "Writing & stories platform", icon: "✍️" },
      { name: "Pocket", url: "https://getpocket.com", description: "Save articles for later", icon: "📥" },
      { name: "Yelp", url: "https://yelp.com", description: "Local business reviews", icon: "⭐" },
    ],
  },
  {
    title: "Developer Tools",
    titleTr: "Geliştirici Araçları",
    emoji: "⚙️",
    apps: [
      { name: "GitHub", url: "https://github.com", description: "Code hosting & collaboration", icon: "🐙" },
      { name: "VS Code", url: "https://code.visualstudio.com", description: "Powerful code editor", icon: "💻" },
    ],
  },
];

const TopApps = () => {
  const { language } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [openCategories, setOpenCategories] = useState<Record<number, boolean>>(
    () => Object.fromEntries(appCategories.map((_, i) => [i, true]))
  );

  const toggleCategory = (index: number) => {
    setOpenCategories((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const totalApps = appCategories.reduce((sum, cat) => sum + cat.apps.length, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        onOpenAuth={(mode) => setAuthModalOpen(true)}
        onCreatePost={() => {}}
      />

      <div className="flex">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onOpenAuth={(mode) => setAuthModalOpen(true)}
        />

        <main className="flex-1 p-4 lg:p-6 max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Smartphone className="h-8 w-8 text-primary" />
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                {language === "tr" ? "En Popüler 100 Uygulama" : "Top 100 Most Downloaded Apps"}
              </h1>
            </div>
            <p className="text-muted-foreground">
              {language === "tr"
                ? `${totalApps} uygulama, ${appCategories.length} kategoride düzenlenmiştir`
                : `${totalApps} apps organized across ${appCategories.length} categories`}
            </p>
          </div>

          <div className="space-y-4">
            {appCategories.map((category, index) => (
              <Collapsible
                key={index}
                open={openCategories[index]}
                onOpenChange={() => toggleCategory(index)}
              >
                <Card>
                  <CardHeader className="pb-3">
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-between p-0 h-auto hover:bg-transparent"
                      >
                        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                          <span className="text-2xl">{category.emoji}</span>
                          {language === "tr" ? category.titleTr : category.title}
                          <span className="text-sm font-normal text-muted-foreground">
                            ({category.apps.length})
                          </span>
                        </CardTitle>
                        {openCategories[index] ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                  </CardHeader>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {category.apps.map((app) => (
                          <a
                            key={app.url}
                            href={app.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block group"
                          >
                            <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-primary/50 group-hover:bg-accent/50">
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <span className="text-2xl shrink-0 mt-0.5">{app.icon}</span>
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                      {app.name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                                      {app.description}
                                    </p>
                                  </div>
                                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
                                </div>
                              </CardContent>
                            </Card>
                          </a>
                        ))}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>
        </main>
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode="login"
      />
    </div>
  );
};

export default TopApps;
