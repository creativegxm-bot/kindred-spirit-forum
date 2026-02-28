import { Link } from "react-router-dom";
import { useLocalizedNavigate } from "@/hooks/useLocalizedNavigate";
import { useLanguage } from "@/hooks/useLanguage";
import { ArrowLeft, FileText, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";

const EditorialGuidelines = () => {
  const { localePath } = useLocalizedNavigate();
  const { language } = useLanguage();
  const isTr = language === "tr";

  const guidelines = isTr
    ? [
        { title: "Doğruluk", desc: "Paylaşılan tüm bilgiler doğrulanabilir ve güvenilir kaynaklara dayalı olmalıdır." },
        { title: "Tarafsızlık", desc: "İçerikler dengeli bir bakış açısıyla sunulmalı, tek taraflı görüşlerden kaçınılmalıdır." },
        { title: "Saygı", desc: "Tüm kullanıcılar ve topluluklar saygıyla ele alınmalıdır. Nefret söylemi ve ayrımcılık yasaktır." },
        { title: "Orijinallik", desc: "Paylaşılan içerikler orijinal olmalı veya uygun kaynak gösterilerek alıntılanmalıdır." },
        { title: "Şeffaflık", desc: "Sponsorlu içerikler ve reklam materyalleri açıkça belirtilmelidir." },
        { title: "Gizlilik", desc: "Kişisel bilgiler izinsiz paylaşılmamalı, kullanıcı gizliliğine saygı gösterilmelidir." },
      ]
    : [
        { title: "Accuracy", desc: "All shared information must be verifiable and based on reliable sources." },
        { title: "Impartiality", desc: "Content should be presented with a balanced perspective, avoiding one-sided views." },
        { title: "Respect", desc: "All users and communities must be treated with respect. Hate speech and discrimination are prohibited." },
        { title: "Originality", desc: "Shared content must be original or properly attributed with appropriate sources." },
        { title: "Transparency", desc: "Sponsored content and advertising materials must be clearly identified." },
        { title: "Privacy", desc: "Personal information must not be shared without consent. User privacy must be respected." },
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
          <FileText className="inline h-8 w-8 mr-2" />
          {isTr ? "Editöryal Kılavuzlar" : "Editorial Guidelines"}
        </h1>
        <p className="text-muted-foreground mb-8">
          {isTr
            ? "ondabir'de içerik oluşturma ve paylaşma standartlarımız."
            : "Our standards for creating and sharing content on ondabir."}
        </p>

        <div className="space-y-4">
          {guidelines.map((g, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5 flex gap-4">
              <CheckCircle className="h-6 w-6 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1">{g.title}</h3>
                <p className="text-muted-foreground text-sm">{g.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EditorialGuidelines;
