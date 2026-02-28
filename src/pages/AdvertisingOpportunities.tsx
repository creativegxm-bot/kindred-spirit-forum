import { Link } from "react-router-dom";
import { useLocalizedNavigate } from "@/hooks/useLocalizedNavigate";
import { useLanguage } from "@/hooks/useLanguage";
import { ArrowLeft, Megaphone, BarChart3, Users, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";

const AdvertisingOpportunities = () => {
  const { localePath } = useLocalizedNavigate();
  const { language } = useLanguage();
  const isTr = language === "tr";

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-8 px-4">
        <Link to={localePath("/")}>
          <Button variant="ghost" size="sm" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            {isTr ? "Ana Sayfa" : "Home"}
          </Button>
        </Link>

        <div className="text-center mb-8 space-y-3">
          <Megaphone className="h-12 w-12 text-primary mx-auto" />
          <h1 className="text-4xl font-bold text-primary">{isTr ? "Reklam Fırsatları" : "Advertising Opportunities"}</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            {isTr
              ? "Markanızı küresel bir kitleye ulaştırın."
              : "Reach a global audience with your brand."}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: Users, value: "1M+", label: isTr ? "Aylık Kullanıcı" : "Monthly Users" },
            { icon: Globe, value: "11", label: isTr ? "Desteklenen Dil" : "Supported Languages" },
            { icon: BarChart3, value: "85%", label: isTr ? "Etkileşim Oranı" : "Engagement Rate" },
          ].map((stat, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5 text-center">
              <stat.icon className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-3xl font-bold text-primary">{stat.value}</p>
              <p className="text-muted-foreground text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {[
            { title: isTr ? "Banner Reklamlar" : "Banner Ads", desc: isTr ? "Ana sayfa ve topluluk sayfalarında görünür banner reklam alanları." : "Visible banner ad spaces on homepage and community pages." },
            { title: isTr ? "Sponsorlu İçerik" : "Sponsored Content", desc: isTr ? "Doğal görünümlü sponsorlu gönderiler ile hedef kitlenize ulaşın." : "Reach your target audience with native-looking sponsored posts." },
            { title: isTr ? "Öne Çıkan Uygulamalar" : "Featured Apps", desc: isTr ? "Uygulamanızı 'En İyi Uygulamalar' bölümünde öne çıkarın." : "Feature your app in the 'Top Apps' section." },
          ].map((item, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link to={localePath("/advertise")}>
            <Button size="lg">{isTr ? "Reklam Verin" : "Start Advertising"}</Button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdvertisingOpportunities;
