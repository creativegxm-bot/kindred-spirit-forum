import { Link } from "react-router-dom";
import { useLocalizedNavigate } from "@/hooks/useLocalizedNavigate";
import { useLanguage } from "@/hooks/useLanguage";
import { ArrowLeft, Upload, CheckCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";

const AddSoftware = () => {
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
          <Upload className="h-12 w-12 text-primary mx-auto" />
          <h1 className="text-4xl font-bold text-primary">
            {isTr ? "Yazılımınızı / Uygulamanızı Ekleyin" : "Add Your Software / App"}
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            {isTr
              ? "Uygulamanızı ondabir platformunda milyonlarca kullanıcıya tanıtın."
              : "Showcase your app to millions of users on the ondabir platform."}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: Upload, title: isTr ? "Kolay Yükleme" : "Easy Upload", desc: isTr ? "Basit form ile uygulamanızı ekleyin" : "Add your app with a simple form" },
            { icon: Star, title: isTr ? "Kullanıcı Değerlendirmeleri" : "User Reviews", desc: isTr ? "Gerçek kullanıcı geri bildirimleri alın" : "Get real user feedback" },
            { icon: CheckCircle, title: isTr ? "Hızlı Onay" : "Quick Approval", desc: isTr ? "24 saat içinde inceleme" : "Review within 24 hours" },
          ].map((item, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5 text-center space-y-2">
              <item.icon className="h-8 w-8 text-primary mx-auto" />
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-muted-foreground text-sm">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-xl font-bold">{isTr ? "Nasıl Başvurulur?" : "How to Submit?"}</h2>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground text-sm">
            <li>{isTr ? "Uygulamanızın adını, açıklamasını ve logosunu hazırlayın." : "Prepare your app's name, description, and logo."}</li>
            <li>{isTr ? "Ekran görüntüleri ve tanıtım videosu ekleyin." : "Add screenshots and a promotional video."}</li>
            <li>{isTr ? "Kategori ve platform bilgilerini belirtin." : "Specify category and platform information."}</li>
            <li>{isTr ? "İletişim bilgilerinizi girin ve gönderin." : "Enter your contact info and submit."}</li>
          </ol>
          <Button className="mt-4">{isTr ? "Başvuru Yap" : "Submit Application"}</Button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AddSoftware;
