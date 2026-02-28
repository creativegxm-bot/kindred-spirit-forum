import { Link } from "react-router-dom";
import { useLocalizedNavigate } from "@/hooks/useLocalizedNavigate";
import { useLanguage } from "@/hooks/useLanguage";
import { ArrowLeft, Shield, Lock, Eye, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";

const SecurityTrust = () => {
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

        <h1 className="text-4xl font-bold text-primary mb-4">
          {isTr ? "Güvenlik ve Güven Merkezi" : "Security & Trust Center"}
        </h1>
        <p className="text-muted-foreground mb-8 text-lg">
          {isTr
            ? "Platformumuzun güvenliğini nasıl sağladığımızı öğrenin."
            : "Learn how we keep our platform secure and trustworthy."}
        </p>

        <div className="space-y-6">
          {[
            { icon: Lock, title: isTr ? "Veri Şifreleme" : "Data Encryption", desc: isTr ? "Tüm veriler aktarım sırasında ve beklemede şifrelenir. AES-256 endüstri standardı şifreleme kullanıyoruz." : "All data is encrypted in transit and at rest. We use AES-256 industry-standard encryption." },
            { icon: Shield, title: isTr ? "DDoS Koruması" : "DDoS Protection", desc: isTr ? "Gelişmiş DDoS koruma sistemleri ile platformumuzu 7/24 koruyoruz." : "We protect our platform 24/7 with advanced DDoS protection systems." },
            { icon: Eye, title: isTr ? "Gizlilik Kontrolleri" : "Privacy Controls", desc: isTr ? "Kullanıcılar profil gizliliğini, veri paylaşım tercihlerini ve çerez ayarlarını tamamen kontrol edebilir." : "Users have full control over profile privacy, data sharing preferences, and cookie settings." },
            { icon: CheckCircle, title: isTr ? "İçerik Moderasyonu" : "Content Moderation", desc: isTr ? "AI destekli ve insan denetimli içerik moderasyon sistemi ile güvenli bir ortam sağlıyoruz." : "We ensure a safe environment with AI-assisted and human-reviewed content moderation." },
          ].map((item, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-6 flex gap-4">
              <item.icon className="h-8 w-8 text-primary shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SecurityTrust;
