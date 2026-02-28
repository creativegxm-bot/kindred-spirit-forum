import { Link } from "react-router-dom";
import { useLocalizedNavigate } from "@/hooks/useLocalizedNavigate";
import { useLanguage } from "@/hooks/useLanguage";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";

const PrivacyPolicyPage = () => {
  const { localePath } = useLocalizedNavigate();
  const { language } = useLanguage();
  const isTr = language === "tr";

  const sections = isTr
    ? [
        { title: "Toplanan Veriler", content: "Hesap oluşturduğunuzda e-posta adresinizi, kullanıcı adınızı ve profil bilgilerinizi toplarız. Ayrıca platform kullanımınıza ilişkin anonim analitik veriler toplanır." },
        { title: "Verilerin Kullanımı", content: "Topladığımız veriler platformu iyileştirmek, kişiselleştirilmiş deneyim sunmak ve güvenliği sağlamak amacıyla kullanılır. Verileriniz üçüncü taraflarla reklam amacıyla paylaşılmaz." },
        { title: "Çerezler", content: "Oturum yönetimi ve kullanıcı tercihlerini hatırlamak için çerezler kullanıyoruz. Çerez tercihlerinizi tarayıcı ayarlarınızdan yönetebilirsiniz." },
        { title: "Veri Güvenliği", content: "Verileriniz şifreli bağlantılar (HTTPS) üzerinden iletilir ve güvenli sunucularda saklanır. Düzenli güvenlik denetimleri yapılır." },
        { title: "Haklarınız", content: "GDPR ve KVKK kapsamında verilerinize erişme, düzeltme ve silme hakkına sahipsiniz. Bu haklarınızı kullanmak için privacy@ondabir.com adresine başvurabilirsiniz." },
        { title: "Üçüncü Taraf Hizmetleri", content: "Analitik ve performans izleme için üçüncü taraf hizmetleri kullanabiliriz. Bu hizmetlerin kendi gizlilik politikaları geçerlidir." },
      ]
    : [
        { title: "Data Collection", content: "When you create an account, we collect your email address, username, and profile information. We also collect anonymous analytics data about platform usage." },
        { title: "Data Usage", content: "The data we collect is used to improve the platform, provide personalized experiences, and ensure security. Your data is not shared with third parties for advertising purposes." },
        { title: "Cookies", content: "We use cookies for session management and remembering user preferences. You can manage your cookie preferences through your browser settings." },
        { title: "Data Security", content: "Your data is transmitted over encrypted connections (HTTPS) and stored on secure servers. Regular security audits are performed." },
        { title: "Your Rights", content: "Under GDPR, you have the right to access, correct, and delete your data. To exercise these rights, contact privacy@ondabir.com." },
        { title: "Third-Party Services", content: "We may use third-party services for analytics and performance monitoring. These services have their own privacy policies." },
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
          <Shield className="inline h-8 w-8 mr-2" />
          {isTr ? "Gizlilik Politikası" : "Privacy Policy"}
        </h1>
        <p className="text-muted-foreground text-sm mb-8">{isTr ? "Son güncelleme: 28 Şubat 2026" : "Last updated: February 28, 2026"}</p>

        <div className="space-y-6">
          {sections.map((s, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold mb-2">{s.title}</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">{s.content}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;
