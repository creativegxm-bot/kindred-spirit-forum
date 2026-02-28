import { Link } from "react-router-dom";
import { useLocalizedNavigate } from "@/hooks/useLocalizedNavigate";
import { useLanguage } from "@/hooks/useLanguage";
import { ArrowLeft, Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";

const CookiePolicy = () => {
  const { localePath } = useLocalizedNavigate();
  const { language } = useLanguage();
  const isTr = language === "tr";

  const cookies = isTr
    ? [
        { type: "Zorunlu Çerezler", desc: "Platform işlevselliği için gerekli çerezler. Oturum yönetimi ve güvenlik için kullanılır. Devre dışı bırakılamaz.", essential: true },
        { type: "Analitik Çerezler", desc: "Platformun nasıl kullanıldığını anlamamıza yardımcı olur. Anonim kullanım verileri toplar.", essential: false },
        { type: "Tercih Çerezleri", desc: "Dil tercihi, tema seçimi gibi kullanıcı tercihlerini hatırlar.", essential: false },
        { type: "Performans Çerezleri", desc: "Sayfa yükleme hızı ve performans iyileştirmeleri için kullanılır.", essential: false },
      ]
    : [
        { type: "Essential Cookies", desc: "Cookies required for platform functionality. Used for session management and security. Cannot be disabled.", essential: true },
        { type: "Analytics Cookies", desc: "Help us understand how the platform is used. Collects anonymous usage data.", essential: false },
        { type: "Preference Cookies", desc: "Remember user preferences such as language and theme selection.", essential: false },
        { type: "Performance Cookies", desc: "Used for page load speed and performance improvements.", essential: false },
      ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-8 px-4">
        <Link to={localePath("/")}>
          <Button variant="ghost" size="sm" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            {isTr ? "Ana Sayfa" : "Home"}
          </Button>
        </Link>

        <h1 className="text-4xl font-bold text-primary mb-2">
          {isTr ? "Çerez Politikası" : "Cookie Policy"}
        </h1>
        <p className="text-muted-foreground text-sm mb-8">{isTr ? "Son güncelleme: 28 Şubat 2026" : "Last updated: February 28, 2026"}</p>

        <div className="rounded-xl border border-border bg-card p-6 mb-6">
          <p className="text-muted-foreground text-sm leading-relaxed">
            {isTr
              ? "ondabir, size daha iyi bir deneyim sunmak için çerezler kullanır. Bu politika, hangi çerezleri neden kullandığımızı ve bunları nasıl yönetebileceğinizi açıklar."
              : "ondabir uses cookies to provide you with a better experience. This policy explains what cookies we use, why, and how you can manage them."}
          </p>
        </div>

        <div className="space-y-4">
          {cookies.map((c, i) => (
            <div key={i} className={`rounded-xl border p-5 ${c.essential ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{c.type}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${c.essential ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                  {c.essential ? (isTr ? "Zorunlu" : "Required") : (isTr ? "İsteğe Bağlı" : "Optional")}
                </span>
              </div>
              <p className="text-muted-foreground text-sm">{c.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold mb-2">{isTr ? "Çerezleri Yönetme" : "Managing Cookies"}</h2>
          <p className="text-muted-foreground text-sm">
            {isTr
              ? "Tarayıcı ayarlarınızdan çerezleri silebilir veya devre dışı bırakabilirsiniz. Ancak bazı çerezlerin devre dışı bırakılması platform işlevselliğini etkileyebilir."
              : "You can delete or disable cookies through your browser settings. However, disabling some cookies may affect platform functionality."}
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CookiePolicy;
