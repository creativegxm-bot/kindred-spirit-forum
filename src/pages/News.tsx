import { useState } from "react";
import { ExternalLink, Newspaper, Globe, ChevronDown, ChevronUp } from "lucide-react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import AuthModal from "@/components/AuthModal";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import Footer from "@/components/Footer";

interface NewsSource {
  name: string;
  url: string;
  description?: string;
}

const turkishNewsSources: NewsSource[] = [
  { name: "Hürriyet", url: "https://www.hurriyet.com.tr", description: "Türkiye'nin en çok okunan gazetesi" },
  { name: "Milliyet", url: "https://www.milliyet.com.tr", description: "Güncel haberler ve son dakika" },
  { name: "Sabah", url: "https://www.sabah.com.tr", description: "Türkiye ve dünya haberleri" },
  { name: "Sözcü", url: "https://www.sozcu.com.tr", description: "Bağımsız gazetecilik" },
  { name: "Cumhuriyet", url: "https://www.cumhuriyet.com.tr", description: "1924'ten beri yayında" },
  { name: "Habertürk", url: "https://www.haberturk.com", description: "Haber ve ekonomi" },
  { name: "NTV", url: "https://www.ntv.com.tr", description: "24 saat haber kanalı" },
  { name: "CNN Türk", url: "https://www.cnnturk.com", description: "Güncel haberler" },
  { name: "TRT Haber", url: "https://www.trthaber.com", description: "Türkiye Radyo ve Televizyon Kurumu" },
  { name: "Anadolu Ajansı", url: "https://www.aa.com.tr", description: "Türkiye'nin haber ajansı" },
  { name: "Yeni Şafak", url: "https://www.yenisafak.com", description: "Günlük gazete" },
  { name: "Star", url: "https://www.star.com.tr", description: "Haber ve magazin" },
  { name: "Posta", url: "https://www.posta.com.tr", description: "Günlük haberler" },
  { name: "Takvim", url: "https://www.takvim.com.tr", description: "Spor ve gündem" },
  { name: "Dünya", url: "https://www.dunya.com", description: "Ekonomi gazetesi" },
  { name: "BloombergHT", url: "https://www.bloomberght.com", description: "Ekonomi ve finans haberleri" },
  { name: "Bianet", url: "https://bianet.org", description: "Bağımsız iletişim ağı" },
  { name: "T24", url: "https://t24.com.tr", description: "Bağımsız internet gazetesi" },
  { name: "Diken", url: "https://www.diken.com.tr", description: "Online haber sitesi" },
  { name: "Gazete Duvar", url: "https://www.gazeteduvar.com.tr", description: "Dijital gazete" },
];

const internationalNewsSources: NewsSource[] = [
  { name: "BBC News", url: "https://www.bbc.com/news", description: "British Broadcasting Corporation" },
  { name: "CNN", url: "https://www.cnn.com", description: "Cable News Network" },
  { name: "The New York Times", url: "https://www.nytimes.com", description: "American daily newspaper" },
  { name: "The Washington Post", url: "https://www.washingtonpost.com", description: "American news publication" },
  { name: "The Guardian", url: "https://www.theguardian.com", description: "British daily newspaper" },
  { name: "Reuters", url: "https://www.reuters.com", description: "International news agency" },
  { name: "Associated Press", url: "https://apnews.com", description: "American news agency" },
  { name: "Al Jazeera", url: "https://www.aljazeera.com", description: "Qatar-based news network" },
  { name: "France 24", url: "https://www.france24.com", description: "French international news" },
  { name: "DW", url: "https://www.dw.com", description: "Deutsche Welle - German news" },
  { name: "Euronews", url: "https://www.euronews.com", description: "European news channel" },
  { name: "The Wall Street Journal", url: "https://www.wsj.com", description: "Business and financial news" },
  { name: "Financial Times", url: "https://www.ft.com", description: "British financial newspaper" },
  { name: "Bloomberg", url: "https://www.bloomberg.com", description: "Business and markets news" },
  { name: "The Economist", url: "https://www.economist.com", description: "Weekly news magazine" },
  { name: "Time", url: "https://time.com", description: "American news magazine" },
  { name: "Newsweek", url: "https://www.newsweek.com", description: "American weekly news" },
  { name: "NPR", url: "https://www.npr.org", description: "National Public Radio" },
  { name: "ABC News", url: "https://abcnews.go.com", description: "American news division" },
  { name: "NBC News", url: "https://www.nbcnews.com", description: "American news organization" },
  { name: "CBS News", url: "https://www.cbsnews.com", description: "American news division" },
  { name: "Fox News", url: "https://www.foxnews.com", description: "American news channel" },
  { name: "Sky News", url: "https://news.sky.com", description: "British news channel" },
  { name: "The Independent", url: "https://www.independent.co.uk", description: "British online newspaper" },
  { name: "The Telegraph", url: "https://www.telegraph.co.uk", description: "British newspaper" },
  { name: "Le Monde", url: "https://www.lemonde.fr", description: "French daily newspaper" },
  { name: "Der Spiegel", url: "https://www.spiegel.de", description: "German news magazine" },
  { name: "El País", url: "https://elpais.com", description: "Spanish daily newspaper" },
  { name: "South China Morning Post", url: "https://www.scmp.com", description: "Hong Kong English newspaper" },
  { name: "The Japan Times", url: "https://www.japantimes.co.jp", description: "Japan's oldest English newspaper" },
];

const News = () => {
  const { language } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [turkishOpen, setTurkishOpen] = useState(true);
  const [internationalOpen, setInternationalOpen] = useState(true);

  const texts = {
    title: language === "tr" ? "Haber Kaynakları" : "News Sources",
    subtitle: language === "tr" 
      ? "Türk ve uluslararası haber sitelerine hızlı erişim" 
      : "Quick access to Turkish and international news websites",
    turkish: language === "tr" ? "Türk Haber Kaynakları" : "Turkish News Sources",
    international: language === "tr" ? "Uluslararası Haber Kaynakları" : "International News Sources",
    visitSite: language === "tr" ? "Siteyi Ziyaret Et" : "Visit Site",
  };

  const NewsCard = ({ source }: { source: NewsSource }) => (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
    >
      <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-primary/50 group-hover:bg-accent/50">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                {source.name}
              </h3>
              {source.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {source.description}
                </p>
              )}
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
          </div>
        </CardContent>
      </Card>
    </a>
  );

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
              <Newspaper className="h-8 w-8 text-primary" />
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{texts.title}</h1>
            </div>
            <p className="text-muted-foreground">{texts.subtitle}</p>
          </div>

          <div className="space-y-6">
            {/* Turkish News Sources */}
            <Collapsible open={turkishOpen} onOpenChange={setTurkishOpen}>
              <Card>
                <CardHeader className="pb-4">
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                      <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                        <span className="text-2xl">🇹🇷</span>
                        {texts.turkish}
                        <span className="text-sm font-normal text-muted-foreground">
                          ({turkishNewsSources.length})
                        </span>
                      </CardTitle>
                      {turkishOpen ? (
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
                      {turkishNewsSources.map((source) => (
                        <NewsCard key={source.url} source={source} />
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* International News Sources */}
            <Collapsible open={internationalOpen} onOpenChange={setInternationalOpen}>
              <Card>
                <CardHeader className="pb-4">
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                      <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                        <Globe className="h-6 w-6 text-primary" />
                        {texts.international}
                        <span className="text-sm font-normal text-muted-foreground">
                          ({internationalNewsSources.length})
                        </span>
                      </CardTitle>
                      {internationalOpen ? (
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
                      {internationalNewsSources.map((source) => (
                        <NewsCard key={source.url} source={source} />
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </div>
        </main>
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode="login"
      />
      <Footer />
    </div>
  );
};

export default News;
