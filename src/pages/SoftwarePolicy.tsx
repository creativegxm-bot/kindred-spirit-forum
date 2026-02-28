import { Link } from "react-router-dom";
import { useLocalizedNavigate } from "@/hooks/useLocalizedNavigate";
import { useLanguage } from "@/hooks/useLanguage";
import { ArrowLeft, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";

const SoftwarePolicy = () => {
  const { localePath } = useLocalizedNavigate();
  const { language } = useLanguage();
  const isTr = language === "tr";

  const sections = isTr
    ? [
        { title: "Kabul Edilen Yazılımlar", content: "ondabir platformunda yalnızca yasal, güvenli ve kötü amaçlı yazılım içermeyen uygulamalar listelenir. Tüm yazılımlar, platformumuza eklenmeden önce güvenlik taramasından geçirilir." },
        { title: "İçerik Standartları", content: "Listelenen uygulamalar doğru açıklamalar, güncel ekran görüntüleri ve geçerli indirme bağlantıları içermelidir. Yanıltıcı bilgi içeren listeler kaldırılır." },
        { title: "Güncelleme Politikası", content: "Yazılım geliştiricileri, uygulamalarını düzenli olarak güncellemekten sorumludur. 6 aydan uzun süredir güncellenmeyen uygulamalar 'eski' olarak işaretlenebilir." },
        { title: "Kullanıcı Değerlendirmeleri", content: "Sahte veya manipüle edilmiş değerlendirmeler kesinlikle yasaktır. Bu tür faaliyetler tespit edildiğinde ilgili uygulama listeden kaldırılır." },
        { title: "Telif Hakkı", content: "Başkalarının fikri mülkiyetini ihlal eden yazılımlar kabul edilmez. DMCA bildirimlerine derhal yanıt verilir." },
      ]
    : [
        { title: "Accepted Software", content: "Only legal, safe, and malware-free applications are listed on the ondabir platform. All software undergoes security scanning before being added." },
        { title: "Content Standards", content: "Listed applications must include accurate descriptions, up-to-date screenshots, and valid download links. Listings with misleading information will be removed." },
        { title: "Update Policy", content: "Software developers are responsible for regularly updating their applications. Apps not updated for more than 6 months may be marked as 'outdated'." },
        { title: "User Reviews", content: "Fake or manipulated reviews are strictly prohibited. When such activities are detected, the related app will be removed from the listing." },
        { title: "Copyright", content: "Software that infringes on others' intellectual property is not accepted. DMCA notices are responded to promptly." },
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

        <h1 className="text-4xl font-bold text-primary mb-4">
          <FileCheck className="inline h-8 w-8 mr-2" />
          {isTr ? "Yazılım Politikası" : "Software Policy"}
        </h1>

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

export default SoftwarePolicy;
