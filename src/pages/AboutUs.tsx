import { Link } from "react-router-dom";
import { useLocalizedNavigate } from "@/hooks/useLocalizedNavigate";
import { useLanguage } from "@/hooks/useLanguage";
import { ArrowLeft, Globe, Users, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";

const AboutUs = () => {
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

        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-primary">
              {isTr ? "Hakkımızda" : "About Us"}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {isTr
                ? "ondabir, dünya genelinde insanları bir araya getiren, çok dilli bir topluluk platformudur."
                : "ondabir is a multilingual community platform bringing people together across the globe."}
            </p>
          </div>

          <div className="relative rounded-2xl overflow-hidden h-64 bg-gradient-to-br from-primary/20 to-primary/5 border border-border flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-primary mb-2">ondabir</h2>
              <p className="text-muted-foreground">{isTr ? "Birlikte Daha Güçlü" : "Stronger Together"}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-border bg-card p-6 space-y-3">
              <Globe className="h-8 w-8 text-primary" />
              <h3 className="text-lg font-semibold">{isTr ? "Küresel Erişim" : "Global Reach"}</h3>
              <p className="text-muted-foreground text-sm">
                {isTr
                  ? "11 dilde içerik sunarak dünya çapında milyonlarca kullanıcıya ulaşıyoruz. Türkçe, İngilizce, Almanca, Fransızca ve daha fazlası."
                  : "We serve content in 11 languages, reaching millions of users worldwide. Turkish, English, German, French, and more."}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 space-y-3">
              <Users className="h-8 w-8 text-primary" />
              <h3 className="text-lg font-semibold">{isTr ? "Topluluk Odaklı" : "Community Driven"}</h3>
              <p className="text-muted-foreground text-sm">
                {isTr
                  ? "Kullanıcılarımız kendi topluluklarını oluşturabilir, içerik paylaşabilir ve anlamlı tartışmalara katılabilir."
                  : "Our users can create their own communities, share content, and engage in meaningful discussions."}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 space-y-3">
              <Shield className="h-8 w-8 text-primary" />
              <h3 className="text-lg font-semibold">{isTr ? "Güvenlik" : "Security"}</h3>
              <p className="text-muted-foreground text-sm">
                {isTr
                  ? "Kullanıcı verilerinin korunması ve platform güvenliği en büyük önceliğimizdir."
                  : "Protecting user data and platform security is our top priority."}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 space-y-3">
              <Zap className="h-8 w-8 text-primary" />
              <h3 className="text-lg font-semibold">{isTr ? "İnovasyon" : "Innovation"}</h3>
              <p className="text-muted-foreground text-sm">
                {isTr
                  ? "AI destekli araçlar, dosya dönüştürücü, gizlilik analizi ve daha birçok yenilikçi özellik sunuyoruz."
                  : "We offer AI-powered tools, file converter, privacy analysis, and many more innovative features."}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-8 space-y-4">
            <h2 className="text-2xl font-bold">{isTr ? "Misyonumuz" : "Our Mission"}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {isTr
                ? "ondabir olarak misyonumuz, dil ve coğrafi sınırları aşarak insanları bilgi, tartışma ve topluluk etrafında bir araya getirmektir. Her kullanıcının sesinin duyulduğu, güvenli ve kapsayıcı bir dijital alan yaratmayı hedefliyoruz."
                : "At ondabir, our mission is to bring people together around knowledge, discussion, and community, transcending language and geographic boundaries. We aim to create a safe and inclusive digital space where every user's voice is heard."}
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AboutUs;
