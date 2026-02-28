import { Link } from "react-router-dom";
import { useLocalizedNavigate } from "@/hooks/useLocalizedNavigate";
import { useLanguage } from "@/hooks/useLanguage";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";

const TermsOfUse = () => {
  const { localePath } = useLocalizedNavigate();
  const { language } = useLanguage();
  const isTr = language === "tr";

  const sections = isTr
    ? [
        { title: "1. Kabul", content: "ondabir platformunu kullanarak bu kullanım koşullarını kabul etmiş olursunuz. Bu koşulları kabul etmiyorsanız platformu kullanmayınız." },
        { title: "2. Hesap Oluşturma", content: "Hesap oluşturmak için 13 yaşında veya daha büyük olmanız gerekmektedir. Hesap bilgilerinizin güvenliğinden siz sorumlusunuz." },
        { title: "3. Kullanıcı İçeriği", content: "Platformda paylaştığınız tüm içeriklerden siz sorumlusunuz. Yasadışı, hakaret içeren veya başkalarının haklarını ihlal eden içerik paylaşmak yasaktır." },
        { title: "4. Yasaklanan Davranışlar", content: "Spam gönderme, sahte hesap oluşturma, diğer kullanıcıları taciz etme, kötü amaçlı yazılım dağıtma ve platformun işleyişini bozmaya çalışma yasaktır." },
        { title: "5. Fikri Mülkiyet", content: "Başkalarının telif haklarını, ticari markalarını veya diğer fikri mülkiyet haklarını ihlal eden içerik paylaşmak yasaktır." },
        { title: "6. Hesap Askıya Alma", content: "Bu koşulları ihlal eden hesaplar uyarı olmaksızın askıya alınabilir veya kalıcı olarak kapatılabilir." },
        { title: "7. Sorumluluk Sınırlaması", content: "ondabir, platformun kesintisiz veya hatasız çalışacağını garanti etmez. Platform 'olduğu gibi' sunulmaktadır." },
        { title: "8. Değişiklikler", content: "Bu koşullar önceden bildirimde bulunmaksızın değiştirilebilir. Güncel koşulları düzenli olarak kontrol etmeniz önerilir." },
      ]
    : [
        { title: "1. Acceptance", content: "By using the ondabir platform, you agree to these terms of use. If you do not accept these terms, please do not use the platform." },
        { title: "2. Account Creation", content: "You must be 13 years or older to create an account. You are responsible for the security of your account information." },
        { title: "3. User Content", content: "You are responsible for all content you share on the platform. Sharing illegal, abusive, or rights-infringing content is prohibited." },
        { title: "4. Prohibited Conduct", content: "Spamming, creating fake accounts, harassing other users, distributing malware, and attempting to disrupt platform operations are prohibited." },
        { title: "5. Intellectual Property", content: "Sharing content that infringes on others' copyrights, trademarks, or other intellectual property rights is prohibited." },
        { title: "6. Account Suspension", content: "Accounts that violate these terms may be suspended or permanently closed without prior notice." },
        { title: "7. Limitation of Liability", content: "ondabir does not guarantee that the platform will operate without interruption or error. The platform is provided 'as is'." },
        { title: "8. Changes", content: "These terms may be changed without prior notice. It is recommended that you regularly review the current terms." },
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

        <h1 className="text-4xl font-bold text-primary mb-2">{isTr ? "Kullanım Koşulları" : "Terms of Use"}</h1>
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

export default TermsOfUse;
