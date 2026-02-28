import { Link } from "react-router-dom";
import { useLocalizedNavigate } from "@/hooks/useLocalizedNavigate";
import { useLanguage } from "@/hooks/useLanguage";
import { ArrowLeft, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";

const LegalInfo = () => {
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
          <Scale className="inline h-8 w-8 mr-2" />
          {isTr ? "Yasal Bilgiler" : "Legal Information"}
        </h1>

        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-3">{isTr ? "Şirket Bilgileri" : "Company Information"}</h2>
            <div className="text-muted-foreground text-sm space-y-1">
              <p><strong>{isTr ? "Şirket Adı:" : "Company Name:"}</strong> ondabir</p>
              <p><strong>{isTr ? "E-posta:" : "Email:"}</strong> legal@ondabir.com</p>
              <p><strong>{isTr ? "Web Sitesi:" : "Website:"}</strong> www.ondabir.com</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-3">{isTr ? "Fikri Mülkiyet" : "Intellectual Property"}</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {isTr
                ? "ondabir adı, logosu ve tüm ilgili markalar ondabir'in tescilli ticari markalarıdır. Bu sitedeki içerikler, aksine açıkça belirtilmedikçe, ondabir'in veya içerik sağlayıcılarının telif hakkıyla korunmaktadır."
                : "The ondabir name, logo, and all related marks are registered trademarks of ondabir. Content on this site is protected by copyright of ondabir or its content providers unless explicitly stated otherwise."}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-3">{isTr ? "Sorumluluk Reddi" : "Disclaimer"}</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {isTr
                ? "ondabir platformunda kullanıcılar tarafından paylaşılan içerikler, ilgili kullanıcıların sorumluluğundadır. ondabir, kullanıcı tarafından oluşturulan içeriklerin doğruluğu, güvenilirliği veya yasallığı konusunda garanti vermez."
                : "Content shared by users on the ondabir platform is the responsibility of the respective users. ondabir does not guarantee the accuracy, reliability, or legality of user-generated content."}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Link to={localePath("/terms")}>
              <div className="rounded-xl border border-border bg-card p-5 hover:border-primary/40 transition-colors">
                <h3 className="font-semibold">{isTr ? "Kullanım Koşulları" : "Terms of Use"}</h3>
                <p className="text-muted-foreground text-sm mt-1">{isTr ? "Platformu kullanma kuralları" : "Rules for using the platform"}</p>
              </div>
            </Link>
            <Link to={localePath("/privacy")}>
              <div className="rounded-xl border border-border bg-card p-5 hover:border-primary/40 transition-colors">
                <h3 className="font-semibold">{isTr ? "Gizlilik Politikası" : "Privacy Policy"}</h3>
                <p className="text-muted-foreground text-sm mt-1">{isTr ? "Verilerinizi nasıl koruyoruz" : "How we protect your data"}</p>
              </div>
            </Link>
            <Link to={localePath("/dmca")}>
              <div className="rounded-xl border border-border bg-card p-5 hover:border-primary/40 transition-colors">
                <h3 className="font-semibold">DMCA</h3>
                <p className="text-muted-foreground text-sm mt-1">{isTr ? "Telif hakkı bildirimleri" : "Copyright notices"}</p>
              </div>
            </Link>
            <Link to={localePath("/cookies")}>
              <div className="rounded-xl border border-border bg-card p-5 hover:border-primary/40 transition-colors">
                <h3 className="font-semibold">{isTr ? "Çerez Politikası" : "Cookie Policy"}</h3>
                <p className="text-muted-foreground text-sm mt-1">{isTr ? "Çerez kullanımı hakkında" : "About cookie usage"}</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LegalInfo;
